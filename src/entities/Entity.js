/**
 * Base Entity Class
 */
export class Entity {
  constructor(config = {}) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.name = config.name || 'Entity';
    this.team = config.team || 'neutral'; // 'blue', 'red', 'neutral'
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.radius = config.radius || 20;

    this.maxHp = config.hp || 1000;
    this.hp = this.maxHp;
    this.alive = true;
  }

  takeDamage(amount, source = null) {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(source);
    }
  }

  die(killer = null) {
    this.alive = false;
  }

  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}
