class DerivAPIConnector {
    constructor(numericAppId = "1089") {
        this.appId = /^\d+$/.test(String(numericAppId)) ? String(numericAppId) : "1089";
        this.ws = null;
        this.isConnected = false;
        this.activeSymbol = null;
        this.subscribers = {};
        this.multiSubscribers = {};
        this.lastEpochs = {};
        this.pingInterval = null;
        this.onActiveSymbolsCallback = null;
        this.onStatusChange = null;
    }

    connect() {
        return new Promise((resolve) => {
            const endpoint = `wss://ws.derivws.com/websockets/v3?app_id=${this.appId}`;
            this.ws = new WebSocket(endpoint);

            this.ws.onopen = () => {
                this.isConnected = true;
                if (this.onStatusChange) this.onStatusChange(true);
                this.startHeartbeat();
                resolve(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.error) {
                        console.warn("Deriv API Notice:", data.error.message);
                        return;
                    }

                    if (data.msg_type === 'active_symbols' && data.active_symbols) {
                        if (this.onActiveSymbolsCallback) {
                            this.onActiveSymbolsCallback(data.active_symbols);
                        }
                    }

                    if (data.msg_type === 'tick' && data.tick) {
                        const sym = data.tick.symbol;
                        const epoch = data.tick.epoch;
                        const quote = Number(data.tick.quote);

                        if (isNaN(quote) || quote <= 0) return;
                        if (this.lastEpochs[sym] && epoch < this.lastEpochs[sym]) return;

                        this.lastEpochs[sym] = epoch;

                        if (this.subscribers[sym]) {
                            this.subscribers[sym](data.tick);
                        }
                        if (this.multiSubscribers[sym]) {
                            this.multiSubscribers[sym](data.tick);
                        }
                    }
                } catch (e) {
                    console.error("Packet parsing error:", e);
                }
            };

            this.ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                this.isConnected = false;
                if (this.onStatusChange) this.onStatusChange(false);
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                if (this.onStatusChange) this.onStatusChange(false);
                clearInterval(this.pingInterval);
                setTimeout(() => this.connect(), 2000);
            };
        });
    }

    startHeartbeat() {
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
            if (this.ws && this.isConnected) {
                this.ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 25000);
    }

    fetchActiveSymbols(callback) {
        this.onActiveSymbolsCallback = callback;
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ active_symbols: "brief" }));
        }
    }

    subscribeTicks(symbol, callback) {
        this.activeSymbol = symbol;
        this.subscribers[symbol] = callback;
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
        }
    }

    subscribeMultipleTicks(symbolsArray, callback) {
        if (!Array.isArray(symbolsArray) || symbolsArray.length === 0) return;
        symbolsArray.forEach(sym => {
            this.multiSubscribers[sym] = callback;
        });
        if (this.ws && this.isConnected) {
            // Stagger requests by 60ms to prevent Deriv server rate limits
            symbolsArray.forEach((sym, index) => {
                setTimeout(() => {
                    if (this.ws && this.isConnected) {
                        this.ws.send(JSON.stringify({ ticks: sym, subscribe: 1 }));
                    }
                }, index * 60);
            });
        }
    }
}
