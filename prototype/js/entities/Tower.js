/**
 * OOP Tower Class
 * Defensive Fortress Tower with Minion-first targeting priority,
 * homing laser fire, and 5-minute Inhibitor respawn logic
 */
class Tower extends Entity {
  constructor(config = {}) {
    super({
      id: config.id,
      name: config.name || 'Trụ Phòng Thủ',
      team: config.team || 'blue',
      x: config.x || 0,
      y: config.y || 0,
      radius: 46,
      maxHp: config.hp || 3500,
      color: config.team === 'blue' ? '#388bfd' : '#f85149',
      symbol: '🏰',
      visionRadius: 950
    });

    this.range = 800;
    this.damage = 180;
    this.attackCooldown = 0;
    this.attackSpeed = 1.2; // 1.2s per shot
    this.target = null;

    this.isInhibitor = config.id ? config.id.includes('_3') : false;
    this.respawnTimer = 0;
  }

  takeDamage(amount, source = null, onDestroy = null) {
    if (!this.alive) return 0;
    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.target = null;
      if (this.isInhibitor) {
        this.respawnTimer = 300; // 5 mins
      }
      if (onDestroy) {
        onDestroy(this, source);
      }
    }
    return amount;
  }

  update(dt, minions, heroes, projectiles, onRevive = null) {
    if (!this.alive) {
      // Inhibitor respawn countdown
      if (this.isInhibitor && this.respawnTimer > 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.alive = true;
          this.hp = this.maxHp * 0.5; // 50% initial HP
          if (onRevive) onRevive(this);
        }
      }
      return;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Check if current target is still valid
    if (this.target) {
      const d = Math.hypot(this.target.x - this.x, this.target.y - this.y);
      if (!this.target.alive || d > this.range) {
        this.target = null;
      }
    }

    // Target Selection: Minions FIRST, then Heroes
    if (!this.target) {
      let validTarget = null;
      let minDist = this.range;

      // 1. Enemy Minions
      if (minions) {
        for (let m of minions) {
          if (m.alive && m.team !== this.team) {
            const d = Math.hypot(m.x - this.x, m.y - this.y);
            if (d < minDist) {
              minDist = d;
              validTarget = m;
            }
          }
        }
      }

      // 2. Enemy Heroes
      if (!validTarget && heroes) {
        for (let h of heroes) {
          if (h.alive && h.team !== this.team) {
            const d = Math.hypot(h.x - this.x, h.y - this.y);
            if (d < minDist) {
              minDist = d;
              validTarget = h;
            }
          }
        }
      }

      this.target = validTarget;
    }

    // Fire defense laser
    if (this.target && this.attackCooldown <= 0 && projectiles) {
      this.attackCooldown = this.attackSpeed;
      this.fireLaser(this.target, projectiles);
    }
  }

  fireLaser(target, projectiles) {
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    projectiles.push(new Projectile({
      x: this.x + Math.cos(angle) * (this.radius + 5),
      y: this.y + Math.sin(angle) * (this.radius + 5),
      vx: Math.cos(angle) * 1100,
      vy: Math.sin(angle) * 1100,
      radius: 14,
      rangeLeft: this.range + 300,
      team: this.team,
      damage: this.damage,
      color: this.team === 'blue' ? '#388bfd' : '#f85149',
      owner: this,
      isTowerShot: true,
      isHoming: true,
      target: target,
      speed: 1100
    }));
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    if (!this.alive) {
      // Ruins & Inhibitor Respawn Countdown
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius - 5, 0, Math.PI * 2);
      ctx.fillStyle = '#21262d';
      ctx.fill();
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = 'center';
      if (this.isInhibitor && this.respawnTimer > 0) {
        const mins = Math.floor(this.respawnTimer / 60);
        const secs = Math.floor(this.respawnTimer % 60).toString().padStart(2, '0');
        ctx.font = 'bold 12px Segoe UI, sans-serif';
        ctx.fillStyle = '#f0883e';
        ctx.fillText(`✨ Hồi sinh: ${mins}:${secs}`, sx, sy - 8);
        ctx.fillStyle = '#8b949e';
        ctx.fillText('(50% Máu)', sx, sy + 10);
      } else {
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.fillStyle = '#484f58';
        ctx.fillText('🪦 Tàn Tích', sx, sy);
      }
      return;
    }

    // Range Circle
    ctx.beginPath();
    ctx.arc(sx, sy, this.range, 0, Math.PI * 2);
    ctx.strokeStyle = this.team === 'blue' ? 'rgba(56, 139, 253, 0.12)' : 'rgba(248, 81, 73, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser targeting beam
    if (this.target) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(this.target.x - camera.x, this.target.y - camera.y);
      ctx.strokeStyle = this.team === 'blue' ? 'rgba(88, 166, 255, 0.35)' : 'rgba(248, 81, 73, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Tower Body
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? 'rgba(31, 111, 235, 0.45)' : 'rgba(218, 54, 51, 0.45)';
    ctx.fill();
    ctx.strokeStyle = this.team === 'blue' ? '#388bfd' : '#f85149';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Tower Symbol
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰', sx, sy);

    // HP Bar
    this.drawHpBar(ctx, sx, sy, 80, 7, -this.radius - 18);

    // Tower Name
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, sx, sy - this.radius - 24);
  }
}
