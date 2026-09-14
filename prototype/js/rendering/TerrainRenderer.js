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

  draw(ctx, camera, canvasWidth, canvasHeight, heroes = []) {
    const mapAssets = window.mapAssetsInstance || (window.mapAssetsInstance = new MapAssets());
    this.animTime = (this.animTime || 0) + 0.016;

    // 1. Two-toned Terrain Background with Procedural Pattern
    ctx.fillStyle = mapAssets.grassPattern || '#081412';
    ctx.fillRect(0 - camera.x, 0 - camera.y, this.mapWidth, this.mapHeight);

    // Dire Volcanic Corner
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0 - camera.x, 0 - camera.y);
    ctx.lineTo(this.mapWidth - camera.x, 0 - camera.y);
    ctx.lineTo(this.mapWidth - camera.x, this.mapHeight - camera.y);
    ctx.closePath();
    ctx.fillStyle = mapAssets.volcanicPattern || '#15090e';
    ctx.fill();
    ctx.restore();

    // 2. Subtle Tactical Grid lines
    const gridSize = 250;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
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

    // 3. 2.5D Sunken River with Flowing Caustics
    if (this.riverPolygon && this.riverPolygon.length > 2) {
      mapAssets.drawRiverWithDepth(ctx, this.riverPolygon, camera, this.animTime);
    }

    // 4. Cobblestone Lanes (Top, Mid, Bot)
    const midPoints = [
      { x: 1200, y: 13800 },
      { x: 13800, y: 1200 }
    ];
    const topPoints = [
      { x: 1200, y: 13800 },
      { x: 1200, y: 1200 },
      { x: 13800, y: 1200 }
    ];
    const botPoints = [
      { x: 1200, y: 13800 },
      { x: 13800, y: 13800 },
      { x: 13800, y: 1200 }
    ];
    mapAssets.drawCobblestoneLane(ctx, midPoints, 340, camera);
    mapAssets.drawCobblestoneLane(ctx, topPoints, 340, camera);
    mapAssets.drawCobblestoneLane(ctx, botPoints, 340, camera);

    // 5. Elevated Base Hextech Dais / Platforms
    const blueBase = (typeof CONSTANTS !== 'undefined' && CONSTANTS.BLUE_BASE) || { x: 1200, y: 13800, radius: 750 };
    const redBase = (typeof CONSTANTS !== 'undefined' && CONSTANTS.RED_BASE) || { x: 13800, y: 1200, radius: 750 };
    mapAssets.drawBasePlatform(ctx, blueBase, 'blue', camera, this.animTime);
    mapAssets.drawBasePlatform(ctx, redBase, 'red', camera, this.animTime);

    // 6. 2.5D Multi-Tier Stratified Cliffs (with Drop Shadows, Plateau, Fissures)
    for (let w of this.rockWalls) {
      const wx = w.x - camera.x;
      const wy = w.y - camera.y;

      // Viewport culling with padding for 3D cliff height & drop shadows
      if (wx + w.w < -120 || wx > canvasWidth + 120 || wy + w.h < -120 || wy > canvasHeight + 120) continue;

      mapAssets.draw3DCliff(ctx, w, camera, this.animTime);
    }

    // 7. Volumetric Multi-Cluster Swaying Bushes
    for (let b of this.bushes) {
      const bx = b.x - camera.x;
      const by = b.y - camera.y;

      // Viewport culling
      if (bx + b.r < -100 || bx - b.r > canvasWidth + 100 || by + b.r < -100 || by - b.r > canvasHeight + 100) continue;

      const hasHero = heroes.some(h => h && h.alive && h.inBush && Math.hypot(h.x - b.x, h.y - b.y) <= b.r);
      mapAssets.drawVolumetricBush(ctx, b, camera, this.animTime, hasHero);
    }
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
