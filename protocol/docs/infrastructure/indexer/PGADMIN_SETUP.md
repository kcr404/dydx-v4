# pgAdmin Setup Guide for dYdX v4 Testing

## Overview

pgAdmin is a web-based database management tool that lets you view and query the dYdX indexer database. This is useful for verifying order data, fills, and trading history.

---

## Part 1: Adding pgAdmin to Docker Compose

### Step 1: Edit docker-compose-local-deployment.yml

**File:** `/data/data/v4-chain/indexer/docker-compose-local-deployment.yml`

Add the pgAdmin service after the postgres service:

```yaml
  pgadmin:
    image: dpage/pgadmin4
    ports:
      - 5050:80
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    links:
      - postgres
    depends_on:
      - postgres
```

### Step 2: Start pgAdmin

```bash
cd /data/data/v4-chain/indexer

# Start all services including pgAdmin
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink pgadmin

# Verify pgAdmin is running
docker-compose -f docker-compose-local-deployment.yml ps | grep pgadmin
```

**Expected Output:**
```
indexer_pgadmin_1   /entrypoint.sh   Up   443/tcp, 0.0.0.0:5050->80/tcp
```

---

## Part 2: Accessing pgAdmin

### Step 1: Open pgAdmin in Browser

**URL:** http://localhost:5050

### Step 2: Login

**Credentials:**
- Email: `admin@admin.com`
- Password: `admin`

![pgAdmin Login Screen]

---

## Part 3: Connecting to dYdX Database

### Step 1: Add New Server

1. Right-click on **"Servers"** in the left sidebar
2. Select **"Register" → "Server..."**

### Step 2: General Tab

**Server Name:** `dYdX Local Indexer`

### Step 3: Connection Tab

**Connection Details:**
- **Host name/address:** `postgres`
- **Port:** `5432`
- **Maintenance database:** `dydx_dev`
- **Username:** `dydx_dev`
- **Password:** `dydxserver123`

**Important Notes:**
- Use `postgres` as hostname (Docker network name)
- If connecting from host machine directly, use `localhost` and port `5435`

### Step 4: Save

Click **"Save"** to connect.

---

## Part 4: Exploring the Database

### Database Structure

```
dYdX Local Indexer
└── Databases
    └── dydx_dev
        └── Schemas
            └── public
                └── Tables
                    ├── orders ⭐ Order data
                    ├── fills ⭐ Fill/match data
                    ├── trades ⭐ Trade history
                    ├── subaccounts
                    ├── perpetual_markets
                    ├── assets
                    └── ... (many more)
```

### Key Tables for Testing

#### 1. orders Table

**Contains:** All orders (short-term and long-term)

**Important Columns:**
- `id` - Unique order ID
- `subaccountId` - Trader's subaccount
- `clientId` - Client-specified order ID
- `clobPairId` - Market ID (35 = TEST-USD)
- `side` - BUY or SELL
- `size` - Order size
- `price` - Order price
- `status` - OPEN, FILLED, CANCELED
- `orderFlags` - 0 = short-term, 32 = long-term
- `goodTilBlock` - Expiry block (short-term)
- `goodTilBlockTime` - Expiry time (long-term)
- `createdAtHeight` - Block height when created

**Sample Query:**
```sql
SELECT 
    id,
    "subaccountId",
    "clientId",
    "clobPairId",
    side,
    size,
    price,
    status,
    "orderFlags",
    "goodTilBlock",
    "createdAtHeight"
FROM orders
ORDER BY "createdAtHeight" DESC
LIMIT 10;
```

#### 2. fills Table

**Contains:** Order matches and fills

**Important Columns:**
- `id` - Unique fill ID
- `subaccountId` - Trader's subaccount
- `orderId` - Related order ID
- `size` - Fill size
- `price` - Fill price
- `type` - LIMIT, MARKET, etc.
- `createdAtHeight` - Block height

**Sample Query:**
```sql
SELECT 
    f.id,
    f."subaccountId",
    f."orderId",
    f.size,
    f.price,
    f.type,
    f."createdAtHeight",
    o.side,
    o."clobPairId"
FROM fills f
LEFT JOIN orders o ON f."orderId" = o.id
ORDER BY f."createdAtHeight" DESC
LIMIT 10;
```

#### 3. subaccounts Table

**Contains:** Subaccount information

**Sample Query:**
```sql
SELECT 
    id,
    address,
    "subaccountNumber",
    "updatedAtHeight"
FROM subaccounts
WHERE address = 'dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4'
LIMIT 10;
```

---

## Part 5: Testing Queries

### Check if Orders Exist

```sql
-- Count total orders
SELECT COUNT(*) as total_orders FROM orders;

-- Count by status
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;

-- Count by order type
SELECT 
    CASE 
        WHEN "orderFlags" = 0 THEN 'Short-Term'
        WHEN "orderFlags" = 32 THEN 'Long-Term'
        ELSE 'Other'
    END as order_type,
    COUNT(*) as count
FROM orders
GROUP BY "orderFlags";
```

### Check Recent Orders

```sql
-- Last 10 orders
SELECT 
    "clientId",
    side,
    size,
    price,
    status,
    "createdAtHeight",
    CASE 
        WHEN "orderFlags" = 0 THEN 'Short-Term'
        WHEN "orderFlags" = 32 THEN 'Long-Term'
        ELSE 'Other'
    END as type
FROM orders
ORDER BY "createdAtHeight" DESC
LIMIT 10;
```

### Check for Specific Market (TEST-USD)

