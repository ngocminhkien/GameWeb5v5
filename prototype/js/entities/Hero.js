/**
 * OOP Hero Class
 * Handles Leveling, Economy, Skills, Movement, Combat, and Visual Token Rendering
 */
class Hero extends Entity {
  constructor(config = {}) {
    super({
      id: config.id || 'hero',
      name: config.name || 'Hero',
      team: config.team || 'blue',
      x: config.x || 1200,
      y: config.y || 13800,
      radius: 32,
      maxHp: config.maxHp || 1400,
      color: config.team === 'blue' ? '#388bfd' : '#f85149',
      symbol: config.symbol || '⚔️',
      visionRadius: config.isPlayer ? 950 : 900
    });

    this.isPlayer = config.isPlayer || false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 420;
    this.facingAngle = 0;

    this.maxMana = config.maxMana || 700;
    this.mana = this.maxMana;
    this.shield = 0;
    this.hpRegen = 15;
    this.manaRegen = 22;
    this.respawnTimer = 0;

    // Skill Cooldowns
    this.cooldowns = { Q: 0, W: 0, E: 0, R: 0, B: 0 };
    this.maxCooldowns = {
      Q: SKILL_RANKS.Q.cd[0],
      W: SKILL_RANKS.W.cd[0],
      E: SKILL_RANKS.E.cd[0],
      R: SKILL_RANKS.R.cd[0],
      B: SKILL_RANKS.B.cd
    };

    // Progression & Economy (Levels 1 - 15)
    this.level = 1;
    this.exp = 0;
    this.maxExp = EXP_TABLE[1];
    this.gold = ECONOMY.INITIAL_GOLD;
    this.skillPoints = 1;
    this.skillRanks = { Q: 0, W: 0, E: 0, R: 0 };

    this.avatarColor = config.avatarColor || (this.team === 'blue' ? '#1f6feb' : '#da3633');
    this.lane = config.lane || 'MID';
    this.aiDecisionTimer = 0;

    // Combat & Auto-attack
    this.attackTarget = null;
    this.attackRange = 550;
    this.attackDamage = 85;
    this.attackCooldown = 0;
    this.attackSpeed = 0.9;

    // Auto-allocate first point for bot
    if (!this.isPlayer) {
      this.autoUpgradeBotSkill();
    }
  }

