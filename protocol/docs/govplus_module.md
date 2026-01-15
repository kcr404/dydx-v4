# GovPlus Module

## Overview

The GovPlus module extends the standard Cosmos SDK governance functionality by providing additional governance capabilities. Currently, it implements a mechanism for governance to slash validators for misbehavior through a dedicated message.

## Contents

1. [Concepts](#concepts)
2. [State](#state)
3. [Messages](#messages)
4. [Queries](#queries)
5. [CLI](#cli)

## Concepts

### Validator Slashing via Governance

The GovPlus module enables governance proposals to slash validators for misbehavior that may have occurred in the past. This is particularly useful for situations where a validator has committed an infraction but it wasn't detected or reported immediately, or when governance wants to take action on validator misbehavior that falls outside the scope of automatic detection mechanisms.

The module provides a `MsgSlashValidator` message that can only be executed by authorized governance entities. This message allows governance to specify:

- The validator to be slashed
- The height at which the infraction occurred
- The tokens the validator had at the time of the infraction
- The slash factor to apply

## State

The GovPlus module has minimal state requirements. The genesis state is essentially empty:

```protobuf
message GenesisState {}
```

## Messages

### MsgSlashValidator

Allows governance to slash a validator for misbehavior.

```protobuf
message MsgSlashValidator {
  string authority = 1;
  // Consensus address of the validator to slash
  string validator_address = 2;
  // Colloquially, the height at which the validator is deemed to have
  // misbehaved. In practice, this is the height used to determine the targets
  // of the slash. For example, undelegating after this height will not escape
  // slashing. This height should be set to a recent height at the time of the
  // proposal to prevent delegators from undelegating during the vote period.
  // i.e. infraction_height <= proposal submission height.
  //
  // NB: At the time this message is applied, this height must have occured
  // equal to or less than an unbonding period in the past in order for the
  // slash to be effective.
  // i.e. time(proposal pass height) - time(infraction_height) < unbonding
  // period
  uint32 infraction_height = 3;
  // Tokens of the validator at the specified height. Used to compute the slash
  // amount. The x/staking HistoricalInfo query endpoint can be used to find
  // this.
  github.com/dydxprotocol/v4-chain/protocol/dtypes.SerializableInt tokens_at_infraction_height = 4;
  // Multiplier for how much of the validator's stake should be slashed.
  // slash_factor * tokens_at_infraction_height = tokens slashed
  cosmossdk.io/math.LegacyDec slash_factor = 5;
}

message MsgSlashValidatorResponse {}
```

Validation rules:

- Authority must be a valid bech32 address
- Validator address must be a valid consensus address
- Tokens at infraction height must be positive
- Slash factor must be between 0 and 1 inclusive

## Queries

The GovPlus module currently does not expose any query endpoints.

## CLI

### Transactions

The GovPlus module does not currently expose any CLI transaction commands.

### Query Commands

The GovPlus module does not currently expose any CLI query commands.
