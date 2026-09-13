/**
 * HUD & UI Management Module
 */
export class HUD {
  constructor() {
    this.blueScoreEl = document.getElementById('blue-kills');
    this.redScoreEl = document.getElementById('red-kills');
    this.clockEl = document.getElementById('match-timer');
    this.announcementEl = document.getElementById('announcement');
    this.btnCamera = document.getElementById('btn-camera');
    this.levelBadgeEl = document.getElementById('hero-level-badge');
    this.expFillEl = document.getElementById('exp-fill');
    this.expTextEl = document.getElementById('exp-text');
    this.goldCountEl = document.getElementById('gold-count');

    this.btnUpgrades = {
      Q: document.getElementById('btn-up-q'),
      W: document.getElementById('btn-up-w'),
      E: document.getElementById('btn-up-e'),
      R: document.getElementById('btn-up-r')
    };

    this.skillLocks = {
      Q: document.getElementById('lock-q'),
      W: document.getElementById('lock-w'),
      E: document.getElementById('lock-e'),
      R: document.getElementById('lock-r')
    };
  }

  bindUpgradeButtons(onUpgrade) {
    ['Q', 'W', 'E', 'R'].forEach(slot => {
      const btn = this.btnUpgrades[slot];
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onUpgrade) onUpgrade(slot);
        });
      }
    });
  }

  updateClock(timeSeconds) {
    if (!this.clockEl) this.clockEl = document.getElementById('match-timer');
    if (this.clockEl) {
      const mins = Math.floor(timeSeconds / 60).toString().padStart(2, '0');
      const secs = Math.floor(timeSeconds % 60).toString().padStart(2, '0');
      this.clockEl.innerText = `⏱️ ${mins}:${secs}`;
    }
  }

  updateScores(blueScore, redScore) {
    if (this.blueScoreEl) this.blueScoreEl.innerText = `Đội Xanh: ${blueScore}`;
    if (this.redScoreEl) this.redScoreEl.innerText = `Đội Đỏ (Bot): ${redScore}`;
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

  updateCameraBtn(isLocked) {
    if (!this.btnCamera) return;
    if (isLocked) {
      this.btnCamera.className = 'btn btn-cam-locked';
      this.btnCamera.innerHTML = '📷 [Y] Khóa Camera: BẬT';
    } else {
      this.btnCamera.className = 'btn btn-cam-unlocked';
      this.btnCamera.innerHTML = '📷 [Y] Khóa Camera: TẮT';
    }
  }

  updateProgression(player) {
    if (!player) return;

    // 1. Level badge
    if (this.levelBadgeEl) {
      this.levelBadgeEl.innerText = `LV ${player.level}`;
    }

    // 2. EXP Bar
    if (this.expFillEl && this.expTextEl) {
      if (player.level >= 15) {
        this.expFillEl.style.width = '100%';
        this.expTextEl.innerText = 'CẤP TỐI ĐA (MAX 15)';
      } else {
        const ratio = Math.max(0, Math.min(1, player.exp / (player.maxExp || 1)));
        const pct = Math.round(ratio * 100);
        this.expFillEl.style.width = `${pct}%`;
        this.expTextEl.innerText = `EXP: ${Math.round(player.exp)} / ${player.maxExp} (${pct}%)`;
      }
    }

    // 3. Gold counter
    if (this.goldCountEl) {
      this.goldCountEl.innerText = Math.floor(player.gold);
    }

    // 4. Upgrade buttons & Locks
    ['Q', 'W', 'E', 'R'].forEach(slot => {
      const btn = this.btnUpgrades[slot];
      const lock = this.skillLocks[slot];
      const rank = player.skillRanks[slot] || 0;

      // Lock overlay
      if (lock) {
        lock.style.display = rank > 0 ? 'none' : 'flex';
      }

      // Upgrade button [+]
      if (btn) {
        if (player.canUpgradeSkill(slot)) {
          btn.style.display = 'flex';
        } else {
          btn.style.display = 'none';
        }
      }

      // Rank pips
      const pipsContainer = document.getElementById(`pips-${slot.toLowerCase()}`);
      if (pipsContainer) {
        const pips = pipsContainer.getElementsByClassName('pip');
        for (let i = 0; i < pips.length; i++) {
          if (i < rank) {
            pips[i].classList.add('active');
          } else {
            pips[i].classList.remove('active');
          }
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
}
