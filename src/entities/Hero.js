import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { CONSTANTS } from '../config/constants.js';

/**
 * Hero Token Class (Inner circle avatar + Outer HP/Mana arcs)
 */
export class Hero extends Entity {
  constructor(config = {}) {
    super(config);
    this.radius = CONSTANTS.HERO_RADIUS;
    this.isPlayer = config.isPlayer || false;

    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = CONSTANTS.HERO_SPEED;
    this.facingAngle = 0;

    this.maxHp = config.hp || CONSTANTS.HERO_MAX_HP;
    this.hp = this.maxHp;
    this.maxMana = config.mana || CONSTANTS.HERO_MAX_MANA;
    this.mana = this.maxMana;
    this.shield = 0;
    this.hpRegen = CONSTANTS.HP_REGEN;
    this.manaRegen = CONSTANTS.MANA_REGEN;

    // Skill cooldowns
    this.cooldowns = { Q: 0, W: 0, E: 0, R: 0, B: 0 };
    this.maxCooldowns = {
      Q: CONSTANTS.SKILL_RANKS.Q.cd[0],
      W: CONSTANTS.SKILL_RANKS.W.cd[0],
      E: CONSTANTS.SKILL_RANKS.E.cd[0],
      R: CONSTANTS.SKILL_RANKS.R.cd[0],
      B: CONSTANTS.SKILL_RANKS.B.cd
    };

    // Progression & Economy (Level 1 to 15)
    this.level = 1;
    this.exp = 0;
    this.maxExp = CONSTANTS.EXP_TABLE[1];
    this.gold = CONSTANTS.ECONOMY.INITIAL_GOLD;
    this.skillPoints = 1;
    this.skillRanks = { Q: 0, W: 0, E: 0, R: 0 };

    this.respawnTimer = 0;
    this.inBush = false;
    this.avatarColor = config.avatarColor || '#388bfd';
    this.symbol = config.symbol || '⚔️';

    this.lane = config.lane || 'MID';
    this.visionRadius = this.isPlayer ? 950 : 900;
    this.attackTarget = null;
    this.attackRange = 550;
    this.attackDamage = 85;
    this.attackCooldown = 0;
    this.attackSpeed = 0.9;

    if (!this.isPlayer) {
      this.autoUpgradeBotSkill();
    }
  }

