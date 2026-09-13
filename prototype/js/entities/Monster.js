/**
 * OOP Neutral Monster Class
 * Handles Jungle Camps, Epic Bosses (Baron & Dragon), Leashing, and Buffs
 */
class Monster extends Entity {
  constructor(config = {}) {
    super({
      id: config.id,
      name: config.name || 'Quái Rừng',
      team: 'neutral',
      x: config.x || 0,
      y: config.y || 0,
      radius: config.radius || 35,
      maxHp: config.hp || 2000,
      color: config.color || '#e3b341',
      symbol: config.symbol || '👾',
      visionRadius: 500
    });

    this.spawnX = config.x;
    this.spawnY = config.y;
    this.damage = config.damage || 85;
    this.speed = 280;
    this.isEpicBoss = config.isEpicBoss || false;
    this.buffType = config.buffType || null; // 'red', 'blue', 'dragon', 'baron'

    this.target = null;
    this.attackCooldown = 0;
    this.leashRadius = config.isEpicBoss ? 800 : 650;
  }

  takeDamage(amount, source = null, addFloatingText = null) {
    if (!this.alive) return 0;
    this.hp -= amount;
    if (addFloatingText) {
      addFloatingText(`-${Math.round(amount)}`, this.x, this.y - 30, '#fff');
    }

    if (source && source.alive) {
      this.target = source;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.die(source);
    }
    return amount;
  }

  die(killer = null, addFloatingText = null, announce = null, distributeRewards = null) {
    this.alive = false;
    const teamName = killer ? (killer.team === 'blue' ? 'Đội Xanh' : 'Đội Đỏ') : '';
    if (announce) {
      announce(`🏆 ${killer ? killer.name : 'Ai đó'} (${teamName}) đã hạ gục ${this.name}!`);
    }

    // Distribute Rewards
    if (distributeRewards) {
      let b = BOUNTIES.MONSTER_SMALL;
      if (this.buffType === 'dragon') b = BOUNTIES.MONSTER_DRAGON;
      else if (this.buffType === 'baron') b = BOUNTIES.MONSTER_BARON;
      else if (this.buffType) b = BOUNTIES.MONSTER_BUFF;
      distributeRewards(this, killer, b.exp, b.gold, b.teamExp || 0, b.teamGold || 0);
    }

    // Buff Application
    if (killer) {
      if (this.buffType === 'dragon' && announce) {
        announce('🔥 ĐỘI NHẬN ĐƯỢC BÙA RỒNG LỬA (+20% Sát Thương Toàn Đội)!');
      } else if (this.buffType === 'baron' && announce) {
        announce('👑 ĐỘI NHẬN ĐƯỢC BÙA BARON (Siêu Cường Hóa Máu & Hộ Thể)!');
      } else if (this.buffType === 'red' && addFloatingText) {
        addFloatingText('🔥 BÙA ĐỎ HỒI PHỤC', killer.x, killer.y - 45, '#ff7b72');
      } else if (this.buffType === 'blue' && addFloatingText) {
        addFloatingText('💧 BÙA XANH NĂNG LƯỢNG', killer.x, killer.y - 45, '#79c0ff');
      }
    }

    // Respawn Timer (45s camps, 2 mins boss)
    const respawnTime = this.isEpicBoss ? 120000 : 45000;
    setTimeout(() => {
      this.alive = true;
      this.hp = this.maxHp;
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.target = null;
      if (announce) announce(`✨ ${this.name} đã tái sinh trên đại bản đồ!`);
    }, respawnTime);
  }

  update(dt) {
    if (!this.alive) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.target && this.target.alive) {
      const distFromSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
      const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);

      // Leash limit
      if (distFromSpawn > this.leashRadius) {
        this.target = null;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.3);
      } else {
        // Combat / Pursuit
        if (distToTarget <= this.radius + this.target.radius + 30) {
          if (this.attackCooldown <= 0) {
            this.attackCooldown = 1.3;
            this.target.takeDamage(this.damage, this);
          }
        } else {
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          this.x += (dx / distToTarget) * this.speed * dt;
          this.y += (dy / distToTarget) * this.speed * dt;
        }
      }
    } else {
      // Return to camp spawn point
      const distToSpawn = Math.hypot(this.spawnX - this.x, this.spawnY - this.y);
      if (distToSpawn > 10) {
        const dx = this.spawnX - this.x;
        const dy = this.spawnY - this.y;
        this.x += (dx / distToSpawn) * (this.speed * 1.5) * dt;
        this.y += (dy / distToSpawn) * (this.speed * 1.5) * dt;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2 * dt);
      }
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Body
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.strokeStyle = this.isEpicBoss ? '#ffd700' : '#ffffff';
    ctx.lineWidth = this.isEpicBoss ? 4 : 2;
    ctx.stroke();

    // Symbol
    ctx.font = `${Math.round(this.radius * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, sx, sy);

    // HP Bar
    this.drawHpBar(ctx, sx, sy, Math.max(50, this.radius * 2.2), 6, -this.radius - 12);
  }
}
