package lib_test

import (
	"testing"

	"github.com/dydxprotocol/v4-chain/protocol/lib"
	"github.com/stretchr/testify/require"
)

func TestGovModuleAddress(t *testing.T) {
	require.Equal(t, "tradeview10d07y265gmmuvt4z0w9aw880jnsr700jpg74g4", lib.GovModuleAddress.String())
}
