import { Entity } from './Entity.js';

/**
 * Neutral Jungle Monster & Epic Boss Class
 */
export class Monster extends Entity {
  constructor(config) {
    super(config);
    this.symbol = config.symbol || '👾';
    this.color = config.color || '#e3b341';
    this.spawnX = config.x;
    this.spawnY = config.y;
    this.damage = config.damage || 85;
    this.speed = 280;
    this.isEpicBoss = config.isEpicBoss || false;
    this.buffType = config.buffType || null;
    this.leashRadius = this.isEpicBoss ? 800 : 650;

    this.target = null;
    this.attackCooldown = 0;
  }

  takeDamage(amount, source = null) {
    if (!this.alive) return;
    super.takeDamage(amount, source);

    if (source && source.alive) {
      this.target = source;
    }
  }

  die(killer = null, onAnnounce = null) {
    super.die(killer);
    const teamName = killer ? (killer.team === 'blue' ? 'Đội Xanh' : 'Đội Đỏ') : '';
    if (onAnnounce) {
      onAnnounce(`🏆 ${killer ? killer.name : 'Chiến binh'} (${teamName}) đã hạ gục ${this.name}!`);
      if (this.buffType === 'dragon') {
        onAnnounce('🔥 ĐỘI NHẬN ĐƯỢC BÙA RỒNG LỬA (+20% Sát Thương)!');
      } else if (this.buffType === 'baron') {
        onAnnounce('👑 ĐỘI NHẬN ĐƯỢC BÙA BARON (Siêu Cường Hóa Máu & Hộ Thể)!');
      }
    }

    // Respawn timer
    const respawnMs = this.isEpicBoss ? 60000 : 30000;
    setTimeout(() => {
      this.alive = true;
      this.hp = this.maxHp;
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.target = null;
      if (onAnnounce) onAnnounce(`✨ ${this.name} đã tái sinh trên chiến trường!`);
    }, respawnMs);
  }

  update(dt, createClickWave) {
    if (!this.alive) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.target && this.target.alive) {
      const distFromSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
      const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);

      // Leash limit reached -> return to spawn
      if (distFromSpawn > this.leashRadius || distToTarget > 950) {
        this.target = null;
      } else {
        if (distToTarget > this.radius + this.target.radius + 15) {
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          this.x += (dx / distToTarget) * this.speed * dt;
          this.y += (dy / distToTarget) * this.speed * dt;
        } else {
          if (this.attackCooldown <= 0) {
            this.attackCooldown = 1.3;
            this.target.takeDamage(this.damage, this);
            if (createClickWave) createClickWave(this.target.x, this.target.y, '#f0883e');
          }
        }
        return;
      }
    }

    // Return to spawn & regenerate HP
    const dBack = Math.hypot(this.spawnX - this.x, this.spawnY - this.y);
    if (dBack > 8) {
      this.x += ((this.spawnX - this.x) / dBack) * this.speed * dt;
      this.y += ((this.spawnY - this.y) / dBack) * this.speed * dt;
      this.hp = Math.min(this.maxHp, this.hp + 300 * dt);
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // HP Ring
    const hpRingR = this.radius + 6;
    ctx.beginPath();
    ctx.arc(sx, sy, hpRingR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(20, 25, 32, 0.85)';
    ctx.lineWidth = 5;
    ctx.stroke();

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.beginPath();
    ctx.arc(sx, sy, hpRingR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = this.isEpicBoss ? '#d29922' : '#e3b341';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner Core
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = this.isEpicBoss ? '#f0883e' : '#fff';
    ctx.lineWidth = this.isEpicBoss ? 3.5 : 2;
    ctx.stroke();

    ctx.font = `${Math.round(this.radius * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, sx, sy);

    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillStyle = this.isEpicBoss ? '#f0883e' : '#e6edf3';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, sx, sy - this.radius - 14);
  }
}
