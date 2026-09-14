import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';

/**
 * Minion Entity Class (Lính 3 đường)
 * Types: 'MELEE' (Cận chiến), 'RANGED' (Đánh xa), 'CANNON' (Xe pháo), 'SUPER' (Siêu cấp)
 */
export class Minion extends Entity {
  constructor(config) {
    super(config);
    this.lane = config.lane; // 'TOP', 'MID', 'BOT'
    this.type = config.type || 'MELEE';
    this.waypoints = config.waypoints || [];
    this.waypointIdx = 0;

    // Type Stats Configuration
    if (this.type === 'MELEE') {
      this.radius = 18;
      this.maxHp = 720;
      this.damage = 40;
      this.range = 110;
      this.attackSpeed = 1.2;
      this.speed = 320;
      this.symbol = '🛡️';
    } else if (this.type === 'RANGED') {
      this.radius = 16;
      this.maxHp = 460;
      this.damage = 52;
      this.range = 550;
      this.attackSpeed = 1.4;
      this.speed = 320;
      this.symbol = '🔮';
    } else if (this.type === 'CANNON') {
      this.radius = 23;
      this.maxHp = 1350;
      this.damage = 85;
      this.range = 650;
      this.attackSpeed = 1.8;
      this.speed = 300;
      this.symbol = '💣';
      this.isCannon = true;
    } else if (this.type === 'SUPER') {
      this.radius = 32;
      this.maxHp = 3800;
      this.damage = 190;
      this.range = 130;
      this.attackSpeed = 1.0;
      this.speed = 340;
      this.symbol = '🤖';
      this.isSuper = true;
    }

    this.hp = this.maxHp;
    this.attackCooldown = 0;
    this.target = null;

    // Base stats backup for Baron Empowerment
    this.baseRadius = this.radius;
    this.baseDamage = this.damage;
    this.baseRange = this.range;
    this.isBaronEmpowered = false;
    this.baronPulse = 0;
  }

  applyBaronBuff(empower) {
    if (empower && !this.isBaronEmpowered) {
      this.isBaronEmpowered = true;
      this.radius = Math.round(this.baseRadius * 1.35);
      if (this.type === 'MELEE') {
        this.damage = Math.round(this.baseDamage * 1.6);
        this.hp = Math.min(this.maxHp + 350, this.hp + 350);
        this.maxHp += 350;
      } else if (this.type === 'RANGED') {
        this.damage = Math.round(this.baseDamage * 1.8);
        this.range = 800;
      } else if (this.type === 'CANNON') {
        this.damage = Math.round(this.baseDamage * 2.2);
        this.range = 920; // Vượt tầm bắn của trụ (750) để nã pháo công thành!
      } else if (this.type === 'SUPER') {
        this.damage = Math.round(this.baseDamage * 1.5);
      }
    } else if (!empower && this.isBaronEmpowered) {
      this.isBaronEmpowered = false;
      this.radius = this.baseRadius;
      this.damage = this.baseDamage;
      this.range = this.baseRange;
    }
  }

  takeDamage(amount, source, addFloatingText, onDie = null) {
    if (!this.alive) return;

    // Cannon minions take 30% reduced damage from towers
    if (this.isCannon && source && source.isTowerShot) {
      amount *= 0.7;
    }

    // Baron Empowered minions take 45% reduced damage from champions & towers
    if (this.isBaronEmpowered) {
      amount *= 0.55;
    }

    this.hp -= amount;
    if (addFloatingText) {
      addFloatingText(`-${Math.round(amount)}`, this.x, this.y - 20, this.team === 'blue' ? '#ff7b72' : '#79c0ff');
    }

    // Aggro source if minion has no target
    if ((!this.target || !this.target.alive) && source && source.alive && source.team !== this.team) {
      this.target = source;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      if (onDie) {
        onDie(this, source);
      }
    }
  }

  update(dt, enemyMinions, enemyTowers, enemyHeroes, projectiles, createClickWave, onKill = null) {
    if (!this.alive) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // 1. Kiểm tra mục tiêu hiện tại
    if (this.target) {
      const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);
      if (!this.target.alive || distToTarget > this.range + 250) {
        this.target = null;
      }
    }

