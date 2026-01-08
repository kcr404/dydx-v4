package types_test

import (
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/x/bridge/types"
	"github.com/stretchr/testify/require"
)

func TestModuleAddress(t *testing.T) {
	require.Equal(t, "tradeview1zlefkpe3g0vvm9a4h0jf9000lmqutlh9qa38wa", types.ModuleAddress.String())
}
