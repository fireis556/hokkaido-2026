import { TRIP } from '../config.js';
import { MAP_COLORS, CATEGORIES } from '../categories.js';
import { onMarkerTap, showPlaceCard } from './peek-card.js';

const _maps = {};
const _dayMarkers = {};

export function getMarkers(dayNum) { return _dayMarkers[dayNum]; }

const LEGEND_LABELS = { food: '餐廳', spot: '景點', transport: '交通', hotel: '飯店' };
export function mapLegendHtml() {
  const items = Object.entries(MAP_COLORS).map(([k, color]) =>
    `<div class="map-legend-item"><div class="map-legend-dot" style="background:${color}"></div>${LEGEND_LABELS[k]}</div>`
  ).join('');
  return `<div class="map-legend">${items}</div>`;
}

export async function initMap(containerId, places) {
  if (_maps[containerId]) return;
  const el = document.getElementById(containerId);
  if (!el || el.offsetParent === null) return;
  const [{ Map }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('marker')
  ]);
  const map = new Map(el, { center: TRIP.defaultCenter, zoom: TRIP.defaultZoom, mapId: 'DEMO_MAP_ID', disableDefaultUI: false, zoomControl: true, gestureHandling: 'cooperative' });
  const bounds = new google.maps.LatLngBounds();
  const dayNum = parseInt(containerId.replace('daymap', ''));
  _dayMarkers[dayNum] = [];
  places.forEach(p => {
    const color = MAP_COLORS[p.cat] || '#999';
    const pin = new PinElement({ background: color, borderColor: '#ffffff', glyphColor: '#ffffff', scale: 0.85 });
    const marker = new AdvancedMarkerElement({ map, position: { lat: p.lat, lng: p.lng }, title: p.name, content: pin, gmpClickable: true });
    onMarkerTap(marker, () => showPlaceCard(p.pid, p.name));
    bounds.extend({ lat: p.lat, lng: p.lng });
    _dayMarkers[dayNum].push({ marker, cat: p.cat, mapRef: map });
  });
  if (places.length > 1) map.fitBounds(bounds, { top: 25, right: 25, bottom: 25, left: 25 });
  else if (places.length === 1) { map.setCenter({ lat: places[0].lat, lng: places[0].lng }); map.setZoom(15); }
  // GPS locate button
  const locBtn = document.createElement('button');
  locBtn.className = 'map-locate-btn'; locBtn.innerHTML = '📍'; locBtn.title = '顯示我的位置';
  el.appendChild(locBtn);
  let locMarker = null, locCircle = null;
  locBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { alert('你的瀏覽器不支援定位'); return; }
    locBtn.classList.add('locating');
    navigator.geolocation.getCurrentPosition(async pos => {
      locBtn.classList.remove('locating');
      const lat = pos.coords.latitude, lng = pos.coords.longitude, acc = pos.coords.accuracy;
      if (locMarker) locMarker.map = null;
      if (locCircle) locCircle.setMap(null);
      const dot = document.createElement('div');
      dot.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#007aff;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)';
      locMarker = new AdvancedMarkerElement({ map, position: { lat, lng }, title: '你在這裡', content: dot });
      locCircle = new google.maps.Circle({ map, center: { lat, lng }, radius: acc, strokeColor: '#007aff', strokeOpacity: .6, strokeWeight: 1, fillColor: '#007aff', fillOpacity: .1 });
      map.setCenter({ lat, lng }); map.setZoom(15);
    }, err => {
      locBtn.classList.remove('locating');
      alert('定位失敗：' + (err.code === 1 ? '請允許位置存取權限' : err.code === 2 ? '無法取得位置' : '定位逾時'));
    }, { enableHighAccuracy: true, timeout: 10000 });
  });
  _maps[containerId] = map;
}

export function filterDayMap(dayNum, activeCats) {
  const markers = _dayMarkers[dayNum];
  if (!markers) return;
  const showAll = activeCats.size === 0;
  markers.forEach(({ marker, cat, mapRef }) => { marker.map = (showAll || activeCats.has(cat)) ? mapRef : null; });
}
