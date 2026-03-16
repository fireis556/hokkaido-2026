import { TRIP } from '../config.js';
import { DAYS } from '../data/days.js';
import { GLOBAL_WARNS } from '../data/warns.js';
import { getCurrentRate, getRateStatus, calcFromJpy, calcFromTwd } from '../currency.js';
import { renderSouvenir, bindSouvenirEvents, updateSouvTotal } from './souvenir.js';

let _dashRendered = false;

export function isDashRendered() { return _dashRendered; }

export function renderDashboard() {
  const el = document.getElementById('day0');
  const currentRate = getCurrentRate();

  let html = '<div class="day-subtabs">';
  html += '<div class="day-subtab active" data-subtab="warns">⚠️ 注意</div>';
  html += '<div class="day-subtab" data-subtab="budget">💰 預算</div>';
  html += '<div class="day-subtab" data-subtab="calc">💱 匯率</div>';
  html += '<div class="day-subtab" data-subtab="souvenir">🎁 伴手禮</div>';
  html += '</div>';

  // === Warns section ===
  let warns = '<div class="dash-section"><h3>⚠️ 注意事項</h3>';
  GLOBAL_WARNS.forEach(w => warns += `<div class="dash-warn">${w}</div>`);
  DAYS.forEach(d => d.warns.forEach(w => warns += `<div class="dash-warn">Day ${d.day}：${w}</div>`));
  warns += '</div>';
  html += `<div class="tab-section active" data-section="warns">${warns}</div>`;

  // === Budget section ===
  const jpyAmounts = [];
  let twdTotal = 0;
  const dayCatTotals = {};
  DAYS.forEach(d => {
    if (!d.budget) return;
    const totalRow = d.budget[d.budget.length - 1];
    const totalStr = totalRow[1];
    const jpyMatch = totalStr.match(/[~]?[¥￥]([0-9,]+)/);
    if (jpyMatch) jpyAmounts.push({ day: d.day, title: d.title, jpy: parseInt(jpyMatch[1].replace(/,/g, '')) });
    const ntMatch = totalStr.match(/NT\$([0-9,]+)/);
    if (ntMatch) twdTotal += parseInt(ntMatch[1].replace(/,/g, ''));
    const ct = { t: { j: 0, n: 0 }, f: { j: 0, n: 0 }, s: { j: 0, n: 0 } };
    d.budget.slice(0, -1).forEach(b => {
      if (!b[2]) return;
      const mj = b[1].match(/[~]?¥([0-9,]+)/); if (mj) ct[b[2]].j += parseInt(mj[1].replace(/,/g, ''));
      const mn = b[1].match(/NT\$([0-9,]+)/); if (mn) ct[b[2]].n += parseInt(mn[1].replace(/,/g, ''));
    });
    dayCatTotals[d.day] = ct;
  });
  const jpyTotal = jpyAmounts.reduce((s, x) => s + x.jpy, 0);
  const grandTotal = Math.round(jpyTotal * currentRate) + twdTotal;
  const catGrand = { t: { j: 0, n: 0 }, f: { j: 0, n: 0 }, s: { j: 0, n: 0 } };
  Object.values(dayCatTotals).forEach(ct => ['t', 'f', 's'].forEach(k => { catGrand[k].j += ct[k].j; catGrand[k].n += ct[k].n; }));

  let budget = `<div class="dash-section dash-budget"><h3>💰 預估總花費（${TRIP.travelers}人）</h3>`;
  budget += '<div class="budget-filters"><span class="bfilter active" data-bcat="all">全部</span>';
  budget += '<span class="bfilter" data-bcat="t">🚃 交通</span>';
  budget += '<span class="bfilter" data-bcat="f">🍽 三餐</span>';
  budget += '<span class="bfilter" data-bcat="s">🛍 伴手禮</span>';
  budget += '</div>';
  budget += '<table class="dash-table">';
  jpyAmounts.forEach(x => { budget += `<tr data-dview="all"><td>Day ${x.day} ${x.title}</td><td>~¥${x.jpy.toLocaleString()}</td></tr>`; });
  if (twdTotal > 0) budget += `<tr data-dview="all"><td>Day 5 Klook</td><td>NT$${twdTotal.toLocaleString()}</td></tr>`;
  budget += `<tr class="total" data-dview="all"><td>日幣小計</td><td>~¥${jpyTotal.toLocaleString()}</td></tr>`;
  if (twdTotal > 0) budget += `<tr class="total" data-dview="all"><td>台幣小計</td><td>NT$${twdTotal.toLocaleString()}</td></tr>`;
  budget += `<tr class="total" data-dview="all"><td>換算總計</td><td data-conv-jpy="${jpyTotal}" data-conv-ntd="${twdTotal}">≈ NT$${grandTotal.toLocaleString()}</td></tr>`;
  ['t', 'f', 's'].forEach(cat => {
    const catName = { t: '交通', f: '三餐', s: '伴手禮' }[cat];
    jpyAmounts.forEach(x => {
      const ct = dayCatTotals[x.day][cat];
      if (!ct.j && !ct.n) return;
      let amt = ct.j ? `~¥${ct.j.toLocaleString()}` : '';
      if (ct.n) amt += (amt ? ' + ' : '') + `NT$${ct.n.toLocaleString()}`;
      budget += `<tr data-dview="${cat}" style="display:none"><td>Day ${x.day} ${catName}</td><td>${amt}</td></tr>`;
    });
    const cg = catGrand[cat];
    let cgAmt = cg.j ? `~¥${cg.j.toLocaleString()}` : '';
    if (cg.n) cgAmt += (cgAmt ? ' + ' : '') + `NT$${cg.n.toLocaleString()}`;
    budget += `<tr class="total" data-dview="${cat}" style="display:none"><td>${catName}小計</td><td>${cgAmt}</td></tr>`;
    const conv = Math.round(cg.j * currentRate) + cg.n;
    budget += `<tr class="total" data-dview="${cat}" style="display:none"><td>換算</td><td data-conv-jpy="${cg.j}" data-conv-ntd="${cg.n}">≈ NT$${conv.toLocaleString()}</td></tr>`;
  });
  budget += '</table></div>';
  html += `<div class="tab-section" data-section="budget">${budget}</div>`;

  // === Calculator section ===
  const { dotCls, label: rateLabel } = getRateStatus();
  let calc = '<div class="dash-section"><h3>💱 日幣計算機</h3>';
  calc += `<div class="calc-row"><span class="calc-label">¥</span><input class="calc-input" id="calc-jpy" type="number" inputmode="numeric" placeholder="日幣金額"></div>`;
  calc += `<div class="calc-arrow">↕</div>`;
  calc += `<div class="calc-row"><span class="calc-label">NT$</span><input class="calc-input" id="calc-twd" type="number" inputmode="numeric" placeholder="台幣金額"></div>`;
  calc += `<div class="rate-status" id="rate-status"><span class="rate-dot ${dotCls}"></span>${rateLabel}</div>`;
  calc += `<div style="font-size:11px;color:var(--text-light);margin-top:2px">匯率 <span id="rate-value">${currentRate.toFixed(4)}</span></div>`;
  calc += '</div>';
  html += `<div class="tab-section" data-section="calc">${calc}</div>`;

  // === Souvenir section ===
  html += `<div class="tab-section" data-section="souvenir">${renderSouvenir()}</div>`;

  el.innerHTML = html;

  document.getElementById('calc-jpy').addEventListener('input', calcFromJpy);
  document.getElementById('calc-twd').addEventListener('input', calcFromTwd);
  bindSouvenirEvents();
  _dashRendered = true;
}
