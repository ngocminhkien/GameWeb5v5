/**
 * OOP Minimap Component
 * Renders 1:1 Square Minimap, Entity Pings, Fog of War Mask, and Viewport Box
 */
class Minimap {
  constructor(canvas, wrapper) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wrapper = wrapper;
  }

  toMiniX(worldX) {
    return (worldX / MAP_WIDTH) * this.canvas.width;
  }

  toMiniY(worldY) {
    return (worldY / MAP_HEIGHT) * this.canvas.height;
  }

  render(towers, monsters, minions, heroes, fogOfWar, camera, zoom, canvasWidth, canvasHeight, riverPolygon) {
    const mw = this.canvas.width;
    const mh = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, mw, mh);

    // 1. Two-toned Base Background
    ctx.fillStyle = '#091512';
    ctx.fillRect(0, 0, mw, mh);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mw, 0);
    ctx.lineTo(mw, mh);
    ctx.closePath();
    ctx.fillStyle = '#170a0e';
    ctx.fill();
    ctx.restore();

    // 2. S-Curved River
    if (riverPolygon && riverPolygon.length > 0) {
      ctx.fillStyle = 'rgba(31, 111, 235, 0.45)';
      ctx.beginPath();
      ctx.moveTo(this.toMiniX(riverPolygon[0].x), this.toMiniY(riverPolygon[0].y));
      for (let i = 1; i < riverPolygon.length; i++) {
        ctx.lineTo(this.toMiniX(riverPolygon[i].x), this.toMiniY(riverPolygon[i].y));
      }
      ctx.closePath();
      ctx.fill();
    }

    // 3. Lanes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2.5;

    // Mid
    ctx.beginPath();
    ctx.moveTo(this.toMiniX(1200), this.toMiniY(13800));
    ctx.lineTo(this.toMiniX(13800), this.toMiniY(1200));
    ctx.stroke();

    // Top
    ctx.beginPath();
    ctx.moveTo(this.toMiniX(1200), this.toMiniY(13800));
    ctx.lineTo(this.toMiniX(1200), this.toMiniY(1200));
    ctx.lineTo(this.toMiniX(13800), this.toMiniY(1200));
    ctx.stroke();

    // Bot
    ctx.beginPath();
    ctx.moveTo(this.toMiniX(1200), this.toMiniY(13800));
    ctx.lineTo(this.toMiniX(13800), this.toMiniY(13800));
    ctx.lineTo(this.toMiniX(13800), this.toMiniY(1200));
    ctx.stroke();

    // 4. Towers
    if (towers) {
      for (let t of towers) {
        const mx = this.toMiniX(t.x);
        const my = this.toMiniY(t.y);
        ctx.fillStyle = t.alive ? (t.team === 'blue' ? '#388bfd' : '#f85149') : '#30363d';
        ctx.fillRect(mx - 2.5, my - 2.5, 5, 5);
        if (t.alive) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(mx - 2.5, my - 2.5, 5, 5);
        }
      }
    }

    const alliedVision = fogOfWar ? fogOfWar.getAlliedVisionSources(heroes, minions, towers) : [];

    // 5. Neutral Monsters
    if (monsters) {
      for (let m of monsters) {
        if (!m.alive) continue;
        if (!fogOfWar || fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
          const mx = this.toMiniX(m.x);
          const my = this.toMiniY(m.y);
          ctx.beginPath();
          ctx.arc(mx, my, m.isEpicBoss ? 4.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();

          if (m.isEpicBoss) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // 6. Minions
    if (minions) {
      for (let m of minions) {
        if (!m.alive) continue;
        if (m.team === 'blue' || !fogOfWar || fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
          ctx.beginPath();
          ctx.arc(this.toMiniX(m.x), this.toMiniY(m.y), m.isSuper ? 3.5 : (m.isCannon ? 2.5 : 1.8), 0, Math.PI * 2);
          ctx.fillStyle = m.team === 'blue' ? '#79c0ff' : '#ff7b72';
          ctx.fill();
          if (m.isSuper) {
            ctx.strokeStyle = '#f0883e';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // 7. Heroes
    if (heroes) {
      for (let h of heroes) {
        if (!h.alive) continue;
        if (h.team === 'blue' || !fogOfWar || fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) {
          const mx = this.toMiniX(h.x);
          const my = this.toMiniY(h.y);

          ctx.beginPath();
          ctx.arc(mx, my, h.isPlayer ? 5 : 4, 0, Math.PI * 2);
          ctx.fillStyle = h.avatarColor;
          ctx.fill();
          ctx.strokeStyle = h.isPlayer ? '#ffd700' : '#ffffff';
          ctx.lineWidth = h.isPlayer ? 2 : 1;
          ctx.stroke();
        }
      }
    }

    // 8. Fog of War on Minimap
    if (fogOfWar) {
      fogOfWar.renderMinimapFog(ctx, mw, mh, alliedVision);
    }

    // 9. Camera Viewport Box
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const worldViewW = canvasWidth / zoom;
    const worldViewH = canvasHeight / zoom;
    const worldViewX = camera.x + cx - worldViewW / 2;
    const worldViewY = camera.y + cy - worldViewH / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(this.toMiniX(worldViewX), this.toMiniY(worldViewY), this.toMiniX(worldViewW), this.toMiniY(worldViewH));
  }
}
