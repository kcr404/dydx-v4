FROM tradeview-base

COPY ./testing/e2etest-local/local.sh /tradeview/local.sh
COPY ./testing/genesis.sh /tradeview/genesis.sh
COPY ./testing/start.sh /tradeview/start.sh
COPY ./daemons/pricefeed/client/constants/testdata /tradeview/exchange_config
COPY ./testing/delaymsg_config /tradeview/delaymsg_config

RUN go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.5.0

RUN /tradeview/local.sh

ENV DAEMON_NAME=tradeviewd
ENTRYPOINT ["cosmovisor", "run"]
