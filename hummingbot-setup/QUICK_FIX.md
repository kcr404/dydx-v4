# Quick Fix - Use Existing Strategy

## The Issue

Hummingbot is looking for strategy files but not finding them. The files exist, but Hummingbot needs them in a specific format.

## ✅ SOLUTION: Use the strategy that already exists!

You have `pure_mm_paper.yml` which is already there. Let's use that!

---

## Type This Exactly:

```
import pure_mm_paper
```

Then:
```
start
```

---

## If That Doesn't Work, Create Strategy Manually

Instead of importing, CREATE a new strategy:

### Type this:
```
create
```

### Then follow the prompts:

1. **What is your market making strategy?**
   ```
   pure_market_making
   ```

2. **Enter your maker spot connector:**
   ```
   paper_trade
   ```

3. **Enter the token trading pair:**
   ```
   BTC-USDT
   ```

4. **How far away from the mid price do you want to place bid orders?**
   ```
   0.5
   ```

5. **How far away from the mid price do you want to place ask orders?**
   ```
   0.5
   ```

6. **How much do you want to trade per order?**
   ```
   0.01
   ```

7. **Would you like to enable inventory skew?**
   ```
   No
   ```

8. **How often do you want to cancel and replace bids and asks?**
   ```
   30
   ```

9. **Do you want to enable adding transaction costs?**
   ```
   No
   ```

10. **Enter the name for your configuration:**
    ```
    my_dydx_strategy
    ```

---

## Then Start:

```
start
```

---

## Summary

**Option 1** (Easiest): `import pure_mm_paper`

**Option 2** (If import fails): `create` and follow prompts above

Both will get you paper trading!
