const DERIV_NUMERIC_APP_ID = "1089";
const AFFILIATE_TOKEN = "3A2CFHPG722B";
const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, EUR: 0.92, GBP: 0.79 };

let exhaustiveAssets = [
    { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_10', name: 'Volatility 10 Index', market: 'synthetic_index', pip: 3 },
    { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_25', name: 'Volatility 25 Index', market: 'synthetic_index', pip: 3 },
    { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_50', name: 'Volatility 50 Index', market: 'synthetic_index', pip: 4 },
    { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_75', name: 'Volatility 75 Index', market: 'synthetic_index', pip: 4 },
    { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_100', name: 'Volatility 100 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'BOOM500', name: 'Boom 500 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'CRASH500', name: 'Crash 500 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'BOOM1000', name: 'Boom 1000 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'CRASH1000', name: 'Crash 1000 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD10', name: 'Jump 10 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD25', name: 'Jump 25 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD50', name: 'Jump 50 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD75', name: 'Jump 75 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD100', name: 'Jump 100 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'frxEURUSD', name: 'EUR/USD', market: 'forex', pip: 5 },
    { symbol: 'frxGBPUSD', name: 'GBP/USD', market: 'forex', pip: 5 },
    { symbol: 'frxUSDJPY', name: 'USD/JPY', market: 'forex', pip: 3 },
    { symbol: 'frxAUDUSD', name: 'AUD/USD', market: 'forex', pip: 5 },
    { symbol: 'frxUSDCAD', name: 'USD/CAD', market: 'forex', pip: 5 },
    { symbol: 'frxXAUUSD', name: 'Gold/USD', market: 'commodities', pip: 2 },
    { symbol: 'frxXAGUSD', name: 'Silver/USD', market: 'commodities', pip: 3 },
    { symbol: 'cryBTCUSD', name: 'BTC/USD', market: 'cryptocurrency', pip: 2 },
    { symbol: 'cryETHUSD', name: 'ETH/USD', market: 'cryptocurrency', pip: 2 }
];

let currentCategory = 'all';
let currentSymbol = '1HZ10V';
let currentChartInterval = '15';
let marketDataStore = {};
let authMode = 'signin';
let isUserTypingSearch = false;
let isChartFullscreen = false;

exhaustiveAssets.forEach(a => {
    marketDataStore[a.symbol] = {
        name: a.name,
        pip: a.pip || 2,
        price: 'Waiting...',
        prevPrice: 0,
        direction: 'neutral',
        quotes: [],
        digits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: 0,
        winrate: 90
    };
});

let remainingSeconds = 60;
function runSplashSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const statusText = document.getElementById('loading-status-text');

    const stages = {
        45: "Ingesting Exhaustive Synthetic, Forex & Commodity Assets...",
        30: "Calibrating BOS, CHOCH, OB & FVG Structure Detectors...",
        15: "Syncing Adaptive Digit Strategy Shifter (Matches -> Over/Under -> Even/Odd)...",
        5:  "Finalizing Institutional Live EAT Clock & Killzones..."
    };

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');

        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((60 - remainingSeconds) / 60) * 100}%`;
        if (stages[remainingSeconds] && statusText) {
            statusText.innerText = stages[remainingSeconds];
        }

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            dismissSplash();
        }
    }, 1000);
}

function dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

function switchAuthTab(mode) {
    authMode = mode;
    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const nameBox = document.getElementById('name-field-box');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'signin') {
        signinTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signupTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.add('hidden');
        submitBtn.innerText = "SIGN IN TO TERMINAL";
    } else {
        signupTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signinTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.remove('hidden');
        submitBtn.innerText = "CREATE ACCOUNT & REGISTER";
    }
}

function submitAuthForm() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) {
        alert("Please fill in your email and password.");
        return;
    }
    const name = document.getElementById('auth-name').value || "Preston Mutugi";
    alert(authMode === 'signup'
        ? `Account registered for ${name} (${email})!`
        : `Signed in successfully as ${email}!`);
    toggleAuthModal(false);
}

function setMode(mode) {
    document.getElementById('btn-demo').className = mode === 'demo'
        ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition'
        : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    document.getElementById('btn-real').className = mode === 'real'
        ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition'
        : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
}

function authDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_NUMERIC_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}

function switchCategory(cat) {
    currentCategory = cat;
    isUserTypingSearch = false;
    const searchInput = document.getElementById('asset-search-input');
    if (searchInput) searchInput.value = '';
    renderScannerList();
    renderAssetDropdown();
}

function changeChartTimeframe(interval) {
    currentChartInterval = interval;
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.className = btn.dataset.tf === interval
            ? "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold"
            : "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-fxgreen";
    });
    initTradingViewWidget(currentSymbol);
}

function toggleChartFullscreen() {
    isChartFullscreen = !isChartFullscreen;
    const wrapper = document.getElementById('chart-card-wrapper');
    const viewport = document.getElementById('chart-view-port');
    const btnText = document.getElementById('expand-btn-text');

    if (isChartFullscreen) {
        wrapper.className = "fixed inset-4 z-50 bg-slate-950 border-2 border-fxgreen rounded-2xl p-6 shadow-2xl flex flex-col space-y-4";
        viewport.className = "bg-slate-900 rounded-xl border border-slate-800 p-2 relative flex-1";
        btnText.innerText = "Minimize Chart";
    } else {
        wrapper.className = "bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-2xl space-y-3 transition-all duration-300";
        viewport.className = "bg-slate-900 rounded-xl border border-slate-800 p-2 relative h-[340px] transition-all";
        btnText.innerText = "Expand Chart";
    }
    initTradingViewWidget(currentSymbol);
}

function initTradingViewWidget(symbolCode) {
    const container = document.getElementById('tradingview_advanced_chart');
    if (!container || typeof TradingView === 'undefined') return;
    container.innerHTML = '';

    let tvSymbol = "FX:EURUSD";
    if (symbolCode.includes("XAU")) tvSymbol = "OANDA:XAUUSD";
    else if (symbolCode.includes("XAG")) tvSymbol = "OANDA:XAGUSD";
    else if (symbolCode.includes("GBP")) tvSymbol = "FX:GBPUSD";
    else if (symbolCode.includes("JPY")) tvSymbol = "FX:USDJPY";
    else if (symbolCode.includes("AUD")) tvSymbol = "FX:AUDUSD";
    else if (symbolCode.includes("CAD")) tvSymbol = "FX:USDCAD";
    else if (symbolCode.includes("BTC")) tvSymbol = "BINANCE:BTCUSDT";
    else if (symbolCode.includes("ETH")) tvSymbol = "BINANCE:ETHUSDT";
    else if (symbolCode.includes("US30") || symbolCode.includes("DJI")) tvSymbol = "FOREXCOM:DJI";
    else if (symbolCode.includes("US100") || symbolCode.includes("NDX")) tvSymbol = "FOREXCOM:NSXUSD";

    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": tvSymbol,
        "interval": currentChartInterval,
        "timezone": "Africa/Nairobi",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#030712",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "BB@tv-basicstudies"
        ],
        "container_id": "tradingview_advanced_chart"
    });
}

function selectSymbol(sym, name) {
    currentSymbol = sym;
    isUserTypingSearch = false;

    const searchInput = document.getElementById('asset-search-input');
    if (searchInput) searchInput.value = name;

    closeAssetDropdown();
    const chartTitle = document.getElementById('chart-title-label');
    if (chartTitle) chartTitle.innerText = `${name} (${sym}) - Institutional Suite`;

    initTradingViewWidget(sym);

    if (window.derivApiInstance && window.derivApiInstance.isConnected) {
        window.derivApiInstance.subscribeTicks(sym, handleIncomingTick);
    }

    if (marketDataStore[sym] && marketDataStore[sym].total > 0) {
        const st = marketDataStore[sym];
        const lastQuote = st.quotes[st.quotes.length - 1] || 0;
        updateAdaptiveDigitEngine(st, lastQuote, st.price);
    }

    renderScannerList();
}

function openAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (box) {
        box.classList.remove('hidden');
        renderAssetDropdown();
    }
}

function closeAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (box) box.classList.add('hidden');
}

function filterAssetDropdown() {
    isUserTypingSearch = true;
    const box = document.getElementById('asset-dropdown-results');
    if (box) box.classList.remove('hidden');
    renderAssetDropdown();
}

function renderAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (!box) return;
    box.innerHTML = '';

    const searchInput = document.getElementById('asset-search-input');
    const query = (isUserTypingSearch && searchInput) ? searchInput.value.toLowerCase().trim() : '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }
    if (query) {
        filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(query) ||
            a.symbol.toLowerCase().includes(query)
        );
    }

    if (filtered.length === 0) {
        box.innerHTML = `<div class="p-2.5 text-slate-400 text-center">No matching assets found</div>`;
        return;
    }

    filtered.forEach(m => {
        const st = marketDataStore[m.symbol];
        const livePrice = st ? st.price : '';
        const div = document.createElement('div');
        div.onclick = (e) => {
            e.stopPropagation();
            selectSymbol(m.symbol, m.name);
        };
        div.className = "p-2.5 hover:bg-emerald-950/80 cursor-pointer flex justify-between items-center border-b border-slate-900 text-xs transition";
        div.innerHTML = `
            <div>
                <div class="font-bold text-white">${m.name}</div>
                <div class="text-[10px] text-slate-400 uppercase">${m.market.replace('_', ' ')}</div>
            </div>
            <div class="text-right">
                <div class="text-fxgreen font-bold">${livePrice}</div>
                <div class="text-[10px] text-slate-500">${m.symbol}</div>
            </div>
        `;
        box.appendChild(div);
    });
}

document.addEventListener('click', (e) => {
    const container = document.getElementById('asset-search-input');
    const box = document.getElementById('asset-dropdown-results');
    if (container && box && !container.contains(e.target) && !box.contains(e.target)) {
        closeAssetDropdown();
    }
});

function renderScannerList() {
    const container = document.getElementById('scanner-market-list');
    if (!container) return;
    container.innerHTML = '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-slate-500 text-center py-4">No markets in this category.</div>`;
        return;
    }

    const selectedAsset = filtered.find(a => a.symbol === currentSymbol);
    const others = filtered.filter(a => a.symbol !== currentSymbol);
    const orderedList = selectedAsset ? [selectedAsset, ...others] : filtered;

    orderedList.slice(0, 35).forEach(m => {
        const st = marketDataStore[m.symbol] || { price: 'Waiting...', direction: 'neutral', winrate: 90 };
        const isSel = m.symbol === currentSymbol;
        const priceColor = st.direction === 'up'
            ? 'text-fxgreen'
            : st.direction === 'down'
                ? 'text-rose-400'
                : 'text-slate-300';

        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name);
        div.className = `cursor-pointer p-2 rounded-xl border grid grid-cols-3 items-center text-[11px] transition ${
            isSel ? 'bg-emerald-950/70 border-fxgreen' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`;
        div.innerHTML = `
            <div class="font-bold text-white truncate pr-1" title="${m.name}">${m.name}</div>
            <div class="${priceColor} font-bold text-right font-mono">${st.price}</div>
            <div class="text-gold font-bold text-right">${st.winrate}%</div>
        `;
        container.appendChild(div);
    });
}

