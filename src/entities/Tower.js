import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';

/**
 * Defensive Tower Class
 */
export class Tower extends Entity {
  constructor(config) {
    super(config);
    this.radius = 46;
    this.range = 800; // Attack range
    this.damage = config.damage || 180;
    this.attackSpeed = 1.2;
    this.attackCooldown = 0;
    this.target = null;
    this.isInhibitor = this.id.includes('_3');
    this.respawnTimer = 0;
  }

  takeDamage(amount, onInhibitorDown, addFloatingText) {
    if (!this.alive) return;
    this.hp -= amount;
    if (addFloatingText) {
      addFloatingText(`-${Math.round(amount)}`, this.x, this.y - 45, '#ffcc00');
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.target = null;
      if (this.isInhibitor) {
        this.respawnTimer = 300; // 5 phút (300 giây)
      }
      if (onInhibitorDown) {
        onInhibitorDown(this);
      }
    }
  }

  update(dt, enemyMinions, enemyHeroes, projectiles, onRespawn) {
    if (!this.alive) {
      // Cơ chế Trụ 3 hồi sinh sau 5 phút với 50% HP
      if (this.isInhibitor && this.respawnTimer > 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.alive = true;
          this.hp = this.maxHp * 0.5; // Hồi sinh 50% HP
          if (onRespawn) onRespawn(this);
        }
      }
      return;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Kiểm tra mục tiêu hiện tại còn hợp lệ không
    if (this.target) {
      const d = this.distanceTo(this.target);
      if (!this.target.alive || d > this.range) {
        this.target = null;
      }
    }

    // Quét tìm mục tiêu trong tầm bắn (Ưu tiên lính địch trước tướng địch)
    if (!this.target) {
      let validTarget = null;
      let minDist = this.range;

      // 1. Quét lính địch trước
      if (enemyMinions) {
        for (let m of enemyMinions) {
          if (m.alive && m.team !== this.team) {
            const d = this.distanceTo(m);
            if (d < minDist) {
              minDist = d;
              validTarget = m;
            }
          }
        }
      }

      // 2. Nếu không có lính địch -> Quét tướng địch
      if (!validTarget && enemyHeroes) {
        for (let h of enemyHeroes) {
          if (h.alive && h.team !== this.team) {
            const d = this.distanceTo(h);
            if (d < minDist) {
              minDist = d;
              validTarget = h;
            }
          }
        }
      }

      this.target = validTarget;
    }

    // Bắn đạn laser phòng thủ
    if (this.target && this.attackCooldown <= 0) {
      this.attackCooldown = this.attackSpeed;
      this.fireShot(projectiles);
    }
  }

  fireShot(projectiles) {
    if (!this.target) return;
    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    projectiles.push(new Projectile({
      x: this.x + Math.cos(angle) * (this.radius + 6),
      y: this.y + Math.sin(angle) * (this.radius + 6),
      vx: Math.cos(angle) * 1100,
      vy: Math.sin(angle) * 1100,
      radius: 14,
      range: this.range + 250,
      team: this.team,
      damage: this.damage,
      color: this.team === 'blue' ? '#388bfd' : '#f85149',
      owner: this,
      isTowerShot: true,
      isHoming: true,
      target: this.target,
      speed: 1100
    }));
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    if (!this.alive) {
      // Ruins & Hiển thị đếm ngược hồi sinh Trụ 3
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius - 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1c2128';
      ctx.fill();
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 3;
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

    // Range circle
    ctx.beginPath();
    ctx.arc(sx, sy, this.range, 0, Math.PI * 2);
    ctx.strokeStyle = this.team === 'blue' ? 'rgba(56, 139, 253, 0.12)' : 'rgba(248, 81, 73, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser lock line
    if (this.target && this.target.alive) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(this.target.x - camera.x, this.target.y - camera.y);
      ctx.strokeStyle = this.team === 'blue' ? 'rgba(88, 166, 255, 0.35)' : 'rgba(248, 81, 73, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Tower base
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? 'rgba(31, 111, 235, 0.45)' : 'rgba(218, 54, 51, 0.45)';
    ctx.fill();
    ctx.strokeStyle = this.team === 'blue' ? '#388bfd' : '#f85149';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰', sx, sy);

    // HP Bar
    const barW = 80;
    const barH = 7;
    const barX = sx - barW / 2;
    const barY = sy - this.radius - 18;

    ctx.fillStyle = '#161b22';
    ctx.fillRect(barX, barY, barW, barH);

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = this.team === 'blue' ? '#3fb950' : '#f85149';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Name
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, sx, barY - 6);
  }
}
