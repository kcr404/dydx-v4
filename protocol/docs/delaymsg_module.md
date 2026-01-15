# DelayMsg Module

## Overview

The delaymsg module enables the scheduling of Cosmos SDK messages for execution at a future block height. This functionality is particularly useful for implementing time-based operations, delayed governance actions, or any scenario where message execution needs to be postponed.

## Contents

- [DelayMsg Module](#delaymsg-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Delayed Message Execution](#delayed-message-execution)
    - [Message Validation](#message-validation)
    - [Authority-Based Submission](#authority-based-submission)
  - [State](#state)
    - [DelayedMessage](#delayedmessage)
    - [BlockMessageIds](#blockmessageids)
  - [Messages](#messages)
    - [MsgDelayMessage](#msgdelaymessage)
  - [Queries](#queries)
    - [NextDelayedMessageId](#nextdelayedmessageid)
    - [Message](#message)
    - [Block Message IDs Query](#block-message-ids-query)
  - [Events](#events)
  - [Functions](#functions)
    - [Core Keeper Functions](#core-keeper-functions)
      - [DelayMessageByBlocks](#delaymessagebyblocks)
      - [DispatchMessagesForBlock](#dispatchmessagesforblock)
  - [Integration with Other Modules](#integration-with-other-modules)

## Concepts

### Delayed Message Execution

The delaymsg module allows any Cosmos SDK message to be scheduled for execution at a future block height. When a message is submitted for delay, it's stored in the module's state with a target block height. During the EndBlock phase of that target block, all messages scheduled for that block are executed.

### Message Validation

Before a message is delayed, it undergoes several validation checks:

1. The message must be routable (have a registered handler)
2. The message must pass its ValidateBasic method
3. The message must have exactly one signer, which must be the delaymsg module address

### Authority-Based Submission

Only authorized addresses can submit messages for delay. This authorization is controlled through the module's keeper configuration and checked when processing MsgDelayMessage.

## State

### DelayedMessage

Represents a message that has been scheduled for future execution.

```protobuf
message DelayedMessage {
  uint32 id = 1;
  google.protobuf.Any msg = 2;
  uint32 block_height = 3;
}
```

**Fields:**

- `id` - Unique identifier for this delayed message
- `msg` - The Cosmos SDK message to be executed (encoded as Any)
- `block_height` - The block height at which this message should be executed

### BlockMessageIds

Stores the IDs of all delayed messages scheduled for execution at a specific block height.

```protobuf
message BlockMessageIds {
  repeated uint32 ids = 1;
}
```

**Fields:**

- `ids` - List of delayed message IDs scheduled for execution at the block height corresponding to this entry

## Messages

### MsgDelayMessage

Schedules a Cosmos SDK message for execution after a specified number of blocks.

```protobuf
message MsgDelayMessage {
  string authority = 1;
  google.protobuf.Any msg = 2;
  uint32 delay_blocks = 3;
}
```

**Fields:**

- `authority` - The address submitting the message for delay (must be authorized)
- `msg` - The Cosmos SDK message to be delayed (encoded as Any)
- `delay_blocks` - Number of blocks to delay execution

**Response:**

```protobuf
message MsgDelayMessageResponse {
  uint64 id = 1;
}
```

## Queries

### NextDelayedMessageId

Returns the next available ID for a delayed message.

```protobuf
message QueryNextDelayedMessageIdRequest {}

message QueryNextDelayedMessageIdResponse {
  uint32 next_delayed_message_id = 1;
}
```

### Message

Retrieves a specific delayed message by its ID.

```protobuf
message QueryMessageRequest {
  uint32 id = 1;
}

message QueryMessageResponse {
  DelayedMessage message = 1;
}
```

### Block Message IDs Query

Retrieves the IDs of all delayed messages scheduled for execution at a specific block height.

```protobuf
message QueryBlockMessageIdsRequest {
  uint32 block_height = 1;
}

message QueryBlockMessageIdsResponse {
  repeated uint32 message_ids = 1;
}
```

## Events

The delaymsg module does not emit any specific events. However, events from the executed delayed messages are propagated to the current context during execution.

## Functions

### Core Keeper Functions

#### DelayMessageByBlocks

Registers a Cosmos SDK message to be executed after a specified number of blocks.

```go
func (k Keeper) DelayMessageByBlocks(
  ctx sdk.Context,
  msg sdk.Msg,
  blockDelay uint32,
) (id uint32, err error)
```

#### DispatchMessagesForBlock

Executes all delayed messages scheduled for the current block height and deletes them from state.

```go
func DispatchMessagesForBlock(k types.DelayMsgKeeper, ctx sdk.Context)
```

## Integration with Other Modules

The delaymsg module integrates with other modules by:

1. Accepting messages from any module for delayed execution
2. Routing executed messages to their appropriate handlers
3. Validating that messages conform to expected signer requirements