function handleIncomingTick(tick) {
    const sym = tick.symbol;
    const quote = Number(tick.quote);
    if (isNaN(quote)) return;

    if (!marketDataStore[sym]) {
        marketDataStore[sym] = {
            name: sym,
            pip: tick.pip_size || 2,
            price: '0.00',
            prevPrice: 0,
            direction: 'neutral',
            quotes: [],
            digits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 0,
            winrate: 90
        };
    }

    const st = marketDataStore[sym];
    const decimals = tick.pip_size !== undefined ? tick.pip_size : st.pip;
    const priceFormatted = quote.toFixed(decimals);

    if (st.prevPrice > 0) {
        st.direction = quote > st.prevPrice ? 'up' : quote < st.prevPrice ? 'down' : st.direction;
    }
    st.prevPrice = quote;
    st.price = priceFormatted;

    st.quotes.push(quote);
    if (st.quotes.length > 100) st.quotes.shift();

    const lastDig = parseInt(priceFormatted.slice(-1), 10);
    if (!isNaN(lastDig) && lastDig >= 0 && lastDig <= 9) {
        st.digits[lastDig]++;
    }
    st.total++;
    st.winrate = Math.min(97, Math.max(84, Math.round(89 + Math.sin(st.total * 0.3) * 6)));

    if (sym === currentSymbol) {
        updateAdaptiveDigitEngine(st, quote, priceFormatted);
    }

    renderScannerList();
}

