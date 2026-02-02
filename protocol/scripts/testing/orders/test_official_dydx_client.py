#!/usr/bin/env python3
"""
Test short-term orders using the official dYdX v4 Python client.
Following the official documentation: https://docs.dydx.xyz/interaction/trading
"""

import asyncio
import random
from v4_client_py import clients
from v4_client_py.clients.constants import Network
from v4_client_py.clients.helpers.chain_helpers import OrderFlags, Order_TimeInForce, Order_Side
from v4_client_py.chain.aerial.wallet import LocalWallet

# Configuration
CHAIN_RPC = "http://ec2-35-88-186-90.us-west-2.compute.amazonaws.com:26657"
CHAIN_GRPC = "ec2-35-88-186-90.us-west-2.compute.amazonaws.com:9090"
CHAIN_ID = "localtradeview"
INDEXER_REST = "http://10.30.21.162:3002"
INDEXER_WS = "ws://10.30.21.162:3003"

# Alice's mnemonic (from your test setup)
ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small"

async def test_short_term_order():
    """Test placing a short-term order using official dYdX v4 client."""
    
    print("=" * 60)
    print("Testing Short-Term Orders with Official dYdX v4 Client")
    print("=" * 60)
    
    # Create custom network configuration
    network = Network(
        chain_id=CHAIN_ID,
        grpc_endpoint=CHAIN_GRPC,
        rest_indexer=INDEXER_REST,
        websocket_indexer=INDEXER_WS,
    )
    
    # Initialize wallet from mnemonic
    wallet = LocalWallet.from_mnemonic(ALICE_MNEMONIC, prefix="tradeview")
    address = str(wallet.address())
    
    print(f"\n📍 Wallet Address: {address}")
    
    # Initialize clients
    print("\n🔌 Connecting to chain and indexer...")
    
    try:
        # Create validator client (for chain interaction)
        validator_client = await clients.ValidatorClient.connect(network)
        print(f"✅ Connected to chain: {CHAIN_RPC}")
        
        # Create composite client (combines chain + indexer)
        client = await clients.CompositeClient.connect(network)
        print(f"✅ Connected to indexer: {INDEXER_REST}")
        
        # Get current block height
        current_height = await validator_client.get_latest_block_height()
        print(f"\n📊 Current Block Height: {current_height}")
        
        # Get account info
        account = await validator_client.get_account(address)
        print(f"📊 Account Number: {account.account_number}")
        print(f"📊 Sequence: {account.sequence}")
        
        # Create order parameters
        subaccount_number = 0
        client_id = random.randint(0, 100000000)
        clob_pair_id = 0  # BTC-USD
        side = Order_Side.SIDE_BUY
        quantums = 1000000  # 0.01 BTC (assuming 8 decimals)
        subticks = 100000   # Price in subticks
        good_til_block = current_height + 20  # Valid for 20 blocks (~30 seconds)
        
        print(f"\n📝 Order Parameters:")
        print(f"   Client ID: {client_id}")
        print(f"   CLOB Pair: {clob_pair_id}")
        print(f"   Side: {'BUY' if side == Order_Side.SIDE_BUY else 'SELL'}")
        print(f"   Quantums: {quantums}")
        print(f"   Subticks: {subticks}")
        print(f"   Good Til Block: {good_til_block}")
        print(f"   Order Flags: SHORT_TERM (0)")
        
        # Place short-term order using official method
        print(f"\n🚀 Placing short-term order...")
        
        # Create order using the official client
        tx = await client.place_short_term_order(
            wallet=wallet,
            subaccount_number=subaccount_number,
            client_id=client_id,
            clob_pair_id=clob_pair_id,
            order_flags=OrderFlags.SHORT_TERM,
            good_til_block=good_til_block,
            side=side,
            quantums=quantums,
            subticks=subticks,
            time_in_force=Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduce_only=False,
        )
        
        print(f"\n✅ Order Placed!")
        print(f"   Transaction Hash: {tx.tx_hash}")
        print(f"   Code: {tx.code}")
        print(f"   Raw Log: {tx.raw_log}")
        
        # Wait for order to be included in a block
        print(f"\n⏳ Waiting for order to be included in block...")
        await asyncio.sleep(3)
        
        # Check if order appears in indexer
        print(f"\n🔍 Checking indexer for order...")
        
        try:
            # Query orders from indexer
            orders_response = await client.indexer_client.account.get_subaccount_orders(
                address=address,
                subaccount_number=subaccount_number,
            )
            
            print(f"\n📊 Orders in Indexer:")
            if orders_response and hasattr(orders_response, 'orders'):
                for order in orders_response.orders:
                    print(f"   - Order ID: {order.id}")
                    print(f"     Client ID: {order.clientId}")
                    print(f"     Status: {order.status}")
                    print(f"     Side: {order.side}")
                    print(f"     Size: {order.size}")
                    print(f"     Price: {order.price}")
                    
                # Check if our order is there
                our_order = next((o for o in orders_response.orders if o.clientId == client_id), None)
                if our_order:
                    print(f"\n✅ SUCCESS! Short-term order found in indexer!")
                    print(f"   Order Status: {our_order.status}")
                else:
                    print(f"\n❌ Short-term order NOT found in indexer")
                    print(f"   Looking for Client ID: {client_id}")
            else:
                print(f"   No orders found in indexer")
                
        except Exception as e:
            print(f"\n⚠️  Error querying indexer: {e}")
            
        # Check fills
        try:
            fills_response = await client.indexer_client.account.get_subaccount_fills(
                address=address,
                subaccount_number=subaccount_number,
            )
            
            print(f"\n📊 Fills in Indexer:")
            if fills_response and hasattr(fills_response, 'fills'):
                print(f"   Total fills: {len(fills_response.fills)}")
                for fill in fills_response.fills[:5]:  # Show first 5
                    print(f"   - Fill: {fill.size} @ {fill.price}")
            else:
                print(f"   No fills found")
                
        except Exception as e:
            print(f"\n⚠️  Error querying fills: {e}")
        
        print(f"\n" + "=" * 60)
        print("Test Complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connections
        if 'validator_client' in locals():
            await validator_client.close()
        if 'client' in locals():
            await client.close()

if __name__ == "__main__":
    asyncio.run(test_short_term_order())
