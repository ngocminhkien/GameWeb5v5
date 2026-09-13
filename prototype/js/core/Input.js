/**
 * OOP Input Manager
 * Handles Keyboard, Mouse, Smart Right-Click MOBA attack/move, Wheel Zoom, and Minimap interaction
 */
class InputManager {
  constructor(canvas, minimapCanvas, game) {
    this.canvas = canvas;
    this.minimapCanvas = minimapCanvas;
    this.game = game;

    this.mouse = {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
      rightDown: false,
      leftDown: false
    };

    this.keys = {};
    this.initEvents();
  }

  updateWorldCoords() {
    const coords = this.game.camera.screenToWorld(
      this.mouse.screenX,
      this.mouse.screenY,
      this.canvas.width,
      this.canvas.height
    );
    this.mouse.worldX = coords.x;
    this.mouse.worldY = coords.y;
  }

  initEvents() {
    // Mouse move on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.screenX = e.clientX - rect.left;
      this.mouse.screenY = e.clientY - rect.top;
      this.updateWorldCoords();
    });

    // Disable context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Mouse Down
    this.canvas.addEventListener('mousedown', (e) => {
      this.updateWorldCoords();

      if (e.button === 0) {
        // Left Click: cast Q skillshot
        this.mouse.leftDown = true;
        this.game.usePlayerSkill('Q');
      } else if (e.button === 2) {
        // Right Click: Smart Move or Attack Target
        this.mouse.rightDown = true;
        const enemy = this.game.findEnemyAt(this.mouse.worldX, this.mouse.worldY);
        const player = this.game.player;

        if (player && player.alive) {
          if (enemy) {
            player.attackTarget = enemy;
            this.game.createClickWave(enemy.x, enemy.y, '#f85149');
          } else {
            player.attackTarget = null;
            player.targetX = this.mouse.worldX;
            player.targetY = this.mouse.worldY;
            this.game.createClickWave(this.mouse.worldX, this.mouse.worldY, '#388bfd');
          }
        }
      }
    });

    // Mouse Up
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    // Mouse Wheel: Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.game.camera.zoom = Math.max(0.4, Math.min(1.5, this.game.camera.zoom * zoomFactor));
      const zoomLabel = document.getElementById('zoom-label');
      if (zoomLabel) {
        zoomLabel.innerText = `🔍 Cuộn Chuột: Zoom ${this.game.camera.zoom.toFixed(2)}x`;
      }
    }, { passive: false });

    // Keyboard Events
    window.addEventListener('keydown', (e) => {
      const k = e.key.toUpperCase();
      this.keys[k] = true;

      // Ctrl + Q / W / E / R: Quick upgrade skill
      if (e.ctrlKey && ['Q', 'W', 'E', 'R'].includes(k)) {
        e.preventDefault();
        this.game.upgradePlayerSkill(k);
        return;
      }

      if (k === 'Y') {
        const locked = this.game.camera.toggleLock();
        this.game.hud.updateCameraBtn(locked);
        this.game.hud.announce(locked ? '📷 [Y] Đã KHÓA Camera' : '📷 [Y] Đã MỞ KHÓA Camera');
      } else if (['Q', 'W', 'E', 'R', 'B'].includes(k)) {
        this.game.usePlayerSkill(k);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toUpperCase()] = false;
    });

    // Minimap Interaction
    if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('mousedown', (e) => {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const clickMiniX = e.clientX - rect.left;
        const clickMiniY = e.clientY - rect.top;

        const targetWorldX = (clickMiniX / this.minimapCanvas.width) * MAP_WIDTH;
        const targetWorldY = (clickMiniY / this.minimapCanvas.height) * MAP_HEIGHT;

        if (e.button === 0) {
          // Left Click: Move Camera
          this.game.camera.targetX = targetWorldX - this.canvas.width / 2;
          this.game.camera.targetY = targetWorldY - this.canvas.height / 2;
          if (this.game.camera.locked) {
            this.game.camera.locked = false;
            this.game.hud.updateCameraBtn(false);
          }
        } else if (e.button === 2) {
          // Right Click: Move Hero
          const player = this.game.player;
          if (player && player.alive) {
            player.attackTarget = null;
            player.targetX = targetWorldX;
            player.targetY = targetWorldY;
            this.game.createClickWave(targetWorldX, targetWorldY, '#388bfd');
          }
        }
      });
    }
  }
}
