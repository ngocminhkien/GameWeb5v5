import { CONSTANTS } from '../config/constants.js';
import { RIVER_POLYGON, LANES, ROCK_WALLS, BUSHES } from '../config/terrain.js';

/**
 * 1:1 Symmetrical Square Minimap
 */
export class Minimap {
  constructor(container, canvas, ctx) {
    this.container = container;
    this.canvas = canvas;
    this.ctx = ctx;

    this.onJumpCamera = null;
    this.onMoveHero = null;

    this.initEvents();
  }

  initEvents() {
    this.container.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const rect = this.container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const worldX = (clickX / this.canvas.width) * CONSTANTS.MAP_WIDTH;
      const worldY = (clickY / this.canvas.height) * CONSTANTS.MAP_HEIGHT;

      if (e.button === 0) { // Left Click: Teleport camera
        if (this.onJumpCamera) this.onJumpCamera(worldX, worldY);
      } else if (e.button === 2) { // Right Click: Command move
        if (this.onMoveHero) this.onMoveHero(worldX, worldY);
      }
    });
  }

  render(game) {
    const mw = this.canvas.width;
    const mh = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, mw, mh);

    // Two-toned Background (Verdant Radiant bottom-left vs Volcanic Dire top-right)
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

    const toMiniX = (wx) => (wx / CONSTANTS.MAP_WIDTH) * mw;
    const toMiniY = (wy) => (wy / CONSTANTS.MAP_HEIGHT) * mh;

    // 1. Dòng Sông Chữ S Tự Nhiên
    ctx.fillStyle = 'rgba(14, 58, 102, 0.65)';
    ctx.beginPath();
    const pts = RIVER_POLYGON;
    ctx.moveTo(toMiniX(pts[0].x), toMiniY(pts[0].y));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toMiniX(pts[i].x), toMiniY(pts[i].y));
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. 3 Đường chính (Lanes)
    ctx.strokeStyle = 'rgba(200, 180, 140, 0.18)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mid
    ctx.beginPath();
    ctx.moveTo(toMiniX(LANES.mid.from.x), toMiniY(LANES.mid.from.y));
    ctx.lineTo(toMiniX(LANES.mid.to.x), toMiniY(LANES.mid.to.y));
    ctx.stroke();

    // Top
    ctx.beginPath();
    ctx.moveTo(toMiniX(LANES.top.points[0].x), toMiniY(LANES.top.points[0].y));
    for (let i = 1; i < LANES.top.points.length; i++) {
      ctx.lineTo(toMiniX(LANES.top.points[i].x), toMiniY(LANES.top.points[i].y));
    }
    ctx.stroke();

    // Bot
    ctx.beginPath();
    ctx.moveTo(toMiniX(LANES.bot.points[0].x), toMiniY(LANES.bot.points[0].y));
    for (let i = 1; i < LANES.bot.points.length; i++) {
      ctx.lineTo(toMiniX(LANES.bot.points[i].x), toMiniY(LANES.bot.points[i].y));
    }
    ctx.stroke();

    // 3. Vách đá & Hang Boss
    ctx.fillStyle = '#2d333b';
    for (let w of ROCK_WALLS) {
      ctx.fillRect(toMiniX(w.x), toMiniY(w.y), Math.max(2, toMiniX(w.w)), Math.max(2, toMiniY(w.h)));
    }

    // 4. Bụi cỏ chiến thuật
    ctx.fillStyle = '#238636';
    for (let b of BUSHES) {
      ctx.beginPath();
      ctx.arc(toMiniX(b.x), toMiniY(b.y), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const alliedVision = game.getAlliedVisionSources ? game.getAlliedVisionSources() : [];

    // 5. 22 Trụ phòng thủ
    for (let tw of game.towers) {
      if (!tw.alive) continue;
      ctx.fillStyle = tw.team === 'blue' ? '#388bfd' : '#f85149';
      ctx.fillRect(toMiniX(tw.x) - 2.5, toMiniY(tw.y) - 2.5, 5, 5);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(toMiniX(tw.x) - 2.5, toMiniY(tw.y) - 2.5, 5, 5);
    }

    // 6. Quái rừng & Boss khủng (Ẩn khi ngoài tầm nhìn)
    for (let m of game.monsters) {
      if (!m.alive) continue;
      if (game.fogOfWar && !game.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) continue;
      ctx.beginPath();
      ctx.arc(toMiniX(m.x), toMiniY(m.y), m.isEpicBoss ? 5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      if (m.isEpicBoss) {
        ctx.strokeStyle = '#f0883e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // 6.5. Lính 3 đường trên Minimap (Lính địch ẩn khi ngoài tầm nhìn)
    if (game.minions) {
      for (let mn of game.minions) {
        if (!mn.alive) continue;
        if (mn.team !== 'blue' && game.fogOfWar && !game.fogOfWar.isVisible(mn.x, mn.y, mn.radius, false, alliedVision)) continue;
        ctx.beginPath();
        ctx.arc(toMiniX(mn.x), toMiniY(mn.y), mn.isSuper ? 3.5 : (mn.isCannon ? 2.5 : 1.8), 0, Math.PI * 2);
        ctx.fillStyle = mn.team === 'blue' ? '#58a6ff' : '#f85149';
        ctx.fill();
        if (mn.isSuper) {
          ctx.strokeStyle = '#f0883e';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // 7. Bases
    ctx.fillStyle = '#1f6feb';
    ctx.beginPath();
    ctx.arc(toMiniX(CONSTANTS.BLUE_BASE.x), toMiniY(CONSTANTS.BLUE_BASE.y), 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#da3633';
    ctx.beginPath();
    ctx.arc(toMiniX(CONSTANTS.RED_BASE.x), toMiniY(CONSTANTS.RED_BASE.y), 8, 0, Math.PI * 2);
    ctx.fill();

    // 8. Tướng (Tướng địch ẩn khi ngoài tầm nhìn hoặc nấp bụi)
    for (let h of game.heroes) {
      if (!h.alive) continue;
      if (h.team !== 'blue' && game.fogOfWar && !game.fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) continue;
      const hx = toMiniX(h.x);
      const hy = toMiniY(h.y);

      ctx.beginPath();
      ctx.arc(hx, hy, h.isPlayer ? 5.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = h.team === 'blue' ? '#58a6ff' : '#f85149';
      ctx.fill();

      if (h.isPlayer) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 8.5. Lớp Sương Mù Trên Minimap
    if (game.fogOfWar) {
      game.fogOfWar.renderMinimap(ctx, mw, mh, alliedVision);
    }

    // 9. Camera Viewport
    const cx = game.canvas.width / 2;
    const cy = game.canvas.height / 2;
    const worldViewW = game.canvas.width / game.camera.zoom;
    const worldViewH = game.canvas.height / game.camera.zoom;
    const worldViewX = game.camera.x + cx - worldViewW / 2;
    const worldViewY = game.camera.y + cy - worldViewH / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(toMiniX(worldViewX), toMiniY(worldViewY), toMiniX(worldViewW), toMiniY(worldViewH));
  }
}
