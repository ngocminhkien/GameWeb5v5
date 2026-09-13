import { CONSTANTS } from '../config/constants.js';
import { RIVER_POLYGON, LANES, ROCK_WALLS, BUSHES } from '../config/terrain.js';

/**
 * Enhanced Canvas Renderer - Themed Terrain (Verdant Radiant vs Dark Volcanic Dire)
 */
export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(game) {
    const ctx = this.ctx;
    const camera = game.camera;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-cx, -cy);

    const alliedVision = game.getAlliedVisionSources ? game.getAlliedVisionSources() : [];

    // 1. Two-toned Ground (Xanh ngọc lục bảo vs Đất nham thạch)
    this.drawTerrainBackground(camera);

    // 2. Grid nền chiến thuật
    this.drawGrid(camera);

    // 3. Sông chữ S tự nhiên
    this.drawRiver(camera);

    // 4. 3 Đường chính
    this.drawLanes(camera);

    // 5. Căn cứ 2 phe
    this.drawBases(camera);

    // 6. Vách đá & Hang Boss móng ngựa
    this.drawWalls(camera);

    // 7. Bụi cỏ chiến thuật
    this.drawBushes(camera);

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

    // Nửa Xanh (Bottom-Left): Thảo nguyên xanh tươi
    ctx.fillStyle = '#081412';
    ctx.fillRect(0 - camera.x, 0 - camera.y, w, h);

    // Nửa Đỏ (Top-Right): Nham thạch hắc ám (Cắt theo đường chéo chính)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0 - camera.x, 0 - camera.y);
    ctx.lineTo(w - camera.x, 0 - camera.y);
    ctx.lineTo(w - camera.x, h - camera.y);
    ctx.closePath();
    ctx.fillStyle = '#15090e';
    ctx.fill();
    ctx.restore();
  }

  drawGrid(camera) {
    const ctx = this.ctx;
    const gridSize = 250;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
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
    ctx.fillStyle = 'rgba(14, 58, 102, 0.55)';
    ctx.beginPath();

    const pts = RIVER_POLYGON;
    ctx.moveTo(pts[0].x - camera.x, pts[0].y - camera.y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x - camera.x, pts[i].y - camera.y);
    }
    ctx.closePath();
    ctx.fill();

    // Bờ sông phát sáng nhẹ
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.25)';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  drawLanes(camera) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(200, 180, 140, 0.08)'; // Màu đất lối mòn
    ctx.lineWidth = CONSTANTS.LANE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mid
    ctx.beginPath();
    ctx.moveTo(LANES.mid.from.x - camera.x, LANES.mid.from.y - camera.y);
    ctx.lineTo(LANES.mid.to.x - camera.x, LANES.mid.to.y - camera.y);
    ctx.stroke();

    // Top
    ctx.beginPath();
    ctx.moveTo(LANES.top.points[0].x - camera.x, LANES.top.points[0].y - camera.y);
    for (let i = 1; i < LANES.top.points.length; i++) {
      ctx.lineTo(LANES.top.points[i].x - camera.x, LANES.top.points[i].y - camera.y);
    }
    ctx.stroke();

    // Bot
    ctx.beginPath();
    ctx.moveTo(LANES.bot.points[0].x - camera.x, LANES.bot.points[0].y - camera.y);
    for (let i = 1; i < LANES.bot.points.length; i++) {
      ctx.lineTo(LANES.bot.points[i].x - camera.x, LANES.bot.points[i].y - camera.y);
    }
    ctx.stroke();
  }

  drawBases(camera) {
    const ctx = this.ctx;
    // Blue Base (Thành trì Đá & Ma Thuật)
    ctx.fillStyle = 'rgba(31, 111, 235, 0.22)';
    ctx.beginPath();
    ctx.arc(CONSTANTS.BLUE_BASE.x - camera.x, CONSTANTS.BLUE_BASE.y - camera.y, CONSTANTS.BLUE_BASE.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Red Base (Pháo đài Nham Thạch)
    ctx.fillStyle = 'rgba(218, 54, 51, 0.22)';
    ctx.beginPath();
    ctx.arc(CONSTANTS.RED_BASE.x - camera.x, CONSTANTS.RED_BASE.y - camera.y, CONSTANTS.RED_BASE.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  drawWalls(camera) {
    const ctx = this.ctx;
    for (let w of ROCK_WALLS) {
      const sx = w.x - camera.x;
      const sy = w.y - camera.y;

      ctx.fillStyle = '#1c222b';
      ctx.beginPath();
      ctx.roundRect(sx, sy, w.w, w.h, 14);
      ctx.fill();
      ctx.strokeStyle = '#323945';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (w.label) {
        ctx.font = 'bold 13px Segoe UI, sans-serif';
        ctx.fillStyle = '#a0aec0';
        ctx.textAlign = 'center';
        ctx.fillText(w.label, sx + w.w / 2, sy + w.h / 2 + 5);
      }
    }
  }

  drawBushes(camera) {
    const ctx = this.ctx;
    for (let b of BUSHES) {
      const sx = b.x - camera.x;
      const sy = b.y - camera.y;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46, 160, 67, 0.28)';
      ctx.fill();
      ctx.strokeStyle = '#238636';
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 4]);
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿', sx, sy);
      ctx.restore();
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
