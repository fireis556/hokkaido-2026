import { TRIP } from './config.js';
import { DAYS } from './data/days.js';
import { PLACE_DATA } from './data/places.js';
import { getCat, CAT_LABELS } from './categories.js';
import { renderCard } from './render/cards.js';
import { renderMealTab } from './render/meal-tab.js';
import { mapLegendHtml } from './map/init.js';
import { fetchRate, onRateUpdate } from './currency.js';
import { updateSouvTotal } from './render/souvenir.js';
import { setDay, autoSelectDay } from './ui/tabs.js';
import { bindEvents } from './ui/events.js';

function render() {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('content');

  // Header subtitle from config
  const sub = document.getElementById('header-sub');
  if (sub) sub.textContent = TRIP.subtitle;

  // Tabs
  tabs.innerHTML = `<div class="tab" data-day="0">🏠<br><span style="font-size:10px;font-weight:400">總覽</span></div>` + DAYS.map(d =>
    `<div class="tab" data-day="${d.day}">Day ${d.day}<br><span style="font-size:10px;font-weight:400">${d.date.slice(0, 5)}</span></div>`
  ).join('');

  // Dashboard view + Day views
  content.innerHTML = `<div class="day-view" id="day0"></div>` +
  DAYS.map(d => {
    let html = `<div class="day-view" id="day${d.day}">`;
    // Header
    html += `<div class="day-header"><div class="date">Day ${d.day} — ${d.date}</div><div class="dtitle">${d.title}</div>`;
    if (d.hotel) html += `<div class="hotel">${d.hotel}</div>`;
    d.warns.forEach(w => html += `<div class="warn">⚠️ ${w}</div>`);
    html += `</div>`;
    // Day map + category filter pills
    const _mapCats = [...new Set(d.items.filter(it => it.m && PLACE_DATA[it.m]).map(it => getCat(it.a)).filter(Boolean))];
    const _filterPills = _mapCats.length > 1 ? `<div class="map-cats">${_mapCats.map(c => `<button class="map-cat-pill" data-day="${d.day}" data-cat="${c}">${CAT_LABELS[c] || c}</button>`).join('')}</div>` : '';
    html += `<div class="map-wrap"><div class="map-sm" id="daymap${d.day}"></div></div>${_filterPills}${mapLegendHtml()}`;
    // Sub-tabs
    html += `<div class="day-subtabs"><div class="day-subtab active" data-subtab="itinerary">🗓 行程</div><div class="day-subtab" data-subtab="meals">🍽 三餐</div></div>`;
    // Itinerary section
    html += `<div class="tab-section active" data-section="itinerary">`;
    html += `<div class="timeline">`;
    d.items.forEach((it, idx) => {
      if (it.meal) return;
      const cat = getCat(it.a);
      html += `<div class="item"${cat ? ` data-cat="${cat}"` : ''}>`;
      html += renderCard(it, cat, d.day, idx);
      html += `</div>`;
    });
    html += `</div>`;
    if (d.budget) {
      const bcats = new Set(d.budget.map(b => b[2]).filter(Boolean));
      let fh = `<div class="budget-filters"><span class="bfilter active" data-bcat="all">全部</span>`;
      if (bcats.has('t')) fh += '<span class="bfilter" data-bcat="t">🚃 交通</span>';
      if (bcats.has('f')) fh += '<span class="bfilter" data-bcat="f">🍽 三餐</span>';
      if (bcats.has('s')) fh += '<span class="bfilter" data-bcat="s">🛍 伴手禮</span>';
      fh += '</div>';
      html += `<div class="budget"><h3>💰 費用概算（${TRIP.travelers}人）</h3>${fh}<table>`;
      d.budget.forEach((b, i, a) => {
        const isTotal = i === a.length - 1;
        const cls = isTotal ? ' class="total"' : '';
        const bcat = isTotal ? '' : ` data-bcat="${b[2] || ''}"`;
        html += `<tr${cls}${bcat}><td>${b[0]}</td><td>${b[1]}</td></tr>`;
      });
      html += `<tr class="total bfilter-sub" style="display:none"><td>小計</td><td class="bfilter-sub-val"></td></tr>`;
      html += `</table></div>`;
    }
    html += `</div>`;
    // Meals section
    html += `<div class="tab-section" data-section="meals">${renderMealTab(d)}</div>`;
    html += `</div>`;
    return html;
  }).join('');

  // Bind all events
  bindEvents();

  // Auto-select day
  autoSelectDay();
}

// Init
onRateUpdate(() => updateSouvTotal());
render();
fetchRate();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
