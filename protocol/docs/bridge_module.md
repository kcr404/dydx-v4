# Bridge Module

## Overview

The Bridge module facilitates cross-chain asset transfers between the dYdX chain and Ethereum. It enables users to deposit assets from Ethereum to the dYdX chain and withdraw assets from the dYdX chain back to Ethereum. The module implements a secure bridging mechanism with built-in safety parameters and delayed execution to prevent malicious bridge events from affecting the chain.

## Concepts

### Bridge Events

Bridge events represent recognized transfers of assets between Ethereum and the dYdX chain. Each bridge event contains:

- Unique ID for tracking
- Coin specification (denomination and amount)
- Destination address on the dYdX chain
- Ethereum block height at which the event occurred

### Two-Step Process

The bridge module implements a two-step process for handling bridge events:

1. **Acknowledgment**: Recognized bridge events are acknowledged by validators and scheduled for completion
2. **Completion**: After a safety delay, the bridge event is executed and tokens are transferred

### Safety Mechanisms

The bridge module includes several safety mechanisms:

- Configurable delay period before bridge completion
- Ability to disable bridging entirely
- Rate limiting of bridge proposals to prevent spam
- Time-based skipping mechanisms to handle network delays

## State

### Parameters

#### Event Parameters

```go
type EventParams struct {
    Denom      string // Denomination of the bridged token
    EthChainId uint64 // Expected Ethereum chain ID
    EthAddress string // Ethereum contract address
}
```

These parameters define the basic configuration for bridging, including which Ethereum contract and chain to monitor.

#### Propose Parameters

```go
type ProposeParams struct {
    MaxBridgesPerBlock           uint32        // Maximum bridges to propose per block
    ProposeDelayDuration         time.Duration // Delay before proposing recognized events
    SkipRatePpm                  uint32        // Probability of skipping bridge proposals (parts per million)
    SkipIfBlockDelayedByDuration time.Duration // Skip proposals if block is delayed
}
```

These parameters control how bridge events are proposed by validators.

#### Safety Parameters

```go
type SafetyParams struct {
    IsDisabled  bool   // Whether bridging is disabled
    DelayBlocks uint32 // Number of blocks to delay bridge completion
}
```

These parameters control the safety mechanisms for bridge execution.

### Bridge Event Info

The module tracks two types of event information:

- **Acknowledged Event Info**: The latest event ID and Ethereum block height that has been acknowledged by consensus
- **Recognized Event Info**: The latest event ID and Ethereum block height recognized by individual nodes (non-consensus)

## Keeper Methods

### Parameter Management

- `GetEventParams(ctx)`: Retrieve current event parameters
- `UpdateEventParams(ctx, params)`: Update event parameters with validation
- `GetProposeParams(ctx)`: Retrieve current propose parameters
- `UpdateProposeParams(ctx, params)`: Update propose parameters with validation
- `GetSafetyParams(ctx)`: Retrieve current safety parameters
- `UpdateSafetyParams(ctx, params)`: Update safety parameters with validation

### Bridge Event Management

- `GetAcknowledgedEventInfo(ctx)`: Get the latest acknowledged event information
- `SetAcknowledgedEventInfo(ctx, info)`: Set the acknowledged event information
- `GetRecognizedEventInfo(ctx)`: Get the latest recognized event information from the bridge event manager

### Bridge Processing

- `GetAcknowledgeBridges(ctx, blockTimestamp)`: Generate a message to acknowledge recognized bridge events
- `AcknowledgeBridges(ctx, events)`: Acknowledge a list of bridge events and schedule them for completion
- `CompleteBridge(ctx, event)`: Execute a bridge event by transferring tokens to the destination address
- `GetDelayedCompleteBridgeMessages(ctx, address)`: Get all pending bridge completion messages for an address

## Messages

### MsgAcknowledgeBridges

Acknowledges a list of bridge events, scheduling them for completion after the safety delay.

### MsgCompleteBridge

Completes a bridge event by transferring tokens to the destination address. This message is automatically generated and delayed by the module.

### Parameter Updates

- `MsgUpdateEventParams`: Update event parameters
- `MsgUpdateProposeParams`: Update propose parameters
- `MsgUpdateSafetyParams`: Update safety parameters

## Genesis

The bridge module's genesis state includes:

- Event parameters with default values
- Propose parameters with default values
- Safety parameters with default values
- Acknowledged event information initialized to zero values

Default values:

- EventParams:
  - Denom: "bridge-token"
  - EthChainId: 11155111 (Sepolia testnet)
  - EthAddress: "0xEf01c3A30eB57c91c40C52E996d29c202ae72193"
- ProposeParams:
  - MaxBridgesPerBlock: 10
  - ProposeDelayDuration: 60 seconds
  - SkipRatePpm: 800,000 (80%)
  - SkipIfBlockDelayedByDuration: 5 seconds
- SafetyParams:
  - IsDisabled: false
  - DelayBlocks: 86,400 (approximately 1 day assuming 1 block per second)

## Integration

### Dependencies

- **Bank Module**: Used to transfer tokens during bridge completion
- **DelayMsg Module**: Used to schedule bridge completions after the safety delay
- **Bridge Daemon**: External daemon that monitors Ethereum for bridge events and communicates with the bridge event manager

### Integration Points

- **Assets Module**: Bridged tokens must be registered assets in the assets module
- **Sending Module**: Post-bridge transfers may use the sending module
- **Subaccounts Module**: Recipients of bridged tokens may be subaccount addresses

### Event Flow

1. Bridge daemon detects events on Ethereum contract
2. Events are communicated to bridge event manager
3. Validators propose acknowledgment of recognized events
4. Consensus acknowledges events and schedules completion
5. After safety delay, bridge completion executes token transfer
