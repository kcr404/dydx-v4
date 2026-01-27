package msgs_test

import (
	"sort"
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/app/msgs"
	"github.com/dydxprotocol/v4-chain/protocol/lib"
	"github.com/stretchr/testify/require"
)

func TestInternalMsgSamples_All_Key(t *testing.T) {
	expectedAllInternalMsgs := lib.MergeAllMapsMustHaveDistinctKeys(msgs.InternalMsgSamplesGovAuth)
	require.Equal(t, expectedAllInternalMsgs, msgs.InternalMsgSamplesAll)
}

func TestInternalMsgSamples_All_Value(t *testing.T) {
	validateMsgValue(t, msgs.InternalMsgSamplesAll)
}

func TestInternalMsgSamples_Gov_Key(t *testing.T) {
	expectedMsgs := []string{
		// auth
		"/cosmos.auth.v1beta1.MsgUpdateParams",

		// bank
		"/cosmos.bank.v1beta1.MsgSetSendEnabled",
		"/cosmos.bank.v1beta1.MsgSetSendEnabledResponse",
		"/cosmos.bank.v1beta1.MsgUpdateParams",
		"/cosmos.bank.v1beta1.MsgUpdateParamsResponse",

		// consensus
		"/cosmos.consensus.v1.MsgUpdateParams",
		"/cosmos.consensus.v1.MsgUpdateParamsResponse",

		// crisis
		"/cosmos.crisis.v1beta1.MsgUpdateParams",
		"/cosmos.crisis.v1beta1.MsgUpdateParamsResponse",

		// distribution
		"/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
		"/cosmos.distribution.v1beta1.MsgCommunityPoolSpendResponse",
		"/cosmos.distribution.v1beta1.MsgUpdateParams",
		"/cosmos.distribution.v1beta1.MsgUpdateParamsResponse",

		// gov
		"/cosmos.gov.v1.MsgExecLegacyContent",
		"/cosmos.gov.v1.MsgExecLegacyContentResponse",
		"/cosmos.gov.v1.MsgUpdateParams",
		"/cosmos.gov.v1.MsgUpdateParamsResponse",

		// slashing
		"/cosmos.slashing.v1beta1.MsgUpdateParams",
		"/cosmos.slashing.v1beta1.MsgUpdateParamsResponse",

		// staking
		"/cosmos.staking.v1beta1.MsgSetProposers",
		"/cosmos.staking.v1beta1.MsgSetProposersResponse",
		"/cosmos.staking.v1beta1.MsgUpdateParams",
		"/cosmos.staking.v1beta1.MsgUpdateParamsResponse",

		// upgrade
		"/cosmos.upgrade.v1beta1.MsgCancelUpgrade",
		"/cosmos.upgrade.v1beta1.MsgCancelUpgradeResponse",
		"/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade",
		"/cosmos.upgrade.v1beta1.MsgSoftwareUpgradeResponse",

		// accountplus
		"/tradeview.accountplus.MsgSetActiveState",
		"/tradeview.accountplus.MsgSetActiveStateResponse",

		// affiliates
		"/tradeview.affiliates.MsgUpdateAffiliateOverrides",
		"/tradeview.affiliates.MsgUpdateAffiliateOverridesResponse",
		"/tradeview.affiliates.MsgUpdateAffiliateParameters",
		"/tradeview.affiliates.MsgUpdateAffiliateParametersResponse",
		"/tradeview.affiliates.MsgUpdateAffiliateTiers",
		"/tradeview.affiliates.MsgUpdateAffiliateTiersResponse",
		"/tradeview.affiliates.MsgUpdateAffiliateWhitelist",
		"/tradeview.affiliates.MsgUpdateAffiliateWhitelistResponse",

		// blocktime
		"/tradeview.blocktime.MsgUpdateDowntimeParams",
		"/tradeview.blocktime.MsgUpdateDowntimeParamsResponse",
		"/tradeview.blocktime.MsgUpdateSynchronyParams",
		"/tradeview.blocktime.MsgUpdateSynchronyParamsResponse",

		// bridge
		"/tradeview.bridge.MsgCompleteBridge",
		"/tradeview.bridge.MsgCompleteBridgeResponse",
		"/tradeview.bridge.MsgUpdateEventParams",
		"/tradeview.bridge.MsgUpdateEventParamsResponse",
		"/tradeview.bridge.MsgUpdateProposeParams",
		"/tradeview.bridge.MsgUpdateProposeParamsResponse",
		"/tradeview.bridge.MsgUpdateSafetyParams",
		"/tradeview.bridge.MsgUpdateSafetyParamsResponse",

		// clob
		"/tradeview.clob.MsgCreateClobPair",
		"/tradeview.clob.MsgCreateClobPairResponse",
		"/tradeview.clob.MsgUpdateBlockRateLimitConfiguration",
		"/tradeview.clob.MsgUpdateBlockRateLimitConfigurationResponse",
		"/tradeview.clob.MsgUpdateClobPair",
		"/tradeview.clob.MsgUpdateClobPairResponse",
		"/tradeview.clob.MsgUpdateEquityTierLimitConfiguration",
		"/tradeview.clob.MsgUpdateEquityTierLimitConfigurationResponse",
		"/tradeview.clob.MsgUpdateLiquidationsConfig",
		"/tradeview.clob.MsgUpdateLiquidationsConfigResponse",

		// delaymsg
		"/tradeview.delaymsg.MsgDelayMessage",
		"/tradeview.delaymsg.MsgDelayMessageResponse",

		// feetiers
		"/tradeview.feetiers.MsgSetMarketFeeDiscountParams",
		"/tradeview.feetiers.MsgSetMarketFeeDiscountParamsResponse",
		"/tradeview.feetiers.MsgSetStakingTiers",
		"/tradeview.feetiers.MsgSetStakingTiersResponse",
		"/tradeview.feetiers.MsgUpdatePerpetualFeeParams",
		"/tradeview.feetiers.MsgUpdatePerpetualFeeParamsResponse",

		// govplus
		"/tradeview.govplus.MsgSlashValidator",
		"/tradeview.govplus.MsgSlashValidatorResponse",

		// listing
		"/tradeview.listing.MsgSetListingVaultDepositParams",
		"/tradeview.listing.MsgSetListingVaultDepositParamsResponse",
		"/tradeview.listing.MsgSetMarketsHardCap",
		"/tradeview.listing.MsgSetMarketsHardCapResponse",
		"/tradeview.listing.MsgUpgradeIsolatedPerpetualToCross",
		"/tradeview.listing.MsgUpgradeIsolatedPerpetualToCrossResponse",

		// perpeutals
		"/tradeview.perpetuals.MsgCreatePerpetual",
		"/tradeview.perpetuals.MsgCreatePerpetualResponse",
		"/tradeview.perpetuals.MsgSetLiquidityTier",
		"/tradeview.perpetuals.MsgSetLiquidityTierResponse",
		"/tradeview.perpetuals.MsgUpdateParams",
		"/tradeview.perpetuals.MsgUpdateParamsResponse",
		"/tradeview.perpetuals.MsgUpdatePerpetualParams",
		"/tradeview.perpetuals.MsgUpdatePerpetualParamsResponse",

		// prices
		"/tradeview.prices.MsgCreateOracleMarket",
		"/tradeview.prices.MsgCreateOracleMarketResponse",
		"/tradeview.prices.MsgUpdateMarketParam",
		"/tradeview.prices.MsgUpdateMarketParamResponse",

		// ratelimit
		"/tradeview.ratelimit.MsgSetLimitParams",
		"/tradeview.ratelimit.MsgSetLimitParamsResponse",

		// revshare
		"/tradeview.revshare.MsgSetMarketMapperRevShareDetailsForMarket",
		"/tradeview.revshare.MsgSetMarketMapperRevShareDetailsForMarketResponse",
		"/tradeview.revshare.MsgSetMarketMapperRevenueShare",
		"/tradeview.revshare.MsgSetMarketMapperRevenueShareResponse",
		"/tradeview.revshare.MsgSetOrderRouterRevShare",
		"/tradeview.revshare.MsgSetOrderRouterRevShareResponse",
		"/tradeview.revshare.MsgUpdateUnconditionalRevShareConfig",
		"/tradeview.revshare.MsgUpdateUnconditionalRevShareConfigResponse",

		// rewards
		"/tradeview.rewards.MsgUpdateParams",
		"/tradeview.rewards.MsgUpdateParamsResponse",

		// sending
		"/tradeview.sending.MsgSendFromAccountToAccount",
		"/tradeview.sending.MsgSendFromAccountToAccountResponse",
		"/tradeview.sending.MsgSendFromModuleToAccount",
		"/tradeview.sending.MsgSendFromModuleToAccountResponse",

		// stats
		"/tradeview.stats.MsgUpdateParams",
		"/tradeview.stats.MsgUpdateParamsResponse",

		// vault
		"/tradeview.vault.MsgUnlockShares",
		"/tradeview.vault.MsgUnlockSharesResponse",
		"/tradeview.vault.MsgUpdateOperatorParams",
		"/tradeview.vault.MsgUpdateOperatorParamsResponse",

		// vest
		"/tradeview.vest.MsgDeleteVestEntry",
		"/tradeview.vest.MsgDeleteVestEntryResponse",
		"/tradeview.vest.MsgSetVestEntry",
		"/tradeview.vest.MsgSetVestEntryResponse",

		// ibc
		"/ibc.applications.interchain_accounts.host.v1.MsgUpdateParams",
		"/ibc.applications.interchain_accounts.host.v1.MsgUpdateParamsResponse",
		"/ibc.applications.transfer.v1.MsgUpdateParams",
		"/ibc.applications.transfer.v1.MsgUpdateParamsResponse",
		"/ibc.core.client.v1.MsgUpdateParams",
		"/ibc.core.client.v1.MsgUpdateParamsResponse",
		"/ibc.core.connection.v1.MsgUpdateParams",
		"/ibc.core.connection.v1.MsgUpdateParamsResponse",
	}

	require.Equal(t, expectedMsgs, lib.GetSortedKeys[sort.StringSlice](msgs.InternalMsgSamplesGovAuth))
}

func TestInternalMsgSamples_Gov_Value(t *testing.T) {
	validateMsgValue(t, msgs.InternalMsgSamplesGovAuth)
}
