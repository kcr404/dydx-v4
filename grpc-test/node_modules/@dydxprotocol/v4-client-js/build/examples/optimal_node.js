"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../src/clients/constants");
const network_optimizer_1 = require("../src/network_optimizer");
async function testNodes() {
    // all valid endpoints
    try {
        const optimizer = new network_optimizer_1.NetworkOptimizer();
        const endpoints = [
            'https://validator.v4testnet1.dydx.exchange',
            'https://dydx-testnet.nodefleet.org',
            'https://dydx-testnet-archive.allthatnode.com:26657/XZvMM41hESf8PJrEQiTzbCOMVyFca79R',
        ];
        const optimal = await optimizer.findOptimalNode(endpoints, constants_1.TESTNET_CHAIN_ID);
        console.log(optimal);
    }
    catch (error) {
        console.log(error.message);
    }
    // one invalid endpoint
    try {
        const optimizer = new network_optimizer_1.NetworkOptimizer();
        const endpoints = [
            'https://validator.v4testnet1.dydx.exchange',
            'https://dydx-testnet.nodefleet.org',
            'https://dydx-testnet-archive.allthatnode.com:26657/XZvMM41hESf8PJrEQiTzbCOMVyFca79R',
            'https://example.com',
        ];
        const optimal = await optimizer.findOptimalNode(endpoints, constants_1.TESTNET_CHAIN_ID);
        console.log(optimal);
    }
    catch (error) {
        console.log(error.message);
    }
    // all invalid endpoints
    try {
        const optimizer = new network_optimizer_1.NetworkOptimizer();
        const endpoints = ['https://example.com', 'https://example.org'];
        const optimal = await optimizer.findOptimalNode(endpoints, constants_1.TESTNET_CHAIN_ID);
        console.log(optimal);
    }
    catch (error) {
        console.log(error.message);
    }
}
async function testIndexers() {
    // all valid endpoints
    try {
        const optimizer = new network_optimizer_1.NetworkOptimizer();
        const endpoints = ['https://indexer.v4testnet2.dydx.exchange'];
        const optimal = await optimizer.findOptimalIndexer(endpoints);
        console.log(optimal);
    }
    catch (error) {
        console.log(error.message);
    }
    // all invalid endpoints
    try {
        const optimizer = new network_optimizer_1.NetworkOptimizer();
        const endpoints = ['https://example.com', 'https://example.org'];
        const optimal = await optimizer.findOptimalIndexer(endpoints);
        console.log(optimal);
    }
    catch (error) {
        console.log(error.message);
    }
}
testNodes().catch(console.log);
testIndexers().catch(console.log);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW1hbF9ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvb3B0aW1hbF9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0RBQTREO0FBQzVELGdFQUE0RDtBQUU1RCxLQUFLLFVBQVUsU0FBUztJQUN0QixzQkFBc0I7SUFDdEIsSUFBSTtRQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksb0NBQWdCLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRztZQUNoQiw0Q0FBNEM7WUFDNUMsb0NBQW9DO1lBQ3BDLHFGQUFxRjtTQUN0RixDQUFDO1FBQ0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxTQUFTLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSw0QkFBZ0IsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVCO0lBRUQsdUJBQXVCO0lBQ3ZCLElBQUk7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLG9DQUFnQixFQUFFLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUc7WUFDaEIsNENBQTRDO1lBQzVDLG9DQUFvQztZQUNwQyxxRkFBcUY7WUFDckYscUJBQXFCO1NBQ3RCLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLDRCQUFnQixDQUFDLENBQUM7UUFDN0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN0QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUI7SUFFRCx3QkFBd0I7SUFFeEIsSUFBSTtRQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksb0NBQWdCLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsTUFBTSxPQUFPLEdBQUcsTUFBTSxTQUFTLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSw0QkFBZ0IsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxZQUFZO0lBQ3pCLHNCQUFzQjtJQUN0QixJQUFJO1FBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxvQ0FBZ0IsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUMvRCxNQUFNLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1QjtJQUVELHdCQUF3QjtJQUV4QixJQUFJO1FBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxvQ0FBZ0IsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLENBQUMscUJBQXFCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUNqRSxNQUFNLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1QjtBQUNILENBQUM7QUFFRCxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMifQ==