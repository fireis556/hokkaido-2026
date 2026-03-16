import { extractEmoji } from '../categories.js';
import { mapUrl, renderTags, warnN, detailN } from '../utils.js';
import { mainOpen, mainClose, mapBtn, cardOpen } from './card-helpers.js';

function renderFoodDetail(it) {
  let h = '<div class="card-detail"><hr class="detail-divider">';
  if (it.hours) h += `<div class="detail-hours">🕐 ${it.hours}</div>`;
  if (it.menu && it.menu.length) {
    h += `<div class="detail-menu-title">🍴 おすすめ / 推薦</div>`;
    it.menu.forEach(m => { h += `<div class="detail-menu-item"><div class="detail-menu-jp">${m.jp}</div><div class="detail-menu-row"><span class="detail-menu-cn">${m.cn}</span><span class="detail-menu-price">${m.price}</span></div></div>`; });
  }
  if (it.tags && it.tags.length) h += renderTags(it.tags);
  h += detailN(it.n);
  if (it.m) h += `<a class="detail-photos" href="${mapUrl(it.m)}" target="_blank" rel="noopener">📷 Google で写真を見る →</a>`;
  return h + '</div>';
}

function renderSpotDetail(it) {
  let h = '<div class="card-detail"><hr class="detail-divider">';
  if (it.hours) h += `<div class="detail-hours">🕐 ${it.hours}</div>`;
  if (it.tags && it.tags.length) h += renderTags(it.tags);
  h += detailN(it.n);
  return h + '</div>';
}

function renderTransportRoute(it, dayNum, idx) {
  let h = cardOpen('card-transport', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div>`;
  h += `<div class="activity">${it.a}</div>`;
  h += `<div class="route"><span class="route-from">${it.from}</span><span class="route-line"></span><span class="route-to">${it.to}</span></div>`;
  const allTags = [it.dur, ...(it.tags || [])];
  h += renderTags(allTags);
  h += warnN(it.n) + mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderTransportSimple(it, dayNum, idx) {
  let h = cardOpen('card-transport', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div><div class="activity">${it.a}</div>`;
  h += warnN(it.n) + renderTags(it.tags) + mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderFoodCard(it, dayNum, idx) {
  const e = extractEmoji(it.a);
  let h = cardOpen('card-food card-expandable', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div>`;
  h += `<div class="card-header">`;
  if (e) h += `<div class="card-icon">${e}</div>`;
  h += `<div class="card-body"><div class="card-shop">${it.shop}</div>`;
  if (it.desc || it.oneliner) h += `<div class="card-desc">${it.desc || it.oneliner}</div>`;
  h += `</div></div>`;
  h += `<div class="card-chevron">▾</div>`;
  h += renderFoodDetail(it);
  h += mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderFoodSimple(it, dayNum, idx) {
  let h = cardOpen('card-food', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div><div class="activity">${it.a}</div>`;
  h += warnN(it.n) + renderTags(it.tags) + mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderSpotCard(it, dayNum, idx) {
  const e = extractEmoji(it.a);
  const hasDetail = it.hours || it.n;
  let h = cardOpen('card-spot' + (hasDetail ? ' card-expandable' : ''), it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div>`;
  h += `<div class="card-header">`;
  if (e) h += `<div class="card-icon">${e}</div>`;
  h += `<div class="card-body"><div class="activity">${it.a}</div></div></div>`;
  if (hasDetail) {
    h += `<div class="card-chevron">▾</div>`;
    h += renderSpotDetail(it);
  }
  h += mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderHotelCard(it, dayNum, idx) {
  let h = cardOpen('card-hotel', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div>`;
  h += `<div class="card-header">`;
  const e = extractEmoji(it.a);
  if (e) h += `<div class="card-icon">${e}</div>`;
  h += `<div class="card-body"><div class="activity">${it.a}</div>`;
  h += warnN(it.n);
  h += `</div></div>`;
  h += renderTags(it.tags) + mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

function renderDefaultCard(it, dayNum, idx) {
  let h = cardOpen('', it, dayNum, idx) + mainOpen(it.m);
  h += `<div class="time">${it.t}</div><div class="activity">${it.a}</div>`;
  h += warnN(it.n) + mainClose(it.m) + mapBtn(it.m) + `</div>`;
  return h;
}

export function renderCard(it, cat, dayNum, idx) {
  switch (cat) {
    case 'transport': return it.from && it.to ? renderTransportRoute(it, dayNum, idx) : renderTransportSimple(it, dayNum, idx);
    case 'food': return it.shop ? renderFoodCard(it, dayNum, idx) : renderFoodSimple(it, dayNum, idx);
    case 'spot': return renderSpotCard(it, dayNum, idx);
    case 'hotel': return renderHotelCard(it, dayNum, idx);
    default: return renderDefaultCard(it, dayNum, idx);
  }
}
