package types_test

import (
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/x/delaymsg/types"
	"github.com/stretchr/testify/require"
)

func TestModuleAddress(t *testing.T) {
	require.Equal(t, "tradeview1mkkvp26dngu6n8rmalaxyp3gwkjuzztqx39w4j", types.ModuleAddress.String())
}
