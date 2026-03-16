import { DAYS } from '../data/days.js';
import { setDay, getActive } from './tabs.js';
import { openSheet } from './sheet.js';
import { filterDayMap, focusMap, unfocusMap, getFocusState } from '../map/init.js';

export function bindEvents() {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('content');

  // Tab switching
  tabs.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) setDay(+tab.dataset.day);
  });

  // Swipe support
  let sx = 0, sy = 0;
  content.addEventListener('touchstart', e => {
    if (e.target.closest('.map-wrap')) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  content.addEventListener('touchend', e => {
    if (e.target.closest('.map-wrap')) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const active = getActive();
      if (dx < 0 && active < DAYS.length) setDay(active + 1);
      else if (dx > 0 && active > 0) setDay(active - 1);
    }
  }, { passive: true });

  // Click handler — sub-tabs / links / badge / expand / alts
  content.addEventListener('click', e => {
    // Sub-tab switching
    const subtab = e.target.closest('.day-subtab');
    if (subtab) {
      const dv = subtab.closest('.day-view');
      if (!dv) return;
      dv.querySelectorAll('.day-subtab').forEach(t => t.classList.remove('active'));
      subtab.classList.add('active');
      const sec = subtab.dataset.subtab;
      dv.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.dataset.section === sec));
      return;
    }
    // Budget filter chips
    const bfilter = e.target.closest('.bfilter');
    if (bfilter) {
      const dashBudget = bfilter.closest('.dash-budget');
      const dayBudget = bfilter.closest('.budget');
      const container = dashBudget || dayBudget;
      if (!container) return;
      container.querySelectorAll('.bfilter').forEach(f => f.classList.toggle('active', f === bfilter));
      const cat = bfilter.dataset.bcat;
      if (dashBudget) {
        dashBudget.querySelectorAll('tr[data-dview]').forEach(r => { r.style.display = r.dataset.dview === cat ? '' : 'none'; });
      } else {
        const rows = dayBudget.querySelectorAll('tr[data-bcat]');
        const totalRow = dayBudget.querySelector('tr.total:not(.bfilter-sub)');
        const subRow = dayBudget.querySelector('.bfilter-sub');
        if (cat === 'all') {
          rows.forEach(r => r.style.display = '');
          if (totalRow) totalRow.style.display = '';
          if (subRow) subRow.style.display = 'none';
        } else {
          let sum = 0;
          rows.forEach(r => {
            const show = r.dataset.bcat === cat;
            r.style.display = show ? '' : 'none';
            if (show) { const m = r.cells[1].textContent.match(/[~]?¥([0-9,]+)/); if (m) sum += parseInt(m[1].replace(/,/g, '')); }
          });
          if (totalRow) totalRow.style.display = 'none';
          if (subRow) { subRow.style.display = ''; subRow.querySelector('.bfilter-sub-val').textContent = sum > 0 ? `~¥${sum.toLocaleString()}` : '—'; }
        }
      }
      return;
    }
    // Map category filter pills
    const catPill = e.target.closest('.map-cat-pill');
    if (catPill) {
      catPill.classList.toggle('active');
      const dayNum = +catPill.dataset.day;
      const container = catPill.closest('.map-cats');
      const activeCats = new Set([...container.querySelectorAll('.map-cat-pill.active')].map(p => p.dataset.cat));
      filterDayMap(dayNum, activeCats);
      return;
    }
    if (e.target.closest('a')) return;
    // Badge → open sheet
    const badge = e.target.closest('.badge');
    if (badge) { const card = badge.closest('[data-day]'); if (card) { const day = +card.dataset.day, idx = +card.dataset.idx; const it = DAYS.find(d => d.day === day).items[idx]; if (it && it.alts) openSheet(it.alts, it.a); } return; }
    const exp = e.target.closest('.card-expandable');
    if (exp) { exp.classList.toggle('expanded'); return; }
    // Focus mode — card with map link
    const focusCard = e.target.closest('.card.has-map[data-day]');
    if (focusCard) {
      const day = +focusCard.dataset.day, idx = +focusCard.dataset.idx;
      const fs = getFocusState();
      const dv = focusCard.closest('.day-view');
      if (fs && fs.dayNum === day && fs.idx === idx) {
        // Toggle off — unfocus
        unfocusMap(day);
        focusCard.classList.remove('focused');
        if (dv) {
          const cats = dv.querySelector('.map-cats');
          if (cats) { cats.style.display = ''; cats.querySelectorAll('.map-cat-pill.active').forEach(p => p.classList.remove('active')); }
        }
      } else {
        // Focus or switch focus
        document.querySelectorAll('.card.focused').forEach(c => c.classList.remove('focused'));
        focusCard.classList.add('focused');
        focusMap(day, idx);
        if (dv) {
          const cats = dv.querySelector('.map-cats');
          if (cats) cats.style.display = 'none';
        }
      }
      return;
    }
    // Has-alts → open sheet
    const alt = e.target.closest('.has-alts');
    if (alt && alt.dataset.day) { const day = +alt.dataset.day, idx = +alt.dataset.idx; const it = DAYS.find(d => d.day === day).items[idx]; if (it && it.alts) openSheet(it.alts, it.a); }
  });
}