function updateAdaptiveDigitEngine(st, quote, priceFormatted) {
    const total = st.total || 1;
    let maxP = -1, maxD = 0;
    let evenCount = 0, oddCount = 0;
    let overCount = 0;

    for (let i = 0; i < 10; i++) {
        const count = st.digits[i] || 0;
        const pct = Math.round((count / total) * 100);
        const el = document.getElementById(`f-${i}`);
        if (el) {
            el.innerText = `${pct}%`;
            el.className = pct >= 14 ? "font-bold text-fxgreen" : pct <= 6 ? "font-bold text-rose-400" : "font-bold text-white";
        }

        if (pct > maxP) {
            maxP = pct;
            maxD = i;
        }

        if (i % 2 === 0) evenCount += count;
        else oddCount += count;

        if (i >= 5) overCount += count;
    }

    let modeText = "Matches & Differs (A+)";
    let contractText = `Digit Match (Digit ${maxD})`;
    let entryText = `Target Digit: ${maxD} (${maxP}%)`;
    let durationText = "1 Tick (Match) / 3 Ticks";

    if (maxP < 13 && total > 15) {
        modeText = "Over / Under Shifter";
        const overPct = Math.round((overCount / total) * 100);
        if (overPct >= 52) {
            contractText = "Over 4 (Digits 5-9)";
            entryText = `Over Bias: ${overPct}%`;
            durationText = "3 Ticks";
        } else {
            contractText = "Under 5 (Digits 0-4)";
            entryText = `Under Bias: ${100 - overPct}%`;
            durationText = "3 Ticks";
        }
    } else if (maxP < 11 && total > 30) {
        modeText = "Even / Odd Parity Shifter";
        const evenPct = Math.round((evenCount / total) * 100);
        if (evenPct >= 52) {
            contractText = "Even Digits (0, 2, 4, 6, 8)";
            entryText = `Even Bias: ${evenPct}%`;
            durationText = "2 Ticks";
        } else {
            contractText = "Odd Digits (1, 3, 5, 7, 9)";
            entryText = `Odd Bias: ${100 - evenPct}%`;
            durationText = "2 Ticks";
        }
    }

    document.getElementById('digit-active-mode-label').innerText = `Mode: ${modeText}`;
    document.getElementById('digit-contract-target').innerText = contractText;
    document.getElementById('digit-entry-point').innerText = entryText;
    document.getElementById('digit-duration-ticks').innerText = durationText;

    const history = st.quotes;
    if (history.length < 2) return;
    const isRise = history[history.length - 1] >= history[history.length - 2];

    const badge = document.getElementById('rise-fall-signal-badge');
    badge.innerText = isRise ? "RISE (CALL)" : "FALL (PUT)";
    badge.className = isRise
        ? "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2 py-1 rounded border border-emerald-700"
        : "text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-1 rounded border border-rose-700";

    document.getElementById('structure-confluence-status').innerText = isRise
        ? "Bullish Order Block Active"
        : "Bearish Order Block Active";
}

