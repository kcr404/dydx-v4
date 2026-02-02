#!/bin/bash

echo "========================================="
echo "  Short-Term Order Investigation"
echo "  Running on Chain Instance"
echo "========================================="

SCRIPT_DIR="/data/dydx-v4/protocol/scripts/testing/orders"

echo -e "\n📋 This script will:"
echo "  1. Compare events from short-term vs long-term orders"
echo "  2. Show transaction details"
echo "  3. Help identify why short-term orders aren't indexed"
echo ""
read -p "Press Enter to continue..."

echo -e "\n========================================="
echo "  STEP 1: Event Comparison"
echo "========================================="

cd "$SCRIPT_DIR"
./compare_order_events.sh

echo -e "\n========================================="
echo "  STEP 2: Analyzing Results"
echo "========================================="

echo -e "\nComparing event files..."
if [ -f /tmp/lt_order_events.json ] && [ -f /tmp/st_order_events.json ]; then
    echo -e "\n--- Event Differences ---"
    diff -u /tmp/lt_order_events.json /tmp/st_order_events.json || echo "Files are identical"
    
    echo -e "\n--- Long-Term Order Event Types ---"
    cat /tmp/lt_order_events.json | jq -r '.events[].type' 2>/dev/null | sort | uniq
    
    echo -e "\n--- Short-Term Order Event Types ---"
    cat /tmp/st_order_events.json | jq -r '.events[].type' 2>/dev/null | sort | uniq
else
    echo "Event files not found. Check compare_order_events.sh output above."
fi

echo -e "\n========================================="
echo "  STEP 3: Checking Recent Transactions"
echo "========================================="

echo -e "\nFetching your original test transactions..."

echo -e "\n--- Long-Term Order (A394E142...) ---"
curl -s "http://localhost:26657/tx?hash=0xA394E142DF9B10F8524B6148079DD92E3CEF5F7C52FF61EBA447ACBC77BAAA6C" | \
    jq -r '.result.tx_result | {code, height, events: [.events[] | {type, attributes: [.attributes[] | {key, value}]}]}' 2>/dev/null

echo -e "\n--- Short-Term Order (BF248570...) ---"
curl -s "http://localhost:26657/tx?hash=0xBF248570DCC7785022551E0E2A83E2762ED3DF1C704F7B9AEF8C7DABE1161D30" | \
    jq -r '.result.tx_result | {code, height, events: [.events[] | {type, attributes: [.attributes[] | {key, value}]}]}' 2>/dev/null

echo -e "\n========================================="
echo "  STEP 4: Summary & Diagnosis"
echo "========================================="

echo -e "\n📊 Key Questions to Answer:"
echo ""
echo "1. Are the event types identical?"
echo "   → Check the event type lists above"
echo ""
echo "2. Do both have 'message' events with action type?"
echo "   → Look for events with type='message'"
echo ""
echo "3. Are there any order-specific events?"
echo "   → Look for 'order_fill', 'order_place', etc."
echo ""
echo "4. Is there a difference in the 'message' event action?"
echo "   → Compare the 'action' attribute values"
echo ""

echo -e "\n🔍 Next Steps Based on Findings:"
echo ""
echo "IF events are identical:"
echo "  → Indexer is filtering out short-term orders"
echo "  → Need to check indexer event handlers"
echo ""
echo "IF short-term has no events:"
echo "  → Orders are in MsgProposedOperations"
echo "  → Need to monitor MsgProposedOperations separately"
echo ""
echo "IF events are different:"
echo "  → Indexer doesn't recognize short-term event types"
echo "  → Need to add event handlers for those types"
echo ""

echo "========================================="
echo "  Investigation Complete"
echo "========================================="
echo ""
echo "Event dumps saved to:"
echo "  /tmp/lt_order_events.json"
echo "  /tmp/st_order_events.json"
echo ""
echo "To view full details:"
echo "  cat /tmp/lt_order_events.json | jq"
echo "  cat /tmp/st_order_events.json | jq"
echo ""
