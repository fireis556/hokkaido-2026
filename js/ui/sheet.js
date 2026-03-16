import { renderSheetAltCard } from '../render/restaurant.js';

let _sheetOverlay = null;
let _sheetEl = null;

export function setSheetRefs(el, overlay) {
  _sheetEl = el;
  _sheetOverlay = overlay;
}

export function openSheet(alts, title) {
  closeSheet(true);
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  let body = '';
  alts.forEach(a => { body += renderSheetAltCard(a); });
  sheet.innerHTML = `<div class="sheet-handle"></div><div class="sheet-head"><div class="sheet-title">備選方案</div><button class="sheet-close">✕</button></div><div class="sheet-body">${body}</div>`;
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  _sheetOverlay = overlay; _sheetEl = sheet;
  requestAnimationFrame(() => { overlay.classList.add('show'); sheet.classList.add('show'); });
  overlay.addEventListener('click', () => closeSheet());
  sheet.querySelector('.sheet-close').addEventListener('click', () => closeSheet());
  let ty = 0;
  sheet.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - ty > 80) closeSheet(); }, { passive: true });
}

export function closeSheet(immediate) {
  const o = _sheetOverlay, s = _sheetEl;
  _sheetOverlay = null; _sheetEl = null;
  if (!o && !s) return;
  if (immediate) { if (o) o.remove(); if (s) s.remove(); return; }
  if (o) o.classList.remove('show');
  if (s) s.classList.remove('show');
  setTimeout(() => { if (o) o.remove(); if (s) s.remove(); }, 250);
}
