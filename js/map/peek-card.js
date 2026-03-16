import { closeSheet, setSheetRefs } from '../ui/sheet.js';

export function onMarkerTap(marker, fn) {
  let ts = null, last = 0;
  const fire = () => { const now = Date.now(); if (now - last > 600) { last = now; fn(); } };
  marker.addEventListener('touchstart', e => { ts = e.touches[0]; }, { passive: true });
  marker.addEventListener('touchend', e => {
    if (!ts) return;
    const dx = Math.abs(e.changedTouches[0].clientX - ts.clientX);
    const dy = Math.abs(e.changedTouches[0].clientY - ts.clientY);
    ts = null;
    if (dx < 10 && dy < 10) { e.preventDefault(); fire(); }
  }, { passive: false });
  marker.addListener('click', fire);
}

export function showPlaceCard(pid, name) {
  closeSheet(true);
  const sheet = document.createElement('div'); sheet.className = 'sheet-peek';
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${pid}`;
  sheet.innerHTML = `<div class="sheet-head"><button class="sheet-close">✕</button></div><div class="photo-strip" id="peek-photos"><div class="photo-skeleton"></div><div class="photo-skeleton"></div><div class="photo-skeleton"></div></div><div class="sheet-body"><gmpx-place-overview place="${pid}" size="small"></gmpx-place-overview></div>`;
  document.body.appendChild(sheet);
  setSheetRefs(sheet, null);
  requestAnimationFrame(() => { sheet.classList.add('show'); });
  sheet.querySelector('.sheet-close').addEventListener('click', e => { e.stopPropagation(); closeSheet(); });
  sheet.querySelector('.photo-strip').addEventListener('click', e => e.stopPropagation());
  sheet.addEventListener('click', () => window.open(navUrl, '_blank', 'noopener'));
  (async () => {
    try {
      const { Place } = await google.maps.importLibrary('places');
      const place = new Place({ id: pid });
      await place.fetchFields({ fields: ['photos'] });
      const strip = sheet.querySelector('#peek-photos');
      if (!strip) return;
      const photos = (place.photos || []).slice(0, 5);
      if (!photos.length) { strip.remove(); return; }
      strip.innerHTML = photos.map(p => `<img class="photo-thumb" src="${p.getURI({ maxWidth: 320, maxHeight: 220 })}" loading="lazy">`).join('');
    } catch (e) {
      const strip = sheet.querySelector('#peek-photos');
      if (strip) strip.remove();
    }
  })();
}
