import { mapUrl } from '../utils.js';
import { mapBtn } from './card-helpers.js';

export function renderRestaurantCard(it, dayNum, idx) {
  const ha = it.alts && it.alts.length > 0;
  const hm = !!it.m;
  let h = `<div class="rest-card${hm ? ' has-map' : ''}${ha ? ' has-alts' : ''}"${ha ? ` data-day="${dayNum}" data-idx="${idx}"` : ''}>`;
  if (ha) h += `<div class="badge">+${it.alts.length}</div>`;
  if (hm) h += '<div class="rest-card-main">';
  h += `<div class="rest-name">${it.shop || ''}</div>`;
  if (it.oneliner) h += `<div class="rest-oneliner">「${it.oneliner}」</div>`;
  h += '<div class="rest-meta">';
  if (it.type) h += `<span class="rest-tag">${it.type}</span>`;
  if (it.station) h += `<span class="rest-tag">📍 ${it.station}</span>`;
  h += '</div>';
  h += '<div class="rest-bottom">';
  if (it.hours) h += `<span class="rest-hours">🕐 ${it.hours}</span>`;
  if (it.price) h += `<span class="rest-price">💰 ${it.price}</span>`;
  h += '</div>';
  if (hm) h += '</div>';
  if (hm) h += mapBtn(it.m);
  h += '</div>';
  return h;
}

export function renderSheetAltCard(a) {
  if (a.type) {
    const hm = !!a.map;
    let h = `<div class="rest-card${hm ? ' has-map' : ''}">`;
    if (hm) h += '<div class="rest-card-main">';
    h += `<div class="rest-name">${a.name}</div>`;
    if (a.oneliner) h += `<div class="rest-oneliner">「${a.oneliner}」</div>`;
    h += '<div class="rest-meta">';
    if (a.type) h += `<span class="rest-tag">${a.type}</span>`;
    if (a.station) h += `<span class="rest-tag">📍 ${a.station}</span>`;
    h += '</div>';
    h += '<div class="rest-bottom">';
    if (a.hours) h += `<span class="rest-hours">🕐 ${a.hours}</span>`;
    if (a.price) h += `<span class="rest-price">💰 ${a.price}</span>`;
    h += '</div>';
    if (a.warn) h += `<div class="rest-warn">⚠️ ${a.warn}</div>`;
    if (hm) h += '</div>';
    if (hm) h += mapBtn(a.map);
    h += '</div>';
    return h;
  }
  let h = `<div class="alt-card">`;
  h += `<div class="alt-name">${a.name}</div>`;
  if (a.feat) h += `<div class="alt-feat">${a.feat}</div>`;
  h += `<div class="alt-detail">`;
  if (a.hours) h += `<span>🕐 ${a.hours}</span>`;
  if (a.menu) h += `<span>🍽 ${a.menu}</span>`;
  if (a.price) h += `<span>💰 ${a.price}</span>`;
  h += `</div>`;
  if (a.warn) h += `<div class="alt-warn">⚠️ ${a.warn}</div>`;
  if (a.map) h += `<a class="alt-map" href="${mapUrl(a.map)}" target="_blank" rel="noopener">📍 Google Maps</a>`;
  h += `</div>`;
  return h;
}
