// 札幌湯咖哩候選池（Tabelog Top 10）
// 資料來源：docs/curry_list.md（2026/05/14 抓取）
// 座標：依札幌「条丁目」格子系統估算（誤差約 ±200m），
//       足以支援距離排序與相對位置呈現。實地後可用 Google Geocoding API 校準。
// 重要：本模組與 PLACE_DATA / DAYS 完全獨立，純候選池用途。

export const BASEPOINTS = {
  odori: { lat: 43.0606, lng: 141.3469, label: '大通公園' }
};

// 100 km 邊界，超過則 GPS 自動 fallback 至 odori（避免出發前在台灣測試干擾）
export const FAR_FROM_SAPPORO_KM = 100;

export const CURRY_SHOPS = [
  {
    id: 'cong',
    name: 'CURRY YA! CONG',
    nameJa: 'カリーヤ！コング',
    address: '中央区南16条西6-2-10 IR山鼻 1F',
    lat: 43.0465, lng: 141.3410, // TODO: 校準
    tabelog: 3.80, tabelogReviews: 472,
    google: 4.0, googleReviews: 185,
    mapsQuery: 'CURRY YA! CONG カリーヤ コング 札幌 南16条',
    spicyLevel: 'mild',
    spicyEvidence: '辣度 1~60 番，要感覺到辣是從「8 番」開始；整體辣度偏低，1~7 番幾乎無辣感。',
    spicyNoSpicyOption: null,
    hours: [{ open: '11:00', close: '14:00' }],
    holiday: ['Wed'],
    features: ['店主出身義式料理，不使用化學調味料', '極為清透的湯體，被形容「神秘、滋味深邃」', '知床產雞腿香煎口碑爆棚'],
    signature: ['チキン野菜カレー', 'ポーク野菜カレー（Rusutsu 高原豬）'],
    note: '店主一人作業，等候時間最久可達 1 小時，不適合多人同行'
  },
  {
    id: 'medicineman',
    name: 'Medicineman',
    nameJa: 'メディスンマン',
    address: '中央区南12条西10-1-18 グッドビル 1F',
    lat: 43.0500, lng: 141.3355, // TODO: 校準
    tabelog: 3.70, tabelogReviews: 1066,
    google: 4.4, googleReviews: 724,
    mapsQuery: 'Medicineman メディスンマン 札幌 南12条',
    spicyLevel: 'safe',
    spicyEvidence: 'マイルド = 零香料（ゼロスパイス）。官方推薦：「小朋友或不擅長吃辣的人，推薦零香料的『マイルド』」',
    spicyNoSpicyOption: 'マイルド（完全零香料）',
    hours: [{ open: '11:30', close: '21:30' }],
    holiday: ['Tue', 'Wed'],
    features: ['「魚醬（ナンプラー）」獨特風味，咖哩風味的湯本身就是主角', '清爽滑順、和風高湯為基底', '辣度分級極為細緻（マイルド → 1~49 番）'],
    signature: ['チキンカレー（帶骨雞腿，大且軟嫩）']
  },
  {
    id: 'suage',
    name: 'Suage+ Soup Curry',
    nameJa: 'スープカリー スアゲ プラス',
    address: '中央区南4条西5-6-1 都志松ビル 2F',
    lat: 43.0571, lng: 141.3415, // TODO: 校準
    tabelog: 3.69, tabelogReviews: 2240,
    google: 4.3, googleReviews: 5747,
    mapsQuery: 'Suage+ スアゲプラス 札幌 南4条',
    spicyLevel: 'safe',
    spicyEvidence: '官方：①甘口（不辣）→ ⑥超辛，⑦以上 ~ ⑩ 需加 ハラペーニョ。北海道 Labo 專訪：「點了最不辣的『甘口』」',
    spicyNoSpicyOption: '①甘口（完全不辣）',
    hours: [{ open: '11:30', close: '21:00' }],
    holiday: [],
    features: ['店名「素揚げ」= 蔬菜全部清炸鎖住鮮味', '蔬菜串在竹籤上，視覺與食用便利雙重特色', '「易入口」「重視食材」適合新手'],
    signature: ['パリパリ知床鶏と野菜カレー（脆皮知床雞）', '生ラム炭焼きカレー', 'ラベンダーポークの炙り角煮カレー']
  },
  {
    id: 'hige',
    name: 'Soup curry Hige danshaku',
    nameJa: 'ひげ男爵',
    address: '中央区北1条東2-5-12 ビーンズコート 1F',
    lat: 43.0610, lng: 141.3487, // TODO: 校準
    tabelog: 3.68, tabelogReviews: 907,
    google: 4.2, googleReviews: 811,
    mapsQuery: 'スープカリー ひげ男爵 札幌 北1条東2',
    spicyLevel: 'mild',
    spicyEvidence: 'HotPepper：辣度 1~6，再上去也 OK。Retty 評論：「辣度 2 番已有微辣程度」→ 1 番應該不辣。',
    spicyNoSpicyOption: null,
    hours: [
      { open: '11:00', close: '15:00' },
      { open: '17:00', close: '22:00' }
    ],
    holiday: [],
    holidayNote: '不定休',
    features: ['札幌市內罕見的「和風高湯系」清爽王道路線', '「ヒゲ割」名物：有鬍子（含畫上去的）折 100 円', '加入冬粉的咖哩，獨特性高', '白飯標準 300g 偏多'],
    signature: ['肉男爵（雞腿+香腸+角煮三重肉，經常售完）']
  },
  {
    id: 'king',
    name: 'SOUP CURRY KING',
    nameJa: 'SOUP CURRY KING セントラル店',
    address: '中央区南2条西3-13-4 カタオカビル B1',
    lat: 43.0588, lng: 141.3439, // TODO: 校準
    tabelog: 3.68, tabelogReviews: 833,
    google: 4.5, googleReviews: 2093,
    mapsQuery: 'SOUP CURRY KING セントラル店 札幌',
    spicyLevel: 'safe',
    spicyEvidence: '辛 Meter：辣度有 0~10 番，再上去是 Jack/Queen/King/Joker。1 番已是「小辣」→ 0 番無辣。',
    spicyNoSpicyOption: '0 番（完全無辣）',
    hours: [
      { open: '11:30', close: '15:30' },
      { open: '17:30', close: '21:30' }
    ],
    holiday: [],
    features: ['#1 特色「Wスープ（雙重湯底）」：雞豚骨白濁濃湯＋和風一番高湯', '動物系×海鮮系混合，湯咖哩用 W 湯底相當罕見', '乳化的白濁湯體，濃郁但不膩', '入選食べログ「咖哩百名店」'],
    signature: ['チキンカリー（皮酥肉嫩）', 'ポーク角煮野菜カリー']
  },
  {
    id: 'bembera',
    name: 'Bem Bera network company',
    nameJa: 'ベンベラ・ネットワークカンパニー',
    address: '中央区南2条西7 エムズスペース 1F',
    lat: 43.0588, lng: 141.3391, // TODO: 校準
    tabelog: 3.68, tabelogReviews: 523,
    google: 4.3, googleReviews: 243,
    mapsQuery: 'ベンベラ ネットワークカンパニー 札幌 狸小路7',
    spicyLevel: 'unsafe',
    spicyEvidence: 'mogtrip：「0 番就已是『普通』，而且沒有甘口（不辣）選項相當少見」「極度不吃辣的人，恐怕連 0 番都嫌辣」',
    spicyNoSpicyOption: null,
    hours: [
      { open: '11:30', close: '15:00' },
      { open: '17:30', close: '20:30' }
    ],
    holiday: ['Wed'],
    features: ['秘密基地般的店址，雜居大樓深處', '湯裡會出現泰式米麵「クィッティアオ」（在別家店看不到）', '白飯預設加半熟太陽蛋', '湯底每日替換（透過官方推特公告）'],
    signature: ['エピローグ・チキンベジタブル', 'キーマ温玉ベジタブル']
  },
  {
    id: 'savoy',
    name: 'Savoy Sapporo Station Kitaguchi',
    nameJa: 'カリーサボイ',
    address: '北区北8条西4-4 稲津ビル B1',
    lat: 43.0672, lng: 141.3427, // TODO: 校準
    tabelog: 3.67, tabelogReviews: 721,
    google: 4.1, googleReviews: 508,
    mapsQuery: 'カリーサボイ Curry SAVoY 札幌駅北口',
    spicyLevel: 'safe',
    spicyEvidence: 'Living 札幌：辣度 6 級，0（無辣味）→ 6（超激辣）。Dr.陳：0 番（沒辣味）~ 6 番共 7 級。另有兒童咖哩。',
    spicyNoSpicyOption: '0 番（完全無辣味）+ 兒童咖哩',
    hours: [
      { open: '11:30', close: '15:00' },
      { open: '17:00', close: '21:30' }
    ],
    holiday: [],
    holidayNote: '不定休',
    features: ['「悪女のスープ（惡女之湯）」傳奇湯底', '熬製 48 小時的清爽湯體', '幾乎沒有油膜的銳利湯體', '北海道產肋排大到要溢出盤子（普通 150g、加大 280g）'],
    signature: ['スペアリブのカリー（肋排）', '15 種の野菜のカリー', '鉄板キーマのカリー']
  },
  {
    id: 'picante',
    name: 'Picante Soup curry',
    nameJa: 'ピカンティ 北13条本店',
    address: '北区北13条西3-2-23 アクロビュー北大前 1F',
    lat: 43.0716, lng: 141.3439, // TODO: 校準
    tabelog: 3.66, tabelogReviews: 1044,
    google: 4.3, googleReviews: 1566,
    mapsQuery: 'ピカンティ Picante 札幌 北13条本店',
    spicyLevel: 'unsafe',
    spicyEvidence: 'note 札幌グルメ：「辣度有 5 級。這次點了『辣度 1 的序章』，但裡面也有辣椒，辣味很明顯」',
    spicyNoSpicyOption: null,
    hours: [{ open: '11:30', close: '22:00' }],
    holiday: ['Thu'],
    features: ['可選 3~4 種湯底（38 億年の風/開闢/藥膳 1/f/海老曼陀羅）', '入選《米其林指南北海道 2017》', '1996 年創業老店，北大學生的靈魂食物', '碗中央有高台讓炸物保持酥脆'],
    signature: ['サクッと PICA チキン', 'やわらか仔羊のガーリック焼き', '北海道産牛すじ煮込み']
  },
  {
    id: 'soulstore',
    name: 'Soul Store Sapporo Odori',
    nameJa: 'ソウルストア（SOUL STORE）',
    address: '中央区南3条西7-3-2 F-DRESS7 BLD 2F',
    lat: 43.0580, lng: 141.3391, // TODO: 校準
    tabelog: 3.66, tabelogReviews: 636,
    google: 4.4, googleReviews: 985,
    mapsQuery: 'ソウルストア SOUL STORE 札幌 南3条西7',
    spicyLevel: 'mild',
    spicyEvidence: 'Retty：「奶香溫和的湯人人都易接受，辣度也可依喜好調整」。無明確的 0 番記載，建議現場詢問。',
    spicyNoSpicyOption: null,
    hours: [
      { open: '11:30', close: '15:00' },
      { open: '17:30', close: '20:30' }
    ],
    holiday: [],
    features: ['「立體式擺盤」蔬菜田，視覺衝擊', '長沼町農家清晨採收直送的 15~20 種季節蔬菜', '4 種湯底（CLASSIC/BOSSA/麻辣/夜間 PSYCHE）', '平日午餐免費供應茉莉花茶'],
    signature: ['チキンカリー（不動人氣 No.1）', '粗挽きラムとくろださんちの寄せ豆富のカリー', '季節の旬菜カリー']
  },
  {
    id: 'pulupulu',
    name: '村上カレー店 プルプル',
    nameJa: '村上カレー店・プルプル（PULU2）',
    address: '中央区南2条西9-1-14 ケンタクビル29 B1F',
    lat: 43.0588, lng: 141.3367, // TODO: 校準
    tabelog: 3.66, tabelogReviews: 481,
    google: 4.3, googleReviews: 400,
    mapsQuery: '村上カレー店 プルプル PULU2 札幌 南2条西9',
    spicyLevel: 'safe',
    spicyEvidence: 'mogtrip：「0~20 番 + 0 円免費」。4travel 評論：「5 番微微辣、15 番慢慢顯現」→ 0 番無辣。',
    spicyNoSpicyOption: '0 番（完全無辣）',
    hours: [
      { open: '11:00', close: '14:30' },
      { open: '17:00', close: '20:00' }
    ],
    holiday: ['Sun'],
    holidayNote: '週日 + 國定假日公休',
    features: ['「納豆湯咖哩的發祥店」（1995 年創業）', '辣度範圍誇張：0~100 番（札幌最大級）', '湯體清爽滑順、調味極簡、幾乎無油', '店內播放雷鬼樂、Rasta 色彩裝潢'],
    signature: ['ナット・挽肉ベジタブル（招牌納豆絞肉蔬菜）', 'チキン・ベジタブル', 'サバ缶・カレー']
  }
];