```sql
-- Orders for TEST-USD market (clobPairId = 35)
SELECT 
    "clientId",
    side,
    size,
    price,
    status,
    "createdAtHeight"
FROM orders
WHERE "clobPairId" = 35
ORDER BY "createdAtHeight" DESC
LIMIT 20;
```

### Check Fills/Matches

```sql
-- Recent fills
SELECT 
    f.id,
    f.size,
    f.price,
    f."createdAtHeight",
    o.side,
    o."clientId"
FROM fills f
LEFT JOIN orders o ON f."orderId" = o.id
ORDER BY f."createdAtHeight" DESC
LIMIT 10;
```

---

## Part 6: Why Database Might Be Empty

### Common Reasons

1. **Ender Service Not Running**
   - Ender processes blockchain events and populates the database
   - Check: `docker logs indexer_ender_1`

2. **Ender Build Issues**
   - Missing TypeScript build files
   - Error: `Cannot find module '/home/dydx/app/services/ender/build/src/index.js'`

3. **Kafka Connection Issues**
   - Ender can't connect to blockchain events
   - Check Kafka broker URLs in docker-compose

### How to Fix

```bash
# Check if Ender is running
docker ps | grep ender

# Check Ender logs
docker logs indexer_ender_1 --tail 50

# Restart Ender
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml restart ender

# If build issues, rebuild
docker-compose -f docker-compose-local-deployment.yml build ender
docker-compose -f docker-compose-local-deployment.yml up -d ender
```

---

## Part 7: Alternative: Direct Database Access

If pgAdmin doesn't work, you can query the database directly:

```bash
# Connect to PostgreSQL container
docker exec -it indexer_postgres_1 psql -U dydx_dev -d dydx_dev

# Run queries
dydx_dev=# SELECT COUNT(*) FROM orders;
dydx_dev=# \dt  -- List all tables
dydx_dev=# \d orders  -- Describe orders table
dydx_dev=# \q  -- Quit
```

---

## Part 8: Service Status Reference

### All Indexer Services

| Service | Port | Purpose | Status Check |
|---------|------|---------|--------------|
| **postgres** | 5435:5432 | Database | `docker logs indexer_postgres_1` |
| **redis** | 6382:6379 | Cache | `docker logs indexer_redis_1` |
| **pgadmin** | 5050:80 | DB Admin UI | http://localhost:5050 |
| **comlink** | 3002:3002 | REST API | http://localhost:3002/v4/height |
| **ender** | - | Event processor | `docker logs indexer_ender_1` |
| **socks** | 3003:3003 | WebSocket | ws://localhost:3003 |

### Check All Services

```bash
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml ps
```

---

## Part 9: Troubleshooting

### pgAdmin Won't Start

```bash
# Check if port 5050 is already in use
sudo lsof -i :5050

# Remove old container
docker rm -f indexer_pgadmin_1

# Restart
docker-compose -f docker-compose-local-deployment.yml up -d pgadmin
```

### Can't Connect to Database

**Error:** "Could not connect to server"

**Solutions:**
1. Use `postgres` as hostname (not `localhost`)
2. Use port `5432` (internal Docker network)
3. Verify postgres is running: `docker ps | grep postgres`

### Database is Empty

**This is expected if:**
- Ender service is not running
- No orders have been placed yet
- Ender has build/connection issues

**Verify orders exist on chain:**
```bash
cd /data/data/v4-chain/protocol/scripts
bash verify_short_term_orders.sh
```

---

## Part 10: Complete Setup Script

Save this as `setup_pgadmin.sh`:

```bash
#!/bin/bash
# Setup pgAdmin for dYdX v4 Indexer

echo "=== Setting up pgAdmin for dYdX v4 ==="

# 1. Add pgAdmin to docker-compose (manual step)
echo "Step 1: Add pgAdmin service to docker-compose-local-deployment.yml"
echo "  (See documentation for YAML configuration)"
echo ""

# 2. Start services
echo "Step 2: Starting indexer services with pgAdmin..."
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink pgadmin

# 3. Wait for services
echo "Step 3: Waiting for services to start..."
sleep 10

# 4. Check status
echo "Step 4: Checking service status..."
docker-compose -f docker-compose-local-deployment.yml ps

# 5. Instructions
echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Access pgAdmin:"
echo "  URL: http://localhost:5050"
echo "  Email: admin@admin.com"
echo "  Password: admin"
echo ""
echo "Database Connection:"
echo "  Host: postgres"
echo "  Port: 5432"
echo "  Database: dydx_dev"
echo "  Username: dydx_dev"
echo "  Password: dydxserver123"
echo ""
```

---

## Summary

### Quick Reference

**pgAdmin Access:**
- URL: http://localhost:5050
- Login: `admin@admin.com` / `admin`

**Database Connection:**
- Host: `postgres` (or `localhost` from host)
- Port: `5432` (or `5435` from host)
- Database: `dydx_dev`
- User: `dydx_dev`
- Password: `dydxserver123`

**Key Tables:**
- `orders` - All orders
- `fills` - Order matches
- `subaccounts` - Account data

**Important:** Database will be empty if Ender service is not running!

---

## Related Documentation

- [COMPLETE_TESTING_GUIDE.md](./COMPLETE_TESTING_GUIDE.md) - Full testing workflow
- [SHORT_TERM_ORDERS_GRPC_GUIDE.md](./SHORT_TERM_ORDERS_GRPC_GUIDE.md) - Order placement guide
- [GRPC_TRADING_STATUS.md](../GRPC_TRADING_STATUS.md) - Current system status
