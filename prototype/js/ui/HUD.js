/**
 * OOP HUD Manager
 * Encapsulates Scoreboard, Match Clock, Progression Bar, Gold Counter,
 * Upgrade Buttons, Skill Cooldowns, Announcements, and Floating Text Particles
 */
class HUD {
  constructor() {
    this.timerEl = document.getElementById('match-timer');
    this.blueKillsEl = document.getElementById('blue-kills');
    this.redKillsEl = document.getElementById('red-kills');
    this.announcementEl = document.getElementById('announcement');
    this.btnCamera = document.getElementById('btn-camera');

    this.levelBadgeEl = document.getElementById('hero-level-badge');
    this.expFillEl = document.getElementById('exp-fill');
    this.expTextEl = document.getElementById('exp-text');
    this.goldCountEl = document.getElementById('gold-count');

    this.floatingTexts = [];
    this.fadeTimer = null;
  }

  updateClock(matchTime) {
    if (this.timerEl) {
      const mins = Math.floor(matchTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(matchTime % 60).toString().padStart(2, '0');
      this.timerEl.innerText = `⏱️ ${mins}:${secs}`;
    }
  }

  updateScores(blueKills, redKills) {
    if (this.blueKillsEl) this.blueKillsEl.innerText = `Đội Xanh: ${blueKills}`;
    if (this.redKillsEl) this.redKillsEl.innerText = `Đội Đỏ (Bot): ${redKills}`;
  }

  updateCameraBtn(locked) {
    if (this.btnCamera) {
      this.btnCamera.className = locked ? 'btn btn-cam-locked' : 'btn btn-cam-unlocked';
      this.btnCamera.innerText = locked ? '📷 [Y] Khóa Camera: BẬT' : '📷 [Y] Khóa Camera: TẮT';
    }
  }

  announce(text) {
    if (!this.announcementEl) return;
    this.announcementEl.innerText = text;
    this.announcementEl.style.opacity = 1;
    clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      this.announcementEl.style.opacity = 0;
    }, 2700);
  }

  addFloatingText(text, x, y, color = '#fff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.3,
      color,
      alpha: 1.0,
      life: 50
    });
  }

  updateProgression(player) {
    if (!player) return;

    if (this.levelBadgeEl) {
      this.levelBadgeEl.innerText = `LV ${player.level}`;
    }

    if (this.expFillEl && this.expTextEl) {
      if (player.level >= MAX_LEVEL) {
        this.expFillEl.style.width = '100%';
        this.expTextEl.innerText = 'CẤP TỐI ĐA (MAX 15)';
      } else {
        const ratio = Math.max(0, Math.min(1, player.exp / (player.maxExp || 1)));
        const pct = Math.round(ratio * 100);
        this.expFillEl.style.width = `${pct}%`;
        this.expTextEl.innerText = `EXP: ${Math.round(player.exp)} / ${player.maxExp} (${pct}%)`;
      }
    }

    if (this.goldCountEl) {
      this.goldCountEl.innerText = Math.floor(player.gold);
    }

    ['Q', 'W', 'E', 'R'].forEach(slot => {
      const lower = slot.toLowerCase();
      const btn = document.getElementById(`btn-up-${lower}`);
      const lock = document.getElementById(`lock-${lower}`);
      const rank = player.skillRanks[slot] || 0;

      if (lock) lock.style.display = rank > 0 ? 'none' : 'flex';
      if (btn) btn.style.display = player.canUpgradeSkill(slot) ? 'flex' : 'none';

      const pipsContainer = document.getElementById(`pips-${lower}`);
      if (pipsContainer) {
        const pips = pipsContainer.getElementsByClassName('pip');
        for (let i = 0; i < pips.length; i++) {
          if (i < rank) pips[i].classList.add('active');
          else pips[i].classList.remove('active');
        }
      }
    });
  }

  updateCooldowns(player) {
    if (!player) return;
    ['q', 'w', 'e', 'r', 'b'].forEach(k => {
      const cdVal = player.cooldowns[k.toUpperCase()];
      const cdEl = document.getElementById(`cd-${k}`);
      if (cdEl) {
        if (cdVal > 0) {
          cdEl.style.display = 'flex';
          cdEl.innerText = cdVal.toFixed(1);
        } else {
          cdEl.style.display = 'none';
        }
      }
    });
  }

  drawFloatingTexts(ctx, camera) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      ft.alpha = ft.life / 50;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      } else {
        ctx.save();
        ctx.font = 'bold 15px Segoe UI, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x - camera.x, ft.y - camera.y);
        ctx.restore();
      }
    }
  }
}
