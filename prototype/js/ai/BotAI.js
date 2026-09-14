/**
 * OOP Bot AI Controller
 * Manages tactical decision making, laning, skillshots, kiting, retreat, combos, and item shopping
 */
class BotAI {
  constructor(hero) {
    this.hero = hero;
    this.decisionTimer = 0;
  }

  update(dt, game) {
    if (!this.hero.alive || this.hero.isPlayer) return;

    this.decisionTimer -= dt;

    // 1. Dodge Skillshot Projectiles
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
    this.decisionTimer = 0.22; // 4 - 5 decisions per second

    // Tự động mua sắm trang bị khi ở Bệ Đá Cổ
    if (this.hero.isInFountain()) {
      this.checkAndBuyItems(game);
    }

    // Tự động kích hoạt đồ phòng thủ khi máu thấp
    if (this.hero.hp / this.hero.maxHp < 0.40) {
      this.useDefensiveItems();
    }

    // 2. Low HP (< 30%) -> Retreat to Base Fountain
    if (this.hero.hp / this.hero.maxHp < 0.3) {
      const base = this.hero.team === 'blue' ? CONSTANTS.BLUE_BASE : CONSTANTS.RED_BASE;
      this.hero.targetX = base.x + (Math.random() * 200 - 100);
      this.hero.targetY = base.y + (Math.random() * 200 - 100);

      if (this.hero.cooldowns.W <= 0 && this.hero.skillRanks.W > 0) {
        this.hero.castShield(game.hud.addFloatingText.bind(game.hud));
      }
      return;
    }

    // 3. Scan for closest enemy hero
    const enemies = game.heroes.filter(h => h.team !== this.hero.team && h.alive);
    let closest = null;
    let minDist = 99999;

    for (let e of enemies) {
      const d = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }

    // 4. Combat & Kiting
    if (closest && minDist < 950) {
      this.hero.facingAngle = Math.atan2(closest.y - this.hero.y, closest.x - this.hero.x);

      if (minDist < 350) {
        const away = Math.atan2(this.hero.y - closest.y, this.hero.x - closest.x);
        this.hero.targetX = this.hero.x + Math.cos(away) * 180;
        this.hero.targetY = this.hero.y + Math.sin(away) * 180;
      } else if (minDist > 650) {
        this.hero.targetX = this.hero.x + (closest.x - this.hero.x) * 0.45;
        this.hero.targetY = this.hero.y + (closest.y - this.hero.y) * 0.45;
      }

      // Combo Execution
      if (closest.hp < 450 && this.hero.cooldowns.R <= 0 && this.hero.skillRanks.R > 0) {
        this.hero.castUltimate(game.heroes, game.towers, game.monsters, game.minions, game.hud.addFloatingText.bind(game.hud), game.onKillReward.bind(game));
      } else if (this.hero.cooldowns.Q <= 0 && this.hero.skillRanks.Q > 0) {
        const leadX = closest.x + (closest.targetX - closest.x) * 0.35;
        const leadY = closest.y + (closest.targetY - closest.y) * 0.35;
        this.hero.castSkillshot(leadX, leadY, game.projectiles, game.hud.addFloatingText.bind(game.hud));
      }
      return;
    }

    // 5. Patrol Lane Waypoint
    let waypoint = { x: CONSTANTS.CENTER_X, y: CONSTANTS.CENTER_Y };
    if (this.hero.lane === 'TOP') waypoint = { x: 2100, y: 2100 };
    else if (this.hero.lane === 'BOT') waypoint = { x: 12900, y: 12900 };

    const angle = Math.random() * Math.PI * 2;
    this.hero.targetX = waypoint.x + Math.cos(angle) * 450;
    this.hero.targetY = waypoint.y + Math.sin(angle) * 450;
  }

  checkAndBuyItems(game) {
    const buildType = this.hero.lane === 'MID' ? 'AP' : (this.hero.lane === 'TOP' ? 'TANK' : 'AD');
    const catalog = window.BOT_BUILD_PATHS || {};
    const path = catalog[buildType] || catalog.AD || [];
    const items = window.ITEMS || {};

    for (let itemId of path) {
      const alreadyHas = this.hero.inventory.some(s => s && s.id === itemId);
      if (!alreadyHas) {
        const itemDef = items[itemId];
        if (itemDef && this.hero.gold >= itemDef.cost) {
          const res = this.hero.buyItem(itemId);
          if (res.success) {
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
