#!/bin/bash
# Verify Short-Term Order Fills on Remote Indexer
# Run this on the INDEXER instance

echo "========================================="
echo "  Indexer Verification: Fills & Trades"
echo "========================================="

# 1. Check for relevant tables
echo -e "\n1. Checking database schema for 'fills' and 'trades'..."
sudo docker exec indexer-postgres-1 psql -U dydx -d dydx -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('fills', 'trades');
"

# 2. Check recent fills (Generic)
echo -e "\n2. Checking 5 most recent entries in 'fills' table..."
sudo docker exec indexer-postgres-1 psql -U dydx -d dydx -c "
SELECT * FROM fills ORDER BY \"createdAt\" DESC LIMIT 5;
" || echo "⚠️  Query failed (maybe 'fills' table doesn't exist or schema differs)"

# 3. Check for Alice's Fills
# Alice: tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy
ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"

echo -e "\n3. Checking fills for Alice ($ALICE)..."
sudo docker exec indexer-postgres-1 psql -U dydx -d dydx -c "
SELECT 
    f.id,
    f.\"clobPairId\",
    f.side,
    f.\"size\",
    f.price,
    f.liquidity, 
    f.\"createdAt\"
FROM fills f
JOIN subaccounts s ON f.\"subaccountId\" = s.id
WHERE s.address = '$ALICE'
ORDER BY f.\"createdAt\" DESC 
LIMIT 5;
" || echo "⚠️  Alice fill query failed"

# 4. Check for Bob's Fills (Counterparty)
# Bob (Temp): tradeview1f3cr2t8q55z3ly470wd5wv4wdlk9d8xlsgwjsr
BOB="tradeview1f3cr2t8q55z3ly470wd5wv4wdlk9d8xlsgwjsr"

echo -e "\n4. Checking fills for Bob ($BOB)..."
sudo docker exec indexer-postgres-1 psql -U dydx -d dydx -c "
SELECT 
    f.id,
    f.\"clobPairId\",
    f.side,
    f.\"size\",
    f.price,
    f.liquidity,
    f.\"createdAt\"
FROM fills f
JOIN subaccounts s ON f.\"subaccountId\" = s.id
WHERE s.address = '$BOB'
ORDER BY f.\"createdAt\" DESC 
LIMIT 5;
" || echo "⚠️  Bob fill query failed"

echo -e "\n========================================="
echo "  Verification Complete"
echo "========================================="