  // ================= PROGRESSION & ECONOMY =================
  addExp(amount, onLevelUp = null, addFloatingText = null) {
    if (this.level >= MAX_LEVEL) return;
    this.exp += amount;

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`+${Math.round(amount)} EXP`, this.x + (Math.random() * 24 - 12), this.y - 48, '#a371f7');
    }

    while (this.level < MAX_LEVEL && this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level++;
      this.skillPoints++;

      // Stat Growth
      this.maxHp += STAT_GROWTH.hp;
      this.hp = Math.min(this.maxHp, this.hp + STAT_GROWTH.hp);
      this.maxMana += STAT_GROWTH.mana;
      this.mana = Math.min(this.maxMana, this.mana + STAT_GROWTH.mana);
      this.attackDamage += STAT_GROWTH.attackDamage;
      this.hpRegen += STAT_GROWTH.hpRegen;
      this.manaRegen += STAT_GROWTH.manaRegen;

      this.maxExp = this.level < MAX_LEVEL ? EXP_TABLE[this.level] : 0;

      if (!this.isPlayer) {
        this.autoUpgradeBotSkill();
      } else if (onLevelUp) {
        onLevelUp(this.level);
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
    const info = SKILL_RANKS[slot];
    if (!info) return false;
    const currentRank = this.skillRanks[slot];
    if (currentRank >= info.maxRank) return false;

    if (slot === 'R') {
      const req = info.reqLevel[currentRank];
      if (this.level < req) return false;
    }
    return true;
  }

  upgradeSkill(slot, addFloatingText = null) {
    if (!this.canUpgradeSkill(slot)) return false;
    this.skillPoints--;
    this.skillRanks[slot]++;
    const newRank = this.skillRanks[slot];
    const info = SKILL_RANKS[slot];
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
    for (let s of ['Q', 'W', 'E']) {
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

  die(killer = null) {
    this.alive = false;
    this.respawnTimer = 7.0;
  }

  // ================= SKILLS =================
  castSkillshot(targetX, targetY, projectiles, addFloatingText = null) {
    if (this.skillRanks.Q <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu Q! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.Q - 1;
    const cfg = SKILL_RANKS.Q;
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
      rangeLeft: range,
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
    const cfg = SKILL_RANKS.W;
    const manaCost = cfg.mana[rankIdx];
    const shield = cfg.shield[rankIdx];
    const speedBoost = cfg.speedBoost[rankIdx];
    const duration = cfg.duration[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.W > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.W = cd;

    this.shield = shield;
    const originalSpeed = this.speed;
    this.speed = speedBoost;
    if (addFloatingText) addFloatingText(`🛡️ HỘ THỂ (+${shield} Giáp)`, this.x, this.y - 35, '#58a6ff');

    setTimeout(() => {
      this.speed = originalSpeed;
      this.shield = 0;
    }, duration * 1000);
  }

  castDash(targetX, targetY, rockWalls, addFloatingText = null) {
    if (this.skillRanks.E <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu E! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.E - 1;
    const cfg = SKILL_RANKS.E;
    const manaCost = cfg.mana[rankIdx];
    const distance = cfg.distance[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.E > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.E = cd;

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.x += Math.cos(angle) * distance;
    this.y += Math.sin(angle) * distance;

    // Resolve wall collisions
    if (window.resolveWallCollisions) {
      window.resolveWallCollisions(this);
    }
    this.targetX = this.x;
    this.targetY = this.y;
    if (addFloatingText) addFloatingText(`⚡ TỐC BIẾN (${distance}px)`, this.x, this.y - 35, '#e3b341');
  }

  castUltimate(heroes, towers, monsters, minions, addFloatingText = null, onKill = null) {
    if (this.skillRanks.R <= 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Chưa học chiêu R (Cần cấp 4)!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.R - 1;
    const cfg = SKILL_RANKS.R;
    const manaCost = cfg.mana[rankIdx];
    const damage = cfg.damage[rankIdx];
    const radius = cfg.radius[rankIdx];
    const cd = cfg.cd[rankIdx];

    if (this.cooldowns.R > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.R = cd;

    // Hit enemy heroes
    for (let h of heroes) {
      if (h.team !== this.team && h.alive && Math.hypot(h.x - this.x, h.y - this.y) <= radius) {
        const wasAlive = h.alive;
        h.takeDamage(damage, this, addFloatingText);
        if (wasAlive && !h.alive && onKill) onKill(h, this);
      }
    }
    // Hit enemy towers
    for (let tw of towers) {
      if (tw.team !== this.team && tw.alive && Math.hypot(tw.x - this.x, tw.y - this.y) <= radius) {
        const wasAlive = tw.alive;
        tw.takeDamage(damage - 60, this);
        if (wasAlive && !tw.alive && onKill) onKill(tw, this);
      }
    }
    // Hit monsters
    for (let m of monsters) {
      if (m.alive && Math.hypot(m.x - this.x, m.y - this.y) <= radius) {
        const wasAlive = m.alive;
        m.takeDamage(damage, this, addFloatingText);
        if (wasAlive && !m.alive && onKill) onKill(m, this);
      }
    }
    // Hit enemy minions
    for (let m of minions) {
      if (m.alive && m.team !== this.team && Math.hypot(m.x - this.x, m.y - this.y) <= radius) {
        const wasAlive = m.alive;
        m.takeDamage(damage, this, addFloatingText);
        if (wasAlive && !m.alive && onKill) onKill(m, this);
      }
    }

    if (addFloatingText) addFloatingText(`💥 THIÊN PHẠT ${damage}!`, this.x, this.y - 40, '#ff7b72');
  }

  recall(addFloatingText = null) {
    if (this.cooldowns.B > 0 || !this.alive) return;
    this.cooldowns.B = 4.0;
    if (addFloatingText) addFloatingText('🌀 ĐANG BIẾN VỀ (4s)...', this.x, this.y - 35, '#388bfd');

    setTimeout(() => {
      if (this.alive) {
        this.x = this.team === 'blue' ? 1200 : 13800;
        this.y = this.team === 'blue' ? 13800 : 1200;
        this.targetX = this.x;
        this.targetY = this.y;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        if (addFloatingText) addFloatingText('✨ ĐÃ VỀ TẾ ĐÀN (HỒI ĐẦY MÁU)', this.x, this.y - 45, '#3fb950');
      }
    }, 4000);
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
      rangeLeft: this.attackRange + 300,
      team: this.team,
      damage: this.attackDamage,
      color: this.team === 'blue' ? '#58a6ff' : '#f85149',
      owner: this,
      isHoming: true,
      target: target,
      speed: 950
    }));
  }

  // ================= UPDATE & MOVEMENT =================
  update(dt, rockWalls, bushes, projectiles) {
    // Respawn countdown
    if (!this.alive) {
      if (this.respawnTimer > 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.alive = true;
          this.hp = this.maxHp;
          this.mana = this.maxMana;
          this.x = this.team === 'blue' ? 1200 : 13800;
          this.y = this.team === 'blue' ? 13800 : 1200;
          this.targetX = this.x;
          this.targetY = this.y;
          this.attackTarget = null;
        }
      }
      return;
    }

    // Regens
    if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * dt);
    if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);

    // Skill cooldowns
    for (let k in this.cooldowns) {
      if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Bush stealth check
    this.inBush = false;
    if (bushes) {
      for (let b of bushes) {
        if (Math.hypot(b.x - this.x, b.y - this.y) <= b.r) {
          this.inBush = true;
          break;
        }
      }
    }

    // Target locked basic attack
    if (this.attackTarget) {
      if (!this.attackTarget.alive) {
        this.attackTarget = null;
      } else {
        const distToTarget = Math.hypot(this.attackTarget.x - this.x, this.attackTarget.y - this.y);
        if (distToTarget <= this.attackRange) {
          this.targetX = this.x;
          this.targetY = this.y;
          if (this.attackCooldown <= 0 && projectiles) {
            this.attackCooldown = this.attackSpeed;
            this.fireBasicAttack(this.attackTarget, projectiles);
          }
        } else {
          this.targetX = this.attackTarget.x;
          this.targetY = this.attackTarget.y;
        }
      }
    }

    // Movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      this.facingAngle = Math.atan2(dy, dx);
      const step = Math.min(dist, this.speed * dt);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }

    // Terrain Collision
    if (window.resolveWallCollisions) {
      window.resolveWallCollisions(this);
    }
  }

  // ================= RENDERING =================
  draw(ctx, camera, mouse = null) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (!this.alive) {
      ctx.save();
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.fillText(`💀 Hồi sinh sau: ${Math.ceil(this.respawnTimer)}s`, screenX, screenY);
      ctx.restore();
      return;
    }

    ctx.save();
    if (this.inBush) {
      ctx.globalAlpha = 0.55;
    }

    // Shield Aura
    if (this.shield > 0) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
    }

    // HP Outer Ring
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

    // Mana Outer Ring
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

    // Avatar Core
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

    // Aim Indicator
    const aimAngle = (this.isPlayer && mouse)
      ? Math.atan2(mouse.worldY - this.y, mouse.worldX - this.x)
      : this.facingAngle;

    const tipX = screenX + Math.cos(aimAngle) * (this.radius + 20);
    const tipY = screenY + Math.sin(aimAngle) * (this.radius + 20);
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? '#79c0ff' : '#ffa198';
    ctx.fill();

    // Level Badge on Token
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

    // Name
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
    const t = this.attackTarget;
    if (!t || !t.alive) return;
    const tx = t.x - camera.x;
    const ty = t.y - camera.y;
    const r = t.radius + 12;

    ctx.save();
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.stroke();

    const crossLen = 8;
    ctx.beginPath();
    ctx.moveTo(tx - r - crossLen, ty); ctx.lineTo(tx - r + 2, ty);
    ctx.moveTo(tx + r - 2, ty); ctx.lineTo(tx + r + crossLen, ty);
    ctx.moveTo(tx, ty - r - crossLen); ctx.lineTo(tx, ty - r + 2);
    ctx.moveTo(tx, ty + r - 2); ctx.lineTo(tx, ty + r + crossLen);
    ctx.stroke();
    ctx.restore();
  }
}
