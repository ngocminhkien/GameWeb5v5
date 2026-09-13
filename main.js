import { Game } from './src/core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const minimapCanvas = document.getElementById('minimapCanvas');
  const minimapWrapper = document.getElementById('minimap-wrapper');

  // Handle Canvas Resize
  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    minimapCanvas.width = minimapWrapper.clientWidth;
    minimapCanvas.height = minimapWrapper.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Instantiate Game
  const game = new Game(canvas, minimapCanvas, minimapWrapper);

  // Bind Header Controls
  const btnPve = document.getElementById('btn-pve');
  const btnSolo = document.getElementById('btn-solo');
  const btnCamera = document.getElementById('btn-camera');
  const btnReset = document.getElementById('btn-reset');

  if (btnPve) {
    btnPve.addEventListener('click', () => {
      btnPve.classList.add('active');
      btnSolo.classList.remove('active');
      game.setMode('pve');
    });
  }

  if (btnSolo) {
    btnSolo.addEventListener('click', () => {
      btnSolo.classList.add('active');
      btnPve.classList.remove('active');
      game.setMode('solo');
    });
  }

  if (btnCamera) {
    btnCamera.addEventListener('click', () => {
      const locked = game.camera.toggleLock();
      game.hud.updateCameraBtn(locked);
      game.hud.announce(locked ? '📷 [Y] Đã KHÓA Camera' : '📷 [Y] Đã MỞ KHÓA Camera');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      game.initMatch();
    });
  }

  // Start the Game Loop
  game.start();

  // Expose to window for debugging if needed
  window.gameInstance = game;
});
