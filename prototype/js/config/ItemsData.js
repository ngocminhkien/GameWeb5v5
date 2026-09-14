/**
 * Cấu hình dữ liệu 50 Trang Bị & Cửa Hàng MOBA (Prototype Version)
 * Gắn vào window.ITEMS và window.BOT_BUILD_PATHS
 */

const ITEMS = {
  // =========================================================================
  // TIER 1: TRANG BỊ CƠ BẢN / THÀNH PHẦN NHỎ (12 MÓN)
  // =========================================================================
  long_sword: {
    id: 'long_sword',
    name: 'Kiếm Dài',
    tier: 1,
    category: 'damage',
    cost: 350,
    icon: '🗡️',
    desc: '+15 Sát Thương Vật Lý',
    stats: { ad: 15 },
    recipe: []
  },
  dagger: {
    id: 'dagger',
    name: 'Dao Găm',
    tier: 1,
    category: 'damage',
    cost: 300,
    icon: '🔪',
    desc: '+12% Tốc Độ Đánh',
    stats: { attackSpeed: 0.12 },
    recipe: []
  },
  brawlers_gloves: {
    id: 'brawlers_gloves',
    name: 'Găng Đấu Sĩ',
    tier: 1,
    category: 'damage',
    cost: 400,
    icon: '🥊',
    desc: '+10% Tỉ Lệ Chí Mạng',
    stats: { critChance: 0.10 },
    recipe: []
  },
  amplifying_tome: {
    id: 'amplifying_tome',
    name: 'Sách Cũ',
    tier: 1,
    category: 'magic',
    cost: 350,
    icon: '📖',
    desc: '+20 Sức Mạnh Phép Thuật (SMPT)',
    stats: { ap: 20 },
    recipe: []
  },
  sapphire_crystal: {
    id: 'sapphire_crystal',
    name: 'Lam Ngọc',
    tier: 1,
    category: 'magic',
    cost: 350,
    icon: '🔷',
    desc: '+250 Năng Lượng Tối Đa',
    stats: { mana: 250 },
    recipe: []
  },
  ruby_crystal: {
    id: 'ruby_crystal',
    name: 'Hồng Ngọc',
    tier: 1,
    category: 'defense',
    cost: 400,
    icon: '🔴',
    desc: '+150 Máu Tối Đa',
    stats: { hp: 150 },
    recipe: []
  },
  cloth_armor: {
    id: 'cloth_armor',
    name: 'Giáp Lụa',
    tier: 1,
    category: 'defense',
    cost: 300,
    icon: '🥼',
    desc: '+15 Giáp (Giảm sát thương vật lý)',
    stats: { armor: 15 },
    recipe: []
  },
  null_magic_mantle: {
    id: 'null_magic_mantle',
    name: 'Áo Choàng Bạc',
    tier: 1,
    category: 'defense',
    cost: 450,
    icon: '🧥',
    desc: '+25 Giáp Kháng Cự',
    stats: { armor: 25 },
    recipe: []
  },
  rejuvenation_bead: {
    id: 'rejuvenation_bead',
    name: 'Hạt Ngọc Phục Hồi',
    tier: 1,
    category: 'defense',
    cost: 300,
    icon: '🟢',
    desc: '+6 Hồi Máu Mỗi Giây',
    stats: { hpRegen: 6 },
    recipe: []
  },
  boots_basic: {
    id: 'boots_basic',
    name: 'Giày Thường',
    tier: 1,
    category: 'boots',
    cost: 300,
    icon: '🥾',
    desc: '+45 Tốc Độ Chạy',
    stats: { speed: 45 },
    recipe: []
  },
  health_potion: {
    id: 'health_potion',
    name: 'Bình Máu',
    tier: 1,
    category: 'consumable',
    cost: 50,
    icon: '🧪',
    desc: 'Hồi phục 250 Máu trong 5 giây (Kích hoạt nhanh bằng phím 1-6)',
    isConsumable: true,
    maxStack: 3,
    recipe: [],
    active: {
      name: 'Uống Bình Máu',
      cd: 1.0,
      type: 'potion',
      value: 250,
      duration: 5.0
    }
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Bình Năng Lượng',
    tier: 1,
    category: 'consumable',
    cost: 50,
    icon: '🧪💧',
    desc: 'Hồi phục 180 Năng Lượng trong 5 giây (Kích hoạt nhanh bằng phím 1-6)',
    isConsumable: true,
    maxStack: 3,
    recipe: [],
    active: {
      name: 'Uống Bình Mana',
      cd: 1.0,
      type: 'mana_potion',
      value: 180,
      duration: 5.0
    }
  },

  // =========================================================================
  // TIER 2: TRANG BỊ TRUNG CẤP / NÂNG CAO (17 MÓN)
  // =========================================================================
  vampiric_scepter: {
    id: 'vampiric_scepter',
    name: 'Huyết Trượng',
    tier: 2,
    category: 'damage',
    cost: 900,
    icon: '🩸',
    desc: '+20 STVL, +10% Hút Máu từ đòn đánh',
    stats: { ad: 20, lifesteal: 0.10 },
    recipe: ['long_sword']
  },
  serrated_dirk: {
    id: 'serrated_dirk',
    name: 'Dao Hung Tàn',
    tier: 2,
    category: 'damage',
    cost: 1000,
    icon: '🗡️⚡',
    desc: '+30 STVL, +10 Sát Lực (Bỏ qua giáp mục tiêu)',
    stats: { ad: 30 },
    recipe: ['long_sword']
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Cuốc Chim',
    tier: 2,
    category: 'damage',
    cost: 875,
    icon: '⛏️',
    desc: '+25 Sát Thương Vật Lý',
    stats: { ad: 25 },
    recipe: []
  },
  sheen: {
    id: 'sheen',
    name: 'Thủy Kiếm',
    tier: 2,
    category: 'damage',
    cost: 1000,
    icon: '🗡️✨',
    desc: '+10% Giảm hồi chiêu. [Nội tại - Kiếm Phép]: Sau khi dùng kỹ năng, đòn đánh kế gây thêm +100% STVL cơ bản',
    stats: { cdr: 0.10 },
    passive: { type: 'spellblade', multiplier: 1.0 },
    recipe: ['sapphire_crystal']
  },
  phage: {
    id: 'phage',
    name: 'Búa Gỗ',
    tier: 2,
    category: 'damage',
    cost: 1100,
    icon: '🔨',
    desc: '+15 STVL, +200 Máu. Đòn đánh trúng tăng +20 Tốc chạy trong 2s',
    stats: { ad: 15, hp: 200, speed: 20 },
    recipe: ['ruby_crystal', 'long_sword']
  },
  zeal: {
    id: 'zeal',
    name: 'Song Kiếm',
    tier: 2,
    category: 'damage',
    cost: 1050,
    icon: '⚔️💨',
    desc: '+15% Tốc Đánh, +15% Tỉ Lệ Chí Mạng, +20 Tốc Chạy',
    stats: { attackSpeed: 0.15, critChance: 0.15, speed: 20 },
    recipe: ['dagger', 'brawlers_gloves']
  },
  blasting_wand: {
    id: 'blasting_wand',
    name: 'Gậy Bùng Nổ',
    tier: 2,
    category: 'magic',
    cost: 850,
    icon: '🪄',
    desc: '+40 Sức Mạnh Phép Thuật',
    stats: { ap: 40 },
    recipe: ['amplifying_tome']
  },
  lost_chapter: {
    id: 'lost_chapter',
    name: 'Bí Chương Thất Truyền',
    tier: 2,
    category: 'magic',
    cost: 1200,
    icon: '📜',
    desc: '+40 SMPT, +300 Mana, +10% Giảm hồi chiêu CDR',
    stats: { ap: 40, mana: 300, cdr: 0.10 },
    recipe: ['amplifying_tome', 'sapphire_crystal']
  },
  fiendish_codex: {
    id: 'fiendish_codex',
    name: 'Sách Quỷ',
    tier: 2,
    category: 'magic',
    cost: 900,
    icon: '📕💀',
    desc: '+35 SMPT, +10% Giảm hồi chiêu CDR',
    stats: { ap: 35, cdr: 0.10 },
    recipe: ['amplifying_tome']
  },
  seekers_armguard: {
    id: 'seekers_armguard',
    name: 'Giáp Tay Seeker',
    tier: 2,
    category: 'magic',
    cost: 1000,
    icon: '🧤🛡️',
    desc: '+30 SMPT, +25 Giáp',
    stats: { ap: 30, armor: 25 },
    recipe: ['amplifying_tome', 'cloth_armor']
  },
  brambles_vest: {
    id: 'brambles_vest',
    name: 'Giáp Gai Nhỏ',
    tier: 2,
    category: 'defense',
    cost: 800,
    icon: '🦺🌵',
    desc: '+30 Giáp. [Nội tại]: Phản lại 10% sát thương từ đòn đánh thường của kẻ địch',
    stats: { armor: 30 },
    passive: { type: 'thorn_reflect', ratio: 0.10 },
    recipe: ['cloth_armor']
  },
  bamis_cinder: {
    id: 'bamis_cinder',
    name: 'Tàn Tích Bami',
    tier: 2,
    category: 'defense',
    cost: 1000,
    icon: '🔥🛡️',
    desc: '+300 Máu. [Nội tại]: Thiêu đốt kẻ địch xung quanh 15 sát thương phép mỗi giây',
    stats: { hp: 300 },
    passive: { type: 'burn_aura', dps: 15, radius: 220 },
    recipe: ['ruby_crystal']
  },
  spectres_cowl: {
    id: 'spectres_cowl',
    name: 'Áo Choàng Ám Ảnh',
    tier: 2,
    category: 'defense',
    cost: 1050,
    icon: '👻🧥',
    desc: '+250 Máu, +20 Giáp/Kháng, +5 Hồi máu mỗi giây',
    stats: { hp: 250, armor: 20, hpRegen: 5 },
    recipe: ['ruby_crystal', 'null_magic_mantle']
  },
  berserker_greaves: {
    id: 'berserker_greaves',
    name: 'Giày Cuồng Nộ',
    tier: 2,
    category: 'boots',
    cost: 900,
    icon: '👢⚡',
    desc: '+65 Tốc Độ Chạy, +30% Tốc Đánh',
    stats: { speed: 65, attackSpeed: 0.30 },
    recipe: ['boots_basic', 'dagger']
  },
  sorcerer_shoes: {
    id: 'sorcerer_shoes',
    name: 'Giày Pháp Sư',
    tier: 2,
    category: 'boots',
    cost: 900,
    icon: '👢🔮',
    desc: '+65 Tốc Độ Chạy, +25 SMPT',
    stats: { speed: 65, ap: 25 },
    recipe: ['boots_basic', 'amplifying_tome']
  },
  plated_steelcaps: {
    id: 'plated_steelcaps',
    name: 'Giày Thép Gai',
    tier: 2,
    category: 'boots',
    cost: 900,
    icon: '👢🛡️',
    desc: '+65 Tốc Độ Chạy, +30 Giáp',
    stats: { speed: 65, armor: 30 },
    recipe: ['boots_basic', 'cloth_armor']
  },
  mercury_treads: {
    id: 'mercury_treads',
    name: 'Giày Thủy Ngân',
    tier: 2,
    category: 'boots',
    cost: 950,
    icon: '👢💧',
    desc: '+65 Tốc Độ Chạy, +30 Giáp/Kháng Cự',
    stats: { speed: 65, armor: 30 },
    recipe: ['boots_basic', 'null_magic_mantle']
  },

  // =========================================================================
  // TIER 3: TRANG BỊ HOÀN CHỈNH / HUYỀN THOẠI (18 MÓN)
  // =========================================================================
  infinity_edge: {
    id: 'infinity_edge',
    name: 'Vô Cực Kiếm',
    tier: 3,
    category: 'damage',
    cost: 3400,
    icon: '⚡🗡️',
    desc: '+70 STVL, +25% Chí Mạng. [Nội tại]: Đòn đánh chí mạng gây x2.2 sát thương cực đại!',
    stats: { ad: 70, critChance: 0.25 },
    passive: { type: 'crit_amp', multiplier: 2.2 },
    recipe: ['pickaxe', 'brawlers_gloves', 'long_sword']
  },
  bloodthirster: {
    id: 'bloodthirster',
    name: 'Huyết Kiếm',
    tier: 3,
    category: 'damage',
    cost: 3200,
    icon: '⚔️🩸',
    desc: '+55 STVL, +20% Hút Máu. Hồi phục vượt trội trong mọi giao tranh kéo dài',
    stats: { ad: 55, lifesteal: 0.20 },
    recipe: ['vampiric_scepter', 'pickaxe']
  },
  statikk_shiv: {
    id: 'statikk_shiv',
    name: 'Dao Điện Statikk',
    tier: 3,
    category: 'damage',
    cost: 2800,
    icon: '⚡',
    desc: '+45 STVL, +25% Tốc Đánh, +20% Chí Mạng. [Nội tại]: Đòn đánh phóng tia sét nảy 110 ST lan 3 mục tiêu',
    stats: { ad: 45, attackSpeed: 0.25, critChance: 0.20 },
    passive: { type: 'chain_lightning', damage: 110, targets: 3 },
    recipe: ['zeal', 'long_sword']
  },
  trinity_force: {
    id: 'trinity_force',
    name: 'Tam Hợp Kiếm',
    tier: 3,
    category: 'damage',
    cost: 3333,
    icon: '🔺✨',
    desc: '+35 STVL, +30% Tốc Đánh, +300 Máu, +15% CDR, +30 Tốc Chạy. [Nội tại - Kiếm Phép]: Đòn đánh sau khi tung chiêu gây thêm +200% STVL cơ bản!',
    stats: { ad: 35, attackSpeed: 0.30, hp: 300, cdr: 0.15, speed: 30 },
    passive: { type: 'spellblade', multiplier: 2.0 },
    recipe: ['sheen', 'phage', 'dagger']
  },
  phantom_dancer: {
    id: 'phantom_dancer',
    name: 'Ma Vũ Song Kiếm',
    tier: 3,
    category: 'damage',
    cost: 2600,
    icon: '🗡️💨',
    desc: '+30 STVL, +35% Tốc Đánh, +20% Chí Mạng, +45 Tốc Độ Chạy',
    stats: { ad: 30, attackSpeed: 0.35, critChance: 0.20, speed: 45 },
    recipe: ['zeal', 'dagger']
  },
  immortal_shieldbow: {
    id: 'immortal_shieldbow',
    name: 'Nỏ Tử Thủ',
    tier: 3,
    category: 'damage',
    cost: 3100,
    icon: '🏹🛡️',
    desc: '+50 STVL, +20% Tốc Đánh, +20% Chí Mạng, +10% Hút Máu. [Nội tại - Cứu Sinh]: Khi máu xuống dưới 30%, tự động nhận lá chắn 400 HP trong 4 giây (hồi chiêu 90s)',
    stats: { ad: 50, attackSpeed: 0.20, critChance: 0.20, lifesteal: 0.10 },
    passive: { type: 'lifeline', shield: 400, duration: 4.0, cd: 90 },
    recipe: ['vampiric_scepter', 'zeal']
  },
  guardian_angel: {
    id: 'guardian_angel',
    name: 'Giáp Thiên Thần',
    tier: 3,
    category: 'damage',
    cost: 3000,
    icon: '😇🛡️',
    desc: '+45 STVL, +40 Giáp. [Nội tại - Hồi Sinh]: Khi nhận sát thương kết liễu, hồi sinh sau 4s với 50% Máu tối đa (hồi chiêu 180s)',
    stats: { ad: 45, armor: 40 },
    passive: { type: 'revive', healRatio: 0.50, duration: 4.0, cd: 180 },
    recipe: ['pickaxe', 'cloth_armor']
  },
  youmuu_ghostblade: {
    id: 'youmuu_ghostblade',
    name: 'Kiếm Ma Youmuu',
    tier: 3,
    category: 'damage',
    cost: 2900,
    icon: '🗡️👻',
    desc: '+55 STVL, +15 Sát Lực. [Kích hoạt - Phím 1-6]: Tăng +40% Tốc chạy vũ bão trong 5 giây (hồi chiêu 45s)',
    stats: { ad: 55 },
    active: {
      name: 'Bứt Tốc Youmuu',
      cd: 45,
      type: 'speed_boost',
      multiplier: 1.40,
      duration: 5.0
    },
    recipe: ['serrated_dirk', 'pickaxe']
  },
  rabadon: {
    id: 'rabadon',
    name: 'Mũ Phù Thủy Rabadon',
    tier: 3,
    category: 'magic',
    cost: 3600,
    icon: '🧙‍♂️',
    desc: '+120 SMPT. [Nội tại Duy Nhất]: Khuếch đại TỔNG Sức Mạnh Phép Thuật thêm +35%!',
    stats: { ap: 120 },
    passive: { type: 'rabadon_amp', multiplier: 0.35 },
    recipe: ['blasting_wand', 'amplifying_tome']
  },
  zhonya: {
    id: 'zhonya',
    name: 'Đồng Hồ Cát Zhonya',
    tier: 3,
    category: 'magic',
    cost: 3000,
    icon: '⏳',
    desc: '+65 SMPT, +45 Giáp, +10% CDR. [Kích hoạt - Phím 1-6]: Ngưng đọng hóa vàng bất tử 2.5s (hồi chiêu 90s)',
    stats: { ap: 65, armor: 45, cdr: 0.10 },
    active: {
      name: 'Ngưng Đọng Thời Gian',
      cd: 90,
      type: 'stasis',
      duration: 2.5
    },
    recipe: ['seekers_armguard', 'fiendish_codex']
  },
  ludens_echo: {
    id: 'ludens_echo',
    name: 'Vọng Âm Luden',
    tier: 3,
    category: 'magic',
    cost: 3200,
    icon: '🔮⚡',
    desc: '+80 SMPT, +600 Mana, +10% CDR. [Nội tại]: Đòn đánh và kỹ năng phóng luồng sóng bộc phát gây 120 ST phép',
    stats: { ap: 80, mana: 600, cdr: 0.10 },
    passive: { type: 'luden_burst', damage: 120 },
    recipe: ['lost_chapter', 'blasting_wand']
  },
  nashors_tooth: {
    id: 'nashors_tooth',
    name: 'Nanh Nashor',
    tier: 3,
    category: 'magic',
    cost: 3000,
    icon: '🦷✨',
    desc: '+90 SMPT, +50% Tốc Đánh. [Nội tại]: Đòn đánh thường gây thêm +30 (+20% SMPT) sát thương phép trên đòn đánh',
    stats: { ap: 90, attackSpeed: 0.50 },
    passive: { type: 'nashor_onhit', baseDamage: 30, apRatio: 0.20 },
    recipe: ['fiendish_codex', 'dagger']
  },
  rylais_scepter: {
    id: 'rylais_scepter',
    name: 'Trượng Pha Lê Rylai',
    tier: 3,
    category: 'magic',
    cost: 2600,
    icon: '❄️🪄',
    desc: '+75 SMPT, +350 Máu. [Nội tại]: Mọi kỹ năng trúng đích làm chậm tốc độ chạy đối thủ 30% trong 1.5 giây',
    stats: { ap: 75, hp: 350 },
    passive: { type: 'slow_on_skill', slowRatio: 0.30, duration: 1.5 },
    recipe: ['blasting_wand', 'ruby_crystal']
  },
  warmog: {
    id: 'warmog',
    name: 'Giáp Máu Warmog',
    tier: 3,
    category: 'defense',
    cost: 3000,
    icon: '💚🛡️',
    desc: '+800 Máu, +15 Hồi Máu/s. [Nội tại]: Hồi phục 5% Máu tối đa mỗi giây khi không giao tranh',
    stats: { hp: 800, hpRegen: 15 },
    passive: { type: 'warmog_heart', percentRegen: 0.05 },
    recipe: ['bamis_cinder', 'ruby_crystal']
  },
  thornmail: {
    id: 'thornmail',
    name: 'Giáp Gai',
    tier: 3,
    category: 'defense',
    cost: 2700,
    icon: '🌵🛡️',
    desc: '+350 Máu, +60 Giáp. [Nội tại]: Phản lại 20% sát thương nhận vào từ kẻ tấn công',
    stats: { hp: 350, armor: 60 },
    passive: { type: 'thorn_reflect', ratio: 0.20 },
    recipe: ['brambles_vest', 'ruby_crystal']
  },
  solari: {
    id: 'solari',
    name: 'Dây Chuyền Solari',
    tier: 3,
    category: 'defense',
    cost: 2500,
    icon: '☀️🛡️',
    desc: '+300 Máu, +30 Giáp. [Kích hoạt - Phím 1-6]: Tạo lá chắn 350 HP cho bản thân và toàn bộ đồng minh trong 4s (hồi chiêu 60s)',
    stats: { hp: 300, armor: 30 },
    active: {
      name: 'Lá Chắn Hoàng Kim',
      cd: 60,
      type: 'shield',
      value: 350,
      duration: 4.0
    },
    recipe: ['ruby_crystal', 'cloth_armor']
  },
  sunfire_aegis: {
    id: 'sunfire_aegis',
    name: 'Khiên Thái Dương',
    tier: 3,
    category: 'defense',
    cost: 2800,
    icon: '🔥☀️',
    desc: '+450 Máu, +40 Giáp. [Nội tại]: Thiêu đốt kẻ địch xung quanh 35 sát thương phép mỗi giây trong bán kính 240px',
    stats: { hp: 450, armor: 40 },
    passive: { type: 'burn_aura', dps: 35, radius: 240 },
    recipe: ['bamis_cinder', 'cloth_armor']
  },
  spirit_visage: {
    id: 'spirit_visage',
    name: 'Giáp Tâm Linh',
    tier: 3,
    category: 'defense',
    cost: 2900,
    icon: '🌿🛡️',
    desc: '+400 Máu, +40 Giáp/Kháng Cự. [Nội tại]: Gia tăng +25% hiệu quả mọi nguồn hồi phục và lá chắn',
    stats: { hp: 400, armor: 40 },
    passive: { type: 'spirit_healing', multiplier: 0.25 },
    recipe: ['spectres_cowl', 'ruby_crystal']
  },

  // =========================================================================
  // DƯỢC PHẨM CẤP CAO (TIER 3 CONSUMABLES - 3 MÓN, HIỆU LỰC 60 GIÂY)
  // =========================================================================
  elixir_of_wrath: {
    id: 'elixir_of_wrath',
    name: 'Dược Phẩm Phẫn Nộ',
    tier: 3,
    category: 'consumable',
    cost: 500,
    icon: '🧪🩸',
    desc: 'Uống tăng +30 STVL và +12% Hút Máu duy trì trong 60 giây (Kích hoạt phím 1-6)',
    isConsumable: true,
    maxStack: 1,
    recipe: [],
    active: {
      name: 'Dược Phẩm Phẫn Nộ',
      cd: 60,
      type: 'elixir',
      elixirType: 'wrath',
      duration: 60.0
    }
  },
  elixir_of_sorcery: {
    id: 'elixir_of_sorcery',
    name: 'Dược Phẩm Phù Thủy',
    tier: 3,
    category: 'consumable',
    cost: 500,
    icon: '🧪🔮',
    desc: 'Uống tăng +50 SMPT và +15 Hồi Năng Lượng/s duy trì trong 60 giây (Kích hoạt phím 1-6)',
    isConsumable: true,
    maxStack: 1,
    recipe: [],
    active: {
      name: 'Dược Phẩm Phù Thủy',
      cd: 60,
      type: 'elixir',
      elixirType: 'sorcery',
      duration: 60.0
    }
  },
  elixir_of_iron: {
    id: 'elixir_of_iron',
    name: 'Dược Phẩm Thép Tinh',
    tier: 3,
    category: 'consumable',
    cost: 500,
    icon: '🧪🛡️',
    desc: 'Uống tăng +300 Máu và +20 Giáp duy trì trong 60 giây (Kích hoạt phím 1-6)',
    isConsumable: true,
    maxStack: 1,
    recipe: [],
    active: {
      name: 'Dược Phẩm Thép Tinh',
      cd: 60,
      type: 'elixir',
      elixirType: 'iron',
      duration: 60.0
    }
  }
};

const BOT_BUILD_PATHS = {
  AD: [
    'boots_basic',
    'long_sword',
    'vampiric_scepter',
    'berserker_greaves',
    'zeal',
    'infinity_edge',
    'bloodthirster',
    'statikk_shiv',
    'immortal_shieldbow',
    'guardian_angel'
  ],
  AP: [
    'boots_basic',
    'amplifying_tome',
    'lost_chapter',
    'sorcerer_shoes',
    'blasting_wand',
    'ludens_echo',
    'seekers_armguard',
    'zhonya',
    'rabadon',
    'rylais_scepter'
  ],
  TANK: [
    'boots_basic',
    'ruby_crystal',
    'cloth_armor',
    'plated_steelcaps',
    'bamis_cinder',
    'sunfire_aegis',
    'brambles_vest',
    'thornmail',
    'warmog',
    'spirit_visage',
    'solari'
  ]
};

window.ITEMS = ITEMS;
window.BOT_BUILD_PATHS = BOT_BUILD_PATHS;
