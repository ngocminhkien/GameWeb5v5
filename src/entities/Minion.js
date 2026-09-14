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

    // Procedural Vector Animation States
    this.animTime = Math.random() * 10;
    this.facingAngle = this.team === 'blue' ? -Math.PI / 4 : (3 * Math.PI) / 4;
    this.walkCycle = 0;
    this.attackAnimDuration = 0.35;
    this.attackAnimTimer = 0;
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

    this.animTime += dt;
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
    }

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

      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.facingAngle = Math.atan2(dy, dx);

      if (dist > attackDist) {
        // Tiến lại gần mục tiêu
        this.walkCycle += dt * 10;
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
          this.facingAngle = Math.atan2(dy, dx);
          this.walkCycle += dt * 10;
          this.x += (dx / distToWp) * this.speed * dt;
          this.y += (dy / distToWp) * this.speed * dt;
        }
      }
    }
  }

  performAttack(projectiles, createClickWave, onKill = null) {
    if (!this.target || !this.target.alive) return;

    this.attackAnimTimer = this.attackAnimDuration;

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

  drawMeleeFrame(ctx, isBaron) {
    const isBlue = this.team === 'blue';
    const mainColor = isBlue ? '#1f6feb' : '#da3633';
    const armorDark = isBlue ? '#0d419d' : '#82071e';
    const trimColor = isBaron ? '#a371f7' : (isBlue ? '#58a6ff' : '#ff7b72');
    const walkBob = Math.sin(this.walkCycle) * 2.5;
    const legOffset = Math.sin(this.walkCycle) * 3.5;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 3, this.radius * 0.9, this.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boots
    ctx.fillStyle = '#21262d';
    ctx.fillRect(-5 + legOffset, 6, 5, 4);
    ctx.fillRect(-5 - legOffset, -10, 5, 4);

    // Torso / Plate Armor
    ctx.fillStyle = armorDark;
    ctx.beginPath();
    ctx.roundRect(-8, -8 + walkBob * 0.3, 14, 16, 4);
    ctx.fill();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Heraldic Faction Tabard Stripe
    ctx.fillStyle = mainColor;
    ctx.fillRect(-4, -6 + walkBob * 0.3, 7, 12);

    // Helmet with Visor Slit
    ctx.fillStyle = '#30363d';
    ctx.beginPath();
    ctx.arc(0, 0 + walkBob * 0.4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#484f58';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glowing Visor
    ctx.fillStyle = isBaron ? '#d2a8ff' : (isBlue ? '#79c0ff' : '#ffa198');
    ctx.fillRect(2, -2 + walkBob * 0.4, 3, 4);

    // Left Arm: Heraldic Shield (Kite Shield)
    ctx.save();
    ctx.translate(2, -11);
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(7, -4);
    ctx.lineTo(4, 7);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fillStyle = armorDark;
    ctx.fill();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Right Arm: Broadsword with attack swing trail
    const isAttacking = this.attackAnimTimer > 0;
    const attackPhase = isAttacking ? 1 - (this.attackAnimTimer / this.attackAnimDuration) : 0;
    const swordAngle = isAttacking ? (-0.6 + attackPhase * 1.8) : 0.2;

    ctx.save();
    ctx.translate(4, 9);
    ctx.rotate(swordAngle);

    // Sword Blade
    ctx.fillStyle = '#c9d1d9';
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(15, -1);
    ctx.lineTo(17, 0);
    ctx.lineTo(15, 1);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8b949e';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Crossguard & Hilt
    ctx.fillStyle = '#d29922';
    ctx.fillRect(-2, -4, 3, 8);
    ctx.fillStyle = '#6e7681';
    ctx.fillRect(-4, -1, 3, 2);
    ctx.restore();

    // Slash Arc Trail during attack
    if (isAttacking && attackPhase > 0.1 && attackPhase < 0.9) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(3, 0, 22, -0.6, -0.6 + attackPhase * 1.6);
      ctx.strokeStyle = isBaron ? 'rgba(163, 113, 247, 0.7)' : (isBlue ? 'rgba(88, 166, 255, 0.7)' : 'rgba(255, 123, 114, 0.7)');
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  }

  drawRangedMinion(ctx, isBaron) {
    const isBlue = this.team === 'blue';
    const robeColor = isBlue ? '#112240' : '#3d0a14';
    const cloakColor = isBlue ? '#1f6feb' : '#da3633';
    const magicGlow = isBaron ? '#d2a8ff' : (isBlue ? '#79c0ff' : '#ffa198');
    const walkBob = Math.sin(this.walkCycle) * 2;
    const hemSway = Math.sin(this.walkCycle) * 3;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 3, this.radius * 0.85, this.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Wizard Cloak / Robe
    ctx.fillStyle = cloakColor;
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(4, -8);
    ctx.lineTo(4, 8);
    ctx.lineTo(-9, 6);
    ctx.quadraticCurveTo(-13 + hemSway, 0, -9, -6);
    ctx.closePath();
    ctx.fill();

    // Robe Core
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.arc(-2, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Wizard Hood
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.arc(1, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cloakColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing Wizard Eyes
    ctx.fillStyle = magicGlow;
    ctx.beginPath();
    ctx.arc(4, -2, 1.3, 0, Math.PI * 2);
    ctx.arc(4, 2, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Magic Staff in hand
    const isAttacking = this.attackAnimTimer > 0;
    const attackPhase = isAttacking ? 1 - (this.attackAnimTimer / this.attackAnimDuration) : 0;
    const staffThrust = isAttacking ? Math.sin(attackPhase * Math.PI) * 5 : 0;

    ctx.save();
    ctx.translate(4 + staffThrust, 8);

    // Staff wooden/gold pole
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(-7, -1.5, 18, 3);

    // Staff Topper: Mystical Arcane Orb
    const orbPulse = Math.sin(this.animTime * 6) * 1.2;
    ctx.fillStyle = magicGlow;
    ctx.shadowColor = magicGlow;
    ctx.shadowBlur = isAttacking ? 12 : 5;
    ctx.beginPath();
    ctx.arc(12, 0, 3.5 + orbPulse + (isAttacking ? 2 : 0), 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring around orb
    ctx.strokeStyle = isBaron ? '#a371f7' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(12, 0, 5.5, 2.5, this.animTime * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawCannonMinion(ctx, isBaron) {
    const isBlue = this.team === 'blue';
    const mainColor = isBlue ? '#1f6feb' : '#da3633';
    const coreGlow = isBaron ? '#a371f7' : (isBlue ? '#388bfd' : '#f85149');
    const wheelRot = this.walkCycle * 0.8;

    // Heavy Chassis Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, this.radius * 1.1, this.radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left & Right Spiked Tread Wheels
    const drawWheel = (y) => {
      ctx.save();
      ctx.translate(0, y);
      ctx.fillStyle = '#21262d';
      ctx.fillRect(-11, -3, 22, 6);
      ctx.strokeStyle = '#484f58';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-11, -3, 22, 6);
      ctx.fillStyle = '#8b949e';
      const spokeOffset = (wheelRot % 5);
      for (let s = -9 + spokeOffset; s <= 9; s += 4.5) {
        ctx.fillRect(s, -3.5, 2, 7);
      }
      ctx.restore();
    };
    drawWheel(-12);
    drawWheel(12);

    // Iron Carriage Chassis
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.roundRect(-12, -10, 22, 20, 4);
    ctx.fill();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hextech Reactor Core (Rear Deck)
    const pulse = Math.sin(this.animTime * 4) * 0.25 + 0.75;
    ctx.fillStyle = coreGlow;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(-5, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Cannon Barrel with Recoil Animation
    const isAttacking = this.attackAnimTimer > 0;
    const attackPhase = isAttacking ? 1 - (this.attackAnimTimer / this.attackAnimDuration) : 0;
    const recoil = isAttacking ? Math.sin(attackPhase * Math.PI) * 6 : 0;

    ctx.save();
    ctx.translate(-recoil, 0);

    // Pivot mount
    ctx.fillStyle = '#30363d';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Bronze/Iron Barrel
    ctx.fillStyle = '#30363d';
    ctx.fillRect(0, -4.5, 16, 9);
    ctx.fillStyle = mainColor;
    ctx.fillRect(3, -4, 4, 8);
    // Reinforced muzzle ring
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(15, -5.5, 3.5, 11);

    ctx.restore();

    // Muzzle Flash & Smoke Puff when firing
    if (isAttacking && attackPhase < 0.4) {
      ctx.save();
      ctx.translate(20, 0);
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(0, 0, 6 * (1 - attackPhase / 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(3, 0, 9 * (attackPhase / 0.4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawSuperMinion(ctx, isBaron) {
    const isBlue = this.team === 'blue';
    const mainColor = isBlue ? '#1f6feb' : '#da3633';
    const trimColor = isBaron ? '#a371f7' : (isBlue ? '#58a6ff' : '#ff7b72');
    const walkBob = Math.sin(this.walkCycle) * 3;
    const legOffset = Math.sin(this.walkCycle) * 4.5;

    // Massive Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, 5, this.radius * 1.05, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Armored Greaves / Legs
    ctx.fillStyle = '#21262d';
    ctx.fillRect(-9 + legOffset, 11, 8, 6);
    ctx.fillRect(-9 - legOffset, -17, 8, 6);

    // Armored Torso / Golem Frame
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.roundRect(-13, -13 + walkBob * 0.3, 22, 26, 5);
    ctx.fill();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Spiked Pauldrons (Shoulders)
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(-2, -15 + walkBob * 0.3, 7.5, 0, Math.PI * 2);
    ctx.arc(-2, 15 + walkBob * 0.3, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Chest Power Reactor
    const corePulse = Math.sin(this.animTime * 5) * 0.3 + 0.7;
    ctx.fillStyle = trimColor;
    ctx.globalAlpha = corePulse;
    ctx.beginPath();
    ctx.arc(0, 0 + walkBob * 0.3, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Horned War Helm
    ctx.fillStyle = '#30363d';
    ctx.beginPath();
    ctx.arc(5, 0 + walkBob * 0.4, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glaring Visor Slit
    ctx.fillStyle = isBaron ? '#d2a8ff' : '#f0883e';
    ctx.fillRect(7, -2 + walkBob * 0.4, 4, 4);

    // Giant Warhammer
    const isAttacking = this.attackAnimTimer > 0;
    const attackPhase = isAttacking ? 1 - (this.attackAnimTimer / this.attackAnimDuration) : 0;
    const hammerAngle = isAttacking ? (-1.2 + attackPhase * 2.4) : 0.3;

    ctx.save();
    ctx.translate(6, 13);
    ctx.rotate(hammerAngle);

    // Hammer Shaft
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(-9, -2, 26, 4);

    // Massive Stone Hammer Head
    ctx.fillStyle = '#484f58';
    ctx.beginPath();
    ctx.roundRect(13, -7, 11, 14, 3);
    ctx.fill();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Ground Shockwave on slam hit
    if (isAttacking && attackPhase > 0.45 && attackPhase < 0.75) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(20, 0, 15 * ((attackPhase - 0.45) / 0.3), 0, Math.PI * 2);
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Viewport Culling
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

    // 1. Procedural Vector Frame Rendering with Direction Alignment
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.facingAngle);

    if (this.type === 'MELEE') {
      this.drawMeleeFrame(ctx, this.isBaronEmpowered);
    } else if (this.type === 'RANGED') {
      this.drawRangedFrame(ctx, this.isBaronEmpowered);
    } else if (this.type === 'CANNON') {
      this.drawCannonFrame(ctx, this.isBaronEmpowered);
    } else if (this.type === 'SUPER') {
      this.drawSuperFrame(ctx, this.isBaronEmpowered);
    }

    ctx.restore();

    // 2. Thanh Máu (HP Bar)
    const barW = Math.max(34, this.radius * 2);
    const barH = 5;
    const barX = sx - barW / 2;
    const barY = sy - this.radius - 12;

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
