/**
 * OOP Fog of War Manager
 * Dynamic Allied Vision Tracking, Bush Stealth Mechanics, and Radial Gradient Fog Cutout
 */
class FogOfWar {
  constructor() {
    this.fogCanvas = document.createElement('canvas');
    this.fogCtx = this.fogCanvas.getContext('2d');

    this.miniFogCanvas = document.createElement('canvas');
    this.miniFogCtx = this.miniFogCanvas.getContext('2d');
  }

  getAlliedVisionSources(heroes, minions, towers) {
    const sources = [
      // Base Fountain
      { x: 1200, y: 13800, visionRadius: 1200, alive: true }
    ];

    if (heroes) {
      for (let h of heroes) {
        if (h.team === 'blue' && h.alive) {
          sources.push(h);
        }
      }
    }

    if (minions) {
      for (let m of minions) {
        if (m.team === 'blue' && m.alive) {
          sources.push(m);
        }
      }
    }

    if (towers) {
      for (let t of towers) {
        if (t.team === 'blue' && t.alive) {
          sources.push(t);
        }
      }
    }

    return sources;
  }

  isVisible(x, y, radius, inBush, alliedVision) {
    for (let src of alliedVision) {
      if (!src.alive) continue;
      const d = Math.hypot(src.x - x, src.y - y);
      const visR = src.visionRadius || 850;

      if (d <= visR + radius) {
        if (inBush) {
          if (src.inBush || d <= 120) return true;
        } else {
          return true;
        }
      }
    }
    return false;
  }

  render(ctx, camera, alliedVision, w, h) {
    if (this.fogCanvas.width !== w || this.fogCanvas.height !== h) {
      this.fogCanvas.width = w;
      this.fogCanvas.height = h;
    }

    this.fogCtx.clearRect(0, 0, w, h);
    this.fogCtx.fillStyle = 'rgba(8, 14, 22, 0.78)';
    this.fogCtx.fillRect(0, 0, w, h);

    this.fogCtx.globalCompositeOperation = 'destination-out';

    for (let src of alliedVision) {
      if (!src.alive) continue;
      const sx = src.x - camera.x;
      const sy = src.y - camera.y;
      const radius = src.visionRadius || 850;

      if (sx < -radius || sx > w + radius || sy < -radius || sy > h + radius) continue;

      const grad = this.fogCtx.createRadialGradient(sx, sy, radius * 0.55, sx, sy, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.82, 'rgba(0, 0, 0, 0.88)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.fogCtx.fillStyle = grad;
      this.fogCtx.beginPath();
      this.fogCtx.arc(sx, sy, radius, 0, Math.PI * 2);
      this.fogCtx.fill();
    }

    this.fogCtx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.drawImage(this.fogCanvas, 0, 0);
    ctx.restore();
  }

  renderMinimapFog(miniCtx, mw, mh, alliedVision) {
    if (this.miniFogCanvas.width !== mw || this.miniFogCanvas.height !== mh) {
      this.miniFogCanvas.width = mw;
      this.miniFogCanvas.height = mh;
    }

    this.miniFogCtx.clearRect(0, 0, mw, mh);
    this.miniFogCtx.fillStyle = 'rgba(8, 14, 22, 0.75)';
    this.miniFogCtx.fillRect(0, 0, mw, mh);

    this.miniFogCtx.globalCompositeOperation = 'destination-out';

    for (let src of alliedVision) {
      if (!src.alive) continue;
      const mx = (src.x / MAP_WIDTH) * mw;
      const my = (src.y / MAP_HEIGHT) * mh;
      const mr = ((src.visionRadius || 850) / MAP_WIDTH) * mw;

      const grad = this.miniFogCtx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.miniFogCtx.fillStyle = grad;
      this.miniFogCtx.beginPath();
      this.miniFogCtx.arc(mx, my, mr, 0, Math.PI * 2);
      this.miniFogCtx.fill();
    }

    this.miniFogCtx.globalCompositeOperation = 'source-over';

    miniCtx.save();
    miniCtx.drawImage(this.miniFogCanvas, 0, 0);
    miniCtx.restore();
  }
}
