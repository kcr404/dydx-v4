package types_test

import (
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/x/rewards/types"
	"github.com/stretchr/testify/require"
)

func TestTreasuryModuleAddress(t *testing.T) {
	require.Equal(t, "tradeview16wrau2x4tsg033xfrrdpae6kxfn9kyue3shxvs", types.TreasuryModuleAddress.String())
}
