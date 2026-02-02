FROM tradeview-base

COPY ./testing/containertest/tradeviewd_preupgrade* /bin/
COPY ./testing/containertest/containertest.sh /tradeview/containertest.sh
COPY ./testing/containertest/preupgrade_entrypoint.sh /tradeview/preupgrade_entrypoint.sh
COPY ./testing/containertest/preupgrade_genesis.json /tradeview/preupgrade_genesis.json
COPY ./testing/genesis.sh /tradeview/genesis.sh
COPY ./daemons/pricefeed/client/constants/testdata /tradeview/exchange_config
COPY ./testing/delaymsg_config /tradeview/delaymsg_config
COPY ./testing/version/. /tradeview/

RUN go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.5.0

RUN /tradeview/containertest.sh

COPY ./testing/containertest/config/pricefeed_exchange_config.toml /tradeview/chain/.alice/config/pricefeed_exchange_config.toml
COPY ./testing/containertest/config/pricefeed_exchange_config.toml /tradeview/chain/.bob/config/pricefeed_exchange_config.toml
COPY ./testing/containertest/config/pricefeed_exchange_config.toml /tradeview/chain/.carl/config/pricefeed_exchange_config.toml
COPY ./testing/containertest/config/pricefeed_exchange_config.toml /tradeview/chain/.dave/config/pricefeed_exchange_config.toml

ENTRYPOINT ["tradeviewd"]
