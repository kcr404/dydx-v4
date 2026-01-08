package types_test

import (
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/x/subaccounts/types"
	"github.com/stretchr/testify/require"
)

func TestModuleAddress(t *testing.T) {
	require.Equal(t, "tradeview1v88c3xv9xyv3eetdx0tvcmq7ung3dywpx0z6xt", types.ModuleAddress.String())
}
