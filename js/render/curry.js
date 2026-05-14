import { TRIP } from '../config.js';
import {
  CURRY_SHOPS, BASEPOINTS, FAR_FROM_SAPPORO_KM,
  haversineKm, sortShops, getOpenStatus, formatDistance
} from '../data/curry.js';

// ─── Module state ─────────────────────────────────────

let _basepoint = { mode: 'odori', lat: BASEPOINTS.odori.lat, lng: BASEPOINTS.odori.lng };
let _sortMode = 'tabelog'; // 'distance' | 'tabelog' | 'spicy'
let _map = null;
let _shopMarkers = [];
let _basepointMarker = null;
let _rendered = false;

const SPICY_META = {
  safe:   { color: '#34c759', emoji: '🟢', label: '不辣安全' },
  mild:   { color: '#ffcc00', emoji: '🟡', label: '微辣可接受' },
  unsafe: { color: '#ff3b30', emoji: '🔴', label: '不推薦' }
};

const STATUS_META = {
  open:    { color: '#34c759', emoji: '🟢' },
  closing: { color: '#ff9500', emoji: '🟡' },
  holiday: { color: '#ff3b30', emoji: '🔴' },
  closed:  { color: '#86868b', emoji: '⚪' }
};

// ─── GPS / basepoint state machine ────────────────────

function requestGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('no-geolocation')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function tryGPSInit() {
  if (sessionStorage.getItem('curry-gps-denied') === '1') return false;
  try {
    const coords = await requestGPS();
    const distToOdori = haversineKm(coords, BASEPOINTS.odori);
    if (distToOdori > FAR_FROM_SAPPORO_KM) {
      toast('你目前不在札幌附近，已切換為大通公園基準');
      setBasepoint('odori');
      return false;
    }
    _basepoint = { mode: 'gps', lat: coords.lat, lng: coords.lng };
    _sortMode = 'distance';
    return true;
  } catch (err) {
    if (err && err.code === 1) sessionStorage.setItem('curry-gps-denied', '1');
    return false;
  }
}

function setBasepoint(mode, coords) {
  if (mode === 'odori') {
    _basepoint = { mode: 'odori', lat: BASEPOINTS.odori.lat, lng: BASEPOINTS.odori.lng };
    _sortMode = 'tabelog';
  } else if (mode === 'gps' && coords) {
    _basepoint = { mode: 'gps', lat: coords.lat, lng: coords.lng };
    _sortMode = 'distance';
  } else if (mode === 'custom' && coords) {
    _basepoint = { mode: 'custom', lat: coords.lat, lng: coords.lng };
    _sortMode = 'distance';
  }
}

// ─── Public API ───────────────────────────────────────

export async function renderCurryTab(container) {
  if (_rendered) return;
  _rendered = true;

  // Build DOM skeleton
  container.innerHTML = buildSkeleton();
  bindLocalEvents(container);

  // Initial render before GPS attempt (so 介面立即可見)
  refreshList(container);

  // Try GPS in background
  const gotGPS = await tryGPSInit();
  if (gotGPS) {
    updateBasepointBar(container);
    refreshList(container);
  }

  // Init map (lazy: Maps SDK 載入後)
  initCurryMap(container);
}

function buildSkeleton() {
  return `
    <div class="curry-tab">
      <div class="curry-basepoint-bar">
        <button class="curry-bp-chip" data-bp="gps">📍 我的位置</button>
        <button class="curry-bp-chip" data-bp="odori">🏨 大通公園</button>
        <span class="curry-bp-info"></span>
      </div>
      <div class="curry-map-wrap">
        <div class="curry-map" id="curry-map"></div>
      </div>
      <div class="curry-sort-bar">
        <span class="curry-sort-pill" data-sort="distance">📏 距離</span>
        <span class="curry-sort-pill" data-sort="tabelog">⭐ Tabelog</span>
        <span class="curry-sort-pill" data-sort="spicy">🌶️ 辣度</span>
      </div>
      <div class="curry-list"></div>
      <div class="curry-unsafe-section" data-collapsed="1">
        <div class="curry-unsafe-header">
          <span>⚠️ 不建議區（不能吃辣者請避免）</span>
          <span class="curry-unsafe-toggle">▾</span>
        </div>
        <div class="curry-unsafe-body"></div>
      </div>
      <div class="curry-toast" id="curry-toast"></div>
    </div>
  `;
}