// ─── 計算工具 ─────────────────────────────────────────

// Haversine 直線距離（km）
export function haversineKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
            Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// 步行時間估算（分鐘）
export function walkMinutes(km) {
  if (km == null) return null;
  return Math.round(km / 4.5 * 60);
}

// 即時營業狀態
// 回傳 { state: 'open'|'closing'|'holiday'|'closed', label: string }
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function _hm(date) { return date.getHours() * 60 + date.getMinutes(); }
function _parseHM(s) { const [h, m] = s.split(':').map(Number); return h * 60 + m; }
function _pad(n) { return String(n).padStart(2, '0'); }

export function getOpenStatus(shop, now = new Date()) {
  const todayKey = WEEK[now.getDay()];
  if (shop.holiday && shop.holiday.includes(todayKey)) {
    // 找下一個非公休日
    for (let i = 1; i <= 7; i++) {
      const next = WEEK[(now.getDay() + i) % 7];
      if (!shop.holiday.includes(next)) {
        return { state: 'holiday', label: `今日公休 · 下次營業：週${WEEK_ZH[(now.getDay() + i) % 7]}` };
      }
    }
    return { state: 'holiday', label: '今日公休' };
  }

  const cur = _hm(now);
  const hours = shop.hours || [];
  // 找當前所處或下一個時段
  for (const slot of hours) {
    const open = _parseHM(slot.open);
    const close = _parseHM(slot.close);
    if (cur >= open && cur < close) {
      // 營業中
      if (close - cur <= 30) {
        return { state: 'closing', label: `即將打烊（${slot.close}）` };
      }
      return { state: 'open', label: `至 ${slot.close} 打烊` };
    }
  }
  // 找今日後續時段
  for (const slot of hours) {
    if (cur < _parseHM(slot.open)) {
      return { state: 'closed', label: `今日 ${slot.open} 開店` };
    }
  }
  // 已過今日最後一個 close → 找明日第一個 open
  for (let i = 1; i <= 7; i++) {
    const next = WEEK[(now.getDay() + i) % 7];
    if (shop.holiday && shop.holiday.includes(next)) continue;
    if (hours[0]) {
      const dayLabel = i === 1 ? '明日' : `週${WEEK_ZH[(now.getDay() + i) % 7]}`;
      return { state: 'closed', label: `${dayLabel} ${hours[0].open} 開店` };
    }
  }
  return { state: 'closed', label: '營業時間未知' };
}

// 排序：safe/mild 在主清單，unsafe 恆置底
// mode: 'distance' | 'tabelog' | 'spicy'
export function sortShops(shops, mode, basepoint) {
  const main = shops.filter(s => s.spicyLevel !== 'unsafe');
  const unsafe = shops.filter(s => s.spicyLevel === 'unsafe');
  const cmp = {
    distance: (a, b) => {
      const da = haversineKm(basepoint, a);
      const db = haversineKm(basepoint, b);
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db;
    },
    tabelog: (a, b) => b.tabelog - a.tabelog,
    spicy: (a, b) => {
      const rank = { safe: 0, mild: 1, unsafe: 2 };
      const d = rank[a.spicyLevel] - rank[b.spicyLevel];
      return d !== 0 ? d : b.tabelog - a.tabelog;
    }
  }[mode] || ((a, b) => b.tabelog - a.tabelog);

  return [...main.sort(cmp), ...unsafe.sort((a, b) => b.tabelog - a.tabelog)];
}

// 格式化距離 chip 文字
export function formatDistance(km) {
  if (km == null) return '—';
  return `${km.toFixed(1)} km · 🚶 ${walkMinutes(km)} 分`;
}
