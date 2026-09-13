/**
 * OOP Terrain Renderer
 * Renders two-toned terrain (Radiant vs Dire), S-curved river, rock walls, bushes, alcoves, and base fountains.
 * Also provides collision detection against terrain walls.
 */
class TerrainRenderer {
  constructor(config = {}) {
    this.mapWidth = config.mapWidth || MAP_WIDTH;
    this.mapHeight = config.mapHeight || MAP_HEIGHT;
    this.riverPolygon = config.riverPolygon || RIVER_POLYGON;
    this.rockWalls = config.rockWalls || ROCK_WALLS;
    this.bushes = config.bushes || BUSHES;
  }

  resolveWallCollisions(entity) {
    for (let w of this.rockWalls) {
      const closestX = Math.max(w.x, Math.min(entity.x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(entity.y, w.y + w.h));

      const dx = entity.x - closestX;
      const dy = entity.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < entity.radius) {
        const overlap = entity.radius - dist;
        if (dist > 0.001) {
          entity.x += (dx / dist) * overlap;
          entity.y += (dy / dist) * overlap;
        } else {
          entity.x += overlap;
        }
      }
    }
  }

  draw(ctx, camera, canvasWidth, canvasHeight) {
    // 1. Two-toned Terrain Background
    ctx.fillStyle = '#081412'; // Radiant Verdant Green
    ctx.fillRect(0 - camera.x, 0 - camera.y, this.mapWidth, this.mapHeight);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0 - camera.x, 0 - camera.y);
    ctx.lineTo(this.mapWidth - camera.x, 0 - camera.y);
    ctx.lineTo(this.mapWidth - camera.x, this.mapHeight - camera.y);
    ctx.closePath();
    ctx.fillStyle = '#15090e'; // Dire Volcanic Dark Red
    ctx.fill();
    ctx.restore();

    // 2. Grid lines
    const gridSize = 250;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;

    const visibleLeft = camera.x - canvasWidth;
    const visibleRight = camera.x + canvasWidth * 2;
    const visibleTop = camera.y - canvasHeight;
    const visibleBottom = camera.y + canvasHeight * 2;

    const startX = Math.floor(visibleLeft / gridSize) * gridSize;
    const startY = Math.floor(visibleTop / gridSize) * gridSize;

    for (let x = startX; x < visibleRight; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - camera.x, visibleTop - camera.y);
      ctx.lineTo(x - camera.x, visibleBottom - camera.y);
      ctx.stroke();
    }
    for (let y = startY; y < visibleBottom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(visibleLeft - camera.x, y - camera.y);
      ctx.lineTo(visibleRight - camera.x, y - camera.y);
      ctx.stroke();
    }

    // 3. S-Curved River
    ctx.fillStyle = 'rgba(14, 58, 102, 0.55)';
    ctx.beginPath();
    ctx.moveTo(this.riverPolygon[0].x - camera.x, this.riverPolygon[0].y - camera.y);
    for (let i = 1; i < this.riverPolygon.length; i++) {
      ctx.lineTo(this.riverPolygon[i].x - camera.x, this.riverPolygon[i].y - camera.y);
    }
    ctx.closePath();
    ctx.fill();

    // River Shoreline Glow
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 4. Lanes (3 lines)
    ctx.lineWidth = 300;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';

    // Mid
    ctx.beginPath();
    ctx.moveTo(1200 - camera.x, 13800 - camera.y);
    ctx.lineTo(13800 - camera.x, 1200 - camera.y);
    ctx.stroke();

    // Top
    ctx.beginPath();
    ctx.moveTo(1200 - camera.x, 13800 - camera.y);
    ctx.lineTo(1200 - camera.x, 1200 - camera.y);
    ctx.lineTo(13800 - camera.x, 1200 - camera.y);
    ctx.stroke();

    // Bot
    ctx.beginPath();
    ctx.moveTo(1200 - camera.x, 13800 - camera.y);
    ctx.lineTo(13800 - camera.x, 13800 - camera.y);
    ctx.lineTo(13800 - camera.x, 1200 - camera.y);
    ctx.stroke();

    // 5. Rock Walls
    for (let w of this.rockWalls) {
      const wx = w.x - camera.x;
      const wy = w.y - camera.y;

      if (wx < -w.w - 100 || wx > canvasWidth + 100 || wy < -w.h - 100 || wy > canvasHeight + 100) continue;

      ctx.fillStyle = '#1c2128';
      ctx.fillRect(wx, wy, w.w, w.h);

      ctx.strokeStyle = '#444c56';
      ctx.lineWidth = 3;
      ctx.strokeRect(wx, wy, w.w, w.h);

      ctx.strokeStyle = '#2d333b';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx + 4, wy + 4, w.w - 8, w.h - 8);

      if (w.label) {
        ctx.font = 'bold 12px Segoe UI, sans-serif';
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'center';
        ctx.fillText(w.label, wx + w.w / 2, wy + w.h / 2 + 4);
      }
    }

    // 6. Bushes
    for (let b of this.bushes) {
      const bx = b.x - camera.x;
      const by = b.y - camera.y;

      if (bx < -b.r * 2 || bx > canvasWidth + b.r * 2 || by < -b.r * 2 || by > canvasHeight + b.r * 2) continue;

      ctx.beginPath();
      ctx.arc(bx, by, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(35, 134, 54, 0.38)';
      ctx.fill();

      ctx.strokeStyle = '#2ea043';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿', bx, by);
    }

    // 7. Base Fountains
    // Blue Base
    ctx.beginPath();
    ctx.arc(1200 - camera.x, 13800 - camera.y, 650, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 139, 253, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Red Base
    ctx.beginPath();
    ctx.arc(13800 - camera.x, 1200 - camera.y, 650, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(248, 81, 73, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// Attach helper to window for global entity access if needed
window.resolveWallCollisions = function(entity) {
  if (window.terrainRendererInstance) {
    window.terrainRendererInstance.resolveWallCollisions(entity);
  } else {
    for (let w of ROCK_WALLS) {
      const closestX = Math.max(w.x, Math.min(entity.x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(entity.y, w.y + w.h));
      const dx = entity.x - closestX;
      const dy = entity.y - closestY;
      const dist = Math.hypot(dx, dy);
      if (dist < entity.radius) {
        const overlap = entity.radius - dist;
        if (dist > 0.001) {
          entity.x += (dx / dist) * overlap;
          entity.y += (dy / dist) * overlap;
        } else {
          entity.x += overlap;
        }
      }
    }
  }
};
