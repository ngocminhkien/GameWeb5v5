import { CONSTANTS } from '../config/constants.js';

/**
 * Camera System - Lock [Y], Edge Panning, Smooth Follow & Zoom
 */
export class Camera {
  constructor() {
    this.x = CONSTANTS.BLUE_BASE.x;
    this.y = CONSTANTS.BLUE_BASE.y;
    this.targetX = this.x;
    this.targetY = this.y;
    this.panSpeed = CONSTANTS.CAMERA_PAN_SPEED;
    this.locked = true;
    this.zoom = CONSTANTS.DEFAULT_ZOOM;
  }

  toggleLock() {
    this.locked = !this.locked;
    return this.locked;
  }

  centerOn(targetX, targetY, canvasWidth, canvasHeight) {
    this.targetX = targetX - canvasWidth / 2;
    this.targetY = targetY - canvasHeight / 2;
  }

  update(dt, player, mouse, keys, canvasWidth, canvasHeight, edgeIndicators = {}) {
    if (this.locked) {
      if (player && player.alive) {
        this.centerOn(player.x, player.y, canvasWidth, canvasHeight);
      }
      if (edgeIndicators.top) edgeIndicators.top.style.opacity = 0;
      if (edgeIndicators.bottom) edgeIndicators.bottom.style.opacity = 0;
      if (edgeIndicators.left) edgeIndicators.left.style.opacity = 0;
      if (edgeIndicators.right) edgeIndicators.right.style.opacity = 0;
    } else {
      // Space key to center
      if (keys[' '] && player && player.alive) {
        this.centerOn(player.x, player.y, canvasWidth, canvasHeight);
      } else {
        // Edge panning
        const margin = CONSTANTS.EDGE_PAN_MARGIN;
        let panX = 0;
        let panY = 0;

        if (mouse.screenX < margin && mouse.screenX >= 0) {
          panX -= this.panSpeed * dt;
          if (edgeIndicators.left) edgeIndicators.left.style.opacity = 1;
        } else if (edgeIndicators.left) edgeIndicators.left.style.opacity = 0;

        if (mouse.screenX > canvasWidth - margin && mouse.screenX <= canvasWidth) {
          panX += this.panSpeed * dt;
          if (edgeIndicators.right) edgeIndicators.right.style.opacity = 1;
        } else if (edgeIndicators.right) edgeIndicators.right.style.opacity = 0;

        if (mouse.screenY < margin && mouse.screenY >= 0) {
          panY -= this.panSpeed * dt;
          if (edgeIndicators.top) edgeIndicators.top.style.opacity = 1;
        } else if (edgeIndicators.top) edgeIndicators.top.style.opacity = 0;

        if (mouse.screenY > canvasHeight - margin && mouse.screenY <= canvasHeight) {
          panY += this.panSpeed * dt;
          if (edgeIndicators.bottom) edgeIndicators.bottom.style.opacity = 1;
        } else if (edgeIndicators.bottom) edgeIndicators.bottom.style.opacity = 0;

        this.targetX += panX;
        this.targetY += panY;
      }
    }

    // Smooth interpolation
    this.x += (this.targetX - this.x) * 0.12;
    this.y += (this.targetY - this.y) * 0.12;

    // Bounds clamp
    this.x = Math.max(0, Math.min(CONSTANTS.MAP_WIDTH - canvasWidth, this.x));
    this.y = Math.max(0, Math.min(CONSTANTS.MAP_HEIGHT - canvasHeight, this.y));
  }
}
