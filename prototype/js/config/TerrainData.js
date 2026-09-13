/**
 * Terrain Data for Prototype: River Polygon, Rock Walls, Strategic Bushes, Alcoves
 */
const RIVER_POLYGON = [
  // Bờ sông phía Tây-Bắc (Upper river bank)
  { x: 2500, y: 1200 },
  { x: 3400, y: 2200 },
  { x: 4200, y: 3600 },
  { x: 4100, y: 5200 },  // Uốn quanh cửa Hang Baron
  { x: 5400, y: 6400 },
  { x: 7200, y: 7000 },
  { x: 8000, y: 7400 },  // Cắt ngang đường Mid
  { x: 9600, y: 8600 },
  { x: 10900, y: 9800 }, // Uốn quanh cửa Hang Rồng
  { x: 11600, y: 11400 },
  { x: 12600, y: 12600 },
  { x: 13800, y: 12500 },

  // Bờ sông phía Đông-Nam (Lower river bank - quay ngược lại)
  { x: 13800, y: 13500 },
  { x: 12400, y: 13500 },
  { x: 11400, y: 12400 },
  { x: 10600, y: 11200 },
  { x: 9400, y: 9600 },
  { x: 7800, y: 8000 },
  { x: 7000, y: 7600 },
  { x: 5600, y: 6600 },
  { x: 4400, y: 5400 },
  { x: 3600, y: 3800 },
  { x: 2800, y: 2400 },
  { x: 2500, y: 1200 }
];

const ROCK_WALLS = [
  // ================= HANG BOSS SÔNG (EPIC PITS) =================
  // Hang Baron (U-Shape mở miệng xuống lòng sông Đông-Nam)
  { x: 4600, y: 3900, w: 900, h: 220, label: 'Hang Baron' },
  { x: 4400, y: 3900, w: 220, h: 900, label: '' },
  { x: 5300, y: 3900, w: 220, h: 600, label: '' },

  // Hang Rồng (U-Shape mở miệng lên lòng sông Tây-Bắc, đối xứng 15000 - x, 15000 - y)
  { x: 9500, y: 10880, w: 900, h: 220, label: 'Hang Rồng' },
  { x: 10380, y: 10200, w: 220, h: 900, label: '' },
  { x: 9480, y: 10500, w: 220, h: 600, label: '' },

  // ================= CÁNH RỪNG ĐỘI XANH (BLUE JUNGLE) =================
  // Vách bãi Bùa Xanh (Blue Sentinel Pit)
  { x: 2600, y: 9100, w: 750, h: 220, label: 'Vách Bùa Xanh' },
  { x: 2600, y: 9100, w: 220, h: 750, label: '' },

  // Vách bãi Bùa Đỏ (Red Brambleback Pit)
  { x: 4600, y: 12400, w: 800, h: 220, label: 'Vách Bùa Đỏ' },
  { x: 5200, y: 11800, w: 220, h: 800, label: '' },

  // Vách Bầy Sói
  { x: 3800, y: 10300, w: 600, h: 200, label: '' },
  // Vách Bãi Chim
  { x: 6200, y: 11200, w: 500, h: 220, label: '' },

  // ================= CÁNH RỪNG ĐỘI ĐỎ (RED JUNGLE - ĐỐI XỨNG) =================
  // Vách bãi Bùa Xanh Đội Đỏ (15000 - x, 15000 - y)
  { x: 11650, y: 5680, w: 750, h: 220, label: 'Vách Bùa Xanh' },
  { x: 12180, y: 5150, w: 220, h: 750, label: '' },

  // Vách bãi Bùa Đỏ Đội Đỏ
  { x: 9600, y: 2380, w: 800, h: 220, label: 'Vách Bùa Đỏ' },
  { x: 9580, y: 2400, w: 220, h: 800, label: '' },

  // Vách Bầy Sói Đỏ
  { x: 10600, y: 4500, w: 600, h: 200, label: '' },
  // Vách Bãi Chim Đỏ
  { x: 8300, y: 3580, w: 500, h: 220, label: '' },

  // ================= HỐC ĐƯỜNG (ALCOVES) =================
  { x: 1200, y: 1200, w: 700, h: 700, label: 'Hốc Đường Trên' },
  { x: 13100, y: 13100, w: 700, h: 700, label: 'Hốc Đường Dưới' }
];

const BUSHES = [
  // Bụi Sông Mid (River Pixel Bushes)
  { x: 6600, y: 6900, r: 240, label: 'Bụi Sông Mid 1' },
  { x: 8400, y: 8100, r: 240, label: 'Bụi Sông Mid 2' },

  // Bụi Cửa Hang Baron & Hang Rồng
  { x: 4200, y: 5600, r: 260, label: 'Bụi Cửa Hang Baron' },
  { x: 10800, y: 9400, r: 260, label: 'Bụi Cửa Hang Rồng' },

  // Bụi 3 ngã rẽ Rừng - Sông (Tri-bushes)
  { x: 3300, y: 3300, r: 250, label: 'Bụi 3 Ngã Top Xanh' },
  { x: 11700, y: 11700, r: 250, label: 'Bụi 3 Ngã Bot Đỏ' },
  { x: 5800, y: 6000, r: 240, label: 'Bụi Cửa Rừng Xanh' },
  { x: 9200, y: 9000, r: 240, label: 'Bụi Cửa Rừng Đỏ' },

  // Bụi cỏ ven 3 đường (Lane side bushes)
  { x: 1200, y: 4800, r: 240, label: 'Bụi Đường Top 1' },
  { x: 1200, y: 7200, r: 240, label: 'Bụi Đường Top 2' },
  { x: 7800, y: 1200, r: 240, label: 'Bụi Đường Top 3' },
  { x: 10200, y: 1200, r: 240, label: 'Bụi Đường Top 4' },

  { x: 4800, y: 13800, r: 240, label: 'Bụi Đường Bot 1' },
  { x: 7200, y: 13800, r: 240, label: 'Bụi Đường Bot 2' },
  { x: 13800, y: 7800, r: 240, label: 'Bụi Đường Bot 3' },
  { x: 13800, y: 10200, r: 240, label: 'Bụi Đường Bot 4' },

  // Bụi bùa lợi trong rừng
  { x: 3800, y: 11400, r: 240, label: 'Bụi Bùa Đỏ Xanh' },
  { x: 11200, y: 3600, r: 240, label: 'Bụi Bùa Đỏ Đỏ' }
];

const MINION_WAYPOINTS = {
  blue: {
    TOP: [{ x: 1200, y: 13000 }, { x: 1200, y: 1200 }, { x: 13800, y: 1200 }],
    MID: [{ x: 1600, y: 13400 }, { x: 7500, y: 7500 }, { x: 13800, y: 1200 }],
    BOT: [{ x: 2000, y: 13800 }, { x: 13800, y: 13800 }, { x: 13800, y: 1200 }]
  },
  red: {
    TOP: [{ x: 13000, y: 1200 }, { x: 1200, y: 1200 }, { x: 1200, y: 13800 }],
    MID: [{ x: 13400, y: 1600 }, { x: 7500, y: 7500 }, { x: 1200, y: 13800 }],
    BOT: [{ x: 13800, y: 2000 }, { x: 13800, y: 13800 }, { x: 1200, y: 13800 }]
  }
};
