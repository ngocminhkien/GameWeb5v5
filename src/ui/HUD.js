import { ITEMS } from '../config/items.js';
import { CHAMPIONS } from '../config/champions.js';

/**
 * HUD & UI Management Module (Includes Progression, Inventory, Shop & Champion Select System)
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

    // HUD Inventory Slots (1-6)
    this.invSlots = [
      document.getElementById('inv-slot-0'),
      document.getElementById('inv-slot-1'),
      document.getElementById('inv-slot-2'),
      document.getElementById('inv-slot-3'),
      document.getElementById('inv-slot-4'),
      document.getElementById('inv-slot-5')
    ];

    // Champion Identity & Resource Bars
    this.avatarEl = document.getElementById('hero-avatar-icon');
    this.hpFillEl = document.getElementById('hud-hp-fill');
    this.shieldFillEl = document.getElementById('hud-shield-fill');
    this.hpTextEl = document.getElementById('hud-hp-text');
    this.hpRegenEl = document.getElementById('hud-hp-regen');
    this.manaFillEl = document.getElementById('hud-mana-fill');
    this.manaTextEl = document.getElementById('hud-mana-text');
    this.manaRegenEl = document.getElementById('hud-mana-regen');

    // Real-time Combat Stats
    this.statAdEl = document.getElementById('hud-stat-ad');
    this.statApEl = document.getElementById('hud-stat-ap');
    this.statArmorEl = document.getElementById('hud-stat-armor');
    this.statAsEl = document.getElementById('hud-stat-as');
    this.statCritEl = document.getElementById('hud-stat-crit');
    this.statSpeedEl = document.getElementById('hud-stat-speed');

    // Shop Modal Elements
    this.shopModal = document.getElementById('shop-modal');
    this.btnOpenShop = document.getElementById('btn-open-shop');
    this.btnCloseShop = document.getElementById('btn-close-shop');
    this.shopFountainBadge = document.getElementById('shop-fountain-status');
    this.shopGoldCount = document.getElementById('shop-gold-count');
    this.shopItemGrid = document.getElementById('shop-item-grid');

    // Shop Preview Pane
    this.previewIcon = document.getElementById('shop-preview-icon');
    this.previewName = document.getElementById('shop-preview-name');
    this.previewCost = document.getElementById('shop-preview-cost');
    this.previewDesc = document.getElementById('shop-preview-desc');
    this.btnBuy = document.getElementById('btn-shop-buy');
    this.btnSell = document.getElementById('btn-shop-sell');

    // Shop Inventory Preview Slots
    this.shopInvSlots = [
      document.getElementById('shop-inv-0'),
      document.getElementById('shop-inv-1'),
      document.getElementById('shop-inv-2'),
      document.getElementById('shop-inv-3'),
      document.getElementById('shop-inv-4'),
      document.getElementById('shop-inv-5')
    ];

    this.selectedItemId = 'long_sword';
    this.selectedInvSlot = -1;
    this.currentCategory = 'all';
    this.currentTier = 'all';

    this.onBuyItemCallback = null;
    this.onSellItemCallback = null;
    this.onUseItemCallback = null;

    // Champion Select Modal Elements
    this.champModal = document.getElementById('champ-select-modal');
    this.btnOpenChampSelect = document.getElementById('btn-champ-select');
    this.btnCloseChampSelect = document.getElementById('btn-close-champ-select');
    this.btnLockChamp = document.getElementById('btn-lock-champ');
    this.champCardsContainer = document.getElementById('champ-cards-container');
    this.champSelectedName = document.getElementById('champ-selected-name');
    this.champSelectedTitle = document.getElementById('champ-selected-title');
    this.selectedChampId = 'mage';
    this.onSelectChampionCallback = null;

    // Buff Badges
    this.buffDragonEl = document.getElementById('buff-dragon');
    this.buffDragonStacksEl = document.getElementById('buff-dragon-stacks');
    this.buffBaronEl = document.getElementById('buff-baron');
    this.buffBaronTimerEl = document.getElementById('buff-baron-timer');
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

    // 1. Level badge & Avatar
    if (this.levelBadgeEl) {
      this.levelBadgeEl.innerText = `LV ${player.level}`;
    }
    if (this.avatarEl && player.symbol) {
      this.avatarEl.innerText = player.symbol;
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

    // 3. HP & Shield Resource Bars
    if (this.hpFillEl) {
      const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
      this.hpFillEl.style.width = `${hpPct}%`;
    }
    if (this.shieldFillEl) {
      if (player.shield > 0) {
        const shieldPct = Math.max(0, Math.min(100, (player.shield / player.maxHp) * 100));
        this.shieldFillEl.style.width = `${shieldPct}%`;
        this.shieldFillEl.style.display = 'block';
      } else {
        this.shieldFillEl.style.display = 'none';
      }
    }
    if (this.hpTextEl) {
      const shieldTxt = player.shield > 0 ? ` (+${Math.round(player.shield)} 🛡️)` : '';
      this.hpTextEl.innerText = `${Math.round(player.hp)} / ${Math.round(player.maxHp)}${shieldTxt}`;
    }
    if (this.hpRegenEl) {
      const regenVal = (player.hpRegen || 4.5).toFixed(1);
      this.hpRegenEl.innerText = `+${regenVal}`;
    }

    // 4. Mana Resource Bar
    if (this.manaFillEl) {
      const manaPct = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
      this.manaFillEl.style.width = `${manaPct}%`;
    }
    if (this.manaTextEl) {
      this.manaTextEl.innerText = `${Math.round(player.mana)} / ${Math.round(player.maxMana)}`;
    }
    if (this.manaRegenEl) {
      const regenVal = (player.manaRegen || 3.0).toFixed(1);
      this.manaRegenEl.innerText = `+${regenVal}`;
    }

    // 5. Real-time Combat Stats
    if (this.statAdEl) this.statAdEl.innerText = Math.round(player.attackDamage || 85);
    if (this.statApEl) this.statApEl.innerText = Math.round(player.abilityPower || 0);
    if (this.statArmorEl) this.statArmorEl.innerText = Math.round(player.armor || 0);
    if (this.statAsEl) {
      const attacksPerSec = player.attackSpeed ? (1 / player.attackSpeed) : 0.9;
      this.statAsEl.innerText = attacksPerSec.toFixed(2);
    }
    if (this.statCritEl) this.statCritEl.innerText = `${Math.round((player.critChance || 0) * 100)}%`;
    if (this.statSpeedEl) {
      const effSpeed = player.slowRatio > 0 ? player.speed * (1 - player.slowRatio) : player.speed;
      this.statSpeedEl.innerText = Math.round(effSpeed);
    }

    // 6. Gold counter
    if (this.goldCountEl) {
      this.goldCountEl.innerText = Math.floor(player.gold);
    }

    // 7. Upgrade buttons & Locks
    ['Q', 'W', 'E', 'R'].forEach(slot => {
      const btn = this.btnUpgrades[slot];
      const lock = this.skillLocks[slot];
      const rank = player.skillRanks[slot] || 0;

      if (lock) {
        lock.style.display = rank > 0 ? 'none' : 'flex';
      }

      if (btn) {
        btn.style.display = player.canUpgradeSkill(slot) ? 'flex' : 'none';
      }

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

    this.updateInventory(player);
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

    // Update active item cooldowns on HUD
    for (let i = 0; i < 6; i++) {
      const cdEl = document.getElementById(`inv-cd-${i}`);
      if (cdEl) {
        const cd = player.itemActiveCooldowns[i] || 0;
        if (cd > 0) {
          cdEl.style.display = 'flex';
          cdEl.innerText = cd.toFixed(0);
        } else {
          cdEl.style.display = 'none';
        }
      }
    }
  }

  // ================= SHOP & INVENTORY UI =================
  initShop(player, onBuy, onSell, onUse) {
    this.onBuyItemCallback = onBuy;
    this.onSellItemCallback = onSell;
    this.onUseItemCallback = onUse;

    if (this.btnOpenShop) {
      this.btnOpenShop.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleShop(player);
      });
    }

    if (this.btnCloseShop) {
      this.btnCloseShop.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeShop();
      });
    }

    // Tier Tabs
    const tierTabs = document.querySelectorAll('.shop-tier-tab');
    tierTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        tierTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTier = tab.dataset.tier || 'all';
        this.renderShopGrid(player);
      });
    });

    // Category Tabs
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCategory = tab.dataset.category || 'all';
        this.renderShopGrid(player);
      });
    });

    // Buy Button
    if (this.btnBuy) {
      this.btnBuy.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedItemId && this.onBuyItemCallback) {
          this.onBuyItemCallback(this.selectedItemId);
          this.updateShop(player);
        }
      });
    }

    // Sell Button
    if (this.btnSell) {
      this.btnSell.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedInvSlot !== -1 && this.onSellItemCallback) {
          this.onSellItemCallback(this.selectedInvSlot);
          this.selectedInvSlot = -1;
          this.updateShop(player);
        }
      });
    }

    // HUD Inventory Slots Clicks
    this.invSlots.forEach((slotEl, idx) => {
      if (!slotEl) return;
      slotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onUseItemCallback) this.onUseItemCallback(idx);
      });
      slotEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onSellItemCallback) {
          this.onSellItemCallback(idx);
          this.updateInventory(player);
        }
      });
    });

    // Shop Inventory Slots Clicks
    this.shopInvSlots.forEach((slotEl, idx) => {
      if (!slotEl) return;
      slotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectShopInvSlot(idx, player);
      });
    });

    this.renderShopGrid(player);
    this.selectShopItem('long_sword', player);
    this.updateInventory(player);
  }

  isShopOpen() {
    return this.shopModal && this.shopModal.style.display === 'flex';
  }

  toggleShop(player) {
    if (this.isShopOpen()) {
      this.closeShop();
    } else {
      this.openShop(player);
    }
  }

  openShop(player) {
    if (!this.shopModal) return;
    this.shopModal.style.display = 'flex';
    this.updateShop(player);
  }

  closeShop() {
    if (!this.shopModal) return;
    this.shopModal.style.display = 'none';
  }

  renderShopGrid(player) {
    if (!this.shopItemGrid) return;
    this.shopItemGrid.innerHTML = '';

    const items = Object.values(ITEMS);
    const filtered = items.filter(it => {
      const matchCat = (this.currentCategory === 'all' || it.category === this.currentCategory);
      const matchTier = (this.currentTier === 'all' || String(it.tier) === String(this.currentTier));
      return matchCat && matchTier;
    });

    filtered.forEach(it => {
      const card = document.createElement('div');
      card.className = `shop-card ${it.id === this.selectedItemId ? 'selected' : ''}`;
      
      const pricing = player && player.calculateItemCost ? player.calculateItemCost(it.id) : { finalCost: it.cost, discount: 0 };
      if (player && player.gold < pricing.finalCost) card.classList.add('cannot-afford');

      card.innerHTML = `
        <div class="shop-card-icon">${it.icon}</div>
        <div class="shop-card-info">
          <div class="shop-card-top">
            <span class="shop-card-name">${it.name}</span>
            <span class="shop-card-tier tier-${it.tier}">C${it.tier}</span>
          </div>
          <div class="shop-card-cost">
            💰 ${pricing.finalCost}
            ${pricing.discount > 0 ? `<s class="cost-original">${it.cost}</s>` : ''}
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.shop-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectShopItem(it.id, player);
      });

      card.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (this.onBuyItemCallback) {
          this.onBuyItemCallback(it.id);
          this.updateShop(player);
        }
      });

      this.shopItemGrid.appendChild(card);
    });
  }

  selectShopItem(itemId, player) {
    this.selectedItemId = itemId;
    const it = ITEMS[itemId];
    if (!it) return;

    if (this.previewIcon) this.previewIcon.innerText = it.icon;
    if (this.previewName) this.previewName.innerText = it.name;

    const pricing = player && player.calculateItemCost ? player.calculateItemCost(it.id) : { finalCost: it.cost, discount: 0 };
    if (this.previewCost) {
      if (pricing.discount > 0) {
        this.previewCost.innerHTML = `💰 ${pricing.finalCost} Vàng <s class="cost-original">${it.cost}</s> <span style="color: #3fb950; font-size: 11px;">(-${pricing.discount})</span>`;
      } else {
        this.previewCost.innerText = `💰 ${it.cost} Vàng`;
      }
    }

    if (this.previewDesc) {
      let descText = it.desc || '';
      if (it.active) {
        descText += `<br><strong style="color: #ffd700;">[KÍCH HOẠT ${it.active.name}]:</strong> Hồi chiêu ${it.active.cd}s.`;
      }
      this.previewDesc.innerHTML = descText;
    }

    // Render Recipe Components
    const recipeContainer = document.getElementById('shop-recipe-container');
    if (recipeContainer) {
      recipeContainer.innerHTML = '';
      if (it.recipe && it.recipe.length > 0) {
        const title = document.createElement('div');
        title.className = 'recipe-section-title';
        title.innerText = 'THÀNH PHẦN GHÉP:';
        recipeContainer.appendChild(title);

        const row = document.createElement('div');
        row.className = 'recipe-items-row';

        const invItemIds = player ? player.inventory.filter(s => s).map(s => s.id) : [];
        const usedIndices = new Set();

        it.recipe.forEach(compKey => {
          const compDef = ITEMS[compKey];
          if (!compDef) return;
          const compEl = document.createElement('div');
          
          let isOwned = false;
          const foundIdx = invItemIds.findIndex((id, idx) => id === compKey && !usedIndices.has(idx));
          if (foundIdx !== -1) {
            isOwned = true;
            usedIndices.add(foundIdx);
          }

          compEl.className = `recipe-mini-card ${isOwned ? 'owned' : ''}`;
          compEl.title = `${compDef.name} (💰 ${compDef.cost})\n${isOwned ? '✓ ĐÃ CÓ TRONG TÚI ĐỒ' : 'Chưa có - Nhấp để xem'}`;
          compEl.innerHTML = `
            <span class="recipe-mini-icon">${compDef.icon}</span>
            <span class="recipe-mini-name">${compDef.name}</span>
            <span class="recipe-mini-cost">💰 ${compDef.cost}</span>
            ${isOwned ? '<span class="recipe-owned-tag">✓ ĐÃ CÓ</span>' : ''}
          `;
          compEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectShopItem(compKey, player);
            this.renderShopGrid(player);
          });
          row.appendChild(compEl);
        });
        recipeContainer.appendChild(row);
      }
    }

    // Render Builds-Into Upgrades
    const buildsIntoContainer = document.getElementById('shop-builds-into-container');
    if (buildsIntoContainer) {
      buildsIntoContainer.innerHTML = '';
      const buildsInto = Object.values(ITEMS).filter(other => other.recipe && other.recipe.includes(itemId));
      if (buildsInto.length > 0) {
        const title = document.createElement('div');
        title.className = 'recipe-section-title';
        title.innerText = 'NÂNG CẤP LÊN:';
        buildsIntoContainer.appendChild(title);

        const row = document.createElement('div');
        row.className = 'recipe-items-row';
        buildsInto.forEach(upDef => {
          const upEl = document.createElement('div');
          upEl.className = 'recipe-mini-card';
          upEl.title = `${upDef.name} (💰 ${upDef.cost}) - Nhấp để xem`;
          upEl.innerHTML = `
            <span class="recipe-mini-icon">${upDef.icon}</span>
            <span class="recipe-mini-name">${upDef.name}</span>
            <span class="recipe-mini-cost">💰 ${upDef.cost}</span>
          `;
          upEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectShopItem(upDef.id, player);
            this.renderShopGrid(player);
          });
          row.appendChild(upEl);
        });
        buildsIntoContainer.appendChild(row);
      }
    }

    this.updateBuyButton(player);
  }

  selectShopInvSlot(slotIdx, player) {
    this.selectedInvSlot = slotIdx;
    this.shopInvSlots.forEach((s, idx) => {
      if (s) s.classList.toggle('selected-slot', idx === slotIdx);
    });

    const slot = player ? player.inventory[slotIdx] : null;
    if (this.btnSell) {
      if (slot) {
        const itemDef = ITEMS[slot.id];
        const refund = Math.floor((itemDef ? itemDef.cost : 0) * 0.7);
        this.btnSell.disabled = !player.isInFountain();
        this.btnSell.innerText = `Bán (${refund} 💰)`;
      } else {
        this.btnSell.disabled = true;
        this.btnSell.innerText = 'Bán Trang Bị';
      }
    }
  }

  updateBuyButton(player) {
    if (!this.btnBuy) return;
    const it = ITEMS[this.selectedItemId];
    if (!it || !player) {
      this.btnBuy.disabled = true;
      return;
    }

    const inFountain = player.isInFountain();
    const pricing = player.calculateItemCost ? player.calculateItemCost(it.id) : { matchedSlots: [], discount: 0, finalCost: it.cost };
    const canAfford = player.gold >= pricing.finalCost;
    const hasEmptySlot = player.inventory.some(s => s === null) 
      || (pricing.matchedSlots && pricing.matchedSlots.length > 0)
      || (it.isConsumable && player.inventory.some(s => s && s.id === it.id && s.count < (it.maxStack || 3)));

    if (!inFountain) {
      this.btnBuy.disabled = true;
      this.btnBuy.innerText = 'Cần ở Bệ Đá Cổ';
    } else if (!canAfford) {
      this.btnBuy.disabled = true;
      this.btnBuy.innerText = `Thiếu ${pricing.finalCost - Math.floor(player.gold)} 💰`;
    } else if (!hasEmptySlot) {
      this.btnBuy.disabled = true;
      this.btnBuy.innerText = 'Túi đồ đã đầy';
    } else {
      this.btnBuy.disabled = false;
      if (pricing.discount > 0) {
        this.btnBuy.innerText = `MUA (${pricing.finalCost} 💰 - Giảm ${pricing.discount})`;
      } else {
        this.btnBuy.innerText = `MUA (${it.cost} 💰)`;
      }
    }
  }

  updateShop(player) {
    if (!player) return;

    if (this.shopGoldCount) {
      this.shopGoldCount.innerText = Math.floor(player.gold);
    }

    if (this.shopFountainBadge) {
      const inFountain = player.isInFountain();
      if (inFountain) {
        this.shopFountainBadge.className = 'fountain-status in';
        this.shopFountainBadge.innerText = '🟢 Đang ở Bệ Đá Cổ (Được phép Mua/Bán)';
      } else {
        this.shopFountainBadge.className = 'fountain-status out';
        this.shopFountainBadge.innerText = '🔴 Ngoài Bệ Đá Cổ (Chỉ có thể xem)';
      }
    }

    this.renderShopGrid(player);
    this.updateBuyButton(player);

    // Update Shop Inventory Slots
    this.shopInvSlots.forEach((slotEl, idx) => {
      if (!slotEl) return;
      const slot = player.inventory[idx];
      if (slot) {
        const it = ITEMS[slot.id];
        slotEl.innerHTML = `
          <div class="slot-icon">${it ? it.icon : '❓'}</div>
          ${slot.count > 1 ? `<div class="slot-badge">x${slot.count}</div>` : ''}
        `;
        slotEl.title = it ? `${it.name} - Bấm để chọn bán` : '';
      } else {
        slotEl.innerHTML = `<div class="slot-empty">${idx + 1}</div>`;
        slotEl.title = 'Ô trống';
      }
    });

    if (this.selectedInvSlot !== -1) {
      this.selectShopInvSlot(this.selectedInvSlot, player);
    }
  }

  updateInventory(player) {
    if (!player) return;

    this.invSlots.forEach((slotEl, idx) => {
      if (!slotEl) return;
      const slot = player.inventory[idx];
      const iconEl = slotEl.querySelector('.inv-icon');
      const badgeEl = slotEl.querySelector('.inv-badge');

      if (slot) {
        const it = ITEMS[slot.id];
        if (iconEl) iconEl.innerText = it ? it.icon : '';
        if (badgeEl) {
          if (slot.count > 1) {
            badgeEl.style.display = 'flex';
            badgeEl.innerText = slot.count;
          } else {
            badgeEl.style.display = 'none';
          }
        }
        slotEl.title = it ? `${it.name}\n${it.desc}\n[Chuột trái / Phím ${idx + 1}]: Kích hoạt\n[Chuột phải]: Bán tại Bệ Đá Cổ` : '';
        slotEl.classList.add('has-item');
      } else {
        if (iconEl) iconEl.innerText = '';
        if (badgeEl) badgeEl.style.display = 'none';
        slotEl.title = `Ô ${idx + 1} (Trống)`;
        slotEl.classList.remove('has-item');
      }
    });

    if (this.isShopOpen()) {
      this.updateShop(player);
    }
  }

  updateChampionSkills(champId) {
    const champ = CHAMPIONS[champId];
    if (!champ) return;

    if (this.avatarEl) {
      this.avatarEl.innerText = champ.symbol || '🧙‍♂️';
      this.avatarEl.style.borderColor = champ.avatarColor || '#ffd700';
    }

    const skills = champ.skills;
    if (!skills) return;

    ['q', 'w', 'e', 'r'].forEach(slotKey => {
      const upper = slotKey.toUpperCase();
      const s = skills[upper];
      if (!s) return;
      const nameEl = document.getElementById(`skill-${slotKey}-name`);
      if (nameEl) {
        nameEl.innerText = s.name;
      }
      const iconEl = document.getElementById(`skill-${slotKey}-icon`);
      if (iconEl) {
        iconEl.title = `[${upper}] ${s.name}\n${s.desc}`;
      }
    });
  }

  updateBuffs(player) {
    if (!player) return;

    if (this.buffDragonEl) {
      const stacks = player.dragonBuffStacks || 0;
      if (stacks > 0) {
        this.buffDragonEl.style.display = 'flex';
        if (this.buffDragonStacksEl) this.buffDragonStacksEl.innerText = stacks;
        this.buffDragonEl.title = `🐲 Bùa Rồng x${stacks}: +${stacks * 6}% AD, +${stacks * 9}% AP, +${stacks * 4}% Tốc chạy`;
      } else {
        this.buffDragonEl.style.display = 'none';
      }
    }

    if (this.buffBaronEl) {
      if (player.hasBaronBuff && player.baronTimer > 0) {
        this.buffBaronEl.style.display = 'flex';
        if (this.buffBaronTimerEl) this.buffBaronTimerEl.innerText = Math.ceil(player.baronTimer);
        this.buffBaronEl.title = `👾 Bùa Baron (${Math.ceil(player.baronTimer)}s): +40 AD, +60 AP, Cường hoá Lính đồng minh xung quanh!`;
      } else {
        this.buffBaronEl.style.display = 'none';
      }
    }
  }

  initChampSelect(onSelect) {
    this.onSelectChampionCallback = onSelect;

    if (this.btnOpenChampSelect) {
      this.btnOpenChampSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openChampSelect();
      });
    }

    if (this.btnCloseChampSelect) {
      this.btnCloseChampSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeChampSelect();
      });
    }

    if (this.btnLockChamp) {
      this.btnLockChamp.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onSelectChampionCallback && this.selectedChampId) {
          this.onSelectChampionCallback(this.selectedChampId);
          this.updateChampionSkills(this.selectedChampId);
        }
        this.closeChampSelect();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isChampSelectOpen()) {
        this.closeChampSelect();
      }
    });

    this.renderChampCards();
  }

  openChampSelect() {
    if (this.champModal) {
      this.champModal.style.display = 'flex';
      this.renderChampCards();
    }
  }

  closeChampSelect() {
    if (this.champModal) {
      this.champModal.style.display = 'none';
    }
  }

  isChampSelectOpen() {
    return this.champModal && this.champModal.style.display !== 'none';
  }

  renderChampCards() {
    if (!this.champCardsContainer) return;
    this.champCardsContainer.innerHTML = '';

    Object.values(CHAMPIONS).forEach(champ => {
      const card = document.createElement('div');
      const isSelected = champ.id === this.selectedChampId;
      card.className = `champ-card ${isSelected ? 'active' : ''}`;
      card.dataset.champ = champ.id;

      card.innerHTML = `
        <div class="champ-card-header">
          <div class="champ-role-badge badge-${champ.id}">${champ.roleBadge}</div>
          <div class="champ-card-avatar" style="background: ${champ.avatarColor}; border-color: ${champ.themeColor};">
            ${champ.symbol}
          </div>
          <h3 class="champ-card-name">${champ.name}</h3>
          <div class="champ-card-title">${champ.title}</div>
        </div>
        <div class="champ-card-passive">
          <strong>${champ.skills.passive.icon} ${champ.skills.passive.name}:</strong> ${champ.skills.passive.desc}
        </div>
        <div class="champ-skills-list">
          <div class="champ-skill-row"><span class="c-key">Q</span><strong>${champ.skills.Q.name}:</strong> ${champ.skills.Q.desc}</div>
          <div class="champ-skill-row"><span class="c-key">W</span><strong>${champ.skills.W.name}:</strong> ${champ.skills.W.desc}</div>
          <div class="champ-skill-row"><span class="c-key">E</span><strong>${champ.skills.E.name}:</strong> ${champ.skills.E.desc}</div>
          <div class="champ-skill-row"><span class="c-key ult">R</span><strong>${champ.skills.R.name}:</strong> ${champ.skills.R.desc}</div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectChampCard(champ.id);
      });

      this.champCardsContainer.appendChild(card);
    });

    this.updateChampSelectedInfo();
  }

  selectChampCard(champId) {
    this.selectedChampId = champId;
    if (this.champCardsContainer) {
      const cards = this.champCardsContainer.querySelectorAll('.champ-card');
      cards.forEach(c => {
        if (c.dataset.champ === champId) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }
    this.updateChampSelectedInfo();
  }

  updateChampSelectedInfo() {
    const champ = CHAMPIONS[this.selectedChampId];
    if (!champ) return;
    if (this.champSelectedName) this.champSelectedName.innerText = champ.name;
    if (this.champSelectedTitle) this.champSelectedTitle.innerText = `${champ.roleBadge} - ${champ.title}`;
  }
}
