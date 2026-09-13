/**
 * JUNGLE CAMPS & EPIC BOSSES - BASED ON LOL & ARENA OF VALOR
 */
const MONSTERS_CONFIG = [
  // ================= 2 BOSS SÔNG HUYỀN THOẠI =================
  {
    id: 'baron',
    name: 'Chúa Tể Hư Không (Baron Nashor)',
    symbol: '👑',
    color: '#a371f7',
    x: 4800,
    y: 4400,
    radius: 64,
    hp: 12000,
    damage: 220,
    isEpicBoss: true,
    buffType: 'baron'
  },
  {
    id: 'dragon',
    name: 'Rồng Nguyên Tố Lửa',
    symbol: '🐉',
    color: '#e056fd',
    x: 10200,
    y: 10600,
    radius: 56,
    hp: 7500,
    damage: 160,
    isEpicBoss: true,
    buffType: 'dragon'
  },

  // ================= CÁNH RỪNG ĐỘI XANH (BLUE JUNGLE) =================
  {
    id: 'blue_buff_blue',
    name: 'Bùa Xanh (Khổng Lồ Năng Lượng)',
    symbol: '💧',
    color: '#1f6feb',
    x: 2900,
    y: 9500,
    radius: 42,
    hp: 3200,
    damage: 95,
    buffType: 'blue'
  },
  {
    id: 'red_buff_blue',
    name: 'Bùa Đỏ (Quái Thụ Thiêu Đốt)',
    symbol: '🔥',
    color: '#da3633',
    x: 4900,
    y: 12200,
    radius: 42,
    hp: 3200,
    damage: 105,
    buffType: 'red'
  },
  {
    id: 'wolves_blue',
    name: 'Bầy Sói Rừng Xanh',
    symbol: '🐺',
    color: '#8957e5',
    x: 4000,
    y: 10500,
    radius: 35,
    hp: 2400,
    damage: 80
  },
  {
    id: 'raptors_blue',
    name: 'Bãi Chim Biến Dị Xanh',
    symbol: '🦅',
    color: '#d29922',
    x: 6400,
    y: 11000,
    radius: 35,
    hp: 2200,
    damage: 85
  },
  {
    id: 'gromp_blue',
    name: 'Cóc Thành Tinh Xanh',
    symbol: '🐸',
    color: '#238636',
    x: 2000,
    y: 8600,
    radius: 38,
    hp: 2600,
    damage: 90
  },

  // ================= CÁNH RỪNG ĐỘI ĐỎ (RED JUNGLE - ĐỐI XỨNG) =================
  {
    id: 'blue_buff_red',
    name: 'Bùa Xanh (Khổng Lồ Năng Lượng)',
    symbol: '💧',
    color: '#1f6feb',
    x: 12100,
    y: 5500,
    radius: 42,
    hp: 3200,
    damage: 95,
    buffType: 'blue'
  },
  {
    id: 'red_buff_red',
    name: 'Bùa Đỏ (Quái Thụ Thiêu Đốt)',
    symbol: '🔥',
    color: '#da3633',
    x: 10100,
    y: 2800,
    radius: 42,
    hp: 3200,
    damage: 105,
    buffType: 'red'
  },
  {
    id: 'wolves_red',
    name: 'Bầy Sói Rừng Đỏ',
    symbol: '🐺',
    color: '#8957e5',
    x: 11000,
    y: 4500,
    radius: 35,
    hp: 2400,
    damage: 80
  },
  {
    id: 'raptors_red',
    name: 'Bãi Chim Biến Dị Đỏ',
    symbol: '🦅',
    color: '#d29922',
    x: 8600,
    y: 4000,
    radius: 35,
    hp: 2200,
    damage: 85
  },
  {
    id: 'gromp_red',
    name: 'Cóc Thành Tinh Đỏ',
    symbol: '🐸',
    color: '#238636',
    x: 13000,
    y: 6400,
    radius: 38,
    hp: 2600,
    damage: 90
  }
];
