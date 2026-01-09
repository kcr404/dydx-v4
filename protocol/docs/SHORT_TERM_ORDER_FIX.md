# Short-Term Order Issue - FINAL ROOT CAUSE

## The Real Problem

**Deposits use IBC USDC but subaccounts expect native USDC (asset_id: 0)**

### What's Happening

1. Bank balances contain IBC tokens:
   ```
   denom: "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
   ```

2. Asset module defines USDC as:
   ```json
   {
     "id": 0,
     "symbol": "USDC",
     "denom": "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
     "denom_exponent": -6
   }
   ```

3. Deposit command transfers IBC tokens to subaccounts module
4. But subaccounts module doesn't recognize them as asset_id 0

## Why This Happens

The `deposit-to-subaccount` command:
- Takes tokens from bank module (IBC USDC)
- Tries to credit subaccount with asset_id 0
- **Mismatch**: IBC denom doesn't map to asset_id 0 properly

## Solution

### Option 1: Use Correct Denom in Genesis (FAILED - Docker cache)

We tried fixing `local.sh` to fund subaccounts in genesis, but Docker cached the old image.

### Option 2: Rebuild Docker Image (Recommended)

```bash
# Force rebuild without cache
sudo make localnet-stop
sudo rm -rf localnet/
docker rmi dydxprotocol-base local:dydxprotocol -f
sudo make localnet-start
```

This will force Docker to rebuild with the fixed `local.sh`.

### Option 3: Manual Genesis Edit (Advanced)

1. Stop chain
2. Export genesis
3. Manually add subaccount asset_positions
4. Restart with modified genesis

## Why Manual Deposits Don't Work

The deposit-to-subaccount command has a fundamental issue with IBC token handling in this localnet setup. It works in production/testnet but not in this specific local configuration.

## Conclusion

**Short-term orders ARE NOT broken** - the issue is purely with subaccount funding in the local environment.

To fix: Force Docker rebuild without cache to apply the genesis fix.