    // 2. Tìm kiếm mục tiêu theo thứ tự ưu tiên (Lính địch -> Trụ địch -> Tướng địch)
    if (!this.target) {
      const scanRange = 550;
      let closest = null;
      let minDist = scanRange;

      // Ưu tiên 1: Lính địch
      for (let m of enemyMinions) {
        if (m.alive && m.team !== this.team) {
          const d = Math.hypot(m.x - this.x, m.y - this.y);
          if (d < minDist) {
            minDist = d;
            closest = m;
          }
        }
      }

      // Ưu tiên 2: Trụ địch
      if (!closest) {
        for (let tw of enemyTowers) {
          if (tw.alive && tw.team !== this.team) {
            const d = Math.hypot(tw.x - this.x, tw.y - this.y);
            if (d < Math.max(minDist, this.range + 100)) {
              minDist = d;
              closest = tw;
            }
          }
        }
      }

      // Ưu tiên 3: Tướng địch
      if (!closest) {
        for (let h of enemyHeroes) {
          if (h.alive && h.team !== this.team) {
            const d = Math.hypot(h.x - this.x, h.y - this.y);
            if (d < minDist) {
              minDist = d;
              closest = h;
            }
          }
        }
      }

      this.target = closest;
    }

    // 3. Xử lý tấn công hoặc di chuyển
    if (this.target && this.target.alive) {
      const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
      const attackDist = this.range + (this.target.radius || 0);

      if (dist > attackDist) {
        // Tiến lại gần mục tiêu
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      } else {
        // Trong tầm đánh -> Tấn công
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.attackSpeed;
          this.performAttack(projectiles, createClickWave, onKill);
        }
      }
    } else {
      // 4. Không có mục tiêu -> Hành quân theo Waypoints dọc đường
      if (this.waypoints.length > 0 && this.waypointIdx < this.waypoints.length) {
        const wp = this.waypoints[this.waypointIdx];
        const distToWp = Math.hypot(wp.x - this.x, wp.y - this.y);

        if (distToWp < 150) {
          this.waypointIdx++;
        } else {
          const dx = wp.x - this.x;
          const dy = wp.y - this.y;
          this.x += (dx / distToWp) * this.speed * dt;
          this.y += (dy / distToWp) * this.speed * dt;
        }
      }
    }
  }

  performAttack(projectiles, createClickWave, onKill = null) {
    if (!this.target || !this.target.alive) return;

    if (this.type === 'MELEE' || this.type === 'SUPER') {
      // Đòn đánh cận chiến
      const wasAlive = this.target.alive;
      this.target.takeDamage(this.damage, this);
      if (wasAlive && !this.target.alive && onKill) {
        onKill(this.target, this);
      }
      if (createClickWave) {
        createClickWave(this.target.x, this.target.y, this.team === 'blue' ? '#58a6ff' : '#f85149');
      }
    } else {
      // Bắn đạn tầm xa (Ranged / Cannon)
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      projectiles.push(new Projectile({
        x: this.x + Math.cos(angle) * (this.radius + 5),
        y: this.y + Math.sin(angle) * (this.radius + 5),
        vx: Math.cos(angle) * 750,
        vy: Math.sin(angle) * 750,
        radius: this.isCannon ? 9 : 6,
        range: this.range + 100,
        team: this.team,
        damage: this.damage,
        color: this.team === 'blue' ? '#58a6ff' : '#f85149',
        owner: this,
        isMinionShot: true,
        isHoming: true,
        target: this.target,
        speed: 750
      }));
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Culling
    if (sx < -100 || sx > ctx.canvas.width + 100 || sy < -100 || sy > ctx.canvas.height + 100) return;

    // 0. Baron Empowerment Aura Ring
    if (this.isBaronEmpowered) {
      this.baronPulse = ((this.baronPulse || 0) + 0.05) % (Math.PI * 2);
      const pulseSize = this.radius + 6 + Math.sin(this.baronPulse) * 3;
      ctx.beginPath();
      ctx.arc(sx, sy, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(163, 113, 247, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, this.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(137, 87, 229, 0.2)';
      ctx.fill();
    }

    // 1. Thân Token Lính
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? '#1f6feb' : '#da3633';
    ctx.fill();

    ctx.strokeStyle = this.isBaronEmpowered ? '#a371f7' : (this.isSuper ? '#f0883e' : (this.isCannon ? '#d29922' : '#ffffff'));
    ctx.lineWidth = (this.isSuper || this.isBaronEmpowered) ? 3.5 : 2;
    ctx.stroke();

    // 2. Biểu tượng lính
    ctx.font = `${Math.round(this.radius * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, sx, sy);

    // 3. Thanh Máu (HP Bar)
    const barW = Math.max(34, this.radius * 2);
    const barH = 5;
    const barX = sx - barW / 2;
    const barY = sy - this.radius - 10;

    ctx.fillStyle = '#161b22';
    ctx.fillRect(barX, barY, barW, barH);

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = this.team === 'blue' ? '#3fb950' : '#f85149';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
  }
}
