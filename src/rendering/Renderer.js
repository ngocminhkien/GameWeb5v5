import { CONSTANTS } from '../config/constants.js';
import { RIVER_POLYGON, LANES, ROCK_WALLS, BUSHES } from '../config/terrain.js';
import { mapAssetsInstance } from './MapAssets.js';

/**
 * Enhanced Canvas Renderer - 2.5D Depth & Height MOBA Battlefield
 */
export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.animTime = 0;
  }

  render(game) {
    const ctx = this.ctx;
    const camera = game.camera;
    this.animTime = game.matchTime || (performance.now() * 0.001);

    if (!mapAssetsInstance.initialized) {
      mapAssetsInstance.init(ctx);
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-cx, -cy);

    const alliedVision = game.getAlliedVisionSources ? game.getAlliedVisionSources() : [];

    // 1. Two-toned Ground Textures (Radiant Emerald vs Dire Volcanic Crust)
    this.drawTerrainBackground(camera);

    // 2. Grid nền chiến thuật
    this.drawGrid(camera);

    // 3. Sông có chiều sâu, dốc bờ và hoạt họa gợn sóng caustics
    this.drawRiver(camera);

    // 4. 3 Đường chính lát đá cổ kính
    this.drawLanes(camera);

    // 5. Căn cứ 2 phe Hextech nâng cao
    this.drawBases(camera);

    // 6. Vách đá 2.5D có độ cao, bóng đổ và vân nứt thớ đá
    this.drawWalls(camera);

    // 7. Bụi cỏ thể tích đung đưa theo gió
    this.drawBushes(camera, game.heroes);

    // 7.5. Lớp Sương Mù Chiến Tranh (Fog of War)
    if (game.fogOfWar) {
      game.fogOfWar.render(ctx, camera, alliedVision);
    }

    // 8. Hiệu ứng sóng click
    this.drawClickWaves(game.clickWaves, camera);

    // 9. Trụ phòng thủ
    for (let tw of game.towers) tw.draw(ctx, camera);

    // 9.5. Lính 3 đường (Minions) - Ẩn lính địch ngoài tầm nhìn
    if (game.minions) {
      for (let mn of game.minions) {
        if (mn.team === 'blue' || !game.fogOfWar || game.fogOfWar.isVisible(mn.x, mn.y, mn.radius, false, alliedVision)) {
          mn.draw(ctx, camera);
        }
      }
    }

    // 10. Quái rừng & Boss - Ẩn khi ngoài tầm nhìn
    for (let m of game.monsters) {
      if (!game.fogOfWar || game.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
        m.draw(ctx, camera);
      }
    }

    // 10.5. Tường gió Wind Walls
    if (game.windWalls) {
      this.drawWindWalls(game.windWalls, camera);
    }

    // 11. Đạn bay - Ẩn đạn địch ngoài tầm nhìn
    for (let p of game.projectiles) {
      if (p.team === 'blue' || !game.fogOfWar || game.fogOfWar.isVisible(p.x, p.y, p.radius, false, alliedVision)) {
        p.draw(ctx, camera);
      }
    }

    // 12. Hiệu ứng hạt
    this.drawParticles(game.particles, camera);

    // 13. Tướng - Ẩn tướng địch ngoài tầm nhìn hoặc nấp bụi
    for (let h of game.heroes) {
      if (h.team === 'blue' || !game.fogOfWar || game.fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) {
        h.draw(ctx, camera, game.input.mouse);
      }
    }

    // 14. Số sát thương nảy
    this.drawFloatingTexts(game.floatingTexts, camera);

    ctx.restore();
  }

  drawTerrainBackground(camera) {
    const ctx = this.ctx;
    const w = CONSTANTS.MAP_WIDTH;
    const h = CONSTANTS.MAP_HEIGHT;

    // Nửa Xanh (Bottom-Left): Thảo nguyên cỏ ngọc Radiant
    if (mapAssetsInstance.patterns.grass) {
      ctx.fillStyle = mapAssetsInstance.patterns.grass;
    } else {
      ctx.fillStyle = '#081813';
    }
    ctx.fillRect(0 - camera.x, 0 - camera.y, w, h);

    // Nửa Đỏ (Top-Right): Nham thạch hắc ám Dire (Cắt theo đường chéo tự nhiên)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0 - camera.x, 0 - camera.y);
    ctx.lineTo(w - camera.x, 0 - camera.y);
    ctx.lineTo(w - camera.x, h - camera.y);
    ctx.closePath();
    if (mapAssetsInstance.patterns.volcanic) {
      ctx.fillStyle = mapAssetsInstance.patterns.volcanic;
    } else {
      ctx.fillStyle = '#140a0e';
    }
    ctx.fill();
    ctx.restore();
  }

  drawGrid(camera) {
    const ctx = this.ctx;
    const gridSize = 300;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
    ctx.lineWidth = 1;

    const visibleLeft = camera.x - this.canvas.width;
    const visibleRight = camera.x + this.canvas.width * 2;
    const visibleTop = camera.y - this.canvas.height;
    const visibleBottom = camera.y + this.canvas.height * 2;

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
  }

  drawRiver(camera) {
    const ctx = this.ctx;
    mapAssetsInstance.drawRiverWithDepth(ctx, RIVER_POLYGON, camera, this.animTime);
  }

  drawLanes(camera) {
    const ctx = this.ctx;
    const laneW = CONSTANTS.LANE_WIDTH || 340;

    // 2.5D Cobblestone paved lanes with curbs and waypoints
    const midPoints = [LANES.mid.from, LANES.mid.to];
    mapAssetsInstance.drawCobblestoneLane(ctx, midPoints, laneW, camera);
    mapAssetsInstance.drawCobblestoneLane(ctx, LANES.top.points, laneW, camera);
    mapAssetsInstance.drawCobblestoneLane(ctx, LANES.bot.points, laneW, camera);
  }

  drawBases(camera) {
    const ctx = this.ctx;
    mapAssetsInstance.drawBasePlatform(ctx, CONSTANTS.BLUE_BASE, 'blue', camera, this.animTime);
    mapAssetsInstance.drawBasePlatform(ctx, CONSTANTS.RED_BASE, 'red', camera, this.animTime);
  }

  drawWalls(camera) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    for (let w of ROCK_WALLS) {
      const sx = w.x - camera.x;
      const sy = w.y - camera.y;

      // Viewport culling
      if (sx + w.w < -120 || sx > cw + 120 || sy + w.h < -120 || sy > ch + 120) continue;

      mapAssetsInstance.draw3DCliff(ctx, w, camera, this.animTime);
    }
  }

  drawBushes(camera, heroes = []) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    for (let b of BUSHES) {
      const sx = b.x - camera.x;
      const sy = b.y - camera.y;

      // Viewport culling
      if (sx + b.r < -100 || sx - b.r > cw + 100 || sy + b.r < -100 || sy - b.r > ch + 100) continue;

      const hasHero = heroes.some(h => h && h.alive && h.inBush && Math.hypot(h.x - b.x, h.y - b.y) <= b.r);
      mapAssetsInstance.drawVolumetricBush(ctx, b, camera, this.animTime, hasHero);
    }
  }

  drawClickWaves(waves, camera) {
    const ctx = this.ctx;
    for (let w of waves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(w.x - camera.x, w.y - camera.y, w.r, 0, Math.PI * 2);
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  drawWindWalls(windWalls, camera) {
    const ctx = this.ctx;
    for (let ww of windWalls) {
      const sx = ww.x - camera.x;
      const sy = ww.y - camera.y;
      const perp = ww.angle + Math.PI / 2;
      const halfLen = (ww.length || 220) / 2;
      const x1 = sx - Math.cos(perp) * halfLen;
      const y1 = sy - Math.sin(perp) * halfLen;
      const x2 = sx + Math.cos(perp) * halfLen;
      const y2 = sy + Math.sin(perp) * halfLen;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 14;
      ctx.strokeStyle = ww.team === 'blue' ? 'rgba(46, 160, 67, 0.75)' : 'rgba(248, 81, 73, 0.75)';
      ctx.lineCap = 'round';
      ctx.shadowColor = ww.team === 'blue' ? '#3fb950' : '#f85149';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Inner white gust line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }
  }

  drawParticles(particles, camera) {
    const ctx = this.ctx;
    for (let pt of particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x - camera.x, pt.y - camera.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.fill();
      ctx.restore();
    }
  }

  drawFloatingTexts(texts, camera) {
    const ctx = this.ctx;
    for (let ft of texts) {
      ctx.save();
      ctx.font = 'bold 15px Segoe UI, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x - camera.x, ft.y - camera.y);
      ctx.restore();
    }
  }
}
