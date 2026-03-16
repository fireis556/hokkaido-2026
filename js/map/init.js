import { TRIP } from '../config.js';
import { MAP_COLORS, CATEGORIES } from '../categories.js';
import { PLACE_DATA } from '../data/places.js';
import { DAYS } from '../data/days.js';
import { onMarkerTap, showPlaceCard } from './peek-card.js';

const _maps = {};
const _dayMarkers = {};
let focusState = null; // { dayNum, idx, altMarkers: [] }

export function getFocusState() { return focusState; }

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
    onMarkerTap(marker, () => { if (!focusState) showPlaceCard(p.pid, p.name); });
    bounds.extend({ lat: p.lat, lng: p.lng });
    _dayMarkers[dayNum].push({ marker, cat: p.cat, mapRef: map });
  });
  // Trigger resize to ensure correct marker projection in sticky container
  google.maps.event.trigger(map, 'resize');
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
  // Click on empty map area to exit focus mode
  map.addListener('click', () => {
    if (focusState && focusState.dayNum === dayNum) {
      unfocusMap(dayNum);
      // Remove card highlight
      document.querySelectorAll('.card.focused').forEach(c => c.classList.remove('focused'));
      // Restore filter chips
      const dv = document.getElementById('day' + dayNum);
      if (dv) {
        const cats = dv.querySelector('.map-cats');
        if (cats) {
          cats.style.display = '';
          cats.querySelectorAll('.map-cat-pill.active').forEach(p => p.classList.remove('active'));
        }
      }
    }
  });
  _maps[containerId] = map;
}

export function filterDayMap(dayNum, activeCats) {
  const markers = _dayMarkers[dayNum];
  if (!markers) return;
  const showAll = activeCats.size === 0;
  markers.forEach(({ marker, cat, mapRef }) => { marker.map = (showAll || activeCats.has(cat)) ? mapRef : null; });
}

export async function focusMap(dayNum, idx) {
  const markers = _dayMarkers[dayNum];
  const map = _maps['daymap' + dayNum];
  if (!markers || !map) return;
  const d = DAYS.find(dd => dd.day === dayNum);
  if (!d) return;
  const item = d.items[idx];
  if (!item || !item.m) return;
  const placeData = PLACE_DATA[item.m];
  if (!placeData) return;

  // Clean up previous focus if any
  if (focusState) {
    focusState.altMarkers.forEach(m => m.map = null);
  }

  // Hide all markers except the focused one
  markers.forEach(({ marker, mapRef }) => {
    marker.map = (marker.title === item.m) ? mapRef : null;
  });

  // Pan and zoom to focused place
  map.panTo({ lat: placeData.lat, lng: placeData.lng });
  map.setZoom(15);

  // Create alt markers if alts exist with map fields
  const altMarkers = [];
  if (item.alts) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker');
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: placeData.lat, lng: placeData.lng });
    let hasAlts = false;
    item.alts.forEach(a => {
      const altKey = a.map;
      if (!altKey) return;
      const altPlace = PLACE_DATA[altKey];
      if (!altPlace) return;
      hasAlts = true;
      const pin = new PinElement({ background: '#9e9e9e', borderColor: '#ffffff', glyphColor: '#ffffff', scale: 0.75 });
      pin.element.style.opacity = '0.6';
      const marker = new AdvancedMarkerElement({ map, position: { lat: altPlace.lat, lng: altPlace.lng }, title: altKey, content: pin });
      bounds.extend({ lat: altPlace.lat, lng: altPlace.lng });
      altMarkers.push(marker);
    });
    if (hasAlts) map.fitBounds(bounds, { top: 30, right: 30, bottom: 50, left: 30 });
  }

  focusState = { dayNum, idx, altMarkers };
}

export function unfocusMap(dayNum) {
  if (!focusState) return;
  const markers = _dayMarkers[dayNum || focusState.dayNum];
  const mapKey = 'daymap' + (dayNum || focusState.dayNum);
  const map = _maps[mapKey];

  // Remove alt markers
  focusState.altMarkers.forEach(m => m.map = null);

  // Restore all markers
  if (markers) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach(({ marker, mapRef }) => {
      marker.map = mapRef;
      bounds.extend(marker.position);
    });
    if (map && markers.length > 1) map.fitBounds(bounds, { top: 25, right: 25, bottom: 25, left: 25 });
    else if (map && markers.length === 1) { map.setCenter(markers[0].marker.position); map.setZoom(15); }
  }

  focusState = null;
}