  // ================= PROGRESSION & ECONOMY =================
  addExp(amount, onLevelUp = null, addFloatingText = null) {
    if (this.level >= CONSTANTS.MAX_LEVEL) return;
    this.exp += amount;

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`+${Math.round(amount)} EXP`, this.x + (Math.random() * 24 - 12), this.y - 48, '#a371f7');
    }

    while (this.level < CONSTANTS.MAX_LEVEL && this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level++;
      this.skillPoints++;

      // Tăng chỉ số cơ bản
      const growth = CONSTANTS.STAT_GROWTH;
      this.maxHp += growth.hp;
      this.hp = Math.min(this.maxHp, this.hp + growth.hp);
      this.maxMana += growth.mana;
      this.mana = Math.min(this.maxMana, this.mana + growth.mana);
      this.attackDamage += growth.attackDamage;
      this.hpRegen += growth.hpRegen;
      this.manaRegen += growth.manaRegen;

      this.maxExp = this.level < CONSTANTS.MAX_LEVEL ? CONSTANTS.EXP_TABLE[this.level] : 0;

      // Tự động nâng chiêu cho Bot AI
      if (!this.isPlayer) {
        this.autoUpgradeBotSkill();
      }

      if (addFloatingText) {
        addFloatingText(`🌟 CẤP ĐỘ ${this.level}!`, this.x, this.y - 55, '#ffd700');
      }

      if (onLevelUp) {
        onLevelUp(this);
      }
    }
  }

  addGold(amount, addFloatingText = null) {
    this.gold += amount;
    if (this.isPlayer && addFloatingText) {
      addFloatingText(`+${Math.round(amount)} 💰`, this.x + (Math.random() * 24 - 12), this.y - 32, '#ffd700');
    }
  }

  canUpgradeSkill(slot) {
    if (this.skillPoints <= 0) return false;
    const info = CONSTANTS.SKILL_RANKS[slot];
    if (!info) return false;
    const currentRank = this.skillRanks[slot];
    if (currentRank >= info.maxRank) return false;

    // Chiêu cuối R yêu cầu cấp 4, 8, 12
    if (slot === 'R') {
      const requiredLevel = info.reqLevel[currentRank];
      if (this.level < requiredLevel) return false;
    }
    return true;
  }

  upgradeSkill(slot, addFloatingText = null) {
    if (!this.canUpgradeSkill(slot)) return false;
    this.skillPoints--;
    this.skillRanks[slot]++;
    const newRank = this.skillRanks[slot];
    const info = CONSTANTS.SKILL_RANKS[slot];
    this.maxCooldowns[slot] = info.cd[newRank - 1];

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`✨ NÂNG CẤP ${slot} (CẤP ${newRank})!`, this.x, this.y - 42, '#388bfd');
    }
    return true;
  }

  autoUpgradeBotSkill() {
    if (this.canUpgradeSkill('R')) {
      this.upgradeSkill('R');
      return;
    }
    const basic = ['Q', 'W', 'E'];
    for (let s of basic) {
      if (this.canUpgradeSkill(s)) {
        this.upgradeSkill(s);
        return;
      }
    }
  }

  takeDamage(amount, source = null, addFloatingText = null) {
    if (!this.alive) return;

    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        if (addFloatingText) addFloatingText(`🛡️ -${Math.round(amount)}`, this.x, this.y - 25, '#58a6ff');
        return;
      } else {
        amount -= this.shield;
        this.shield = 0;
      }
    }

    this.hp -= amount;
    if (addFloatingText) {
      addFloatingText(`-${Math.round(amount)}`, this.x + (Math.random() * 28 - 14), this.y - 32, this.team === 'blue' ? '#f85149' : '#fff');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.die(source);
    }
  }

  die(killer = null, onAnnounce = null, particles = null) {
    super.die(killer);
    this.respawnTimer = CONSTANTS.RESPAWN_TIME;

    if (onAnnounce) {
      onAnnounce(`${this.name} đã bị hạ gục!`);
    }

    if (particles) {
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: this.x,
          y: this.y,
          vx: (Math.random() - 0.5) * 300,
          vy: (Math.random() - 0.5) * 300,
          radius: Math.random() * 6 + 2,
          color: this.team === 'blue' ? '#388bfd' : '#f85149',
          alpha: 1,
          life: 40
        });
      }
    }
  }

  respawn() {
    this.alive = true;
    this.hp = this.maxHp;
    this.mana = this.maxMana;
    this.shield = 0;
    const base = this.team === 'blue' ? CONSTANTS.BLUE_BASE : CONSTANTS.RED_BASE;
    this.x = base.x + (Math.random() * 200 - 100);
    this.y = base.y + (Math.random() * 200 - 100);
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, rockWalls, bushes, projectiles = null) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.respawn();
      return;
    }

    // Regen
    if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + (this.hpRegen || CONSTANTS.HP_REGEN) * dt);
    if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + (this.manaRegen || CONSTANTS.MANA_REGEN) * dt);

    // Cooldowns
    for (let s in this.cooldowns) {
      if (this.cooldowns[s] > 0) this.cooldowns[s] = Math.max(0, this.cooldowns[s] - dt);
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Basic Attack Targeting & Homing Execution
    if (this.attackTarget) {
      if (!this.attackTarget.alive) {
        this.attackTarget = null;
      } else {
        const d = Math.hypot(this.attackTarget.x - this.x, this.attackTarget.y - this.y);
        const threshold = this.attackRange + (this.attackTarget.radius || 0);

        if (d > threshold) {
          // Pursue target into range
          this.targetX = this.attackTarget.x;
          this.targetY = this.attackTarget.y;
        } else {
          // In range -> hold position and aim at target
          this.targetX = this.x;
          this.targetY = this.y;
          this.facingAngle = Math.atan2(this.attackTarget.y - this.y, this.attackTarget.x - this.x);

          if (this.attackCooldown <= 0 && projectiles) {
            this.attackCooldown = this.attackSpeed;
            this.fireBasicAttack(this.attackTarget, projectiles);
          }
        }
      }
    }

    // Movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      const step = this.speed * dt;
      if (step >= dist) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
      this.facingAngle = Math.atan2(dy, dx);
    }

    // Wall collision
    this.resolveWalls(rockWalls);

    // Bush detection
    this.inBush = false;
    for (let b of bushes) {
      if (Math.hypot(this.x - b.x, this.y - b.y) <= b.r) {
        this.inBush = true;
        break;
      }
    }

    // Map bounds
    this.x = Math.max(100, Math.min(CONSTANTS.MAP_WIDTH - 100, this.x));
    this.y = Math.max(100, Math.min(CONSTANTS.MAP_HEIGHT - 100, this.y));
  }

  fireBasicAttack(target, projectiles) {
    if (!target || !target.alive) return;
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    this.facingAngle = angle;
    projectiles.push(new Projectile({
      x: this.x + Math.cos(angle) * (this.radius + 8),
      y: this.y + Math.sin(angle) * (this.radius + 8),
      vx: Math.cos(angle) * 950,
      vy: Math.sin(angle) * 950,
      radius: 10,
      range: this.attackRange + 300,
      team: this.team,
      damage: this.attackDamage,
      color: this.team === 'blue' ? '#58a6ff' : '#f85149',
      owner: this,
      isBasicAttack: true,
      isHoming: true,
      target: target,
      speed: 950
    }));
  }

  resolveWalls(walls) {
    for (let w of walls) {
      const closestX = Math.max(w.x, Math.min(this.x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(this.y, w.y + w.h));
      const dx = this.x - closestX;
      const dy = this.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < this.radius) {
        const overlap = this.radius - dist;
        if (dist > 0.001) {
          this.x += (dx / dist) * overlap;
          this.y += (dy / dist) * overlap;
        } else {
          this.x += overlap;
        }
      }
    }
  }

  // ================= SKILLS =================
  castSkillshot(targetX, targetY, projectiles, addFloatingText = null) {
    if (this.skillRanks.Q <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu Q! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.Q - 1;
    const cfg = CONSTANTS.SKILL_RANKS.Q;
    const manaCost = cfg.mana[rankIdx];
    const damage = cfg.damage[rankIdx];
    const cd = cfg.cd[rankIdx];
    const speed = cfg.speed[rankIdx];
    const range = cfg.range[rankIdx];

    if (this.cooldowns.Q > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.Q = cd;

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    projectiles.push(new Projectile({
      x: this.x + Math.cos(angle) * (this.radius + 8),
      y: this.y + Math.sin(angle) * (this.radius + 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: cfg.radius,
      range: range,
      team: this.team,
      damage: damage,
      color: this.team === 'blue' ? '#388bfd' : '#f85149',
      owner: this
    }));
  }

  castShield(addFloatingText = null) {
    if (this.skillRanks.W <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu W! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.W - 1;
    const cfg = CONSTANTS.SKILL_RANKS.W;
    const manaCost = cfg.mana[rankIdx];
    const shield = cfg.shield[rankIdx];
    const speedBoost = cfg.speedBoost[rankIdx];
    const duration = cfg.duration[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.W > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.W = cd;
    this.shield = shield;
    this.speed = speedBoost;
    setTimeout(() => { this.speed = CONSTANTS.HERO_SPEED; }, duration * 1000);
    if (addFloatingText) addFloatingText(`🛡️ HỘ THỂ +${shield}!`, this.x, this.y - 35, '#58a6ff');
  }

  castDash(targetX, targetY, rockWalls, addFloatingText = null) {
    if (this.skillRanks.E <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu E! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.E - 1;
    const cfg = CONSTANTS.SKILL_RANKS.E;
    const manaCost = cfg.mana[rankIdx];
    const distance = cfg.distance[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.E > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.E = cd;

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.x += Math.cos(angle) * distance;
    this.y += Math.sin(angle) * distance;
    this.resolveWalls(rockWalls);
    this.targetX = this.x;
    this.targetY = this.y;
    if (addFloatingText) addFloatingText(`⚡ TỐC BIẾN (${distance}px)`, this.x, this.y - 35, '#e3b341');
  }

  castUltimate(heroes, towers, monsters, createClickWave = null, addFloatingText = null, onKill = null) {
    if (this.skillRanks.R <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu R (Cần cấp 4)!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.R - 1;
    const cfg = CONSTANTS.SKILL_RANKS.R;
    const manaCost = cfg.mana[rankIdx];
    const damage = cfg.damage[rankIdx];
    const radius = cfg.radius[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.R > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.R = cd;

    // Hit enemies
    for (let h of heroes) {
      if (h.team !== this.team && h.alive && this.distanceTo(h) <= radius) {
        const wasAlive = h.alive;
        h.takeDamage(damage, this, addFloatingText);
        if (wasAlive && !h.alive && onKill) {
          onKill(h, this);
        }
      }
    }
    // Hit towers
    for (let tw of towers) {
      if (tw.team !== this.team && tw.alive && this.distanceTo(tw) <= radius) {
        const wasAlive = tw.alive;
        tw.takeDamage(damage - 60);
        if (wasAlive && !tw.alive && onKill) {
          onKill(tw, this);
        }
      }
    }
    // Hit monsters
    for (let m of monsters) {
      if (m.alive && this.distanceTo(m) <= radius) {
        const wasAlive = m.alive;
        m.takeDamage(damage, this);
        if (wasAlive && !m.alive && onKill) {
          onKill(m, this);
        }
      }
    }

    if (createClickWave) createClickWave(this.x, this.y, this.team === 'blue' ? '#58a6ff' : '#f85149');
    if (addFloatingText) addFloatingText(`💥 THIÊN PHẠT ${damage}!`, this.x, this.y - 40, '#ff7b72');
  }

  recall(addFloatingText = null) {
    if (this.cooldowns.B > 0) return;
    this.cooldowns.B = this.maxCooldowns.B;
    if (addFloatingText) addFloatingText('✨ Đang biến về...', this.x, this.y - 35, '#79c0ff');

    setTimeout(() => {
      if (this.alive) {
        const base = this.team === 'blue' ? CONSTANTS.BLUE_BASE : CONSTANTS.RED_BASE;
        this.x = base.x;
        this.y = base.y;
        this.targetX = this.x;
        this.targetY = this.y;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        if (addFloatingText) addFloatingText('❤️ Đã hồi phục!', this.x, this.y - 35, '#3fb950');
      }
    }, CONSTANTS.SKILLS.B.castTime * 1000);
  }

  // ================= TOKEN RENDERING =================
  draw(ctx, camera, mouse) {
    if (!this.alive) return;

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    ctx.save();
    if (this.inBush) ctx.globalAlpha = 0.55;

    // Shield Aura
    if (this.shield > 0) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
    }

    // Outer Ring 1: HP Arc
    const hpRingRadius = this.radius + 7;
    ctx.beginPath();
    ctx.arc(screenX, screenY, hpRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(18, 22, 28, 0.85)';
    ctx.lineWidth = 5.5;
    ctx.stroke();

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    const hpColor = this.team === 'blue' ? '#3fb950' : '#f85149';
    ctx.beginPath();
    ctx.arc(screenX, screenY, hpRingRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = hpColor;
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Outer Ring 2: Mana Arc
    const manaRingRadius = this.radius + 14.5;
    ctx.beginPath();
    ctx.arc(screenX, screenY, manaRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10, 20, 35, 0.75)';
    ctx.lineWidth = 4;
    ctx.stroke();

    const manaRatio = Math.max(0, this.mana / this.maxMana);
    ctx.beginPath();
    ctx.arc(screenX, screenY, manaRingRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * manaRatio);
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Central Core & Avatar
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.avatarColor;
    ctx.fill();
    ctx.strokeStyle = this.team === 'blue' ? '#58a6ff' : '#ff7b72';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, screenX, screenY);

    // Direction pointer
    const aimAngle = this.isPlayer && mouse
      ? Math.atan2(mouse.worldY - this.y, mouse.worldX - this.x)
      : this.facingAngle;

    const tipX = screenX + Math.cos(aimAngle) * (this.radius + 20);
    const tipY = screenY + Math.sin(aimAngle) * (this.radius + 20);

    ctx.beginPath();
    ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? '#79c0ff' : '#ffa198';
    ctx.fill();

    // Level badge on token
    const badgeX = screenX + this.radius - 4;
    const badgeY = screenY + this.radius - 4;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1117';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(this.level, badgeX, badgeY);

    // Name tag
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText(this.name, screenX, screenY - this.radius - 20);

    ctx.restore();

    if (this.isPlayer && this.attackTarget && this.attackTarget.alive) {
      this.drawTargetReticle(ctx, camera);
    }
  }

  drawTargetReticle(ctx, camera) {
    if (!this.attackTarget || !this.attackTarget.alive) return;
    const sx = this.attackTarget.x - camera.x;
    const sy = this.attackTarget.y - camera.y;
    const r = (this.attackTarget.radius || 30) + 12;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();

    const marks = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    marks.forEach(a => {
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (r - 6), sy + Math.sin(a) * (r - 6));
      ctx.lineTo(sx + Math.cos(a) * (r + 6), sy + Math.sin(a) * (r + 6));
      ctx.strokeStyle = '#ff7b72';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
    ctx.restore();
  }
}
