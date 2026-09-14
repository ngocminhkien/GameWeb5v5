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

    // Procedural 3D Tower & Crystal Animation
    this.animTime = Math.random() * 10;
    this.fireFlashTimer = 0;
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

    this.animTime += dt;
    if (this.fireFlashTimer > 0) {
      this.fireFlashTimer -= dt;
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
    this.fireFlashTimer = 0.25;
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

  drawTowerProcedural(ctx, sx, sy, camera) {
    const isBlue = this.team === 'blue';
    const teamColor = isBlue ? '#388bfd' : '#f85149';
    const teamGlow = isBlue ? '#79c0ff' : '#ffa198';
    const darkStone = '#161b22';
    const midStone = '#21262d';
    const lightStone = '#30363d';

    // 1. Directional Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(sx + 8, sy + 14, this.radius * 1.15, this.radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stepped Octagonal Stone Pedestal Base
    const drawPolygon = (radius, sides, rot = 0) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = rot + (i * Math.PI * 2) / sides;
        const px = sx + Math.cos(a) * radius;
        const py = sy + Math.sin(a) * (radius * 0.85);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    // Tier 1 Base: Broad dark octagonal foundation
    drawPolygon(this.radius, 8, Math.PI / 8);
    ctx.fillStyle = darkStone;
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tier 2: Elevated carved stone tier with team runic bevel
    drawPolygon(this.radius * 0.78, 8, 0);
    ctx.fillStyle = midStone;
    ctx.fill();
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4 Corner Buttress Piers
    for (let i = 0; i < 4; i++) {
      const bAngle = (i * Math.PI) / 2 + Math.PI / 4;
      const bx = sx + Math.cos(bAngle) * (this.radius * 0.65);
      const by = sy + Math.sin(bAngle) * (this.radius * 0.55);
      ctx.fillStyle = lightStone;
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Tier 3: Central Spire Pedestal Socket
    drawPolygon(this.radius * 0.48, 8, Math.PI / 8);
    ctx.fillStyle = '#0d1117';
    ctx.fill();
    ctx.strokeStyle = '#484f58';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Runic conduits glowing on socket
    const pulse = Math.sin(this.animTime * 3) * 0.3 + 0.7;
    ctx.fillStyle = teamColor;
    ctx.globalAlpha = pulse * 0.6;
    drawPolygon(this.radius * 0.35, 6, 0);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 3. Hovering Hextech Power Crystal
    const isLocked = this.target && this.target.alive;
    const hoverY = Math.sin(this.animTime * 3) * 6;
    const cy_crystal = sy - 14 + hoverY;
    const spinSpeed = isLocked ? 4.5 : 1.8;
    const crystalAngle = this.animTime * spinSpeed;

    // Laser Tracking Lock Beam
    if (isLocked) {
      const tx = this.target.x - camera.x;
      const ty = this.target.y - camera.y;

      ctx.save();
      // Outer beam aura
      ctx.beginPath();
      ctx.moveTo(sx, cy_crystal);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = isBlue ? 'rgba(56, 139, 253, 0.45)' : 'rgba(248, 81, 73, 0.45)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner intense core beam
      ctx.beginPath();
      ctx.moveTo(sx, cy_crystal);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Trailing charge particle dots
      const particleProgress = (this.animTime * 4) % 1;
      const px = sx + (tx - sx) * particleProgress;
      const py = cy_crystal + (ty - cy_crystal) * particleProgress;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3 Orbiting Runic Shards
    for (let i = 0; i < 3; i++) {
      const sAngle = -this.animTime * 2.2 + (i * Math.PI * 2) / 3;
      const sDist = 20;
      const shX = sx + Math.cos(sAngle) * sDist;
      const shY = cy_crystal + Math.sin(sAngle) * (sDist * 0.4);

      ctx.save();
      ctx.translate(shX, shY);
      ctx.rotate(sAngle + Math.PI / 2);
      ctx.fillStyle = teamGlow;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Central Hextech Crystal
    ctx.save();
    ctx.translate(sx, cy_crystal);

    // Glowing energy bloom
    ctx.shadowColor = teamColor;
    ctx.shadowBlur = isLocked ? 20 : 12;

    // 3D Faceted Octahedron Crystal with animated spin
    const crystalW = 12 * Math.cos(crystalAngle);
    const crystalH = 22;

    // Left Facet
    ctx.beginPath();
    ctx.moveTo(0, -crystalH / 2);
    ctx.lineTo(crystalW, 0);
    ctx.lineTo(0, crystalH / 2);
    ctx.closePath();
    ctx.fillStyle = isBlue ? '#58a6ff' : '#ff7b72';
    ctx.fill();

    // Right Facet (Darker shading)
    ctx.beginPath();
    ctx.moveTo(0, -crystalH / 2);
    ctx.lineTo(-crystalW, 0);
    ctx.lineTo(0, crystalH / 2);
    ctx.closePath();
    ctx.fillStyle = isBlue ? '#1f6feb' : '#da3633';
    ctx.fill();

    // Crystal highlight ridge
    ctx.beginPath();
    ctx.moveTo(0, -crystalH / 2);
    ctx.lineTo(0, crystalH / 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Fire Flash Discharge Flare
    if (this.fireFlashTimer > 0) {
      const flashRatio = this.fireFlashTimer / 0.25;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 14 * flashRatio, 0, Math.PI * 2);
      ctx.fill();

      // Expanding plasma shock ring
      ctx.strokeStyle = teamGlow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26 * (1 - flashRatio), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawRuinsProcedural(ctx, sx, sy) {
    // Cracked base slab
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Deep crack fissures
    ctx.strokeStyle = '#0d1117';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 20, sy - 10);
    ctx.lineTo(sx + 5, sy + 2);
    ctx.lineTo(sx + 24, sy - 15);
    ctx.moveTo(sx + 5, sy + 2);
    ctx.lineTo(sx - 8, sy + 25);
    ctx.stroke();

    // Crumbled rubble blocks
    ctx.fillStyle = '#30363d';
    ctx.fillRect(sx - 18, sy + 6, 8, 8);
    ctx.fillRect(sx + 10, sy - 12, 10, 7);
    ctx.fillRect(sx + 4, sy + 14, 7, 6);

    // Inhibitor Respawn Countdown / Tombstone
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
      ctx.fillText('🪦 Tàn Tích Trụ', sx, sy);
    }
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    if (!this.alive) {
      this.drawRuinsProcedural(ctx, sx, sy);
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

    // Procedural 3D Tower Architecture with Floating Hextech Crystal
    this.drawTowerProcedural(ctx, sx, sy, camera);

    // HP Bar
    this.drawHpBar(ctx, sx, sy, 80, 7, -this.radius - 20);

    // Tower Name
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, sx, sy - this.radius - 26);
  }
}
