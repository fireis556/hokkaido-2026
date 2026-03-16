import { SOUVENIRS } from '../data/souvenirs.js';
import { getCurrentRate } from '../currency.js';
import { mapUrl } from '../utils.js';

export function loadSouvState() {
  const blank = () => SOUVENIRS.map(() => ({ checked: false, qty: 0 }));
  try {
    const saved = JSON.parse(localStorage.getItem('souvenir-state'));
    if (!saved) return blank();
    while (saved.length < SOUVENIRS.length) saved.push({ checked: false, qty: 0 });
    return saved;
  } catch (e) { return blank(); }
}

export function saveSouvState(state) {
  localStorage.setItem('souvenir-state', JSON.stringify(state));
}

export function updateSouvTotal() {
  const el = document.querySelector('[data-section="souvenir"] .souv-total');
  if (!el) return;
  const state = loadSouvState();
  const currentRate = getCurrentRate();
  let cnt = 0, total = 0;
  state.forEach((st, i) => { if (st.checked && st.qty > 0) { cnt += st.qty; total += st.qty * SOUVENIRS[i].price; } });
  el.innerHTML = cnt > 0
    ? `🛒 ${cnt} 件 · <span class="mono">¥${total.toLocaleString()}</span> ≈ <span class="mono">NT$${Math.round(total * currentRate).toLocaleString()}</span>`
    : '尚未選擇伴手禮';
}

export function renderSouvenir() {
  const state = loadSouvState();
  const currentRate = getCurrentRate();
  const storeMap = { '常溫': 'normal', '冷藏': 'cold', '冷凍': 'frozen' };
  let h = '<div class="souv-list">';
  SOUVENIRS.forEach((s, i) => {
    const st = state[i];
    h += `<div class="souv-item${st.checked ? ' checked' : ''}" data-idx="${i}">`;
    h += `<label class="souv-check"><input type="checkbox"${st.checked ? ' checked' : ''}><span class="souv-tick">✓</span></label>`;
    h += `<span class="souv-emoji">${s.emoji}</span>`;
    h += `<div class="souv-row1"><span class="souv-name">${s.name}</span><span class="souv-pin"><svg viewBox="0 0 24 24" fill="none" stroke="#0071e3" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5"/><path d="M3.5 8.5h17M3.5 15.5h17"/></svg></span><div class="souv-qty"><button class="qty-btn qty-minus">−</button><span class="qty-val${st.qty > 0 ? ' has-qty' : ''}">${st.qty}</span><button class="qty-btn qty-plus">＋</button></div></div>`;
    h += `<div class="souv-row2"><span class="souv-brand">${s.brand}・${s.unit}</span><span class="store-pill store-${storeMap[s.store] || 'normal'}">${s.store}</span><span class="souv-price">¥${s.price.toLocaleString()}</span></div>`;
    if (s.shops && s.shops.length) {
      h += `<div class="souv-shops"><hr class="souv-shop-divider">`;
      const areas = { '札幌': '🏙', '空港': '✈' };
      s.shops.forEach(sh => {
        h += `<div class="souv-shop-area">${areas[sh.area] || '📍'} ${sh.area === '空港' ? '新千歳空港' : sh.area === '札幌' ? '札幌市区' : sh.area}</div>`;
        h += `<a class="souv-shop-link" href="${mapUrl(sh.query)}" target="_blank" rel="noopener">${'📍 ' + sh.label}</a>`;
      });
      h += `</div>`;
    }
    h += `</div>`;
  });
  h += '</div>';
  let cnt = 0, total = 0;
  state.forEach((st, i) => { if (st.checked && st.qty > 0) { cnt += st.qty; total += st.qty * SOUVENIRS[i].price; } });
  const twdTotal = Math.round(total * currentRate);
  h += `<div class="souv-total">`;
  if (cnt > 0) h += `🛒 ${cnt} 件 · <span class="mono">¥${total.toLocaleString()}</span> ≈ <span class="mono">NT$${twdTotal.toLocaleString()}</span>`;
  else h += `尚未選擇伴手禮`;
  h += `</div>`;
  return h;
}

export function bindSouvenirEvents() {
  const container = document.querySelector('[data-section="souvenir"]');
  if (!container) return;
  container.addEventListener('click', e => {
    const item = e.target.closest('.souv-item');
    if (!item) return;
    const idx = +item.dataset.idx;
    const state = loadSouvState();
    const st = state[idx];
    if (e.target.closest('.souv-shop-link')) return;
    if (e.target.closest('.souv-pin')) { item.classList.toggle('shop-open'); return; }
    if (e.target.closest('.qty-plus')) {
      st.qty++;
      if (!st.checked) st.checked = true;
    } else if (e.target.closest('.qty-minus')) {
      if (st.qty > 0) st.qty--;
      if (st.qty === 0) st.checked = false;
    } else if (e.target.closest('.souv-check')) {
      const cb = item.querySelector('input[type="checkbox"]');
      st.checked = cb.checked;
      if (st.checked && st.qty === 0) st.qty = 1;
      if (!st.checked) st.qty = 0;
    } else return;
    saveSouvState(state);
    const cb = item.querySelector('input[type="checkbox"]');
    cb.checked = st.checked;
    item.classList.toggle('checked', st.checked);
    const qv = item.querySelector('.qty-val');
    qv.textContent = st.qty;
    qv.classList.toggle('has-qty', st.qty > 0);
    updateSouvTotal();
  });
  container.querySelectorAll('.souv-check input').forEach(cb => {
    cb.addEventListener('click', e => e.stopPropagation());
    cb.addEventListener('change', e => {
      const item = e.target.closest('.souv-item');
      const idx = +item.dataset.idx;
      const state = loadSouvState();
      const st = state[idx];
      st.checked = e.target.checked;
      if (st.checked && st.qty === 0) st.qty = 1;
      if (!st.checked) st.qty = 0;
      saveSouvState(state);
      item.classList.toggle('checked', st.checked);
      const qv = item.querySelector('.qty-val');
      qv.textContent = st.qty;
      qv.classList.toggle('has-qty', st.qty > 0);
      updateSouvTotal();
    });
  });
}
