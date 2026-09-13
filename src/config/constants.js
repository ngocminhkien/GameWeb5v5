/**
 * Global game constants & balance parameters
 */
export const CONSTANTS = {
  // Map dimensions (Square 1:1)
  MAP_WIDTH: 15000,
  MAP_HEIGHT: 15000,
  CENTER_X: 7500,
  CENTER_Y: 7500,

  // Bases
  BLUE_BASE: { x: 1200, y: 13800, radius: 750 },
  RED_BASE: { x: 13800, y: 1200, radius: 750 },

  // Lane & River Widths
  LANE_WIDTH: 380,
  RIVER_WIDTH: 700,

  // Camera & Zoom
  DEFAULT_ZOOM: 0.85,
  MIN_ZOOM: 0.4,
  MAX_ZOOM: 1.5,
  CAMERA_PAN_SPEED: 3800,
  EDGE_PAN_MARGIN: 35,

  // Hero Defaults
  HERO_RADIUS: 32,
  HERO_SPEED: 420,
  HERO_MAX_HP: 1400,
  HERO_MAX_MANA: 700,
  HP_REGEN: 15,
  MANA_REGEN: 22,
  RESPAWN_TIME: 7.0,

  // Level & Progression (Levels 1 to 15)
  MAX_LEVEL: 15,
  // expToNext[level]: EXP required to reach level + 1 from current level
  EXP_TABLE: [
    0,     // lv 0 unused
    240,   // lv 1 -> 2
    360,   // lv 2 -> 3
    500,   // lv 3 -> 4
    660,   // lv 4 -> 5
    840,   // lv 5 -> 6
    1040,  // lv 6 -> 7
    1260,  // lv 7 -> 8
    1500,  // lv 8 -> 9
    1760,  // lv 9 -> 10
    2040,  // lv 10 -> 11
    2340,  // lv 11 -> 12
    2660,  // lv 12 -> 13
    3000,  // lv 13 -> 14
    3400   // lv 14 -> 15 (Max level)
  ],

  // Stat growth per level
  STAT_GROWTH: {
    hp: 90,
    mana: 45,
    attackDamage: 5,
    hpRegen: 1.0,
    manaRegen: 1.2
  },

  // Gold Economy
  ECONOMY: {
    PASSIVE_GOLD_PER_SEC: 3,
    ASSIST_RADIUS: 1000,
    INITIAL_GOLD: 500
  },

  // EXP & Gold Bounties
  BOUNTIES: {
    MINION_MELEE: { exp: 60, gold: 25 },
    MINION_RANGED: { exp: 45, gold: 20 },
    MINION_CANNON: { exp: 95, gold: 45 },
    MINION_SUPER: { exp: 150, gold: 70 },

    MONSTER_SMALL: { exp: 140, gold: 55 },
    MONSTER_BUFF: { exp: 240, gold: 100 },
    MONSTER_DRAGON: { exp: 650, gold: 250, teamGold: 150, teamExp: 300 },
    MONSTER_BARON: { exp: 1000, gold: 400, teamGold: 250, teamExp: 500 },

    HERO_KILL: { exp: 350, gold: 300, assistGold: 150, assistExp: 150 },
    TOWER_DESTROY: { gold: 250, teamGold: 100, teamExp: 150 }
  },

  // Skills Multi-Rank Upgrade Tables (Q, W, E max 4 ranks, R max 3 ranks)
  SKILL_RANKS: {
    Q: {
      maxRank: 4,
      name: 'Đạn Năng Lượng',
      damage: [140, 195, 250, 310],
      cd: [1.8, 1.5, 1.2, 0.9],
      mana: [40, 45, 50, 55],
      speed: [980, 1040, 1100, 1160],
      range: [1100, 1150, 1200, 1250],
      radius: 12
    },
    W: {
      maxRank: 4,
      name: 'Hộ Thể',
      shield: [260, 380, 510, 650],
      speedBoost: [520, 570, 620, 680],
      duration: [2.2, 2.6, 3.0, 3.5],
      cd: [8.0, 7.0, 6.0, 5.0],
      mana: [60, 65, 70, 75]
    },
    E: {
      maxRank: 4,
      name: 'Tốc Biến',
      distance: [420, 480, 540, 600],
      cd: [6.0, 5.2, 4.4, 3.6],
      mana: [50, 45, 40, 35]
    },
    R: {
      maxRank: 3,
      name: 'Thiên Phạt',
      reqLevel: [4, 8, 12],
      damage: [380, 560, 780],
      radius: [380, 430, 480],
      cd: [20.0, 16.0, 12.0],
      mana: [120, 140, 160]
    },
    B: {
      cd: 4.0,
      castTime: 2.2
    }
  },

  // Skills Defaults (Backward compatibility)
  SKILLS: {
    Q: { cd: 1.8, mana: 40, damage: 140, speed: 980, range: 1100, radius: 12 },
    W: { cd: 8.0, mana: 60, shield: 260, speedBoost: 520, duration: 2.2 },
    E: { cd: 6.0, mana: 50, distance: 420 },
    R: { cd: 20.0, mana: 120, damage: 380, radius: 380 },
    B: { cd: 4.0, castTime: 2.2 }
  }
};
