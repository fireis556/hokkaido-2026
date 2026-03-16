import { TRIP } from './config.js';

let currentRate = TRIP.fallbackRate;
let rateSource = 'fallback';
let rateTime = '';

export function getCurrentRate() { return currentRate; }

export function getRateStatus() {
  const dotCls = rateSource === 'online' ? 'online' : rateSource === 'cached' ? 'cached' : 'fallback';
  const label = rateSource === 'online' ? `線上即時 · ${rateTime}` : rateSource === 'cached' ? `離線快取 · ${rateTime}` : '預設匯率（無快取）';
  return { dotCls, label };
}

let _onRateUpdate = null;
export function onRateUpdate(fn) { _onRateUpdate = fn; }

export async function fetchRate() {
  const cached = localStorage.getItem('jpy_rate');
  const cachedTime = localStorage.getItem('jpy_rate_time');
  if (cached) { currentRate = +cached; rateSource = 'cached'; rateTime = cachedTime || ''; }
  try {
    const r = await fetch(TRIP.rateApi);
    const j = await r.json();
    if (j.result === 'success' && j.rates && j.rates.TWD) {
      currentRate = j.rates.TWD;
      rateSource = 'online';
      rateTime = new Date().toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('jpy_rate', currentRate);
      localStorage.setItem('jpy_rate_time', rateTime);
    }
  } catch (e) {}
  updateRateUI();
}

export function updateRateUI() {
  const el = document.getElementById('rate-status');
  if (!el) return;
  const { dotCls, label } = getRateStatus();
  el.innerHTML = `<span class="rate-dot ${dotCls}"></span>${label}`;
  const rateVal = document.getElementById('rate-value');
  if (rateVal) rateVal.textContent = currentRate.toFixed(4);
  const jpyInput = document.getElementById('calc-jpy');
  if (jpyInput && jpyInput.value) calcFromJpy();
  document.querySelectorAll('[data-conv-jpy]').forEach(el => {
    const jpy = +el.dataset.convJpy, ntd = +el.dataset.convNtd || 0;
    el.textContent = `≈ NT$${(Math.round(jpy * currentRate) + ntd).toLocaleString()}`;
  });
  if (_onRateUpdate) _onRateUpdate();
}

export function calcFromJpy() {
  const v = parseFloat(document.getElementById('calc-jpy').value) || 0;
  document.getElementById('calc-twd').value = v ? Math.round(v * currentRate) : '';
}

export function calcFromTwd() {
  const v = parseFloat(document.getElementById('calc-twd').value) || 0;
  document.getElementById('calc-jpy').value = v ? Math.round(v / currentRate) : '';
}
