package app_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	distrtypes "github.com/cosmos/cosmos-sdk/x/distribution/types"
	govtypes "github.com/cosmos/cosmos-sdk/x/gov/types"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"
	icatypes "github.com/cosmos/ibc-go/v8/modules/apps/27-interchain-accounts/types"
	ibctransfertypes "github.com/cosmos/ibc-go/v8/modules/apps/transfer/types"
	marketmapmoduletypes "github.com/dydxprotocol/slinky/x/marketmap/types"
	"github.com/dydxprotocol/v4-chain/protocol/app"
	bridgemoduletypes "github.com/dydxprotocol/v4-chain/protocol/x/bridge/types"
	perpetualsmoduletypes "github.com/dydxprotocol/v4-chain/protocol/x/perpetuals/types"
	rewardsmoduletypes "github.com/dydxprotocol/v4-chain/protocol/x/rewards/types"
	satypes "github.com/dydxprotocol/v4-chain/protocol/x/subaccounts/types"
	vaultmoduletypes "github.com/dydxprotocol/v4-chain/protocol/x/vault/types"
	vestmoduletypes "github.com/dydxprotocol/v4-chain/protocol/x/vest/types"
)

func TestModuleAccountsToAddresses(t *testing.T) {
	expectedModuleAccToAddresses := map[string]string{
		authtypes.FeeCollectorName:                   "tradeview17xpfvakm2amg962yls6f84z3kell8c5ltnws4m",
		bridgemoduletypes.ModuleName:                 "tradeview1zlefkpe3g0vvm9a4h0jf9000lmqutlh9qa38wa",
		distrtypes.ModuleName:                        "tradeview1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8u4fvhe",
		stakingtypes.BondedPoolName:                  "tradeview1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3w3yl83",
		stakingtypes.NotBondedPoolName:               "tradeview1tygms3xhhs3yv487phx3dw4a95jn7t7l63cw39",
		govtypes.ModuleName:                          "tradeview10d07y265gmmuvt4z0w9aw880jnsr700jpg74g4",
		ibctransfertypes.ModuleName:                  "tradeview1yl6hdjhmkf37639730gffanpzndzdpmh44mef9",
		satypes.ModuleName:                           "tradeview1v88c3xv9xyv3eetdx0tvcmq7ung3dywpx0z6xt",
		perpetualsmoduletypes.InsuranceFundName:      "tradeview1c7ptc87hkd54e3r7zjy92q29xkq7t79wgxnta3",
		rewardsmoduletypes.TreasuryAccountName:       "tradeview16wrau2x4tsg033xfrrdpae6kxfn9kyue3shxvs",
		rewardsmoduletypes.VesterAccountName:         "tradeview1ltyc6y4skclzafvpznpt2qjwmfwgsndp88yh9s",
		vestmoduletypes.CommunityTreasuryAccountName: "tradeview15ztc7xy42tn2ukkc0qjthkucw9ac63pgndvgaz",
		vestmoduletypes.CommunityVesterAccountName:   "tradeview1wxje320an3karyc6mjw4zghs300dmrjkuqaj48",
		icatypes.ModuleName:                          "tradeview1vlthgax23ca9syk7xgaz347xmf4nunefuzm8jk",
		marketmapmoduletypes.ModuleName:              "tradeview16j3d86dww8p2rzdlqsv7wle98cxzjxw66p3suz",
		vaultmoduletypes.MegavaultAccountName:        "tradeview18tkxrnrkqc2t0lr3zxr5g6a4hdvqksyl5n3dtj",
	}

	require.True(t, len(expectedModuleAccToAddresses) == len(app.GetMaccPerms()),
		"expected %d, got %d", len(expectedModuleAccToAddresses), len(app.GetMaccPerms()))
	for acc, address := range expectedModuleAccToAddresses {
		expectedAddr := authtypes.NewModuleAddress(acc).String()
		require.Equal(t, address, expectedAddr, "module (%v) should have address (%s)", acc, expectedAddr)
	}
}

func TestBlockedAddresses(t *testing.T) {
	expectedBlockedAddresses := map[string]bool{
		"tradeview17xpfvakm2amg962yls6f84z3kell8c5ltnws4m": true,
		"tradeview1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8u4fvhe": true,
		"tradeview1tygms3xhhs3yv487phx3dw4a95jn7t7l63cw39": true,
		"tradeview1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3w3yl83": true,
		"tradeview1yl6hdjhmkf37639730gffanpzndzdpmh44mef9": true,
		"tradeview1vlthgax23ca9syk7xgaz347xmf4nunefuzm8jk": true,
	}
	require.Equal(t, expectedBlockedAddresses, app.BlockedAddresses())
}

func TestMaccPerms(t *testing.T) {
	maccPerms := app.GetMaccPerms()
	expectedMaccPerms := map[string][]string{
		"bonded_tokens_pool":     {"burner", "staking"},
		"bridge":                 {"minter"},
		"distribution":           nil,
		"fee_collector":          nil,
		"gov":                    {"burner"},
		"insurance_fund":         nil,
		"not_bonded_tokens_pool": {"burner", "staking"},
		"subaccounts":            nil,
		"transfer":               {"minter", "burner"},
		"interchainaccounts":     nil,
		"rewards_treasury":       nil,
		"rewards_vester":         nil,
		"community_treasury":     nil,
		"community_vester":       nil,
		"marketmap":              nil,
		"megavault":              nil,
	}
	require.Equal(t, expectedMaccPerms, maccPerms, "default macc perms list does not match expected")
}

func TestModuleAccountAddrs(t *testing.T) {
	expectedModuleAccAddresses := map[string]bool{
		"tradeview17xpfvakm2amg962yls6f84z3kell8c5ltnws4m": true, // x/auth.FeeCollector
		"tradeview1zlefkpe3g0vvm9a4h0jf9000lmqutlh9qa38wa": true, // x/bridge
		"tradeview1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8u4fvhe": true, // x/distribution
		"tradeview1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3w3yl83": true, // x/staking.bondedPool
		"tradeview1tygms3xhhs3yv487phx3dw4a95jn7t7l63cw39": true, // x/staking.notBondedPool
		"tradeview10d07y265gmmuvt4z0w9aw880jnsr700jpg74g4": true, // x/ gov
		"tradeview1yl6hdjhmkf37639730gffanpzndzdpmh44mef9": true, // ibc transfer
		"tradeview1vlthgax23ca9syk7xgaz347xmf4nunefuzm8jk": true, // interchainaccounts
		"tradeview1v88c3xv9xyv3eetdx0tvcmq7ung3dywpx0z6xt": true, // x/subaccount
		"tradeview1c7ptc87hkd54e3r7zjy92q29xkq7t79wgxnta3": true, // x/clob.insuranceFund
		"tradeview16wrau2x4tsg033xfrrdpae6kxfn9kyue3shxvs": true, // x/rewards.treasury
		"tradeview1ltyc6y4skclzafvpznpt2qjwmfwgsndp88yh9s": true, // x/rewards.vester
		"tradeview15ztc7xy42tn2ukkc0qjthkucw9ac63pgndvgaz": true, // x/vest.communityTreasury
		"tradeview1wxje320an3karyc6mjw4zghs300dmrjkuqaj48": true, // x/vest.communityVester
		"tradeview16j3d86dww8p2rzdlqsv7wle98cxzjxw66p3suz": true, // x/marketmap
		"tradeview18tkxrnrkqc2t0lr3zxr5g6a4hdvqksyl5n3dtj": true, // x/vault.megavault
	}

	require.Equal(t, expectedModuleAccAddresses, app.ModuleAccountAddrs())
}
