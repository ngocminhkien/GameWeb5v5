/**
 * OOP Projectile Class
 * Handles straight skillshots, homing basic attacks, and tower lasers
 */
class Projectile {
  constructor(config = {}) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.radius = config.radius || 8;
    this.speed = config.speed || 900;
    this.rangeLeft = config.rangeLeft || config.range || 1000;

    this.team = config.team || 'blue';
    this.damage = config.damage || 50;
    this.color = config.color || '#388bfd';
    this.owner = config.owner || null;

    this.isHoming = config.isHoming || false;
    this.target = config.target || null;
    this.isTowerShot = config.isTowerShot || false;
    this.isMinionShot = config.isMinionShot || false;
    this.isBasicAttack = config.isBasicAttack || false;
    this.isCrit = config.isCrit || false;
    this.isSpellblade = config.isSpellblade || false;

    this.isTornado = config.isTornado || false;
    this.isCrystalArrow = config.isCrystalArrow || false;
    this.isSeismicShard = config.isSeismicShard || false;
    this.isVolleyArrow = config.isVolleyArrow || false;
    this.isStarOrb = config.isStarOrb || false;

    this.active = true;
  }

  update(dt) {
    if (!this.active) return;

    if (this.isHoming) {
      if (!this.target || !this.target.alive) {
        this.active = false;
        return;
      }
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const angle = Math.atan2(dy, dx);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rangeLeft -= this.speed * dt;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rangeLeft -= Math.hypot(this.vx * dt, this.vy * dt);
    }

    if (this.rangeLeft <= 0) {
      this.active = false;
    }
  }

  checkCollision(entity) {
    if (!this.active || !entity.alive || entity.team === this.team) return false;
    const dist = Math.hypot(entity.x - this.x, entity.y - this.y);
    return dist <= entity.radius + this.radius;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
}