function updateBasepointBar(container) {
  container.querySelectorAll('.curry-bp-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.bp === _basepoint.mode);
  });
  // For custom mode, ensure a chip exists
  let customChip = container.querySelector('.curry-bp-chip[data-bp="custom"]');
  if (_basepoint.mode === 'custom') {
    if (!customChip) {
      customChip = document.createElement('button');
      customChip.className = 'curry-bp-chip active';
      customChip.dataset.bp = 'custom';
      customChip.innerHTML = '📌 自訂基準點 <span class="curry-bp-clear">×</span>';
      const odoriChip = container.querySelector('.curry-bp-chip[data-bp="odori"]');
      odoriChip.parentNode.insertBefore(customChip, odoriChip.nextSibling);
    }
    customChip.classList.add('active');
  } else if (customChip) {
    customChip.remove();
  }
  const info = container.querySelector('.curry-bp-info');
  if (info) {
    if (_basepoint.mode === 'gps') info.textContent = '已啟用定位';
    else if (_basepoint.mode === 'custom') info.textContent = '點地圖空白處可變更';
    else info.textContent = sessionStorage.getItem('curry-gps-denied') === '1' ? '已關閉定位' : '預設基準';
  }
  // Sort pills
  container.querySelectorAll('.curry-sort-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.sort === _sortMode);
  });
}

function refreshList(container) {
  updateBasepointBar(container);
  const sorted = sortShops(CURRY_SHOPS, _sortMode, _basepoint);
  const safe = sorted.filter(s => s.spicyLevel !== 'unsafe');
  const unsafe = sorted.filter(s => s.spicyLevel === 'unsafe');
  const now = new Date();
  container.querySelector('.curry-list').innerHTML =
    safe.map(s => renderCurryCard(s, _basepoint, now)).join('');
  container.querySelector('.curry-unsafe-body').innerHTML =
    unsafe.map(s => renderCurryCard(s, _basepoint, now)).join('');
}

function renderCurryCard(shop, basepoint, now) {
  const dist = haversineKm(basepoint, shop);
  const distLabel = formatDistance(dist);
  const sp = SPICY_META[shop.spicyLevel];
  const status = getOpenStatus(shop, now);
  const st = STATUS_META[status.state];
  const hoursDisplay = shop.hours.map(h => `${h.open}–${h.close}`).join(' / ');
  const holidayDisplay = shop.holidayNote ||
    (shop.holiday && shop.holiday.length ? `週${shop.holiday.map(d => ({Sun:'日',Mon:'一',Tue:'二',Wed:'三',Thu:'四',Fri:'五',Sat:'六'}[d])).join('、')}公休` : '無公休');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;

  const evidence = shop.spicyLevel === 'unsafe'
    ? `<div class="curry-evidence curry-evidence-warn">⚠️ ${shop.spicyEvidence}</div>`
    : shop.spicyNoSpicyOption
      ? `<div class="curry-evidence">✓ 不辣選項：<b>${shop.spicyNoSpicyOption}</b><br><span class="curry-evidence-src">${shop.spicyEvidence}</span></div>`
      : `<div class="curry-evidence curry-evidence-mild">${shop.spicyEvidence}</div>`;

  return `
    <div class="curry-card" data-spicy="${shop.spicyLevel}" data-id="${shop.id}">
      <div class="curry-card-head">
        <div class="curry-card-titles">
          <div class="curry-card-name">${shop.name}</div>
          <div class="curry-card-nameja">${shop.nameJa}</div>
        </div>
        <span class="curry-chip-spicy" style="background:${sp.color}">${sp.emoji} ${sp.label}</span>
      </div>
      <div class="curry-card-meta">
        <span class="curry-chip-distance">${distLabel}</span>
        <span class="curry-chip-status" data-state="${status.state}">${st.emoji} ${status.label}</span>
      </div>
      <div class="curry-card-addr">📍 ${shop.address}</div>
      ${evidence}
      <div class="curry-card-info">
        <div>⭐ Tabelog ${shop.tabelog} (${shop.tabelogReviews.toLocaleString()}) · Google ${shop.google} (${shop.googleReviews.toLocaleString()})</div>
        <div>🕐 ${hoursDisplay} · ${holidayDisplay}</div>
      </div>
      <details class="curry-card-features">
        <summary>店家特色 / 招牌</summary>
        <ul class="curry-features-list">${shop.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="curry-signature"><b>招牌：</b>${shop.signature.join('、')}</div>
        ${shop.note ? `<div class="curry-note">💡 ${shop.note}</div>` : ''}
      </details>
      <a class="curry-card-nav" href="${mapsUrl}" target="_blank" rel="noopener">🗺 在 Google Maps 開啟</a>
    </div>
  `;
}

// ─── Map ──────────────────────────────────────────────

