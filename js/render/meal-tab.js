import { renderRestaurantCard } from './restaurant.js';

export function renderMealTab(d) {
  const mealItems = {};
  d.items.forEach((it, idx) => { if (it.meal) { (mealItems[it.meal] = mealItems[it.meal] || []).push({ it, idx }); } });
  const mealOrder = [{ key: '朝', label: '🌅 朝食' }, { key: '昼', label: '🌞 昼食' }, { key: '夜', label: '🌙 夕食' }];
  let html = '';
  mealOrder.forEach(m => {
    html += `<div class="meal-group"><div class="meal-group-label">${m.label}</div>`;
    const items = mealItems[m.key] || [];
    if (items.length === 0) {
      html += `<div class="meal-empty">未安排 · 行程中自由覓食</div>`;
    } else {
      items.forEach(({ it, idx }) => { html += renderRestaurantCard(it, d.day, idx); });
    }
    html += `</div>`;
  });
  const snacks = mealItems['小吃'] || [];
  if (snacks.length > 0) {
    html += `<div class="meal-group snack-section"><div class="meal-group-label">🍡 小吃・甜點</div>`;
    snacks.forEach(({ it, idx }) => { html += renderRestaurantCard(it, d.day, idx); });
    html += `</div>`;
  }
  return html;
}
