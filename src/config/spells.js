/**
 * SUMMONER SPELLS CONFIGURATION (5 Core MOBA Spells)
 */

export const SPELLS = {
  flash: {
    id: 'flash',
    name: 'Tốc Biến',
    nameEn: 'Flash',
    icon: '⚡',
    key: 'D',
    cooldown: 240, // 4 minutes
    range: 420,
    desc: 'Dịch chuyển tức thời nhân vật một khoảng 420 đơn vị về hướng con trỏ chuột, vượt qua mọi địa hình và vách đá.'
  },
  heal: {
    id: 'heal',
    name: 'Hồi Máu',
    nameEn: 'Heal',
    icon: '🩸',
    key: 'F',
    cooldown: 180, // 3 minutes
    desc: 'Hồi phục ngay lập tức 300 (+20 mỗi cấp) Máu và tăng 30% Tốc độ di chuyển trong 1.5 giây cho bản thân và 1 đồng minh gần nhất.'
  },
  smite: {
    id: 'smite',
    name: 'Trừng Phạt',
    nameEn: 'Smite',
    icon: '⚔️',
    key: 'F',
    cooldown: 60, // 1 minute
    range: 550,
    desc: 'Gây 650 (+35 mỗi cấp) sát thương chuẩn tức thời lên quái rừng hoặc lính đối phương. Đồng thời hồi phục 15% Máu tối đa của bản thân.'
  },
  ignite: {
    id: 'ignite',
    name: 'Thiêu Đốt',
    nameEn: 'Ignite',
    icon: '🔥',
    key: 'F',
    cooldown: 180,
    range: 600,
    desc: 'Thiêu đốt tướng địch chỉ định, gây 80 (+25 mỗi cấp) sát thương chuẩn trong 5 giây và áp dụng Vết Thương Sâu (giảm 50% khả năng hồi máu).'
  },
  barrier: {
    id: 'barrier',
    name: 'Lá Chắn',
    nameEn: 'Barrier',
    icon: '🛡️',
    key: 'F',
    cooldown: 150,
    desc: 'Bảo hộ bản thân với lớp lá chắn hấp thụ 350 (+25 mỗi cấp) sát thương nhận vào trong 2.5 giây.'
  }
};