async function initCurryMap(container) {
  const el = container.querySelector('#curry-map');
  if (!el) return;
  // Wait briefly for Maps SDK
  if (typeof google === 'undefined' || !google.maps) {
    setTimeout(() => initCurryMap(container), 200);
    return;
  }
  const [{ Map }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('marker')
  ]);
  _map = new Map(el, {
    center: { lat: _basepoint.lat, lng: _basepoint.lng },
    zoom: 13,
    mapId: 'DEMO_MAP_ID',
    disableDefaultUI: false,
    zoomControl: true,
    gestureHandling: 'cooperative'
  });

  const bounds = new google.maps.LatLngBounds();
  CURRY_SHOPS.forEach(shop => {
    if (shop.lat == null || shop.lng == null) return;
    const color = SPICY_META[shop.spicyLevel].color;
    const pin = new PinElement({
      background: color,
      borderColor: '#ffffff',
      glyphColor: '#ffffff',
      glyph: '🍛',
      scale: 0.95
    });
    const marker = new AdvancedMarkerElement({
      map: _map,
      position: { lat: shop.lat, lng: shop.lng },
      title: shop.name,
      content: pin.element,
      gmpClickable: true
    });
    marker.addListener('gmp-click', e => {
      // 阻止冒泡至 map click
      if (e && e.domEvent && e.domEvent.stopPropagation) e.domEvent.stopPropagation();
      scrollToCard(container, shop.id);
    });
    _shopMarkers.push(marker);
    bounds.extend({ lat: shop.lat, lng: shop.lng });
  });
  bounds.extend({ lat: _basepoint.lat, lng: _basepoint.lng });
  _map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

  updateBasepointMarker();

  // 地圖空白處點擊 → 設為自訂基準點
  _map.addListener('click', e => {
    if (!e || !e.latLng) return;
    setBasepoint('custom', { lat: e.latLng.lat(), lng: e.latLng.lng() });
    updateBasepointMarker();
    refreshList(container);
  });

  google.maps.event.trigger(_map, 'resize');
}

function updateBasepointMarker() {
  if (!_map) return;
  if (_basepointMarker) _basepointMarker.map = null;
  google.maps.importLibrary('marker').then(({ AdvancedMarkerElement }) => {
    const dot = document.createElement('div');
    const isCustom = _basepoint.mode === 'custom';
    dot.style.cssText = isCustom
      ? 'width:18px;height:18px;border-radius:50%;background:#ff3b30;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)'
      : 'width:16px;height:16px;border-radius:50%;background:#007aff;border:3px solid #fff;box-shadow:0 0 0 6px rgba(0,122,255,.2)';
    _basepointMarker = new AdvancedMarkerElement({
      map: _map,
      position: { lat: _basepoint.lat, lng: _basepoint.lng },
      title: isCustom ? '自訂基準點' : (_basepoint.mode === 'gps' ? '你在這裡' : '大通公園'),
      content: dot
    });
  });
}

function scrollToCard(container, shopId) {
  const card = container.querySelector(`.curry-card[data-id="${shopId}"]`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (card) {
    card.classList.add('curry-card-flash');
    setTimeout(() => card.classList.remove('curry-card-flash'), 1200);
  }
}

// ─── Local events (basepoint chips, sort pills, unsafe collapse) ─

function bindLocalEvents(container) {
  container.addEventListener('click', async e => {
    // Basepoint chip
    const bpChip = e.target.closest('.curry-bp-chip');
    if (bpChip) {
      const clear = e.target.closest('.curry-bp-clear');
      const target = clear ? 'gps' : bpChip.dataset.bp;
      if (target === 'gps') {
        sessionStorage.removeItem('curry-gps-denied');
        try {
          const coords = await requestGPS();
          const distToOdori = haversineKm(coords, BASEPOINTS.odori);
          if (distToOdori > FAR_FROM_SAPPORO_KM) {
            toast('你目前不在札幌附近，已切換為大通公園基準');
            setBasepoint('odori');
          } else {
            setBasepoint('gps', coords);
          }
        } catch (err) {
          if (err && err.code === 1) sessionStorage.setItem('curry-gps-denied', '1');
          toast('無法取得位置，使用大通公園基準');
          setBasepoint('odori');
        }
      } else if (target === 'odori') {
        setBasepoint('odori');
      }
      updateBasepointMarker();
      refreshList(container);
      return;
    }
    // Sort pill
    const sortPill = e.target.closest('.curry-sort-pill');
    if (sortPill) {
      _sortMode = sortPill.dataset.sort;
      refreshList(container);
      return;
    }
    // Unsafe section toggle
    const unsafeHead = e.target.closest('.curry-unsafe-header');
    if (unsafeHead) {
      const sec = unsafeHead.closest('.curry-unsafe-section');
      const collapsed = sec.dataset.collapsed === '1';
      sec.dataset.collapsed = collapsed ? '0' : '1';
      return;
    }
  });
}

// ─── Toast ────────────────────────────────────────────

let _toastTimer = null;
function toast(msg) {
  const el = document.getElementById('curry-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
