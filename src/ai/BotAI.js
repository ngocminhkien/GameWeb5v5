import { CONSTANTS } from '../config/constants.js';
import { ITEMS, BOT_BUILD_PATHS } from '../config/items.js';
import { ROCK_WALLS } from '../config/terrain.js';

/**
 * Modular Bot AI Controller (Advanced Macro, Jungler, Combo Chaining, Survival Spells, Adaptive Shopping)
 */
export class BotAI {
  constructor(hero) {
    this.hero = hero;
    this.decisionTimer = 0;
  }

  update(dt, game) {
    if (!this.hero.alive || this.hero.isPlayer) return;

    this.decisionTimer -= dt;

    const floatText = game.addFloatingText ? game.addFloatingText.bind(game) : () => {};
    const clickWave = game.createClickWave ? game.createClickWave.bind(game) : () => {};
    const walls = ROCK_WALLS || [];

    // 1. Phản ứng né đạn kỹ năng
    if (game.projectiles) {
      for (let p of game.projectiles) {
        if (p.team !== this.hero.team && !p.isHoming) {
          const dist = Math.hypot(p.x - this.hero.x, p.y - this.hero.y);
          if (dist < 260) {
            const perpX = -p.vy;
            const perpY = p.vx;
            const len = Math.hypot(perpX, perpY);
            if (len > 0) {
              this.hero.targetX = this.hero.x + (perpX / len) * 200;
              this.hero.targetY = this.hero.y + (perpY / len) * 200;
              return;
            }
          }
        }
      }
    }

    if (this.decisionTimer > 0) return;
    this.decisionTimer = 0.20; // 5 lần / giây

    // Mua sắm trang bị khi ở Bệ Đá Cổ
    if (this.hero.isInFountain()) {
      this.checkAndBuyItems(game);
    }

    const hpPct = this.hero.hp / this.hero.maxHp;

    // Kích hoạt trang bị bảo vệ khi máu thấp
    if (hpPct < 0.40) {
      this.useDefensiveItems();
    }

    // Quét tìm tướng địch gần nhất
    const enemies = game.heroes.filter(h => h.team !== this.hero.team && h.alive);
    let closestEnemy = null;
    let minEnemyDist = 99999;
    for (let e of enemies) {
      const d = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
      if (d < minEnemyDist) {
        minEnemyDist = d;
        closestEnemy = e;
      }
    }

    // 2. SINH TỒN VÀ PHÉP BỔ TRỢ (FLASH / HEAL / BARRIER / IGNITE)
    // Tốc Biến khẩn cấp nếu máu < 22% và đang bị địch áp sát nguy hiểm
    if (hpPct < 0.22 && closestEnemy && minEnemyDist < 550 && this.hero.cooldowns.D === 0 && this.hero.spells && this.hero.spells.D === 'flash') {
      const awayAngle = Math.atan2(this.hero.y - closestEnemy.y, this.hero.x - closestEnemy.x);
      const flashX = this.hero.x + Math.cos(awayAngle) * 420;
      const flashY = this.hero.y + Math.sin(awayAngle) * 420;
      this.hero.castSummonerSpell('D', flashX, flashY, game.heroes, game.minions, game.monsters, walls, floatText, clickWave, game.projectiles);
    }

    // Hồi Máu / Lá Chắn khi máu < 35%
    if (hpPct < 0.35 && this.hero.cooldowns.F === 0 && this.hero.spells) {
      if (this.hero.spells.F === 'heal' || this.hero.spells.F === 'barrier') {
        this.hero.castSummonerSpell('F', this.hero.x, this.hero.y, game.heroes, game.minions, game.monsters, walls, floatText, clickWave, game.projectiles);
      }
    }

    // Thiêu Đốt kẻ địch yếu máu (< 30%) trong tầm 600px
    if (closestEnemy && closestEnemy.hp < 400 && minEnemyDist < 600 && this.hero.spells && this.hero.spells.F === 'ignite' && this.hero.cooldowns.F === 0) {
      this.hero.castSummonerSpell('F', closestEnemy.x, closestEnemy.y, game.heroes, game.minions, game.monsters, walls, floatText, clickWave, game.projectiles);
    }

    // Rút lui về Tế Đàn khi máu quá thấp (< 25%)
    if (hpPct < 0.25) {
      const base = this.hero.team === 'blue' ? CONSTANTS.BLUE_BASE : CONSTANTS.RED_BASE;
      this.hero.targetX = base.x + (Math.random() * 200 - 100);
      this.hero.targetY = base.y + (Math.random() * 200 - 100);
      if (this.hero.cooldowns.W === 0) {
        this.hero.castShield(floatText);
      }
      return;
    }

    // 3. COMBO CHAINING NÂNG CAO
    // A. Yasuo (assassin): Chém gió hất tung + Trảm Phong lướt R lập tức khi có kẻ địch bị hất tung!
    if (this.hero.championId === 'assassin' && this.hero.cooldowns.R === 0) {
      const airborneTarget = enemies.find(e => e.knockupTimer > 0 && Math.hypot(e.x - this.hero.x, e.y - this.hero.y) <= 1100);
      if (airborneTarget) {
        this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
          if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
        }, game.projectiles);
        return;
      }
    }

    // B. Malphite (tank): Không Thể Cản Phá (R) mở giao tranh khi địch gom cụm hoặc mục tiêu chủ lực yếu máu
    if (this.hero.championId === 'tank' && this.hero.cooldowns.R === 0) {
      for (let e of enemies) {
        const d = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
        if (d <= 800) {
          const groupedCount = enemies.filter(other => Math.hypot(other.x - e.x, other.y - e.y) < 320).length;
          if (groupedCount >= 2 || (e.hp / e.maxHp < 0.45 && (e.championId === 'adc' || e.championId === 'mage'))) {
            this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
              if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
            }, game.projectiles);
            return;
          }
        }
      }
    }

    // C. Ashe (adc): Bắn Đại Băng Tiễn (R) từ cự ly xa (550px - 1300px)
    if (this.hero.championId === 'adc' && this.hero.cooldowns.R === 0) {
      if (closestEnemy && minEnemyDist >= 550 && minEnemyDist <= 1300) {
        this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
          if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
        }, game.projectiles);
      }
    }

    // D. Lumina (support): Khúc Ca Tinh Vân (R) mở giao tranh hoặc giải cứu đồng minh
    if (this.hero.championId === 'support' && this.hero.cooldowns.R === 0) {
      const nearbyEnemies = enemies.filter(e => Math.hypot(e.x - this.hero.x, e.y - this.hero.y) <= 650);
      const lowAlly = allies.find(a => a.hp / a.maxHp < 0.40 && Math.hypot(a.x - this.hero.x, a.y - this.hero.y) <= 650);
      if (nearbyEnemies.length >= 2 || lowAlly) {
        this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
          if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
        }, game.projectiles);
      }
    }

    // E. Garen (fighter): Công Lý Demacia (R) kết liễu tướng địch yếu máu (< 35% HP)
    if (this.hero.championId === 'fighter' && this.hero.cooldowns.R === 0) {
      const executeTarget = enemies.find(e => (e.hp / e.maxHp) <= 0.35 && Math.hypot(e.x - this.hero.x, e.y - this.hero.y) <= 500);
      if (executeTarget) {
        this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
          if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
        }, game.projectiles);
      }
    }

    // 4. GIAO TRANH TƯỚNG ĐỊCH
    if (closestEnemy && minEnemyDist < 850) {
      this.hero.facingAngle = Math.atan2(closestEnemy.y - this.hero.y, closestEnemy.x - this.hero.x);

      // Kiting / Giữ cự ly
      if (this.hero.championId === 'adc' || this.hero.championId === 'mage' || this.hero.championId === 'support') {
        if (minEnemyDist < 380) {
          const away = Math.atan2(this.hero.y - closestEnemy.y, this.hero.x - closestEnemy.x);
          this.hero.targetX = this.hero.x + Math.cos(away) * 160;
          this.hero.targetY = this.hero.y + Math.sin(away) * 160;
        } else if (minEnemyDist > 600) {
          this.hero.targetX = this.hero.x + (closestEnemy.x - this.hero.x) * 0.4;
          this.hero.targetY = this.hero.y + (closestEnemy.y - this.hero.y) * 0.4;
        }
      } else {
        this.hero.targetX = closestEnemy.x;
        this.hero.targetY = closestEnemy.y;
      }

      // Kỹ năng Q & W & E & R
      if (this.hero.cooldowns.W === 0) {
        this.hero.castShield(floatText, game.heroes);
      }

      if (this.hero.cooldowns.Q === 0) {
        const leadX = closestEnemy.x + (closestEnemy.targetX - closestEnemy.x) * 0.3;
        const leadY = closestEnemy.y + (closestEnemy.targetY - closestEnemy.y) * 0.3;
        this.hero.castSkillshot(leadX, leadY, game.projectiles, floatText);
      }

      if (this.hero.cooldowns.E === 0) {
        if (this.hero.championId === 'fighter' && minEnemyDist <= 320) {
          this.hero.castDash(closestEnemy.x, closestEnemy.y, walls, floatText, enemies, allies);
        } else if (this.hero.championId === 'support') {
          const needHeal = allies.some(a => a.hp / a.maxHp < 0.70 && Math.hypot(a.x - this.hero.x, a.y - this.hero.y) <= 450) || (this.hero.hp / this.hero.maxHp < 0.70);
          if (needHeal) {
            this.hero.castDash(this.hero.x, this.hero.y, walls, floatText, enemies, allies);
          }
        }
      }

      if (this.hero.cooldowns.R === 0) {
        if (this.hero.championId === 'fighter') {
          if (closestEnemy.hp / closestEnemy.maxHp < 0.35 || closestEnemy.hp < 600) {
            this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
              if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
            }, game.projectiles);
          }
        } else if (this.hero.championId === 'support') {
          if (minEnemyDist <= 550) {
            this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, null, game.projectiles);
          }
        } else if (closestEnemy.hp < 450) {
          this.hero.castUltimate(game.heroes, game.towers, game.monsters, clickWave, floatText, (deadTarget, killer) => {
            if (game.distributeRewards) game.distributeRewards(deadTarget, killer, 300, 300);
          }, game.projectiles);
        }
      }

      this.hero.attackTarget = closestEnemy;
      return;
    }

    // 5. HÀNH VI ĐI RỪNG (JUNGLER MACRO & SMITE)
    if (this.hero.lane === 'JUNGLE') {
      this.handleJunglerBehavior(game, floatText, clickWave, walls);
      return;
    }

    // 6. ĐI ĐƯỜNG THEO LÀN (LANING)
    const enemyMinions = game.minions.filter(m => m.team !== this.hero.team && m.alive);
    let closestMinion = null;
    let minMinionDist = 99999;
    for (let m of enemyMinions) {
      const d = Math.hypot(m.x - this.hero.x, m.y - this.hero.y);
      if (d < minMinionDist) {
        minMinionDist = d;
        closestMinion = m;
      }
    }

    if (closestMinion && minMinionDist < 600) {
      this.hero.attackTarget = closestMinion;
      if (this.hero.cooldowns.Q === 0 && Math.random() < 0.3) {
        this.hero.castSkillshot(closestMinion.x, closestMinion.y, game.projectiles, floatText);
      }
      return;
    }

    // Tuần tra theo vị trí làn
    let waypoint = { x: CONSTANTS.CENTER_X, y: CONSTANTS.CENTER_Y };
    if (this.hero.lane === 'TOP') waypoint = { x: 2800, y: 2800 };
    else if (this.hero.lane === 'BOT') waypoint = { x: 12200, y: 12200 };

    const angle = Math.random() * Math.PI * 2;
    this.hero.targetX = waypoint.x + Math.cos(angle) * 450;
    this.hero.targetY = waypoint.y + Math.sin(angle) * 450;
    this.hero.attackTarget = null;
  }

  handleJunglerBehavior(game, floatText, clickWave, walls) {
    const isBlue = this.hero.team === 'blue';
    const smiteDmg = 600 + this.hero.level * 25;

    const aliveMonsters = game.monsters.filter(m => m.alive);

    let targetCamp = null;
    let minDist = 99999;
    for (let m of aliveMonsters) {
      const d = Math.hypot(m.x - this.hero.x, m.y - this.hero.y);
      const inHomeSide = isBlue ? m.y >= 6500 : m.y <= 8500;
      const weight = inHomeSide ? 1 : 1.5;
      if (d * weight < minDist) {
        minDist = d * weight;
        targetCamp = m;
      }
    }

    if (targetCamp) {
      const dist = Math.hypot(targetCamp.x - this.hero.x, targetCamp.y - this.hero.y);

      if (dist <= this.hero.range + 80) {
        this.hero.attackTarget = targetCamp;

        // Trừng Phạt (Smite) khi máu quái <= sát thương Smite
        if (targetCamp.hp <= smiteDmg && this.hero.cooldowns.F === 0 && this.hero.spells && this.hero.spells.F === 'smite') {
          this.hero.castSummonerSpell('F', targetCamp.x, targetCamp.y, game.heroes, game.minions, game.monsters, walls, floatText, clickWave, game.projectiles);
        }

        if (this.hero.cooldowns.Q === 0) {
          this.hero.castSkillshot(targetCamp.x, targetCamp.y, game.projectiles, floatText);
        }
        if (this.hero.cooldowns.W === 0) {
          this.hero.castShield(floatText);
        }
      } else {
        this.hero.targetX = targetCamp.x;
        this.hero.targetY = targetCamp.y;
        this.hero.attackTarget = null;
      }
      return;
    }

    // Nếu không còn quái rừng -> Gank đường MID
    const midPoint = { x: CONSTANTS.CENTER_X, y: CONSTANTS.CENTER_Y };
    this.hero.targetX = midPoint.x + (Math.random() * 600 - 300);
    this.hero.targetY = midPoint.y + (Math.random() * 600 - 300);
    this.hero.attackTarget = null;
  }

  checkAndBuyItems(game) {
    let buildType = 'AD';
    if (this.hero.lane === 'JUNGLE') buildType = 'JUNGLE';
    else if (this.hero.championId === 'support' || (this.hero.lane === 'BOT' && this.hero.championId !== 'adc')) buildType = 'SUPPORT';
    else if (this.hero.championId === 'fighter') buildType = 'FIGHTER';
    else if (this.hero.lane === 'MID' || this.hero.championId === 'mage') buildType = 'AP';
    else if (this.hero.lane === 'TOP' || this.hero.championId === 'tank') buildType = 'TANK';

    const path = BOT_BUILD_PATHS[buildType] || BOT_BUILD_PATHS.AD;

    for (let itemId of path) {
      const alreadyHas = this.hero.inventory.some(s => s && s.id === itemId);
      if (!alreadyHas) {
        const itemDef = ITEMS[itemId];
        if (itemDef && this.hero.gold >= itemDef.cost) {
          const res = this.hero.buyItem(itemId);
          if (res && res.success) {
            break;
          }
        }
      }
    }
  }

  useDefensiveItems() {
    for (let i = 0; i < 6; i++) {
      const slot = this.hero.inventory[i];
      if (slot) {
        this.hero.useActiveItem(i);
      }
    }
  }
}
