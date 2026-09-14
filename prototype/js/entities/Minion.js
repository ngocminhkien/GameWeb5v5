/**
 * OOP Minion Class
 * Handles 4 Minion Archetypes (Melee, Ranged, Cannon, Super)
 * Autonomous waypoint navigation, aggro switching, and siege assault
 */
class Minion extends Entity {
  constructor(config = {}) {
    const type = config.type || 'MELEE';
    let radius = 18;
    let maxHp = 720;
    let damage = 40;
    let range = 110;
    let attackSpeed = 1.2;
    let speed = 320;
    let symbol = '🛡️';
    let isCannon = false;
    let isSuper = false;

    if (type === 'RANGED') {
      radius = 16;
      maxHp = 460;
      damage = 52;
      range = 550;
      attackSpeed = 1.4;
      speed = 320;
      symbol = '🔮';
    } else if (type === 'CANNON') {
      radius = 23;
      maxHp = 1350;
      damage = 85;
      range = 650;
      attackSpeed = 1.8;
      speed = 300;
      symbol = '💣';
      isCannon = true;
    } else if (type === 'SUPER') {
      radius = 32;
      maxHp = 3800;
      damage = 190;
      range = 130;
      attackSpeed = 1.0;
      speed = 340;
      symbol = '🤖';
      isSuper = true;
    }

    super({
      id: config.id,
      name: `${type} Minion`,
      team: config.team || 'blue',
      x: config.x || 0,
      y: config.y || 0,
      radius: radius,
      maxHp: maxHp,
      color: config.team === 'blue' ? '#1f6feb' : '#da3633',
      symbol: symbol,
      visionRadius: 650
    });

    this.type = type;
    this.lane = config.lane || 'MID';
    this.waypoints = config.waypoints || [];
    this.waypointIdx = 0;
    this.damage = damage;
    this.range = range;
    this.attackSpeed = attackSpeed;
    this.speed = speed;
    this.isCannon = isCannon;
    this.isSuper = isSuper;

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
        this.range = 920;
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

  takeDamage(amount, source = null, onDie = null) {
    if (!this.alive) return 0;
    // Cannon minions take 30% reduced damage from towers
    if (this.isCannon && source && source.isTowerShot) {
      amount *= 0.7;
    }

    // Baron Empowered minions take 45% reduced damage from champions & towers
    if (this.isBaronEmpowered) {
      amount *= 0.55;
    }

    this.hp -= amount;
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
    return amount;
  }

  update(dt, enemyMinions, enemyTowers, enemyHeroes, projectiles, onKill = null) {
    if (!this.alive) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // 1. Check current target validity
    if (this.target) {
      const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);
      if (!this.target.alive || distToTarget > this.range + 250) {
        this.target = null;
      }
    }

    // 2. Target Acquisition Priority: Minions -> Towers -> Heroes
    if (!this.target) {
      let closest = null;
      let minDist = 550;

      // Priority 1: Enemy Minions
      if (enemyMinions) {
        for (let m of enemyMinions) {
          if (m.alive && m.team !== this.team) {
            const d = Math.hypot(m.x - this.x, m.y - this.y);
            if (d < minDist) {
              minDist = d;
              closest = m;
            }
          }
        }
      }

      // Priority 2: Enemy Towers
      if (!closest && enemyTowers) {
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

      // Priority 3: Enemy Heroes
      if (!closest && enemyHeroes) {
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

    // 3. Movement or Attack
    if (this.target) {
      const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
      if (dist <= this.range) {
        // Attack Target
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.attackSpeed;
          this.performAttack(projectiles, onKill);
        }
      } else {
        // Move towards target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
    } else {
      // Follow Lane Waypoints
      if (this.waypointIdx < this.waypoints.length) {
        const wp = this.waypoints[this.waypointIdx];
        const dx = wp.x - this.x;
        const dy = wp.y - this.y;
        const distToWp = Math.hypot(dx, dy);

        if (distToWp < 120) {
          this.waypointIdx++;
        } else {
          this.x += (dx / distToWp) * this.speed * dt;
          this.y += (dy / distToWp) * this.speed * dt;
        }
      }
    }
  }

  performAttack(projectiles, onKill = null) {
    if (!this.target || !this.target.alive) return;

    if (this.type === 'MELEE' || this.type === 'SUPER') {
      const wasAlive = this.target.alive;
      this.target.takeDamage(this.damage, this);
      if (wasAlive && !this.target.alive && onKill) {
        onKill(this.target, this);
      }
    } else if (projectiles) {
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      projectiles.push(new Projectile({
        x: this.x + Math.cos(angle) * (this.radius + 5),
        y: this.y + Math.sin(angle) * (this.radius + 5),
        vx: Math.cos(angle) * 750,
        vy: Math.sin(angle) * 750,
        radius: this.isCannon ? 9 : 6,
        rangeLeft: this.range + 100,
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
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

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

    // Token Body
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? '#1f6feb' : '#da3633';
    ctx.fill();

    ctx.strokeStyle = this.isBaronEmpowered ? '#a371f7' : (this.isSuper ? '#f0883e' : (this.isCannon ? '#d29922' : '#ffffff'));
    ctx.lineWidth = (this.isSuper || this.isBaronEmpowered) ? 3.5 : 2;
    ctx.stroke();

    // Symbol
    ctx.font = `${Math.round(this.radius * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, sx, sy);

    // HP Bar
    this.drawHpBar(ctx, sx, sy, Math.max(34, this.radius * 2), 5, -this.radius - 10);
  }
}
