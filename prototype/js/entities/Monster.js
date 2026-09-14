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

    // Procedural multi-frame animation states
    this.animTime = Math.random() * 10;
    this.facingAngle = 0;
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

    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.target && this.target.alive) {
      const distFromSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
      const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);

      // Leash limit
      if (distFromSpawn > this.leashRadius) {
        this.target = null;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.3);
      } else {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.facingAngle = Math.atan2(dy, dx);

        // Combat / Pursuit
        if (distToTarget <= this.radius + this.target.radius + 30) {
          if (this.attackCooldown <= 0) {
            this.attackCooldown = 1.3;
            this.target.takeDamage(this.damage, this);
          }
        } else {
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
        this.facingAngle = Math.atan2(dy, dx);
        this.x += (dx / distToSpawn) * (this.speed * 1.5) * dt;
        this.y += (dy / distToSpawn) * (this.speed * 1.5) * dt;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2 * dt);
      }
    }
  }

  drawDragon(ctx, sx, sy) {
    const hoverY = Math.sin(this.animTime * 3) * 6;
    const flap = Math.sin(this.animTime * 6) * 0.45;
    const tailSway = Math.sin(this.animTime * 3.5) * 8;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 22, this.radius * 0.95, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy + hoverY);
    ctx.rotate(this.facingAngle || -Math.PI / 2);

    // Left Wing
    ctx.save();
    ctx.translate(-8, -14);
    ctx.rotate(-0.4 + flap);
    ctx.fillStyle = '#b32400';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -28);
    ctx.lineTo(8, -42);
    ctx.lineTo(16, -26);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.translate(-8, 14);
    ctx.rotate(0.4 - flap);
    ctx.fillStyle = '#b32400';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, 28);
    ctx.lineTo(8, 42);
    ctx.lineTo(16, 26);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Serpentine Tail
    ctx.strokeStyle = '#2c1220';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-30, tailSway, -42, tailSway * 1.3);
    ctx.stroke();

    // Barbed Tail Spade
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.moveTo(-42, tailSway * 1.3);
    ctx.lineTo(-48, tailSway * 1.3 - 6);
    ctx.lineTo(-54, tailSway * 1.3);
    ctx.lineTo(-48, tailSway * 1.3 + 6);
    ctx.closePath();
    ctx.fill();

    // Dragon Torso (Scaled Obsidian)
    ctx.fillStyle = '#2c1220';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5500';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glowing Magma Veins on Chest
    const magmaPulse = Math.sin(this.animTime * 4) * 0.3 + 0.7;
    ctx.fillStyle = '#ff8800';
    ctx.globalAlpha = magmaPulse;
    ctx.beginPath();
    ctx.ellipse(4, 0, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Horned Dragon Head
    ctx.fillStyle = '#1a0a14';
    ctx.beginPath();
    ctx.ellipse(18, 0, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Swept Horns
    ctx.strokeStyle = '#e056fd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(6, -16);
    ctx.moveTo(14, 6);
    ctx.lineTo(6, 16);
    ctx.stroke();

    // Slitted Fiery Eyes
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(22, -4, 2.2, 0, Math.PI * 2);
    ctx.arc(22, 4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Flame Breath Sparks at mouth
    const sparkDist = Math.sin(this.animTime * 8) * 4 + 4;
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.arc(28 + sparkDist, (Math.sin(this.animTime * 12) * 2), 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBaron(ctx, sx, sy) {
    // 1. Abyss Void Crater beneath Baron
    ctx.fillStyle = '#080511';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 16, this.radius * 1.15, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(163, 113, 247, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Multi-Segmented Undulating Void Serpent
    for (let i = 0; i < 4; i++) {
      const segY = (3 - i) * 11;
      const segSway = Math.sin(this.animTime * 2.8 - i * 0.75) * 7;
      const segR = 26 - i * 3;

      ctx.save();
      ctx.translate(sx + segSway, sy + segY - 14);

      // Chitin Shell Segment
      ctx.fillStyle = '#180f2d';
      ctx.beginPath();
      ctx.ellipse(0, 0, segR, segR * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a371f7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Side Carapace Spines
      ctx.fillStyle = '#a371f7';
      ctx.beginPath();
      ctx.moveTo(-segR, 0);
      ctx.lineTo(-segR - 8, -4);
      ctx.lineTo(-segR + 2, 4);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(segR, 0);
      ctx.lineTo(segR + 8, -4);
      ctx.lineTo(segR - 2, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 3. Baron Head Crest & Maw
    const headSway = Math.sin(this.animTime * 2.8) * 7;
    ctx.save();
    ctx.translate(sx + headSway, sy - 18);

    // Crown Crest
    ctx.fillStyle = '#0d071a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d2a8ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glowing Venomous 4 Eyes
    ctx.fillStyle = '#d2a8ff';
    ctx.beginPath();
    ctx.arc(-8, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(-4, 3, 1.8, 0, Math.PI * 2);
    ctx.arc(4, 3, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Mandibles / Pincers
    const pincerTwitch = Math.sin(this.animTime * 5) * 2;
    ctx.strokeStyle = '#a371f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.lineTo(-20 + pincerTwitch, 16);
    ctx.lineTo(-12, 18);
    ctx.moveTo(14, 8);
    ctx.lineTo(20 - pincerTwitch, 16);
    ctx.lineTo(12, 18);
    ctx.stroke();

    ctx.restore();
  }

  drawBlueBuff(ctx, sx, sy) {
    const bob = Math.sin(this.animTime * 3) * 3;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 14, this.radius * 0.9, this.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy + bob);

    // Left Floating Boulder Shoulder
    ctx.fillStyle = '#1c2128';
    ctx.beginPath();
    ctx.roundRect(-26, -16 - bob * 0.5, 12, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right Floating Boulder Shoulder
    ctx.beginPath();
    ctx.roundRect(14, -16 - bob * 0.5, 12, 14, 3);
    ctx.fill();
    ctx.stroke();

    // Central Granite Torso
    ctx.fillStyle = '#21262d';
    ctx.beginPath();
    ctx.roundRect(-16, -14, 32, 28, 5);
    ctx.fill();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sapphire Core Crystal in chest
    const pulse = Math.sin(this.animTime * 4) * 0.25 + 0.75;
    ctx.fillStyle = '#388bfd';
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Stone Head Brow & Eyes
    ctx.fillStyle = '#161b22';
    ctx.fillRect(-10, -22, 20, 9);
    ctx.fillStyle = '#79c0ff';
    ctx.fillRect(-6, -19, 3, 3);
    ctx.fillRect(3, -19, 3, 3);

    ctx.restore();
  }

  drawRedBuff(ctx, sx, sy) {
    const bob = Math.sin(this.animTime * 2.8) * 2.5;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 14, this.radius * 0.9, this.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy + bob);

    // Gnarled Wooden Bark Body
    ctx.fillStyle = '#2b170e';
    ctx.beginPath();
    ctx.roundRect(-17, -15, 34, 30, 6);
    ctx.fill();
    ctx.strokeStyle = '#da3633';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Burning Ember Magma Core
    const firePulse = Math.sin(this.animTime * 5) * 0.3 + 0.7;
    ctx.fillStyle = '#ff4500';
    ctx.globalAlpha = firePulse;
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Flaming Antler Branches
    ctx.strokeStyle = '#ff7b72';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.lineTo(-18, -26);
    ctx.lineTo(-24, -22);
    ctx.moveTo(10, -15);
    ctx.lineTo(18, -26);
    ctx.lineTo(24, -22);
    ctx.stroke();

    // Fire Particles escaping head
    ctx.fillStyle = '#ffa657';
    ctx.beginPath();
    ctx.arc(-16 + Math.sin(this.animTime * 7) * 3, -28, 2.5, 0, Math.PI * 2);
    ctx.arc(16 - Math.sin(this.animTime * 7) * 3, -28, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawWolves(ctx, sx, sy) {
    const tailWag = Math.sin(this.animTime * 6) * 4;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 8, this.radius * 0.85, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.facingAngle || 0);

    // Quadruped Wolf Body
    ctx.fillStyle = '#30263d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8957e5';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wolf Tail
    ctx.strokeStyle = '#8957e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-24, tailWag);
    ctx.stroke();

    // Wolf Head & Snout
    ctx.fillStyle = '#241a30';
    ctx.beginPath();
    ctx.ellipse(14, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sharp Ears
    ctx.fillStyle = '#8957e5';
    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(8, -12);
    ctx.lineTo(13, -7);
    ctx.moveTo(10, 5);
    ctx.lineTo(8, 12);
    ctx.lineTo(13, 7);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = '#e3b341';
    ctx.beginPath();
    ctx.arc(15, -3, 1.3, 0, Math.PI * 2);
    ctx.arc(15, 3, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawRaptors(ctx, sx, sy) {
    const wingFlap = Math.sin(this.animTime * 7) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 8, this.radius * 0.8, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.facingAngle || 0);

    // Feathered Raptor Body
    ctx.fillStyle = '#a65614';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wing Feathers
    ctx.fillStyle = '#d29922';
    ctx.fillRect(-6, -13 + wingFlap, 12, 4);
    ctx.fillRect(-6, 9 - wingFlap, 12, 4);

    // Sharp Curved Raptor Beak
    ctx.fillStyle = '#d29922';
    ctx.beginPath();
    ctx.moveTo(14, -3);
    ctx.lineTo(22, 0);
    ctx.lineTo(14, 3);
    ctx.closePath();
    ctx.fill();

    // Head Crest Plumage
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.lineTo(2, -13);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(12, 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawGromp(ctx, sx, sy) {
    const throatScale = 1 + Math.sin(this.animTime * 3.5) * 0.25;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 10, this.radius * 0.9, this.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.facingAngle || 0);

    // Rotund Moss-Green Toad Body
    ctx.fillStyle = '#1b4d24';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2ea043';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Poisonous Purple Warts
    ctx.fillStyle = '#8957e5';
    ctx.beginPath();
    ctx.arc(-6, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(-2, 6, 2, 0, Math.PI * 2);
    ctx.arc(-8, 3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Inflating Vocal Sac
    ctx.fillStyle = '#238636';
    ctx.beginPath();
    ctx.ellipse(14, 0, 6 * throatScale, 7 * throatScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bulging Toad Eyes
    ctx.fillStyle = '#e3b341';
    ctx.beginPath();
    ctx.arc(8, -8, 3.5, 0, Math.PI * 2);
    ctx.arc(8, 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(7, -8.5, 2, 1);
    ctx.fillRect(7, 7.5, 2, 1);

    ctx.restore();
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Viewport Culling
    if (sx < -120 || sx > ctx.canvas.width + 120 || sy < -120 || sy > ctx.canvas.height + 120) return;

    // 1. Procedural Vector Frame Rendering
    if (this.id === 'dragon') {
      this.drawDragon(ctx, sx, sy);
    } else if (this.id === 'baron') {
      this.drawBaron(ctx, sx, sy);
    } else if (this.id && this.id.includes('blue_buff')) {
      this.drawBlueBuff(ctx, sx, sy);
    } else if (this.id && this.id.includes('red_buff')) {
      this.drawRedBuff(ctx, sx, sy);
    } else if (this.id && this.id.includes('wolves')) {
      this.drawWolves(ctx, sx, sy);
    } else if (this.id && this.id.includes('raptors')) {
      this.drawRaptors(ctx, sx, sy);
    } else if (this.id && this.id.includes('gromp')) {
      this.drawGromp(ctx, sx, sy);
    } else {
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    // 2. HP Bar
    this.drawHpBar(ctx, sx, sy, Math.max(50, this.radius * 2.2), 6, -this.radius - 12);
  }
}
