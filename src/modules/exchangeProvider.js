import store from "modules/store";
import watch from "redux-watch";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { connectExchange, refreshExchange } from "modules/reducers/exchange";
/*
    TODO: make it to a HOC
*/

export default () => {
    console.debug("exchangeProvider");

    const exchange = store.getState().exchange;
    const web3Connect = store.getState().web3Connect;
    let w1 = watch(store.getState, "web3Connect.web3ConnectionId");
    store.subscribe(
        w1((newVal, oldVal, objectPath) => {
            console.debug("exchangeProvider - web3Connect.web3ConnectionId");
            if (newVal) {
                console.debug(
                    "exchangeProvider - web3Connect.web3ConnectionId changed. Dispatching connectExchange()"
                );
                store.dispatch(connectExchange());
            }
        })
    );

    let w2 = watch(store.getState, "exchange.contract");
    store.subscribe(
        w2((newVal, oldVal, objectPath) => {
            if (newVal) {
                console.debug(
                    "exchangeProvider - exchange.contract changed. Dispatching refreshExchange()"
                );
                store.dispatch(refreshExchange());
                setupListeners();
            }
        })
    );

    if (!web3Connect.isLoading && !web3Connect.isConnected) {
        store.dispatch(setupWeb3());
    }

    if (
        !exchange.isLoading &&
        !exchange.isConnected &&
        web3Connect.isConnected
    ) {
        console.debug(
            "exchangeProvider - web3 connected, dispatching connectExchange() "
        );
        store.dispatch(connectExchange());
    }

    return;
};

const setupListeners = () => {
    const exchange = store.getState().exchange;
    exchange.contract.instance
        .e_newOrder({ fromBlock: "latest", toBlock: "pending" })
        .watch(onNewOrder);
    exchange.contract.instance
        .e_orderFill({ fromBlock: "latest", toBlock: "pending" })
        .watch(onOrderFill);
};

const onNewOrder = (error, result) => {
    // event e_newOrder(uint orderId, OrdersLib.OrderType orderType, address maker, uint amount);
    console.debug(
        "exchangeProvider.onNewOrder: dispatching refreshExchange()",
        result.args
    );
    store.dispatch(refreshExchange());
};

// event e_orderFill(uint orderId, OrdersLib.OrderType orderType, address maker, address taker, uint amountSold, uint amountPaid);
const onOrderFill = (error, result) => {
    // event e_newOrder(address maker, uint weiToSell, uint ucdToSell );
    console.debug(
        "exchangeProvider.onOrderFill: dispatching refreshExchange()",
        result.args
    );
    // FIXME: shouldn't do refresh for each orderFill but no new order emmited if a sell fully covered by orders
    store.dispatch(refreshExchange());
};