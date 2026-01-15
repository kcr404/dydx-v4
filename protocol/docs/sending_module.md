# Sending Module

## Overview

The Sending module manages the transfer of assets between different account types in the dYdX v4 chain protocol. It handles transfers between subaccounts, deposits from regular accounts to subaccounts, withdrawals from subaccounts to regular accounts, and special transfers from module accounts to regular accounts. The module integrates with the subaccounts, bank, and account modules to facilitate these transfers while maintaining proper accounting and emitting relevant events for indexing.

## Contents

- [Sending Module](#sending-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Subaccount Transfers](#subaccount-transfers)
    - [Account to Subaccount Deposits](#account-to-subaccount-deposits)
    - [Subaccount to Account Withdrawals](#subaccount-to-account-withdrawals)
    - [Module to Account Transfers](#module-to-account-transfers)
    - [Account to Account Transfers](#account-to-account-transfers)
  - [State](#state)
    - [GenesisState](#genesisstate)
  - [Messages](#messages)
    - [MsgCreateTransfer](#msgcreatetransfer)
    - [MsgDepositToSubaccount](#msgdeposittosubaccount)
    - [MsgWithdrawFromSubaccount](#msgwithdrawfromsubaccount)
    - [MsgSendFromModuleToAccount](#msgsendfrommoduletoaccount)
    - [MsgSendFromAccountToAccount](#msgsendfromaccounttoaccount)
  - [Queries](#queries)
  - [Events](#events)
    - [CreateTransfer Event](#createtransfer-event)
    - [DepositToSubaccount Event](#deposittosubaccount-event)
    - [WithdrawFromSubaccount Event](#withdrawfromsubaccount-event)
  - [Functions](#functions)
    - [Core Keeper Functions](#core-keeper-functions)
      - [ProcessTransfer](#processtransfer)
      - [ProcessDepositToSubaccount](#processdeposittosubaccount)
      - [ProcessWithdrawFromSubaccount](#processwithdrawfromsubaccount)
      - [SendFromModuleToAccount](#sendfrommoduletoaccount)
      - [SendFromAccountToAccount](#sendfromaccounttoaccount)
  - [CLI Commands](#cli-commands)
    - [Transaction Commands](#transaction-commands)
      - [`create-transfer`](#create-transfer)
      - [`deposit-to-subaccount`](#deposit-to-subaccount)
      - [`withdraw-from-subaccount`](#withdraw-from-subaccount)
  - [Integration with Other Modules](#integration-with-other-modules)
    - [Subaccounts](#subaccounts)
    - [Bank](#bank)
    - [Account](#account)

## Concepts

### Subaccount Transfers

The sending module enables transfers of assets between subaccounts. A subaccount is identified by an owner address and a subaccount number. Transfers between subaccounts update the balance of the specified asset in both the sender and recipient subaccounts. This functionality is primarily used for moving funds between different trading accounts of the same user or between different users.

### Account to Subaccount Deposits

Users can deposit assets from their regular bank accounts to subaccounts. This functionality allows users to move funds from their main wallet address into a subaccount for trading purposes. The deposit operation transfers the specified amount of an asset from a regular account to a subaccount, updating both account balances accordingly.

### Subaccount to Account Withdrawals

Users can withdraw assets from their subaccounts back to their regular bank accounts. This functionality allows users to move funds from a subaccount back to their main wallet address. The withdrawal operation transfers the specified amount of an asset from a subaccount to a regular account, updating both account balances accordingly.

### Module to Account Transfers

Authorized entities (typically governance) can initiate transfers from module accounts to regular accounts. This functionality is used for distributing rewards, refunds, or other protocol-related transfers from module-controlled accounts to user accounts. These transfers use the standard Cosmos SDK bank module functionality for moving funds.

### Account to Account Transfers

Authorized entities (typically governance) can initiate transfers between regular accounts. This functionality is used for administrative transfers between user accounts when needed for protocol operations. These transfers use the standard Cosmos SDK bank module functionality for moving funds.

## State

### GenesisState

The sending module has an empty genesis state as it doesn't maintain persistent state beyond facilitating transfers.

```protobuf
message GenesisState {
}
```

## Messages

### MsgCreateTransfer

Initiates a transfer of assets between two subaccounts.

```protobuf
rpc CreateTransfer(MsgCreateTransfer) returns (MsgCreateTransferResponse);
```

Fields:

- `transfer`: The transfer details including sender, recipient, asset ID, and amount

### MsgDepositToSubaccount

Initiates a deposit from a regular account to a subaccount.

```protobuf
rpc DepositToSubaccount(MsgDepositToSubaccount) returns (MsgDepositToSubaccountResponse);
```

Fields:

- `sender`: The sender's account address
- `recipient`: The recipient subaccount ID
- `asset_id`: The ID of the asset being transferred
- `quantums`: The amount of asset to transfer in quantum units

### MsgWithdrawFromSubaccount

Initiates a withdrawal from a subaccount to a regular account.

```protobuf
rpc WithdrawFromSubaccount(MsgWithdrawFromSubaccount) returns (MsgWithdrawFromSubaccountResponse);
```

Fields:

- `sender`: The sender subaccount ID
- `recipient`: The recipient account address
- `asset_id`: The ID of the asset being transferred
- `quantums`: The amount of asset to transfer in quantum units

### MsgSendFromModuleToAccount

Initiates a transfer from a module account to a regular account. This message can only be executed by authorized entities (typically governance).

```protobuf
rpc SendFromModuleToAccount(MsgSendFromModuleToAccount) returns (MsgSendFromModuleToAccountResponse);
```

Fields:

- `authority`: The address authorized to execute this message
- `sender_module_name`: The name of the module sending the funds
- `recipient`: The recipient account address
- `coin`: The coin being transferred (denomination and amount)

### MsgSendFromAccountToAccount

Initiates a transfer from one regular account to another regular account. This message can only be executed by authorized entities (typically governance).

```protobuf
rpc SendFromAccountToAccount(MsgSendFromAccountToAccount) returns (MsgSendFromAccountToAccountResponse);
```

Fields:

- `authority`: The address authorized to execute this message
- `sender`: The sender account address
- `recipient`: The recipient account address
- `coin`: The coin being transferred (denomination and amount)

## Queries

The sending module does not expose any query endpoints as it doesn't maintain persistent state that needs to be queried.

## Events

### CreateTransfer Event

Emitted when a transfer between subaccounts is successfully processed.

```protobuf
message Event {
  string type = 1;
  repeated Attribute attributes = 2;
}

message Attribute {
  string key = 1;
  string value = 2;
}
```

Attributes:

- `sender`: The owner address of the sending subaccount
- `sender_number`: The subaccount number of the sender
- `recipient`: The owner address of the receiving subaccount
- `recipient_number`: The subaccount number of the recipient
- `asset_id`: The ID of the asset being transferred
- `quantums`: The amount of asset transferred

### DepositToSubaccount Event

Emitted when a deposit from an account to a subaccount is successfully processed.

```protobuf
message Event {
  string type = 1;
  repeated Attribute attributes = 2;
}

message Attribute {
  string key = 1;
  string value = 2;
}
```

Attributes:

- `sender`: The sender's account address
- `recipient`: The owner address of the receiving subaccount
- `recipient_number`: The subaccount number of the recipient
- `asset_id`: The ID of the asset being transferred
- `quantums`: The amount of asset deposited

### WithdrawFromSubaccount Event

Emitted when a withdrawal from a subaccount to an account is successfully processed.

```protobuf
message Event {
  string type = 1;
  repeated Attribute attributes = 2;
}

message Attribute {
  string key = 1;
  string value = 2;
}
```

Attributes:

- `sender`: The owner address of the sending subaccount
- `sender_number`: The subaccount number of the sender
- `recipient`: The recipient's account address
- `asset_id`: The ID of the asset being transferred
- `quantums`: The amount of asset withdrawn

## Functions

### Core Keeper Functions

#### ProcessTransfer

Processes a transfer between two subaccounts by calling the subaccounts module's transfer function.

```go
func (k Keeper) ProcessTransfer(
  ctx sdk.Context,
  pendingTransfer *types.Transfer,
) (err error)
```

#### ProcessDepositToSubaccount

Processes a deposit from a regular account to a subaccount by calling the subaccounts module's deposit function.

```go
func (k Keeper) ProcessDepositToSubaccount(
  ctx sdk.Context,
  msgDepositToSubaccount *types.MsgDepositToSubaccount,
) (err error)
```

#### ProcessWithdrawFromSubaccount

Processes a withdrawal from a subaccount to a regular account by calling the subaccounts module's withdrawal function.

```go
func (k Keeper) ProcessWithdrawFromSubaccount(
  ctx sdk.Context,
  msgWithdrawFromSubaccount *types.MsgWithdrawFromSubaccount,
) (err error)
```

#### SendFromModuleToAccount

Sends coins from a module account to a regular account using the bank module.

```go
func (k Keeper) SendFromModuleToAccount(
  ctx sdk.Context,
  msg *types.MsgSendFromModuleToAccount,
) (err error)
```

#### SendFromAccountToAccount

Sends coins from one regular account to another regular account using the bank module.

```go
func (k Keeper) SendFromAccountToAccount(
  ctx sdk.Context,
  msg *types.MsgSendFromAccountToAccount,
) (err error)
```

## CLI Commands

### Transaction Commands

#### `create-transfer`

Create a transfer between subaccounts.

Usage:

```bash
dydxprotocold tx sending create-transfer [sender_owner] [sender_number] [recipient_owner] [recipient_number] [quantums]
```

Example:

```bash
dydxprotocold tx sending create-transfer dydx1... 0 dydx1... 0 1000000
```

#### `deposit-to-subaccount`

Deposit from an account to a subaccount.

Usage:

```bash
dydxprotocold tx sending deposit-to-subaccount [sender] [recipient_owner] [recipient_number] [quantums]
```

Example:

```bash
dydxprotocold tx sending deposit-to-subaccount dydx1... dydx1... 0 1000000
```

#### `withdraw-from-subaccount`

Withdraw from a subaccount to an account.

Usage:

```bash
dydxprotocold tx sending withdraw-from-subaccount [sender_owner] [sender_number] [recipient] [quantums]
```

Example:

```bash
dydxprotocold tx sending withdraw-from-subaccount dydx1... 0 dydx1... 1000000
```

## Integration with Other Modules

### Subaccounts

The sending module heavily depends on the subaccounts module to perform the actual balance updates for subaccount transfers, deposits, and withdrawals. It calls functions like `TransferFundsFromSubaccountToSubaccount`, `DepositFundsFromAccountToSubaccount`, and `WithdrawFundsFromSubaccountToAccount` to execute the core transfer logic.

### Bank

The sending module uses the bank module for transfers between regular accounts and for transfers from module accounts to regular accounts. It calls functions like `SendCoinsFromModuleToAccount` and `SendCoins` to execute these transfers.

### Account

The sending module interacts with the account module to ensure recipient accounts exist when processing transfers. If a recipient account doesn't exist, it creates a new account for the recipient address.
