import { CONSTANTS } from '../config/constants.js';

/**
 * Input Manager - Mouse & Keyboard Event Handler
 */
export class Input {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;

    this.mouse = {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
      rightDown: false
    };

    this.keys = {};
    this.listeners = {
      onSkill: null,
      onUpgradeSkill: null,
      onToggleCamera: null,
      onRightClickMove: null,
      onToggleShop: null,
      onCloseShop: null,
      onUseItem: null,
      onScoreboard: null
    };

    this.initListeners();
  }

  updateWorldCoords() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.mouse.worldX = (this.mouse.screenX - cx) / this.camera.zoom + cx + this.camera.x;
    this.mouse.worldY = (this.mouse.screenY - cy) / this.camera.zoom + cy + this.camera.y;
  }

  initListeners() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.screenX = e.clientX - rect.left;
      this.mouse.screenY = e.clientY - rect.top;
      this.updateWorldCoords();
    });

    window.addEventListener('mousedown', (e) => {
      // Ignore if clicking minimap, HUD, Shop, Scoreboard, or Victory modal
      const ignoreSelectors = ['#minimap-wrapper', '#hud', '#shop-modal', '#scoreboard-modal', '#victory-modal'];
      for (const sel of ignoreSelectors) {
        const el = document.querySelector(sel);
        if (el && el.style.display !== 'none' && el.style.visibility !== 'hidden') {
          const rect = el.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            return;
          }
        }
      }

      this.updateWorldCoords();

      if (e.button === 2) { // Right Click: Move
        this.mouse.rightDown = true;
        if (this.listeners.onRightClickMove) {
          this.listeners.onRightClickMove(this.mouse.worldX, this.mouse.worldY);
        }
      } else if (e.button === 0) { // Left Click: Cast Q
        if (this.listeners.onSkill) this.listeners.onSkill('Q');
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) this.mouse.rightDown = false;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Wheel Zoom
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.camera.zoom = Math.min(CONSTANTS.MAX_ZOOM, this.camera.zoom + 0.08);
      } else {
        this.camera.zoom = Math.max(CONSTANTS.MIN_ZOOM, this.camera.zoom - 0.08);
      }
      this.updateWorldCoords();

      const label = document.getElementById('zoom-label');
      if (label) label.innerText = `🔍 Zoom ${this.camera.zoom.toFixed(2)}x (Cuộn chuột)`;
    }, { passive: false });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      const k = e.key.toUpperCase();
      this.keys[k] = true;

      // Scoreboard on Tab (Hold to view)
      if (e.key === 'Tab') {
        e.preventDefault();
        if (this.listeners.onScoreboard) this.listeners.onScoreboard(true);
        return;
      }

      // Close Shop on Escape
      if (e.key === 'Escape') {
        if (this.listeners.onCloseShop) this.listeners.onCloseShop();
        return;
      }

      // Toggle Shop on [P]
      if (k === 'P') {
        if (this.listeners.onToggleShop) this.listeners.onToggleShop();
        return;
      }

      // Quick item slots [1] - [6]
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const slotIdx = parseInt(e.key, 10) - 1;
        if (this.listeners.onUseItem) this.listeners.onUseItem(slotIdx);
        return;
      }

      // Ctrl + Q / W / E / R: Nâng cấp chiêu thức nhanh
      if (e.ctrlKey && ['Q', 'W', 'E', 'R'].includes(k)) {
        e.preventDefault();
        if (this.listeners.onUpgradeSkill) this.listeners.onUpgradeSkill(k);
        return;
      }

      if (k === 'Y') {
        if (this.listeners.onToggleCamera) this.listeners.onToggleCamera();
      } else if (['Q', 'W', 'E', 'R', 'B', 'D', 'F'].includes(k)) {
        if (this.listeners.onSkill) this.listeners.onSkill(k);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toUpperCase()] = false;
      if (e.key === 'Tab') {
        e.preventDefault();
        if (this.listeners.onScoreboard) this.listeners.onScoreboard(false);
      }
    });
  }
}
