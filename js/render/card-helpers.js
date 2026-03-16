import { mapUrl } from '../utils.js';

export function mainOpen(m) { return m ? '<div class="card-main">' : ''; }
export function mainClose(m) { return m ? '</div>' : ''; }

export function mapBtn(m) {
  return m ? `<a class="card-map-btn" href="${mapUrl(m)}" target="_blank" rel="noopener" aria-label="Google Maps"><svg viewBox="0 0 24 24" fill="none" stroke="#0071e3" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5"/><path d="M3.5 8.5h17M3.5 15.5h17"/></svg></a>` : '';
}

export function cardOpen(cls, it, dayNum, idx) {
  const ha = it.alts && it.alts.length > 0;
  const hm = !!it.m;
  const needData = ha || hm;
  return `<div class="card ${cls}${it.c ? ' compact' : ''}${ha ? ' has-alts' : ''}${hm ? ' has-map' : ''}"${needData ? ` data-day="${dayNum}" data-idx="${idx}"` : ''}>` + (ha ? `<div class="badge">+${it.alts.length}</div>` : '');
}
