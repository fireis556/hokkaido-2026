export function mapUrl(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function renderTags(tags) {
  if (!tags || !tags.length) return '';
  return '<div class="tags">' + tags.map(t => `<span class="tag">${t}</span>`).join('') + '</div>';
}

export function warnN(n) {
  return n ? `<div class="notes">${n.replace(/⚠️/g, '<span class="warn-text">⚠️</span>')}</div>` : '';
}

export function detailN(n) {
  return n ? `<div class="detail-notes">${n.replace(/⚠️/g, '<span class="warn-text">⚠️</span>')}</div>` : '';
}