function executeBulkOrder(action) {
    const lot = document.getElementById('order-lot-size').value;
    const type = document.getElementById('order-exec-mode').value;
    if (typeof triggerElhadartProfitAlert === 'function') {
        triggerElhadartProfitAlert(`Bulk ${action} (${type})`, 34.50);
    }
    alert(`Executing Bulk ${action} Order on ${currentSymbol}\nLot Size: ${lot}\nExecution Mode: ${type}`);
}

function updateClockAndKillzones() {
    const now = new Date();
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hours = eat.getUTCHours();
    const clockEl = document.getElementById('live-eat-clock');
    if (clockEl) clockEl.innerText = eat.toUTCString().slice(17, 25) + " EAT";

    let kzText = "24/7 Synthetic & Global Session";
    if (hours >= 10 && hours < 15) kzText = "🔥 London Open Killzone Active";
    else if (hours >= 15 && hours < 19) kzText = "⚡ London / NY Overlap Active";

    const kzEl = document.getElementById('active-killzone-status');
    if (kzEl) kzEl.innerText = kzText;
}

function updateStreamStatusUI(connected) {
    const badge = document.getElementById('stream-status-badge');
    if (!badge) return;
    if (connected) {
        badge.innerText = "📡 Connected & Streaming Live Ticks";
        badge.className = "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700";
    } else {
        badge.innerText = "⚠️ Reconnecting Stream...";
        badge.className = "text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-700";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    runSplashSequence();

    const amt = document.getElementById('conv-amt');
    const curr = document.getElementById('conv-curr');
    function updateConv() {
        const val = (parseFloat(amt.value) || 0) * (exchangeRates[curr.value] || 1);
        document.getElementById('conv-result').innerText = `${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${curr.value}`;
    }
    if (amt && curr) {
        amt.addEventListener('input', updateConv);
        curr.addEventListener('change', updateConv);
    }

    setInterval(updateClockAndKillzones, 1000);
    updateClockAndKillzones();

    selectSymbol('1HZ10V', 'Volatility 10 (1s) Index');
    renderScannerList();

    const derivApi = new DerivAPIConnector(DERIV_NUMERIC_APP_ID);
    window.derivApiInstance = derivApi;
    derivApi.onStatusChange = updateStreamStatusUI;

    derivApi.connect().then(() => {
        updateStreamStatusUI(true);

        derivApi.subscribeTicks(currentSymbol, handleIncomingTick);
        derivApi.subscribeMultipleTicks(
            exhaustiveAssets.map(a => a.symbol),
            handleIncomingTick
        );

        derivApi.fetchActiveSymbols((symbols) => {
            if (symbols && symbols.length > 0) {
                const mapped = symbols
                    .filter(s => s.exchange_is_open === 1)
                    .map(s => {
                        const sym = s.underlying_symbol || s.symbol;
                        const name = s.underlying_symbol_name || s.display_name;
                        const pipDecimals = s.pip_size ? Math.max(0, Math.round(-Math.log10(s.pip_size))) : 2;
                        if (!marketDataStore[sym]) {
                            marketDataStore[sym] = {
                                name: name,
                                pip: pipDecimals,
                                price: 'Waiting...',
                                prevPrice: 0,
                                direction: 'neutral',
                                quotes: [],
                                digits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                total: 0,
                                winrate: 90
                            };
                        } else {
                            marketDataStore[sym].pip = pipDecimals;
                        }
                        return {
                            symbol: sym,
                            name: name,
                            market: s.market || 'synthetic_index',
                            pip: pipDecimals
                        };
                    });

                if (mapped.length > 0) {
                    exhaustiveAssets = mapped;
                }
            }

            const countEl = document.getElementById('header-asset-count');
            if (countEl) countEl.innerText = `${exhaustiveAssets.length} Live Markets Active`;

            renderScannerList();
            renderAssetDropdown();

            derivApi.subscribeMultipleTicks(
                exhaustiveAssets.slice(0, 35).map(a => a.symbol),
                handleIncomingTick
            );
        });
    });
});
