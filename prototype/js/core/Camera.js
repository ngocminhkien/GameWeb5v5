/**
 * OOP Camera Class
 * Manages Viewport, Smooth Follow, Edge Panning, Camera Lock [Y], Space-to-Center, and Zoom
 */
class Camera {
  constructor(config = {}) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.locked = true;
    this.zoom = config.zoom || 0.85;
    this.panSpeed = config.panSpeed || 3800;
    this.edgeMargin = config.edgeMargin || 35;
  }

  toggleLock() {
    this.locked = !this.locked;
    return this.locked;
  }

  centerOn(x, y, canvasWidth, canvasHeight) {
    this.targetX = x - canvasWidth / 2;
    this.targetY = y - canvasHeight / 2;
    this.x = this.targetX;
    this.y = this.targetY;
  }

  update(dt, player, mouse, keys, canvasWidth, canvasHeight) {
    const edgeTop = document.getElementById('edge-top');
    const edgeBottom = document.getElementById('edge-bottom');
    const edgeLeft = document.getElementById('edge-left');
    const edgeRight = document.getElementById('edge-right');

    if (this.locked) {
      if (player && player.alive) {
        this.targetX = player.x - canvasWidth / 2;
        this.targetY = player.y - canvasHeight / 2;
      }
      if (edgeTop) edgeTop.style.opacity = 0;
      if (edgeBottom) edgeBottom.style.opacity = 0;
      if (edgeLeft) edgeLeft.style.opacity = 0;
      if (edgeRight) edgeRight.style.opacity = 0;
    } else {
      // Spacebar to snap back to hero
      if (keys && keys[' '] && player && player.alive) {
        this.targetX = player.x - canvasWidth / 2;
        this.targetY = player.y - canvasHeight / 2;
      } else {
        // Edge Panning
        let panX = 0;
        let panY = 0;

        if (mouse.screenX < this.edgeMargin && mouse.screenX >= 0) {
          panX -= this.panSpeed * dt;
          if (edgeLeft) edgeLeft.style.opacity = 1;
        } else if (edgeLeft) {
          edgeLeft.style.opacity = 0;
        }

        if (mouse.screenX > canvasWidth - this.edgeMargin && mouse.screenX <= canvasWidth) {
          panX += this.panSpeed * dt;
          if (edgeRight) edgeRight.style.opacity = 1;
        } else if (edgeRight) {
          edgeRight.style.opacity = 0;
        }

        if (mouse.screenY < this.edgeMargin && mouse.screenY >= 0) {
          panY -= this.panSpeed * dt;
          if (edgeTop) edgeTop.style.opacity = 1;
        } else if (edgeTop) {
          edgeTop.style.opacity = 0;
        }

        if (mouse.screenY > canvasHeight - this.edgeMargin && mouse.screenY <= canvasHeight) {
          panY += this.panSpeed * dt;
          if (edgeBottom) edgeBottom.style.opacity = 1;
        } else if (edgeBottom) {
          edgeBottom.style.opacity = 0;
        }

        this.targetX += panX;
        this.targetY += panY;
      }
    }

    // Smooth Lerp
    this.x += (this.targetX - this.x) * 0.12;
    this.y += (this.targetY - this.y) * 0.12;

    // Bounds check
    this.x = Math.max(0, Math.min(MAP_WIDTH - canvasWidth, this.x));
    this.y = Math.max(0, Math.min(MAP_HEIGHT - canvasHeight, this.y));
  }

  screenToWorld(screenX, screenY, canvasWidth, canvasHeight) {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const relX = screenX - cx;
    const relY = screenY - cy;
    return {
      x: this.x + cx + relX / this.zoom,
      y: this.y + cy + relY / this.zoom
    };
  }
}
