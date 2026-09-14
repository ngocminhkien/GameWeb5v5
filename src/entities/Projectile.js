/**
 * Projectile Class - Skillshots and Tower Laser Bolts
 */
export class Projectile {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.radius = config.radius || 10;
    this.rangeLeft = config.range || 1000;
    this.team = config.team;
    this.damage = config.damage || 120;
    this.color = config.color || '#388bfd';
    this.owner = config.owner;
    this.isTowerShot = config.isTowerShot || false;
    this.isMinionShot = config.isMinionShot || false;
    this.isBasicAttack = config.isBasicAttack || false;
    this.isCrit = config.isCrit || false;
    this.isSpellblade = config.isSpellblade || false;
    this.isTornado = config.isTornado || false;
    this.isCrystalArrow = config.isCrystalArrow || false;
    this.isSeismicShard = config.isSeismicShard || false;
    this.isStarOrb = config.isStarOrb || false;
    this.isHoming = config.isHoming || false;
    this.target = config.target || null;
    this.speed = config.speed || (Math.hypot(config.vx || 0, config.vy || 0) || 850);
    this.active = true;
    this.animTime = Math.random() * 5;
  }

  update(dt) {
    this.animTime += dt;

    if (this.isHoming) {
      if (!this.target || !this.target.alive) {
        this.active = false;
        return;
      }
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rangeLeft -= this.speed * dt;

      if (this.rangeLeft <= 0) {
        this.active = false;
      }
      return;
    }

    const step = Math.hypot(this.vx * dt, this.vy * dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rangeLeft -= step;

    if (this.rangeLeft <= 0) {
      this.active = false;
    }
  }

  checkCollision(entity) {
    if (!this.active || !entity.alive) return false;
    // Don't hit allies
    if (this.team === entity.team && !this.isTowerShot) return false;

    const dist = Math.hypot(this.x - entity.x, this.y - entity.y);
    return dist <= (this.radius + entity.radius);
  }

  drawCrystalArrow(ctx, sx, sy, angle) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    // Glowing Frost Wake behind
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-40, 0);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Large Faceted Ice Spearhead
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(2, -12);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-6, -6);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-14, 18);
    ctx.lineTo(2, 12);
    ctx.closePath();
    ctx.fill();

    // Inner White Crystal Spine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(2, -4);
    ctx.lineTo(-14, 0);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawTornado(ctx, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);

    // 3D Swirling Cyclone Vortex Funnel
    for (let i = 0; i < 5; i++) {
      const ringR = 6 + i * 4.5;
      const ringY = -12 + i * 6;
      const spinAngle = this.animTime * (9 - i * 1.2);

      ctx.save();
      ctx.translate(0, ringY);
      ctx.rotate(spinAngle);

      ctx.strokeStyle = `rgba(224, 242, 254, ${0.45 + i * 0.12})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringR, ringR * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cyclonic air streamers
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ringR, 0, 2, 0, Math.PI * 2);
      ctx.arc(-ringR, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  drawSeismicShard(ctx, sx, sy) {
    const roll = this.animTime * 9;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(roll);

    // 3D Chiseled Granite Boulder
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const r = this.radius * (0.8 + (i % 3) * 0.12);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Moss / Earth patch
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(2, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawStarOrb(ctx, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);

    const pulse = Math.sin(this.animTime * 6) * 2;
    // Outer blooming halo
    ctx.fillStyle = this.color || '#ec4899';
    ctx.shadowColor = this.color || '#ec4899';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright white core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, (this.radius + pulse) * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Double-helix orbital light ribbon
    const ribbonAngle = this.animTime * 7;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius + 6, (this.radius + 6) * 0.35, ribbonAngle, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawTowerShot(ctx, sx, sy, angle) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    // Ionization laser trail
    ctx.strokeStyle = this.team === 'blue' ? 'rgba(56, 139, 253, 0.45)' : 'rgba(248, 81, 73, 0.45)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-32, 0);
    ctx.stroke();

    // Diamond High-Energy Plasma Dart
    ctx.fillStyle = this.team === 'blue' ? '#388bfd' : '#f85149';
    ctx.shadowColor = this.team === 'blue' ? '#79c0ff' : '#ffa198';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(0, -7);
    ctx.lineTo(-12, 0);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();

    // Intense White Inner Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(0, -3);
    ctx.lineTo(-8, 0);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawMinionShot(ctx, sx, sy, angle) {
    ctx.save();
    ctx.translate(sx, sy);

    if (this.radius >= 8) {
      // Heavy Cast-Iron Cannonball with burning fuse
      ctx.fillStyle = '#1c2128';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8b949e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Burning fuse spark
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(Math.cos(this.animTime * 12) * 3, Math.sin(this.animTime * 12) * 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Arcane Caster Bolt: Spinning twin comet tails
      ctx.rotate(angle);
      ctx.fillStyle = this.color || '#58a6ff';
      ctx.shadowColor = this.color || '#58a6ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tail trail
      ctx.strokeStyle = this.color || '#58a6ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-16, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBasicAttack(ctx, sx, sy, angle) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    // Trail streak
    ctx.strokeStyle = this.isCrit ? 'rgba(250, 204, 21, 0.75)' : (this.color || '#58a6ff');
    ctx.lineWidth = this.isCrit ? 4 : 2.5;
    ctx.shadowColor = this.isCrit ? '#facc15' : this.color;
    ctx.shadowBlur = this.isCrit ? 14 : 8;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-18, 0);
    ctx.stroke();

    // Arrowhead / Dart
    ctx.fillStyle = this.isCrit ? '#fef08a' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(2, -4);
    ctx.lineTo(4, 0);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();

    // Fletching Feathers
    ctx.strokeStyle = this.isCrit ? '#f59e0b' : '#c9d1d9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-18, -4);
    ctx.moveTo(-14, 0);
    ctx.lineTo(-18, 4);
    ctx.stroke();

    ctx.restore();
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Viewport culling
    if (sx < -60 || sx > ctx.canvas.width + 60 || sy < -60 || sy > ctx.canvas.height + 60) return;

    const angle = Math.atan2(this.vy, this.vx);

    if (this.isCrystalArrow) {
      this.drawCrystalArrow(ctx, sx, sy, angle);
    } else if (this.isTornado) {
      this.drawTornado(ctx, sx, sy);
    } else if (this.isSeismicShard) {
      this.drawSeismicShard(ctx, sx, sy);
    } else if (this.isStarOrb) {
      this.drawStarOrb(ctx, sx, sy);
    } else if (this.isTowerShot) {
      this.drawTowerShot(ctx, sx, sy, angle);
    } else if (this.isMinionShot) {
      this.drawMinionShot(ctx, sx, sy, angle);
    } else if (this.isBasicAttack) {
      this.drawBasicAttack(ctx, sx, sy, angle);
    } else {
      // Default directional projectile
      this.drawBasicAttack(ctx, sx, sy, angle);
    }
  }
}
