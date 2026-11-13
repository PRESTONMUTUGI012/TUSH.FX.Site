class TerminalAudioEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = true;
    }
    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playTone(freq, type, startTime, duration, volume = 0.15) {
        if (!this.isEnabled) return;
        this.initContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
    playProfitChime() {
        if (!this.isEnabled) return;
        this.initContext();
        const now = this.ctx.currentTime;
        this.playTone(523.25, 'triangle', now, 0.18, 0.16);
        this.playTone(659.25, 'triangle', now + 0.09, 0.18, 0.16);
        this.playTone(783.99, 'triangle', now + 0.18, 0.22, 0.18);
        this.playTone(1046.50, 'sine', now + 0.27, 0.45, 0.22);
    }
}

const terminalAudio = new TerminalAudioEngine();

function toggleTerminalAudio() {
    terminalAudio.isEnabled = !terminalAudio.isEnabled;
    if (terminalAudio.isEnabled) terminalAudio.initContext();
    const icon = document.getElementById('audio-status-icon');
    const text = document.getElementById('audio-status-text');
    if (icon && text) {
        icon.innerText = terminalAudio.isEnabled ? '🔊' : '🔇';
        text.innerText = terminalAudio.isEnabled ? 'SFX ON' : 'MUTED';
    }
}

function triggerElhadartProfitAlert(boatLabel, profitAmount) {
    terminalAudio.playProfitChime();
    const banner = document.getElementById('profit-toast-banner');
    const details = document.getElementById('profit-toast-details');
    if (banner && details) {
        details.innerText = `${boatLabel} Secured +$${profitAmount.toFixed(2)} Profit`;
        banner.classList.remove('translate-x-full', 'opacity-0');
        banner.classList.add('translate-x-0', 'opacity-100');
        clearTimeout(window.profitToastTimeout);
        window.profitToastTimeout = setTimeout(() => {
            banner.classList.remove('translate-x-0', 'opacity-100');
            banner.classList.add('translate-x-full', 'opacity-0');
        }, 4000);
    }
}

// 9 Speed Boats & Institutional Indicator Profiles
const speedBoatsDirectory = {
    1: { name: "Boat 1: Smart Money OB Sniper", indicator: "Order Block (OB) Tap", rule: "Hold 15M OB Zone Test" },
    2: { name: "Boat 2: Tick Momentum Scalper", indicator: "Tick Velocity Surge", rule: "Hold 1-3 Ticks Momentum" },
    3: { name: "Boat 3: Tick Reversal Scalper", indicator: "Exhaustion Sweep", rule: "Hold 2 Ticks Reversal" },
    4: { name: "Boat 4: FVG Rebalance Bot", indicator: "Fair Value Gap Fill", rule: "Hold to FVG Equilibrium" },
    5: { name: "Boat 5: BOS Trend Follower", indicator: "Break of Structure (BOS)", rule: "Hold 1H Swing Continuation" },
    6: { name: "Boat 6: CHOCH Reversal Hunter", indicator: "Change of Character (CHOCH)", rule: "Hold Market Structure Flip" },
    7: { name: "Boat 7: Premium/Discount Array", indicator: "Institutional Array 50%", rule: "Hold Equilibrium Target" },
    8: { name: "Boat 8: Adaptive Parity Shifter", indicator: "Even / Odd Bias Shift", rule: "Hold Parity Run (2-3 Ticks)" },
    9: { name: "Boat 9: Over/Under Matrixer", indicator: "Digits 0-4 vs 5-9 Bias", rule: "Hold Statistical Over/Under" }
};

let currentActiveSpeedBoat = 2;

function switchSpeedBoat(boatId) {
    currentActiveSpeedBoat = boatId;
    const boat = speedBoatsDirectory[boatId];
    if (boat) {
        document.getElementById('active-indicator-status').innerText = boat.indicator;
        document.getElementById('candle-holding-rule').innerText = boat.rule;
    }
}

function executeSpeedBoatTrade() {
    const boat = speedBoatsDirectory[currentActiveSpeedBoat];
    const label = boat ? boat.name : `Speed Boat ${currentActiveSpeedBoat}`;
    triggerElhadartProfitAlert(label, 42.50);
    alert(`Executing ${label} Contract Successfully!`);
}
