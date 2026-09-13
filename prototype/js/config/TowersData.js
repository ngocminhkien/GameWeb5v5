/**
 * 20 DEFENSIVE TOWERS (10 BLUE vs 10 RED) - 1 CENTRAL NEXUS TOWER PER TEAM
 */
const TOWERS_CONFIG = [
  // ================= 10 BLUE TOWERS (ĐỘI XANH) =================
  // Mid Lane
  { id: 'b_mid_1', name: 'Trụ 1 Mid Xanh (Ngoài)', team: 'blue', x: 6300, y: 8700,  hp: 3500 },
  { id: 'b_mid_2', name: 'Trụ 2 Mid Xanh (Trong)', team: 'blue', x: 4700, y: 10300, hp: 4200 },
  { id: 'b_mid_3', name: 'Trụ 3 Mid Xanh (Nhà Lính)', team: 'blue', x: 3100, y: 11900, hp: 4800 },

  // Top Lane
  { id: 'b_top_1', name: 'Trụ 1 Top Xanh (Ngoài)', team: 'blue', x: 1200, y: 3000,  hp: 3500 },
  { id: 'b_top_2', name: 'Trụ 2 Top Xanh (Trong)', team: 'blue', x: 1200, y: 7000,  hp: 4200 },
  { id: 'b_top_3', name: 'Trụ 3 Top Xanh (Nhà Lính)', team: 'blue', x: 1200, y: 11000, hp: 4800 },

  // Bot Lane
  { id: 'b_bot_1', name: 'Trụ 1 Bot Xanh (Ngoài)', team: 'blue', x: 12000, y: 13800, hp: 3500 },
  { id: 'b_bot_2', name: 'Trụ 2 Bot Xanh (Trong)', team: 'blue', x: 8000,  y: 13800, hp: 4200 },
  { id: 'b_bot_3', name: 'Trụ 3 Bot Xanh (Nhà Lính)', team: 'blue', x: 4000,  y: 13800, hp: 4800 },

  // 1 Trụ Nhà Chính Độc Nhất
  { id: 'b_nexus', name: 'Trụ Nhà Chính Xanh', team: 'blue', x: 2000, y: 13000, hp: 6000 },

  // ================= 10 RED TOWERS (ĐỘI ĐỎ - ĐỐI XỨNG) =================
  // Mid Lane
  { id: 'r_mid_1', name: 'Trụ 1 Mid Đỏ (Ngoài)', team: 'red', x: 8700,  y: 6300,  hp: 3500 },
  { id: 'r_mid_2', name: 'Trụ 2 Mid Đỏ (Trong)', team: 'red', x: 10300, y: 4700,  hp: 4200 },
  { id: 'r_mid_3', name: 'Trụ 3 Mid Đỏ (Nhà Lính)', team: 'red', x: 11900, y: 3100,  hp: 4800 },

  // Top Lane
  { id: 'r_top_1', name: 'Trụ 1 Top Đỏ (Ngoài)', team: 'red', x: 3000,  y: 1200,  hp: 3500 },
  { id: 'r_top_2', name: 'Trụ 2 Top Đỏ (Trong)', team: 'red', x: 7000,  y: 1200,  hp: 4200 },
  { id: 'r_top_3', name: 'Trụ 3 Top Đỏ (Nhà Lính)', team: 'red', x: 11000, y: 1200,  hp: 4800 },

  // Bot Lane
  { id: 'r_bot_1', name: 'Trụ 1 Bot Đỏ (Ngoài)', team: 'red', x: 13800, y: 12000, hp: 3500 },
  { id: 'r_bot_2', name: 'Trụ 2 Bot Đỏ (Trong)', team: 'red', x: 13800, y: 8000,  hp: 4200 },
  { id: 'r_bot_3', name: 'Trụ 3 Bot Đỏ (Nhà Lính)', team: 'red', x: 13800, y: 4000,  hp: 4800 },

  // 1 Trụ Nhà Chính Độc Nhất
  { id: 'r_nexus', name: 'Trụ Nhà Chính Đỏ', team: 'red', x: 13000, y: 2000, hp: 6000 }
];
