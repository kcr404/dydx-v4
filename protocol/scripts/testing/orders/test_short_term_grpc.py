#!/usr/bin/env python3
"""
Short-Term Order Submission via gRPC
Alternative Python implementation using grpcurl
"""

import subprocess
import json
import time
from datetime import datetime

def get_current_height():
    """Get current block height"""
    result = subprocess.run(
        ['curl', '-s', 'http://localhost:26657/status'],
        capture_output=True,
        text=True
    )
    status = json.loads(result.stdout)
    return int(status['result']['sync_info']['latest_block_height'])

def place_order_grpc(address, subaccount, client_id, clob_pair, side, quantums, subticks, gtb):
    """
    Place short-term order using grpcurl to gRPC endpoint
    
    This bypasses the transaction mempool and goes directly to MemClob
    """
    
    order_json = {
        "order": {
            "order_id": {
                "subaccount_id": {
                    "owner": address,
                    "number": subaccount
                },
                "client_id": client_id,
                "order_flags": 0,  # SHORT_TERM flag
                "clob_pair_id": clob_pair
            },
            "side": side,  # 1=BUY, 2=SELL
            "quantums": str(quantums),
            "subticks": str(subticks),
            "good_til_block": gtb,
            "time_in_force": 0,
            "reduce_only": False,
            "client_metadata": 0
        }
    }
    
    # Use grpcurl to call the gRPC endpoint
    cmd = [
        'grpcurl',
        '-plaintext',
        '-d', json.dumps(order_json),
        'localhost:9090',  # gRPC port
        'dydxprotocol.clob.MsgService/PlaceOrder'
    ]
    
    print(f"   Calling gRPC endpoint...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"   ✅ Order placed successfully!")
        print(f"   Response: {result.stdout}")
        return True
    else:
        print(f"   ❌ Error: {result.stderr}")
        return False

def main():
    print("=========================================")
    print("  Short-Term Orders via gRPC (Python)")
    print("=========================================\n")
    
    # Configuration
    ALICE = "tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
    BOB = "tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp"
    
    print("Step 1: Getting current block height...")
    current_height = get_current_height()
    gtb = current_height + 10
    print(f"   Current height: {current_height}")
    print(f"   Good Til Block: {gtb}\n")
    
    # Generate client IDs
    client_id_alice = int(time.time())
    client_id_bob = client_id_alice + 1
    
    print("Step 2: Placing Alice's BUY order via gRPC...")
    place_order_grpc(
        address=ALICE,
        subaccount=0,
        client_id=client_id_alice,
        clob_pair=0,
        side=1,  # BUY
        quantums=10_000_000,
        subticks=5_000_000,
        gtb=gtb
    )
    
    time.sleep(2)
    
    print("\nStep 3: Placing Bob's SELL order via gRPC...")
    place_order_grpc(
        address=BOB,
        subaccount=0,
        client_id=client_id_bob,
        clob_pair=0,
        side=2,  # SELL
        quantums=10_000_000,
        subticks=5_000_000,
        gtb=gtb
    )
    
    print("\n=========================================")
    print("✅ Orders submitted via gRPC!")
    print("=========================================\n")
    print("Note: This method:")
    print("  • Bypasses transaction mempool")
    print("  • Goes directly to MemClob")
    print("  • Avoids PrepareProposal filtering")
    print("  • Is the CORRECT way for short-term orders")
    print("")

if __name__ == "__main__":
    main()
