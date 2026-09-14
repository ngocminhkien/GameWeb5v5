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
    this.isHoming = config.isHoming || false;
    this.target = config.target || null;
    this.speed = config.speed || (Math.hypot(config.vx || 0, config.vy || 0) || 850);
    this.active = true;
  }

  update(dt) {
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

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();
  }
}
