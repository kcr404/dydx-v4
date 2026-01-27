package msgs

import (
	upgrade "cosmossdk.io/x/upgrade/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	auth "github.com/cosmos/cosmos-sdk/x/auth/types"
	bank "github.com/cosmos/cosmos-sdk/x/bank/types"
	consensus "github.com/cosmos/cosmos-sdk/x/consensus/types"
	crisis "github.com/cosmos/cosmos-sdk/x/crisis/types"
	distribution "github.com/cosmos/cosmos-sdk/x/distribution/types"
	gov "github.com/cosmos/cosmos-sdk/x/gov/types/v1"
	slashing "github.com/cosmos/cosmos-sdk/x/slashing/types"
	staking "github.com/cosmos/cosmos-sdk/x/staking/types"
	icahosttypes "github.com/cosmos/ibc-go/v8/modules/apps/27-interchain-accounts/host/types"
	ibctransfer "github.com/cosmos/ibc-go/v8/modules/apps/transfer/types"
	ibcclient "github.com/cosmos/ibc-go/v8/modules/core/02-client/types" //nolint:staticcheck
	ibcconn "github.com/cosmos/ibc-go/v8/modules/core/03-connection/types"
	"github.com/dydxprotocol/v4-chain/protocol/lib"
	accountplus "github.com/dydxprotocol/v4-chain/protocol/x/accountplus/types"
	affiliates "github.com/dydxprotocol/v4-chain/protocol/x/affiliates/types"
	blocktime "github.com/dydxprotocol/v4-chain/protocol/x/blocktime/types"
	bridge "github.com/dydxprotocol/v4-chain/protocol/x/bridge/types"
	clob "github.com/dydxprotocol/v4-chain/protocol/x/clob/types"
	delaymsg "github.com/dydxprotocol/v4-chain/protocol/x/delaymsg/types"
	feetiers "github.com/dydxprotocol/v4-chain/protocol/x/feetiers/types"
	govplus "github.com/dydxprotocol/v4-chain/protocol/x/govplus/types"
	listing "github.com/dydxprotocol/v4-chain/protocol/x/listing/types"
	perpetuals "github.com/dydxprotocol/v4-chain/protocol/x/perpetuals/types"
	prices "github.com/dydxprotocol/v4-chain/protocol/x/prices/types"
	ratelimit "github.com/dydxprotocol/v4-chain/protocol/x/ratelimit/types"
	revshare "github.com/dydxprotocol/v4-chain/protocol/x/revshare/types"
	rewards "github.com/dydxprotocol/v4-chain/protocol/x/rewards/types"
	sending "github.com/dydxprotocol/v4-chain/protocol/x/sending/types"
	stats "github.com/dydxprotocol/v4-chain/protocol/x/stats/types"
	vault "github.com/dydxprotocol/v4-chain/protocol/x/vault/types"
	vest "github.com/dydxprotocol/v4-chain/protocol/x/vest/types"
)

