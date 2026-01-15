# Bug Report: First Transaction in Proposal Proposal is Silently Dropped

**Severity**: High (Data Loss / Transaction Censorship)
**Component**: `x/app/prepare` (PrepareProposal)

## Summary
A logic error in the `PrepareProposalHandler` causes the **first transaction** of every block proposal to be silently discarded. This occurs because the `RemoveDisallowMsgs` function is called with a slice start index of `1` (`req.Txs[1:]`), intentionally skipping the first element.

This effectively means that if a user's transaction is ordered first in the proposal (by the sender or mempool), it will never be included in the block, leading to intermittent transaction failures that appear random to the user.

## Vulnerable Code

**File**: `protocol/app/prepare/prepare_proposal.go`

```go
// Current Implementation
// The slice [1:] skips the first transaction (index 0)
txsWithoutDisallowMsgs := RemoveDisallowMsgs(ctx, txConfig.TxDecoder(), req.Txs[1:])
```

## Impact
- **Transaction Loss**: Valid transactions are dropped without error or notification.
- **Intermittent Failures**: Users may experience "flaky" order placement where some orders work and others vanish, depending on their position in the mempool/proposal.
- **UX Degradation**: Users effectively pay for gas (in terms of time/effort, though rejected txs don't consume fee) but get no execution.
- **Liveness**: Determines a localized liveness failure for specific transactions.

## Reproduction
1.  Spin up a local validator node.
2.  Send a single transaction (e.g., `MsgPlaceOrder`) to the node.
3.  Observe logs or block results.
4.  The transaction will be received by the mempool but will **not** appear in the final block, as it is index `0` and is stripped out during `PrepareProposal`.

## Recommended Fix
Remove the slicing index to process all transactions.

```go
// Recommended Fix
txsWithoutDisallowMsgs := RemoveDisallowMsgs(ctx, txConfig.TxDecoder(), req.Txs)
```

## References
*   This pattern (`[1:]`) is often used in other Cosmos chains to skip a special system transaction (like an Oracle vote) that is injected at index 0.
*   However, if `RemoveDisallowMsgs` is run *before* any system transactions are injected, or if the first transaction is a standard user tx, this slice is incorrect.
