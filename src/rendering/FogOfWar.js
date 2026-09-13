/**
 * FogOfWar.js - Dynamic Vision & Fog of War Manager
 * Allied units (Player, Heroes, Minions, Towers, Base) provide vision circles.
 * Outside vision is shrouded in fog. Enemy units outside vision are hidden.
 */
export class FogOfWar {
  constructor(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    // Offscreen canvas for main viewport fog
    this.fogCanvas = document.createElement('canvas');
    this.fogCtx = this.fogCanvas.getContext('2d');

    // Offscreen canvas for minimap fog
    this.miniFogCanvas = document.createElement('canvas');
    this.miniFogCtx = this.miniFogCanvas.getContext('2d');
  }

  /**
   * Check if a world point/entity is visible to the player team (Blue)
   */
  isVisible(targetX, targetY, targetRadius = 0, inBush = false, alliedVisionSources = []) {
    for (let src of alliedVisionSources) {
      if (!src.alive) continue;
      const d = Math.hypot(targetX - src.x, targetY - src.y);
      const range = (src.visionRadius || 850) + targetRadius;

      if (d <= range) {
        if (inBush) {
          // If target is in bush, an ally must be very close or in the same bush
          if (src.inBush || d <= 120) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Render Fog of War on the main screen canvas
   */
  render(ctx, camera, alliedVisionSources) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (this.fogCanvas.width !== w || this.fogCanvas.height !== h) {
      this.fogCanvas.width = w;
      this.fogCanvas.height = h;
    }

    const fCtx = this.fogCtx;
    fCtx.clearRect(0, 0, w, h);

    // 1. Fill entire screen with dark fog of war
    fCtx.fillStyle = 'rgba(8, 14, 22, 0.78)';
    fCtx.fillRect(0, 0, w, h);

    // 2. Cut out vision holes using destination-out
    fCtx.globalCompositeOperation = 'destination-out';

    for (let src of alliedVisionSources) {
      if (!src.alive) continue;

      const sx = src.x - camera.x;
      const sy = src.y - camera.y;
      const radius = src.visionRadius || 850;

      // Culling: check if vision circle intersects screen
      if (sx < -radius || sx > w + radius || sy < -radius || sy > h + radius) {
        continue;
      }

      const grad = fCtx.createRadialGradient(sx, sy, radius * 0.55, sx, sy, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.82, 'rgba(0, 0, 0, 0.88)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      fCtx.fillStyle = grad;
      fCtx.beginPath();
      fCtx.arc(sx, sy, radius, 0, Math.PI * 2);
      fCtx.fill();
    }

    fCtx.globalCompositeOperation = 'source-over';

    // 3. Draw fog layer onto main context
    ctx.save();
    ctx.drawImage(this.fogCanvas, 0, 0);
    ctx.restore();
  }

  /**
   * Render Fog of War on the Minimap
   */
  renderMinimap(miniCtx, mw, mh, alliedVisionSources) {
    if (this.miniFogCanvas.width !== mw || this.miniFogCanvas.height !== mh) {
      this.miniFogCanvas.width = mw;
      this.miniFogCanvas.height = mh;
    }

    const mfCtx = this.miniFogCtx;
    mfCtx.clearRect(0, 0, mw, mh);

    // 1. Dark fog
    mfCtx.fillStyle = 'rgba(8, 14, 22, 0.75)';
    mfCtx.fillRect(0, 0, mw, mh);

    // 2. Cut holes
    mfCtx.globalCompositeOperation = 'destination-out';

    for (let src of alliedVisionSources) {
      if (!src.alive) continue;

      const mx = (src.x / this.mapWidth) * mw;
      const my = (src.y / this.mapHeight) * mh;
      const mr = ((src.visionRadius || 850) / this.mapWidth) * mw;

      const grad = mfCtx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      mfCtx.fillStyle = grad;
      mfCtx.beginPath();
      mfCtx.arc(mx, my, mr, 0, Math.PI * 2);
      mfCtx.fill();
    }

    mfCtx.globalCompositeOperation = 'source-over';

    // 3. Draw to minimap
    miniCtx.save();
    miniCtx.drawImage(this.miniFogCanvas, 0, 0);
    miniCtx.restore();
  }
}
