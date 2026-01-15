# Glossary

[`Subaccount`](x/subaccounts/types/subaccount.go:1): A trading account that holds positions and collateral for perpetual contracts, enabling isolated risk management and cross-margin functionality.

[`Perpetual`](x/perpetuals/types/perpetual.go:1): A financial derivative that tracks the price of an underlying asset without an expiration date, allowing traders to maintain positions indefinitely with funding rate payments.

[`CLOB`](x/clob/types/orderbook.go:1): Central Limit Order Book that matches buy and sell orders based on price-time priority, facilitating transparent price discovery for perpetual contracts.

[`Price Feed`](daemons/pricefeed/client/client.go:1): A continuous stream of market price data from external exchanges used to determine fair market values for perpetual contract settlements and liquidations.

[`Vault`](x/vault/keeper/vault.go:1): An automated trading entity that manages liquidity provision and executes algorithmic strategies on behalf of users in perpetual markets.

[`Margin`](lib/margin/risk.go:1): Collateral deposited by traders to maintain leveraged positions, subject to maintenance requirements to prevent liquidation.

[`Bridge`](x/bridge/keeper/bridge_event.go:1): A cross-chain infrastructure component that facilitates asset transfers between different blockchain networks and the v4-chain protocol.

[`Liquidity`](x/clob/keeper/liquidations.go:1): Available trading volume in the order book that enables efficient trade execution without significant price slippage.

[`Order Book`](x/clob/types/orderbook.go:1): A real-time record of buy and sell orders for a perpetual market, organized by price levels to facilitate trade matching.

[`Market Maker`](daemons/pricefeed/client/types/market_config.go:1): An entity that provides liquidity to the exchange by continuously posting buy and sell orders to profit from bid-ask spreads.

[`Funding Rate`](app/process/funding_premium_votes.go:1): A periodic payment mechanism between long and short positions that keeps the perpetual price aligned with the underlying index price.

[`Liquidation`](x/clob/keeper/liquidations.go:1): The forced closure of a trader's position when their margin falls below the maintenance requirement threshold.

[`Collateral`](x/assets/types/asset.go:1): Assets deposited by traders to back their leveraged positions and absorb potential losses in perpetual trading.

[`Leverage`](x/perpetuals/types/perpetual.go:1): The use of borrowed capital to increase the potential return of a trading position, amplifying both gains and losses.

[`Position`](x/subaccounts/types/subaccount.go:1): An open trade representing a trader's exposure to a perpetual market, either long or short, with specific size and entry price.

[`Trade`](x/clob/types/matches.pb.go:1): The execution of a buy and sell order that results in the exchange of assets and the realization of profits or losses.

[`Order Types`](x/clob/types/order.pb.go:1): Different methods of submitting trades including limit orders, market orders, stop-loss orders, and take-profit orders.

[`Oracle`](daemons/pricefeed/client/types/exchange_query_config.go:1): A trusted data source that provides external market information to the blockchain for price determination and settlement.

[`Epoch`](x/epochs/keeper/epoch.go:1): A fixed time period used for scheduling protocol events such as funding rate calculations and reward distributions.

[`Validator`](x/staking/keeper/validator.go:1): A network participant responsible for validating transactions and maintaining consensus in the proof-of-stake blockchain.

[`Keeper`](x/clob/keeper/keeper.go:1): A module component that manages state transitions and business logic for a specific domain within the Cosmos SDK application.

[`Msg`](x/clob/types/message_place_order.go:1): A message object that represents a user's intent to perform an action, processed by the blockchain to modify state.

[`Tx`](lib/tx_mode.go:1): A transaction containing one or more messages that are executed atomically as a single unit on the blockchain.

[`Denom`](x/assets/types/asset.go:1): A denomination identifier for a specific asset type used in the protocol for accounting and trading purposes.

[`Quantum`](lib/quantums.go:1): The smallest indivisible unit of an asset used for precision calculations in the protocol's internal accounting system.

[`Sudo`](lib/abci/util.go:1): A privileged operation that allows designated addresses to execute administrative functions in the protocol.

[`Governance`](x/gov/keeper/governance.go:1): The decentralized decision-making process through which stakeholders vote on protocol upgrades and parameter changes.

[`Staking`](x/staking/keeper/staking.go:1): The process of locking tokens to participate in network validation and earn rewards while securing the blockchain.

[`Fee`](x/feegrant/keeper/feegrant.go:1): A charge imposed on transactions and trades to incentivize validators and fund protocol operations.

[`Snapshot`](x/snapshots/keeper/snapshot.go:1): A point-in-time export of the blockchain state used for node synchronization and historical data recovery.

[`Indexer`](indexer/indexer_manager/event_manager.go:1): An off-chain service that processes blockchain events and maintains a queryable database of trading activity.

[`Risk Engine`](lib/margin/risk.go:1): A computational system that evaluates position risk and determines margin requirements for trader safety.

