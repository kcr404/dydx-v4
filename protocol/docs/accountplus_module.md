# AccountPlus Module

## Overview

The AccountPlus module extends the standard Cosmos SDK account functionality by introducing smart account capabilities with authenticators. This module enables accounts to have multiple authentication methods beyond traditional private key signatures, allowing for more sophisticated account management and transaction authorization patterns.

The module is based on the Osmosis `x/smart-account` module with modifications specific to the dYdX v4 chain requirements.

## Contents

1. [Concepts](#concepts)
2. [State](#state)
3. [Messages](#messages)
4. [Queries](#queries)
5. [Authenticators](#authenticators)
6. [Ante Handler](#ante-handler)
7. [CLI](#cli)

## Concepts

### Smart Accounts

Smart accounts are Cosmos SDK accounts that can be authorized through various authentication methods beyond simple private key signatures. Each account can have multiple authenticators registered, and transactions can specify which authenticator to use for validation.

### Authenticators

Authenticators are modular components that define how an account can be authenticated for a specific transaction. They can be simple (like signature verification) or complex (combinations of multiple authenticators).

### Timestamp Nonce Anti-Replay Protection

The module implements timestamp-based nonce management to prevent replay attacks while allowing for more flexible transaction ordering compared to traditional sequence numbers.

### Circuit Breaker

The module includes a circuit breaker mechanism that can disable smart account functionality entirely through governance control.

## State

### Account State

Each account that uses timestamp nonces maintains state tracking:

```protobuf
message AccountState {
  string address = 1;
  TimestampNonceDetails timestamp_nonce_details = 2;
}

message TimestampNonceDetails {
  repeated uint64 timestamp_nonces = 1;
  uint64 max_ejected_nonce = 2;
}
```

### AccountAuthenticator

Each account can have multiple authenticators registered:

```protobuf
message AccountAuthenticator {
  uint64 id = 1;
  string type = 2;
  bytes config = 3;
}
```

### Module Parameters

Module parameters control the activation state:

```protobuf
message Params {
  bool is_smart_account_active = 1;
}
```

### GenesisState

The module's genesis state includes accounts, parameters, and authenticator data:

```protobuf
message GenesisState {
  repeated AccountState accounts = 1;
  Params params = 2;
  uint64 next_authenticator_id = 3;
  repeated AuthenticatorData authenticator_data = 4;
}

message AuthenticatorData {
  string address = 1;
  repeated AccountAuthenticator authenticators = 2;
}
```

## Messages

### MsgAddAuthenticator

Adds a new authenticator to an account.

```protobuf
message MsgAddAuthenticator {
  string sender = 1;
  string authenticator_type = 2;
  bytes data = 3;
}

message MsgAddAuthenticatorResponse {
  bool success = 1;
}
```

### MsgRemoveAuthenticator

Removes an authenticator from an account.

```protobuf
message MsgRemoveAuthenticator {
  string sender = 1;
  uint64 id = 2;
}

message MsgRemoveAuthenticatorResponse {
  bool success = 1;
}
```

### MsgSetActiveState

Enables or disables the smart account functionality (governance-only).

```protobuf
message MsgSetActiveState {
  string authority = 1;
  bool active = 2;
}

message MsgSetActiveStateResponse {}
```

## Query Methods

### Params

Returns the module parameters.

```protobuf
message QueryParamsRequest {}

message QueryParamsResponse {
  Params params = 1;
}
```

### GetAuthenticator

Returns a specific authenticator for an account.

```protobuf
message GetAuthenticatorRequest {
  string account = 1;
  uint64 authenticator_id = 2;
}

message GetAuthenticatorResponse {
  AccountAuthenticator account_authenticator = 1;
}
```

### GetAuthenticators

Returns all authenticators for an account.

```protobuf
message GetAuthenticatorsRequest {
  string account = 1;
}

message GetAuthenticatorsResponse {
  repeated AccountAuthenticator account_authenticators = 1;
}
```

### AccountState

Returns the account state for timestamp nonce tracking.

```protobuf
message AccountStateRequest {
  string address = 1;
}

message AccountStateResponse {
  AccountState account_state = 1;
}
```

## Authenticator Types

### SignatureVerification

Verifies secp256k1 signatures against a configured public key.

Type: `SignatureVerification`

Configuration: 33-byte compressed secp256k1 public key

### MessageFilter

Filters messages based on their type URLs.

Type: `MessageFilter`

Configuration: String of message type URLs separated by `;`

### SubaccountFilter

Filters CLOB messages based on subaccount numbers.

Type: `SubaccountFilter`

Configuration: String of subaccount numbers separated by `;`

### ClobPairIdFilter

Filters CLOB messages based on CLOB pair IDs.

Type: `ClobPairIdFilter`

Configuration: String of CLOB pair IDs separated by `;`

### AllOf

Logical AND composite authenticator requiring all sub-authenticators to pass.

Types: `AllOf`, `PartitionedAllOf`

Configuration: JSON array of sub-authenticator configurations

### AnyOf

Logical OR composite authenticator requiring at least one sub-authenticator to pass.

Types: `AnyOf`, `PartitionedAnyOf`

Configuration: JSON array of sub-authenticator configurations

## Ante Handler

The module implements an ante handler that processes authenticator-based transaction validation:

1. Checks if smart accounts are active
2. Validates transaction fee payer requirements
3. Processes each message with its selected authenticator
4. Executes authenticator authentication, tracking, and confirmation phases

Transactions must include a `TxExtension` with selected authenticator IDs for each message.

## CLI

### Transactions

#### add-authenticator

Registers an authenticator for an account.

```bash
dydxprotocold tx accountplus add-authenticator [account] [authenticator_type] [data]
```

#### remove-authenticator

Removes an authenticator from an account.

```bash
dydxprotocold tx accountplus remove-authenticator [sender] [authenticator_id]
```

### Queries

#### param

Gets module parameters.

```bash
dydxprotocold query accountplus param
```

#### get-authenticator

Gets a specific authenticator for an account.

```bash
dydxprotocold query accountplus get-authenticator [account] [authenticator_id]
```

#### get-all-authenticators

Gets all authenticators for an account.

```bash
dydxprotocold query accountplus get-all-authenticators [account]
```

#### account-state

Gets account state for timestamp nonce tracking.

```bash
dydxprotocold query accountplus account-state [address]
