export const CATEGORIES = {
  transport: { emoji: /[✈🚃🚇🚌🚡🚕🚢🚶🚻]/u, color: '#5ac8fa', label: '🚃 交通' },
  food:      { emoji: /[🍽🍛🍖🍣🍰🍦🍳🛒🌽🍥🍨🍹🍵☕]/u, color: '#ff9500', label: '🍽 餐廳' },
  spot:      { emoji: /[📸🏛🎵🌸🌷🌃🎆♨📝🛍]/u, color: '#34c759', label: '📍 景點' },
  hotel:     { emoji: /[🏨🛁]/u, color: '#af52de', label: '🏨 飯店' },
};

export function getCat(a) {
  for (const [key, def] of Object.entries(CATEGORIES)) {
    if (def.emoji.test(a)) return key;
  }
  return '';
}

export function extractEmoji(s) {
  const m = s.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u);
  return m ? m[0] : '';
}

export const MAP_COLORS = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.color])
);

export const CAT_LABELS = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])
);
