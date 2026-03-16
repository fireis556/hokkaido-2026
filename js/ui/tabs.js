import { TRIP } from '../config.js';
import { DAYS } from '../data/days.js';
import { PLACE_DATA } from '../data/places.js';
import { getCat } from '../categories.js';
import { initMap, unfocusMap, getFocusState } from '../map/init.js';
import { renderDashboard, isDashRendered } from '../render/dashboard.js';
import { updateSouvTotal } from '../render/souvenir.js';

let active = -1;

export function getActive() { return active; }

export function setDay(n) {
  if (n === active) return;
  // Clear focus state from previous day
  const fs = getFocusState();
  if (fs) {
    unfocusMap(fs.dayNum);
    document.querySelectorAll('.card.focused').forEach(c => c.classList.remove('focused'));
    const prevDv = document.getElementById('day' + fs.dayNum);
    if (prevDv) { const cats = prevDv.querySelector('.map-cats'); if (cats) { cats.style.display = ''; cats.querySelectorAll('.map-cat-pill.active').forEach(p => p.classList.remove('active')); } }
  }
  active = n;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', +t.dataset.day === n));
  document.querySelectorAll('.day-view').forEach(v => v.classList.toggle('active', v.id === `day${n}`));
  if (n === 0) { if (!isDashRendered()) renderDashboard(); else updateSouvTotal(); }
  const dv = document.getElementById(`day${n}`);
  if (dv) {
    const firstSub = dv.querySelector('.day-subtab');
    const firstSec = firstSub ? firstSub.dataset.subtab : null;
    dv.querySelectorAll('.day-subtab').forEach((t, i) => t.classList.toggle('active', i === 0));
    if (firstSec) dv.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.dataset.section === firstSec));
  }
  const at = document.querySelector('.tab.active');
  if (at) at.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (n > 0) {
    setTimeout(() => {
      const d = DAYS.find(d => d.day === n);
      const dayPlaces = d ? d.items.filter(it => it.m && PLACE_DATA[it.m]).map(it => ({ day: n, name: it.m, cat: getCat(it.a), ...PLACE_DATA[it.m] })) : [];
      if (dayPlaces.length) initMap('daymap' + n, dayPlaces);
    }, 100);
  }
}

export function autoSelectDay() {
  const today = new Date();
  if (today.getFullYear() === TRIP.year && today.getMonth() === TRIP.month - 1) {
    const dayNum = today.getDate() - TRIP.startDay + 1;
    if (dayNum >= 1 && dayNum <= TRIP.totalDays) { setDay(dayNum); return; }
  }
  setDay(0);
}
