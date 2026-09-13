/**
 * OOP Base Entity Class
 * Foundation for Heroes, Towers, Minions, and Monsters
 */
class Entity {
  constructor(config = {}) {
    this.id = config.id || `entity_${Math.random().toString(36).substr(2, 9)}`;
    this.name = config.name || 'Entity';
    this.team = config.team || 'neutral'; // 'blue', 'red', 'neutral'
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.radius = config.radius || 20;

    this.maxHp = config.hp || config.maxHp || 1000;
    this.hp = this.maxHp;
    this.alive = true;

    this.symbol = config.symbol || '⚪';
    this.color = config.color || '#fff';
    this.visionRadius = config.visionRadius || 800;
    this.inBush = false;
  }

  takeDamage(amount, source = null) {
    if (!this.alive) return 0;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.die(source);
    }
    return amount;
  }

  heal(amount) {
    if (!this.alive) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  die(killer = null) {
    this.alive = false;
  }

  drawHpBar(ctx, screenX, screenY, width = 60, height = 6, yOffset = -20) {
    const barX = screenX - width / 2;
    const barY = screenY + yOffset;

    // Background
    ctx.fillStyle = '#161b22';
    ctx.fillRect(barX, barY, width, height);

    // Fill
    const ratio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = this.team === 'blue' ? '#3fb950' : (this.team === 'red' ? '#f85149' : '#e3b341');
    ctx.fillRect(barX, barY, width * ratio, height);

    // Border
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, width, height);
  }

  update(dt) {
    // Override in subclasses
  }

  draw(ctx, camera) {
    // Override in subclasses
  }
}