[`Settlement`](x/subaccounts/lib/updates.go:1): The process of calculating and distributing profits and losses when closing positions or during funding events.

[`Metrics`](lib/metrics/lib.go:1): Quantitative measurements collected from the system to monitor performance, usage, and operational health.

[`Telemetry`](lib/telemetry.go:1): The collection and transmission of metrics data for monitoring, alerting, and analytical purposes.

[`Mempool`](mempool/noop.go:1): A temporary storage area for unconfirmed transactions awaiting inclusion in a block by validators.

[`Streaming`](streaming/full_node_streaming_manager.go:1): Real-time data transmission of blockchain events and market updates to external consumers.

[`Daemon`](daemons/pricefeed/client/client.go:1): A background process that performs continuous operations such as price fetching and metric reporting.

[`Client`](client/cli/query.go:1): Software that interacts with the blockchain to submit transactions and query state information.

[`Server`](server/server.go:1): The backend infrastructure that hosts the blockchain node and handles incoming client requests.

[`Grpc`](proto/dydxprotocol/clob/query.proto:1): A high-performance remote procedure call protocol used for communication between clients and servers.

[`Health Monitor`](daemons/health/monitor.go:1): A system that continuously checks the operational status of critical components and alerts on failures.

[`Price Timestamp`](daemons/pricefeed/types/price_timestamp.go:1): A temporal marker associated with price data to ensure freshness and ordering of market information.

[`Market Config`](daemons/pricefeed/client/types/market_config.go:1): Configuration parameters that define how a specific market operates, including tick size and step base.

[`Exchange Config`](daemons/pricefeed/client/types/exchange_config_json.go:1): Settings that specify how to connect to and retrieve data from a particular cryptocurrency exchange.

[`Mutable Market Config`](daemons/pricefeed/client/types/mutable_exchange_market_config.go:1): Dynamic market parameters that can be adjusted without requiring a protocol upgrade.

[`Price Encoder`](daemons/pricefeed/client/price_encoder/price_encoder.go:1): A component that transforms raw exchange price data into standardized format for protocol consumption.

[`Price Function`](daemons/pricefeed/client/price_function/crypto_com/crypto_com.go:1): Logic that extracts and processes price information from exchange-specific API responses.

[`Exchange ID`](daemons/pricefeed/client/types/exchange_query_details.go:1): A unique identifier assigned to each supported cryptocurrency exchange in the price feed system.

[`Market Pair`](daemons/pricefeed/metrics/market_pairs.go:1): A mapping between an exchange-specific trading pair and its corresponding protocol market identifier.

[`Module Addresses`](lib/module_addresses.go:1): Predefined blockchain addresses associated with specific protocol modules for secure operations.

[`Router`](lib/router.go:1): A component that directs messages to the appropriate handler based on their type for processing.

[`Ante`](lib/ante/disallow_msg.go:1): Pre-execution logic that validates transactions and enforces protocol rules before state changes occur.

[`ABCI`](lib/abci/util.go:1): Application BlockChain Interface that defines the standard communication protocol between Tendermint and the application.

[`Eth`](lib/eth/util.go:1): Ethereum-related utilities and functionality integrated into the protocol for cross-chain compatibility.

[`Big Math`](lib/big_math.go:1): Mathematical operations performed on large integers or decimals with high precision to prevent rounding errors.

[`Int256`](lib/int256/int256.go:1): A 256-bit signed integer type used for precise financial calculations in the protocol.

[`Time Provider`](lib/time/time_provider.go:1): An abstraction layer for time-related operations that enables deterministic testing and block-time synchronization.

[`Metrics Keys`](lib/metrics/metric_keys.go:1): Standardized identifiers used to categorize and label different types of metric data points.

[`Metrics Constants`](lib/metrics/constants.go:1): Fixed values and labels used consistently throughout the metrics collection system.

[`Metrics Util`](lib/metrics/util.go:1): Helper functions and tools for collecting, formatting, and reporting system metrics data.

[`Telemetry Utils`](lib/telemetry.go:1): Utility functions that facilitate the collection and transmission of telemetry data for monitoring.

[`Tx Mode`](lib/tx_mode.go:1): A classification system that determines how transactions are processed and validated in different contexts.

[`Disallow Msg`](lib/ante/disallow_msg.go:1): A security mechanism that prevents execution of certain message types deemed unsafe or inappropriate.

[`Unsupported Msgs`](lib/ante/unsupported_msgs.go:1): Message types that are explicitly blocked from processing due to incompatibility or policy restrictions.

[`Internal Msg`](lib/ante/internal_msg.go:1): Messages that originate from within the protocol itself rather than from external user transactions.

[`Nested Msg`](lib/ante/nested_msg.go:1): Complex messages that contain other messages, requiring special handling during validation and execution.

[`App Injected Msg`](lib/ante/app_injected_msg.go:1): Messages automatically generated and inserted by the application layer during block processing.
