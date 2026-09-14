/**
 * CHAMPIONS DEFINITIONS FOR PROTOTYPE OOP
 * Attached to window.CHAMPIONS
 */

window.CHAMPIONS = {
  mage: {
    id: 'mage',
    name: 'Valhein',
    title: 'Pháp Sư Tinh Anh',
    role: 'Pháp Sư',
    roleEn: 'Mage',
    roleBadge: '🔮 PHÁP SƯ',
    symbol: '🧙‍♂️',
    avatarColor: '#8957e5',
    themeColor: '#a371f7',
    description: 'Chuyên gia cấu rỉa ma pháp tầm xa, sở hữu khả năng dồn sát thương bộc phá và tạo khiên bảo hộ.',
    difficulty: 2,
    ratings: { damage: 85, defense: 40, mobility: 60 },
    baseStats: {
      hp: 1400,
      mana: 700,
      attackDamage: 75,
      abilityPower: 30,
      armor: 28,
      speed: 410,
      attackRange: 550,
      attackSpeed: 0.9,
      hpRegen: 12,
      manaRegen: 22
    },
    skills: {
      passive: {
        name: 'Dòng Chảy Ma Thuật',
        icon: '🌀',
        desc: 'Đòn đánh thường hồi 12 Năng lượng. Khi tung chiêu, nhận thêm 10% Sức mạnh phép thuật trong 4 giây.'
      },
      Q: {
        name: 'Đạn Năng Lượng',
        icon: '⚡',
        desc: 'Bắn một quả cầu năng lượng ma pháp gây 150/210/270/330 (+65% AP) sát thương phép lên kẻ địch đầu tiên.',
        cd: [1.8, 1.5, 1.2, 0.9],
        mana: [40, 45, 50, 55],
        speed: 1050,
        range: 1200,
        radius: 12,
        damage: [150, 210, 270, 330]
      },
      W: {
        name: 'Hộ Thể Tinh Anh',
        icon: '🛡️',
        desc: 'Tạo lớp lá chắn ma thuật hấp thụ 220/310/400/500 (+60% AP) sát thương trong 4 giây.',
        cd: [6.0, 5.2, 4.4, 3.6],
        mana: [50, 55, 60, 65],
        shield: [220, 310, 400, 500]
      },
      E: {
        name: 'Tốc Biến Hư Không',
        icon: '✨',
        desc: 'Lập tức dịch chuyển tức thời 450 đơn vị về hướng chỉ định, vượt qua mọi chướng ngại vật và vách đá.',
        cd: [7.0, 6.2, 5.4, 4.5],
        mana: [45, 45, 45, 45],
        dashDist: 450
      },
      R: {
        name: 'Thiên Phạt Triệu Hồi',
        icon: '⚡',
        desc: 'Triệu hồi sấm sét giáng xuống đầu tất cả kẻ địch trong tầm 950 đơn vị, gây 400/600/800 (+90% AP) sát thương diện rộng.',
        cd: [35, 28, 22],
        mana: [100, 120, 140],
        damage: [400, 600, 800],
        range: 950
      }
    }
  },

  adc: {
    id: 'adc',
    name: 'Ashe',
    title: 'Xạ Thủ Băng Giá',
    role: 'Xạ Thủ',
    roleEn: 'Marksman',
    roleBadge: '🏹 XẠ THỦ',
    symbol: '🏹',
    avatarColor: '#388bfd',
    themeColor: '#58a6ff',
    description: 'Xạ thủ tầm bắn cực xa, sở hữu khả năng thả diều làm chậm vĩnh cửu và chiêu cuối mở giao tranh toàn bản đồ.',
    difficulty: 2,
    ratings: { damage: 95, defense: 30, mobility: 45 },
    baseStats: {
      hp: 1300,
      mana: 550,
      attackDamage: 88,
      abilityPower: 0,
      armor: 24,
      speed: 405,
      attackRange: 660,
      attackSpeed: 0.85,
      hpRegen: 10,
      manaRegen: 16
    },
    skills: {
      passive: {
        name: 'Băng Tiễn',
        icon: '❄️',
        desc: 'Mọi đòn đánh thường làm chậm mục tiêu 25% trong 1.5 giây và tăng thêm 15% tỉ lệ chí mạng nội tại.'
      },
      Q: {
        name: 'Tán Xạ Tiễn',
        icon: '🏹',
        desc: 'Bắn ra hình nón 7 mũi tên băng, mỗi mũi tên gây 130/180/230/280 (+70% AD) sát thương và làm chậm mục tiêu 35%.',
        cd: [3.5, 3.0, 2.5, 2.0],
        mana: [40, 45, 50, 55],
        speed: 1200,
        range: 1100,
        radius: 8,
        damage: [130, 180, 230, 280]
      },
      W: {
        name: 'Chú Tâm Tiễn',
        icon: '⚡',
        desc: 'Tập trung sức mạnh, nhận ngay +60/75/90/110% Tốc độ đánh và mỗi đòn đánh bắn kèm 2 mũi tên phụ trong 5 giây.',
        cd: [8.0, 7.0, 6.0, 5.0],
        mana: [50, 50, 50, 50],
        asBoost: [0.60, 0.75, 0.90, 1.10]
      },
      E: {
        name: 'Lướt Lùi Băng Giá',
        icon: '💨',
        desc: 'Lướt nhanh lùi lại 360 đơn vị và bắn một mũi tên băng làm choáng kẻ địch gần nhất trong 1.0 giây.',
        cd: [9.0, 8.0, 7.0, 6.0],
        mana: [50, 50, 50, 50],
        dashDist: 360
      },
      R: {
        name: 'Đại Băng Tiễn',
        icon: '👑',
        desc: 'Bắn một mũi tên pha lê băng khổng lồ bay xuyên bản đồ. Va chạm tướng địch đầu tiên gây 450/650/850 (+100% AD) sát thương và LÀM CHOÁNG 2.5 giây!',
        cd: [40, 32, 25],
        mana: [100, 110, 120],
        speed: 1400,
        range: 15000,
        radius: 26,
        damage: [450, 650, 850]
      }
    }
  },

  assassin: {
    id: 'assassin',
    name: 'Yasuo',
    title: 'Kiếm Khách Phong Lôi',
    role: 'Sát Thủ / Đấu Sĩ',
    roleEn: 'Assassin',
    roleBadge: '⚔️ SÁT THỦ',
    symbol: '⚔️',
    avatarColor: '#2ea043',
    themeColor: '#3fb950',
    description: 'Bậc thầy kiếm thuật lướt liên tục qua kẻ địch, tạo lốc xoáy hất tung và ngưng đọng trảm kích trên không.',
    difficulty: 3,
    ratings: { damage: 100, defense: 45, mobility: 95 },
    baseStats: {
      hp: 1450,
      mana: 400,
      attackDamage: 92,
      abilityPower: 0,
      armor: 32,
      speed: 430,
      attackRange: 210,
      attackSpeed: 0.8,
      hpRegen: 14,
      manaRegen: 10
    },
    skills: {
      passive: {
        name: 'Đạo Của Lãng Khách',
        icon: '🌪️',
        desc: 'Tỉ lệ chí mạng được nhân đôi (x2). Khi di chuyển tích tụ Phong Năng, đầy thanh sẽ tự động tạo khiên 200 HP.'
      },
      Q: {
        name: 'Bão Kiếm / Lốc Xoáy',
        icon: '🗡️',
        desc: 'Đâm kiếm tới trước gây 140/190/240/290 (+80% AD). Đòn đâm thứ 3 giải phóng Cơn Lốc Xoáy HẤT TUNG kẻ địch 1.2 giây!',
        cd: [1.6, 1.4, 1.2, 1.0],
        mana: [25, 25, 25, 25],
        speed: 1300,
        range: 650,
        tornadoRange: 1000,
        radius: 16,
        damage: [140, 190, 240, 290]
      },
      W: {
        name: 'Tường Gió Bất Bại',
        icon: '🛡️',
        desc: 'Dựng một bức tường gió phong ấn trước mặt trong 3.5 giây, ngăn chặn và tiêu biến toàn bộ đạn đạo của đối thủ.',
        cd: [12.0, 10.5, 9.0, 7.5],
        mana: [40, 40, 40, 40],
        duration: 3.5
      },
      E: {
        name: 'Quét Kiếm Xuyên Thấu',
        icon: '⚡',
        desc: 'Lướt xuyên qua một mục tiêu gây 100/140/180/220 (+40% AD) sát thương. Thời gian hồi chiêu cực ngắn (0.5s).',
        cd: [0.6, 0.5, 0.4, 0.3],
        mana: [15, 15, 15, 15],
        dashDist: 380,
        damage: [100, 140, 180, 220]
      },
      R: {
        name: 'Trăn Trối Tuyệt Kỹ',
        icon: '🌪️',
        desc: 'Lập tức tốc biến đến kẻ địch đang bị HẤT TUNG hoặc CHOÁNG, giữ chúng trên không thêm 1.5s và trảm 5 nhát cực mạnh gây 420/620/850 (+110% AD)!',
        cd: [30, 24, 18],
        mana: [80, 90, 100],
        damage: [420, 620, 850],
        range: 1200
      }
    }
  },

  tank: {
    id: 'tank',
    name: 'Malphite',
    title: 'Dũng Sĩ Nham Thạch',
    role: 'Đỡ Đòn / Tiên Phong',
    roleEn: 'Tank',
    roleBadge: '🗿 ĐỠ ĐÒN',
    symbol: '🗿',
    avatarColor: '#d29922',
    themeColor: '#f59e0b',
    description: 'Bức tường thành kiên cố không thể xuyên thủng, mở giao tranh thần tốc hất tung toàn bộ đội hình đối phương.',
    difficulty: 1,
    ratings: { damage: 60, defense: 100, mobility: 65 },
    baseStats: {
      hp: 1750,
      mana: 500,
      attackDamage: 82,
      abilityPower: 0,
      armor: 48,
      speed: 415,
      attackRange: 220,
      attackSpeed: 0.95,
      hpRegen: 20,
      manaRegen: 14
    },
    skills: {
      passive: {
        name: 'Giáp Hoa Cương',
        icon: '🪨',
        desc: 'Nếu không chịu sát thương trong 7 giây, nhận lớp lá chắn đá bằng 12% Máu tối đa. Nhận thêm +25% Giáp từ trang bị.'
      },
      Q: {
        name: 'Lăn Đá Nham Thạch',
        icon: '🥌',
        desc: 'Ném một đĩa đá nham thạch lăn tới mục tiêu gây 140/195/250/310 (+60% AP) sát thương, cướp 25% Tốc chạy của đối thủ trong 3 giây.',
        cd: [3.8, 3.3, 2.8, 2.3],
        mana: [45, 50, 55, 60],
        speed: 950,
        range: 850,
        radius: 14,
        damage: [140, 195, 250, 310]
      },
      W: {
        name: 'Nắm Đấm Sấm Sét',
        icon: '💥',
        desc: 'Kích hoạt tăng +30/40/50/60 Giáp và khiến các đòn đánh thường lan xung quanh trong 6 giây.',
        cd: [7.0, 6.2, 5.4, 4.6],
        mana: [40, 40, 40, 40],
        armorBoost: [30, 40, 50, 60]
      },
      E: {
        name: 'Dậm Đất Chấn Động',
        icon: '🌋',
        desc: 'Đập mạnh xuống mặt đất gây 130/180/230/280 (+40% Giáp) sát thương diện rộng và GIẢM 40% Tốc độ đánh của mọi kẻ địch trong 3 giây.',
        cd: [5.0, 4.4, 3.8, 3.2],
        mana: [45, 50, 55, 60],
        range: 350,
        damage: [130, 180, 230, 280]
      },
      R: {
        name: 'Không Thể Cản Phá',
        icon: '☄️',
        desc: 'Lao vút như một thiên thạch tới vị trí chỉ định với tốc độ thần sầu, HẤT TUNG toàn bộ kẻ địch trong phạm vi 360 đơn vị trong 1.5 giây và gây 400/600/820 (+80% AP)!',
        cd: [38, 30, 22],
        mana: [100, 110, 120],
        speed: 2200,
        range: 1200,
        radius: 360,
        damage: [400, 600, 820]
      }
    }
  }
};
