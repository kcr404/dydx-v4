#!/usr/bin/env python3
"""
SHORT-TERM ORDERS VIA PYTHON CLIENT
Following official dYdX v4 documentation
"""

import asyncio
import random
from v4_client_py import clients
from v4_client_py.clients.helpers.chain_helpers import OrderFlags, Order_TimeInForce, OrderType, OrderSide

# Mnemonics from local.sh
ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small"
BOB_MNEMONIC = "color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum"

async def main():
    print("=========================================")
    print("  SHORT-TERM ORDERS VIA PYTHON CLIENT")
    print("=========================================\n")
    
    # Connect to local node
    print("Step 1: Connecting to local chain...")
    node = await clients.ValidatorClient.connect('localhost:26657')
    print("   ✅ Connected!\n")
    
    # Create wallets
    print("Step 2: Creating wallets...")
    alice_wallet = await clients.Wallet.from_mnemonic(node, ALICE_MNEMONIC, "tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy")
    bob_wallet = await clients.Wallet.from_mnemonic(node, BOB_MNEMONIC, "tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp")
    print(f"   Alice: {alice_wallet.address()}")
    print(f"   Bob: {bob_wallet.address()}\n")
    
    # Get market
    print("Step 3: Getting BTC-USD market...")
    market = node.get_market('BTC-USD')
    print("   ✅ Market loaded\n")
    
    # Get current height for GTB
    print("Step 4: Calculating Good Til Block...")
    current_height = await node.latest_block_height()
    good_til_block = current_height + 15  # 15 blocks window
    print(f"   Current height: {current_height}")
    print(f"   Good Til Block: {good_til_block}\n")
    
    # Place Alice's BUY order
    print("Step 5: Placing Alice's SHORT-TERM BUY order...")
    alice_client_id = random.randint(0, 100000000)
    
    alice_order_id = market.order_id(
        alice_wallet.address(),
        0,  # subaccount
        alice_client_id,
        OrderFlags.SHORT_TERM  # SHORT-TERM flag = 0
    )
    
    alice_order = market.order(
        alice_order_id,
        OrderType.LIMIT,
        OrderSide.SIDE_BUY,
        size=0.01,  # 0.01 BTC
        price=50000,  # $50,000
        time_in_force=Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
        reduce_only=False,
        good_til_block=good_til_block
    )
    
    try:
        alice_result = await node.place_order(alice_wallet, alice_order)
        print(f"   ✅ Alice order placed!")
        print(f"   TxHash: {alice_result.get('hash', 'N/A')}\n")
    except Exception as e:
        print(f"   ⚠️  Alice error: {e}\n")
    
    # Wait a bit
    await asyncio.sleep(3)
    
    # Place Bob's SELL order
    print("Step 6: Placing Bob's SHORT-TERM SELL order...")
    bob_client_id = alice_client_id + 1
    
    bob_order_id = market.order_id(
        bob_wallet.address(),
        0,
        bob_client_id,
        OrderFlags.SHORT_TERM
    )
    
    bob_order = market.order(
        bob_order_id,
        OrderType.LIMIT,
        OrderSide.SIDE_SELL,
        size=0.01,
        price=50000,  # Same price - should match!
        time_in_force=Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
        reduce_only=False,
        good_til_block=good_til_block
    )
    
    try:
        bob_result = await node.place_order(bob_wallet, bob_order)
        print(f"   ✅ Bob order placed!")
        print(f"   TxHash: {bob_result.get('hash', 'N/A')}\n")
    except Exception as e:
        print(f"   ⚠️  Bob error: {e}\n")
    
    print("Step 7: Waiting for processing...")
    await asyncio.sleep(10)
    
    print("\n=========================================")
    print("✅ SHORT-TERM ORDERS SUBMITTED!")
    print("=========================================\n")
    print("Key Points:")
    print("  • Used official dYdX Python client")
    print("  • Orders placed via node.place_order()")
    print("  • SHORT_TERM flag (OrderFlags.SHORT_TERM)")
    print("  • Valid for 15 blocks (~22 seconds)")
    print("")

if __name__ == "__main__":
    asyncio.run(main())