var (
	// InternalMsgSamplesAll are msgs that are used only used internally.
	InternalMsgSamplesAll = lib.MergeAllMapsMustHaveDistinctKeys(InternalMsgSamplesGovAuth)

	// InternalMsgSamplesGovAuth are msgs that are used only used internally.
	// GovAuth means that these messages must originate from the gov module and
	// signed by gov module account.
	// InternalMsgSamplesAll are msgs that are used only used internally.
	InternalMsgSamplesGovAuth = lib.MergeAllMapsMustHaveDistinctKeys(
		InternalMsgSamplesDefault,
		InternalMsgSamplesDydxCustom,
	)

	// CosmosSDK default modules
	InternalMsgSamplesDefault = map[string]sdk.Msg{
		// auth
		"/cosmos.auth.v1beta1.MsgUpdateParams": &auth.MsgUpdateParams{},

		// bank
		"/cosmos.bank.v1beta1.MsgSetSendEnabled":         &bank.MsgSetSendEnabled{},
		"/cosmos.bank.v1beta1.MsgSetSendEnabledResponse": nil,
		"/cosmos.bank.v1beta1.MsgUpdateParams":           &bank.MsgUpdateParams{},
		"/cosmos.bank.v1beta1.MsgUpdateParamsResponse":   nil,

		// consensus
		"/cosmos.consensus.v1.MsgUpdateParams":         &consensus.MsgUpdateParams{},
		"/cosmos.consensus.v1.MsgUpdateParamsResponse": nil,

		// crisis
		"/cosmos.crisis.v1beta1.MsgUpdateParams":         &crisis.MsgUpdateParams{},
		"/cosmos.crisis.v1beta1.MsgUpdateParamsResponse": nil,

		// distribution
		"/cosmos.distribution.v1beta1.MsgCommunityPoolSpend":         &distribution.MsgCommunityPoolSpend{},
		"/cosmos.distribution.v1beta1.MsgCommunityPoolSpendResponse": nil,
		"/cosmos.distribution.v1beta1.MsgUpdateParams":               &distribution.MsgUpdateParams{},
		"/cosmos.distribution.v1beta1.MsgUpdateParamsResponse":       nil,

		// gov
		"/cosmos.gov.v1.MsgExecLegacyContent":         &gov.MsgExecLegacyContent{},
		"/cosmos.gov.v1.MsgExecLegacyContentResponse": nil,
		"/cosmos.gov.v1.MsgUpdateParams":              &gov.MsgUpdateParams{},
		"/cosmos.gov.v1.MsgUpdateParamsResponse":      nil,

		// slashing
		"/cosmos.slashing.v1beta1.MsgUpdateParams":         &slashing.MsgUpdateParams{},
		"/cosmos.slashing.v1beta1.MsgUpdateParamsResponse": nil,

		// staking
		"/cosmos.staking.v1beta1.MsgSetProposers":         &staking.MsgSetProposers{},
		"/cosmos.staking.v1beta1.MsgSetProposersResponse": nil,
		"/cosmos.staking.v1beta1.MsgUpdateParams":         &staking.MsgUpdateParams{},
		"/cosmos.staking.v1beta1.MsgUpdateParamsResponse": nil,

		// upgrade
		"/cosmos.upgrade.v1beta1.MsgCancelUpgrade":           &upgrade.MsgCancelUpgrade{},
		"/cosmos.upgrade.v1beta1.MsgCancelUpgradeResponse":   nil,
		"/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade":         &upgrade.MsgSoftwareUpgrade{},
		"/cosmos.upgrade.v1beta1.MsgSoftwareUpgradeResponse": nil,

		// ibc
		"/ibc.applications.interchain_accounts.host.v1.MsgUpdateParams":         &icahosttypes.MsgUpdateParams{},
		"/ibc.applications.interchain_accounts.host.v1.MsgUpdateParamsResponse": nil,
		"/ibc.applications.transfer.v1.MsgUpdateParams":                         &ibctransfer.MsgUpdateParams{},
		"/ibc.applications.transfer.v1.MsgUpdateParamsResponse":                 nil,
		"/ibc.core.client.v1.MsgUpdateParams":                                   &ibcclient.MsgUpdateParams{},
		"/ibc.core.client.v1.MsgUpdateParamsResponse":                           nil,
		"/ibc.core.connection.v1.MsgUpdateParams":                               &ibcconn.MsgUpdateParams{},
		"/ibc.core.connection.v1.MsgUpdateParamsResponse":                       nil,
	}

	// Custom modules
	InternalMsgSamplesDydxCustom = map[string]sdk.Msg{
		// affiliates
		"/tradeview.affiliates.MsgUpdateAffiliateTiers":              &affiliates.MsgUpdateAffiliateTiers{},
		"/tradeview.affiliates.MsgUpdateAffiliateTiersResponse":      nil,
		"/tradeview.affiliates.MsgUpdateAffiliateWhitelist":          &affiliates.MsgUpdateAffiliateWhitelist{},
		"/tradeview.affiliates.MsgUpdateAffiliateWhitelistResponse":  nil,
		"/tradeview.affiliates.MsgUpdateAffiliateParameters":         &affiliates.MsgUpdateAffiliateParameters{},
		"/tradeview.affiliates.MsgUpdateAffiliateParametersResponse": nil,
		"/tradeview.affiliates.MsgUpdateAffiliateOverrides":          &affiliates.MsgUpdateAffiliateOverrides{},
		"/tradeview.affiliates.MsgUpdateAffiliateOverridesResponse":  nil,

		// accountplus
		"/tradeview.accountplus.MsgSetActiveState":         &accountplus.MsgSetActiveState{},
		"/tradeview.accountplus.MsgSetActiveStateResponse": nil,

		// blocktime
		"/tradeview.blocktime.MsgUpdateDowntimeParams":          &blocktime.MsgUpdateDowntimeParams{},
		"/tradeview.blocktime.MsgUpdateDowntimeParamsResponse":  nil,
		"/tradeview.blocktime.MsgUpdateSynchronyParams":         &blocktime.MsgUpdateSynchronyParams{},
		"/tradeview.blocktime.MsgUpdateSynchronyParamsResponse": nil,

		// bridge
		"/tradeview.bridge.MsgCompleteBridge":              &bridge.MsgCompleteBridge{},
		"/tradeview.bridge.MsgCompleteBridgeResponse":      nil,
		"/tradeview.bridge.MsgUpdateEventParams":           &bridge.MsgUpdateEventParams{},
		"/tradeview.bridge.MsgUpdateEventParamsResponse":   nil,
		"/tradeview.bridge.MsgUpdateProposeParams":         &bridge.MsgUpdateProposeParams{},
		"/tradeview.bridge.MsgUpdateProposeParamsResponse": nil,
		"/tradeview.bridge.MsgUpdateSafetyParams":          &bridge.MsgUpdateSafetyParams{},
		"/tradeview.bridge.MsgUpdateSafetyParamsResponse":  nil,

		// clob
		"/tradeview.clob.MsgCreateClobPair":                             &clob.MsgCreateClobPair{},
		"/tradeview.clob.MsgCreateClobPairResponse":                     nil,
		"/tradeview.clob.MsgUpdateBlockRateLimitConfiguration":          &clob.MsgUpdateBlockRateLimitConfiguration{},
		"/tradeview.clob.MsgUpdateBlockRateLimitConfigurationResponse":  nil,
		"/tradeview.clob.MsgUpdateClobPair":                             &clob.MsgUpdateClobPair{},
		"/tradeview.clob.MsgUpdateClobPairResponse":                     nil,
		"/tradeview.clob.MsgUpdateEquityTierLimitConfiguration":         &clob.MsgUpdateEquityTierLimitConfiguration{},
		"/tradeview.clob.MsgUpdateEquityTierLimitConfigurationResponse": nil,
		"/tradeview.clob.MsgUpdateLiquidationsConfig":                   &clob.MsgUpdateLiquidationsConfig{},
		"/tradeview.clob.MsgUpdateLiquidationsConfigResponse":           nil,

		// delaymsg
		"/tradeview.delaymsg.MsgDelayMessage":         &delaymsg.MsgDelayMessage{},
		"/tradeview.delaymsg.MsgDelayMessageResponse": nil,

		// feetiers
		"/tradeview.feetiers.MsgUpdatePerpetualFeeParams":           &feetiers.MsgUpdatePerpetualFeeParams{},
		"/tradeview.feetiers.MsgUpdatePerpetualFeeParamsResponse":   nil,
		"/tradeview.feetiers.MsgSetMarketFeeDiscountParams":         &feetiers.MsgSetMarketFeeDiscountParams{},
		"/tradeview.feetiers.MsgSetMarketFeeDiscountParamsResponse": nil,
		"/tradeview.feetiers.MsgSetStakingTiers":                    &feetiers.MsgSetStakingTiers{},
		"/tradeview.feetiers.MsgSetStakingTiersResponse":            nil,

		// govplus
		"/tradeview.govplus.MsgSlashValidator":         &govplus.MsgSlashValidator{},
		"/tradeview.govplus.MsgSlashValidatorResponse": nil,

		// listing
		"/tradeview.listing.MsgSetMarketsHardCap":                       &listing.MsgSetMarketsHardCap{},
		"/tradeview.listing.MsgSetMarketsHardCapResponse":               nil,
		"/tradeview.listing.MsgSetListingVaultDepositParams":            &listing.MsgSetListingVaultDepositParams{},
		"/tradeview.listing.MsgSetListingVaultDepositParamsResponse":    nil,
		"/tradeview.listing.MsgUpgradeIsolatedPerpetualToCross":         &listing.MsgUpgradeIsolatedPerpetualToCross{},
		"/tradeview.listing.MsgUpgradeIsolatedPerpetualToCrossResponse": nil,

		// perpetuals
		"/tradeview.perpetuals.MsgCreatePerpetual":               &perpetuals.MsgCreatePerpetual{},
		"/tradeview.perpetuals.MsgCreatePerpetualResponse":       nil,
		"/tradeview.perpetuals.MsgSetLiquidityTier":              &perpetuals.MsgSetLiquidityTier{},
		"/tradeview.perpetuals.MsgSetLiquidityTierResponse":      nil,
		"/tradeview.perpetuals.MsgUpdateParams":                  &perpetuals.MsgUpdateParams{},
		"/tradeview.perpetuals.MsgUpdateParamsResponse":          nil,
		"/tradeview.perpetuals.MsgUpdatePerpetualParams":         &perpetuals.MsgUpdatePerpetualParams{},
		"/tradeview.perpetuals.MsgUpdatePerpetualParamsResponse": nil,

		// prices
		"/tradeview.prices.MsgCreateOracleMarket":         &prices.MsgCreateOracleMarket{},
		"/tradeview.prices.MsgCreateOracleMarketResponse": nil,
		"/tradeview.prices.MsgUpdateMarketParam":          &prices.MsgUpdateMarketParam{},
		"/tradeview.prices.MsgUpdateMarketParamResponse":  nil,

		// ratelimit
		"/tradeview.ratelimit.MsgSetLimitParams":         &ratelimit.MsgSetLimitParams{},
		"/tradeview.ratelimit.MsgSetLimitParamsResponse": nil,

		// revshare
		"/tradeview.revshare.MsgSetMarketMapperRevShareDetailsForMarket":         &revshare.MsgSetMarketMapperRevShareDetailsForMarket{}, //nolint:lll
		"/tradeview.revshare.MsgSetMarketMapperRevShareDetailsForMarketResponse": nil,
		"/tradeview.revshare.MsgSetMarketMapperRevenueShare":                     &revshare.MsgSetMarketMapperRevenueShare{}, //nolint:lll
		"/tradeview.revshare.MsgSetMarketMapperRevenueShareResponse":             nil,
		"/tradeview.revshare.MsgSetOrderRouterRevShare":                          &revshare.MsgSetOrderRouterRevShare{}, //nolint:lll
		"/tradeview.revshare.MsgSetOrderRouterRevShareResponse":                  nil,
		"/tradeview.revshare.MsgUpdateUnconditionalRevShareConfig":               &revshare.MsgUpdateUnconditionalRevShareConfig{}, //nolint:lll
		"/tradeview.revshare.MsgUpdateUnconditionalRevShareConfigResponse":       nil,

		// rewards
		"/tradeview.rewards.MsgUpdateParams":         &rewards.MsgUpdateParams{},
		"/tradeview.rewards.MsgUpdateParamsResponse": nil,

		// sending
		"/tradeview.sending.MsgSendFromModuleToAccount":          &sending.MsgSendFromModuleToAccount{},
		"/tradeview.sending.MsgSendFromModuleToAccountResponse":  nil,
		"/tradeview.sending.MsgSendFromAccountToAccount":         &sending.MsgSendFromAccountToAccount{},
		"/tradeview.sending.MsgSendFromAccountToAccountResponse": nil,

		// stats
		"/tradeview.stats.MsgUpdateParams":         &stats.MsgUpdateParams{},
		"/tradeview.stats.MsgUpdateParamsResponse": nil,

		// vault
		"/tradeview.vault.MsgUnlockShares":                 &vault.MsgUnlockShares{},
		"/tradeview.vault.MsgUnlockSharesResponse":         nil,
		"/tradeview.vault.MsgUpdateOperatorParams":         &vault.MsgUpdateOperatorParams{},
		"/tradeview.vault.MsgUpdateOperatorParamsResponse": nil,

		// vest
		"/tradeview.vest.MsgSetVestEntry":            &vest.MsgSetVestEntry{},
		"/tradeview.vest.MsgSetVestEntryResponse":    nil,
		"/tradeview.vest.MsgDeleteVestEntry":         &vest.MsgDeleteVestEntry{},
		"/tradeview.vest.MsgDeleteVestEntryResponse": nil,
	}
)
