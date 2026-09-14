/**
 * OOP Hero Class
 * Handles Leveling, Economy, Skills, Movement, Combat, and Visual Token Rendering
 */
class Hero extends Entity {
  constructor(config = {}) {
    super({
      id: config.id || 'hero',
      name: config.name || 'Hero',
      team: config.team || 'blue',
      x: config.x || 1200,
      y: config.y || 13800,
      radius: 32,
      maxHp: config.maxHp || 1400,
      color: config.team === 'blue' ? '#388bfd' : '#f85149',
      symbol: config.symbol || '⚔️',
      visionRadius: config.isPlayer ? 950 : 900
    });

    this.isPlayer = config.isPlayer || false;

    // Champion Selection & Identity
    const championsData = window.CHAMPIONS || {};
    this.championId = config.championId || 'mage';
    const cDef = championsData[this.championId] || championsData.mage || {
      name: 'Valhein',
      symbol: '🧙‍♂️',
      avatarColor: '#8957e5',
      baseStats: { hp: 1400, mana: 700, attackDamage: 75, abilityPower: 30, armor: 28, speed: 410, attackRange: 550, attackSpeed: 0.9, hpRegen: 12, manaRegen: 22 },
      skills: { Q: { cd: [1.8] }, W: { cd: [6.0] }, E: { cd: [7.0] }, R: { cd: [35] } }
    };
    this.championDef = cDef;

    this.targetX = this.x;
    this.targetY = this.y;
    this.facingAngle = 0;

    this.maxHp = config.maxHp || cDef.baseStats.hp;
    this.hp = this.maxHp;
    this.maxMana = config.maxMana || cDef.baseStats.mana;
    this.mana = this.maxMana;
    this.shield = 0;
    this.hpRegen = cDef.baseStats.hpRegen;
    this.manaRegen = cDef.baseStats.manaRegen;
    this.respawnTimer = 0;

    // Base stats (before item bonuses)
    this.baseMaxHp = this.maxHp;
    this.baseMaxMana = this.maxMana;
    this.baseAttackDamage = cDef.baseStats.attackDamage;
    this.baseHpRegen = cDef.baseStats.hpRegen;
    this.baseManaRegen = cDef.baseStats.manaRegen;
    this.baseSpeed = cDef.baseStats.speed;
    this.baseAttackSpeed = cDef.baseStats.attackSpeed;
    this.attackRange = cDef.baseStats.attackRange;
    this.baseAttackRange = cDef.baseStats.attackRange;
    this.attackDamage = this.baseAttackDamage;
    this.speed = this.baseSpeed;
    this.attackSpeed = this.baseAttackSpeed;
    this.armor = cDef.baseStats.armor;
    this.baseArmor = cDef.baseStats.armor;
    this.abilityPower = cDef.baseStats.abilityPower;
    this.baseAbilityPower = cDef.baseStats.abilityPower;

    // Summoner Spells (D & F)
    const spellsCatalog = window.SPELLS || {};
    this.spells = {
      D: config.spellD || 'flash',
      F: config.spellF || (config.lane === 'JUNGLE' ? 'smite' : 'heal')
    };

    // Skill & Spell Cooldowns
    this.cooldowns = { Q: 0, W: 0, E: 0, R: 0, B: 0, D: 0, F: 0 };
    this.maxCooldowns = {
      Q: cDef.skills && cDef.skills.Q ? cDef.skills.Q.cd[0] : 1.8,
      W: cDef.skills && cDef.skills.W ? cDef.skills.W.cd[0] : 6.0,
      E: cDef.skills && cDef.skills.E ? cDef.skills.E.cd[0] : 7.0,
      R: cDef.skills && cDef.skills.R ? cDef.skills.R.cd[0] : 35,
      B: (typeof SKILL_RANKS !== 'undefined' && SKILL_RANKS.B) ? SKILL_RANKS.B.cd : 8,
      D: spellsCatalog[this.spells.D] ? spellsCatalog[this.spells.D].cooldown : 240,
      F: spellsCatalog[this.spells.F] ? spellsCatalog[this.spells.F].cooldown : 180
    };

    // Match Performance & Tracking (KDA, CS, Damage, Gold)
    this.kills = 0;
    this.deaths = 0;
    this.assists = 0;
    this.cs = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.totalGoldEarned = config.gold || (typeof ECONOMY !== 'undefined' ? ECONOMY.INITIAL_GOLD : 500);

    // Progression & Economy (Levels 1 - 15)
    this.level = 1;
    this.exp = 0;
    this.maxExp = typeof EXP_TABLE !== 'undefined' ? EXP_TABLE[1] : 240;
    this.gold = typeof ECONOMY !== 'undefined' ? ECONOMY.INITIAL_GOLD : 500;
    this.skillPoints = 1;
    this.skillRanks = { Q: 0, W: 0, E: 0, R: 0 };

    // Inventory & Item System (6 Slots)
    this.inventory = new Array(6).fill(null);
    this.itemActiveCooldowns = [0, 0, 0, 0, 0, 0];
    this.lifesteal = 0;
    this.critChance = 0;
    this.cooldownReduction = 0;
    this.bonusAttackSpeed = 0;

    // Active Effects & Cooldowns
    this.isStasis = false;
    this.stasisTimer = 0;
    this.potionTimer = 0;
    this.potionRegenRate = 0;
    this.manaPotionTimer = 0;
    this.manaPotionRegenRate = 0;
    this.speedBoostTimer = 0;
    this.elixirTimer = 0;
    this.elixirType = null;

    // Advanced MOBA Passives
    this.isReviving = false;
    this.reviveTimer = 0;
    this.gaCooldown = 0;
    this.hasGuardianAngel = false;
    this.hasShieldbow = false;
    this.shieldbowCooldown = 0;
    this.hasSpellblade = null; // 'sheen' or 'trinity'
    this.spellbladeActive = false;
    this.spellbladeTimer = 0;
    this.hasSunfire = false;
    this.burnAuraDps = 0;
    this.burnAuraRadius = 0;
    this.burnTimer = 0;
    this.hasRylai = false;
    this.hasNashor = false;
    this.hasSpiritVisage = false;
    this.thornRatio = 0;
    this.critMultiplier = 2.0;

    // Crowd Control & Buffs
    this.slowRatio = 0;
    this.slowTimer = 0;
    this.knockupTimer = 0;
    this.stunTimer = 0;
    this.silenceTimer = 0;
    this.dragonStacks = 0;
    this.hasDragonSoul = false;
    this.dragonSoulCooldown = 0;
    this.baronTimer = 0;
    this.hasBaronBuff = false;

    // Champion specific mechanics
    this.tempestStacks = 0;
    this.rangersFocusTimer = 0;
    this.thunderclapTimer = 0;
    this.graniteTimer = 0;
    this.asDebuffTimer = 0;
    this.attackSpeedDebuff = 0;
    this.spawnWindWall = null;
    this.garenQTimer = 0;
    this.garenWTimer = 0;
    this.garenSpinTimer = 0;
    this.garenSpinTickTimer = 0;
    this.outOfCombatTimer = 0;
    this.cosmicZone = null;

    this.avatarColor = config.avatarColor || cDef.avatarColor;
    this.symbol = config.symbol || cDef.symbol;
    this.name = config.name || cDef.name;
    this.lane = config.lane || 'MID';
    this.aiDecisionTimer = 0;

    this.visionRadius = this.isPlayer ? 950 : 900;
    this.attackTarget = null;
    this.attackCooldown = 0;

    // Auto-allocate first point for bot
    if (!this.isPlayer) {
      this.autoUpgradeBotSkill();
    }
  }

  setChampion(champId) {
    const championsData = window.CHAMPIONS || {};
    const cDef = championsData[champId];
    if (!cDef) return;
    this.championId = champId;
    this.championDef = cDef;
    this.symbol = cDef.symbol;
    this.name = this.isPlayer ? `Bạn (${cDef.name})` : cDef.name;
    this.avatarColor = cDef.avatarColor;

    this.baseMaxHp = cDef.baseStats.hp + (this.level - 1) * STAT_GROWTH.hp;
    this.baseMaxMana = cDef.baseStats.mana + (this.level - 1) * STAT_GROWTH.mana;
    this.baseAttackDamage = cDef.baseStats.attackDamage + (this.level - 1) * STAT_GROWTH.attackDamage;
    this.baseHpRegen = cDef.baseStats.hpRegen + (this.level - 1) * STAT_GROWTH.hpRegen;
    this.baseManaRegen = cDef.baseStats.manaRegen + (this.level - 1) * STAT_GROWTH.manaRegen;
    this.baseSpeed = cDef.baseStats.speed;
    this.baseAttackSpeed = cDef.baseStats.attackSpeed;
    this.attackRange = cDef.baseStats.attackRange;
    this.baseAttackRange = cDef.baseStats.attackRange;
    this.baseArmor = cDef.baseStats.armor;
    this.baseAbilityPower = cDef.baseStats.abilityPower;

    if (cDef.skills) {
      this.maxCooldowns.Q = cDef.skills.Q.cd[Math.max(0, this.skillRanks.Q - 1)];
      this.maxCooldowns.W = cDef.skills.W.cd[Math.max(0, this.skillRanks.W - 1)];
      this.maxCooldowns.E = cDef.skills.E.cd[Math.max(0, this.skillRanks.E - 1)];
      this.maxCooldowns.R = cDef.skills.R.cd[Math.max(0, this.skillRanks.R - 1)];
    }

    this.tempestStacks = 0;
    this.rangersFocusTimer = 0;
    this.thunderclapTimer = 0;
    this.graniteTimer = 0;
    this.garenQTimer = 0;
    this.garenWTimer = 0;
    this.garenSpinTimer = 0;
    this.garenSpinTickTimer = 0;
    this.outOfCombatTimer = 0;
    this.cosmicZone = null;
    this.silenceTimer = 0;

    this.recalculateStats();
    this.hp = this.maxHp;
    this.mana = this.maxMana;
  }

  // ================= PROGRESSION & ECONOMY =================
  addExp(amount, onLevelUp = null, addFloatingText = null) {
    if (this.level >= MAX_LEVEL) return;
    this.exp += amount;

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`+${Math.round(amount)} EXP`, this.x + (Math.random() * 24 - 12), this.y - 48, '#a371f7');
    }

    while (this.level < MAX_LEVEL && this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level++;
      this.skillPoints++;

      // Stat Growth
      this.baseMaxHp += STAT_GROWTH.hp;
      this.baseMaxMana += STAT_GROWTH.mana;
      this.baseAttackDamage += STAT_GROWTH.attackDamage;
      this.baseHpRegen += STAT_GROWTH.hpRegen;
      this.baseManaRegen += STAT_GROWTH.manaRegen;

      this.recalculateStats();
      this.hp = Math.min(this.maxHp, this.hp + STAT_GROWTH.hp);
      this.mana = Math.min(this.maxMana, this.mana + STAT_GROWTH.mana);

      this.maxExp = this.level < MAX_LEVEL ? EXP_TABLE[this.level] : 0;

      if (!this.isPlayer) {
        this.autoUpgradeBotSkill();
      } else if (onLevelUp) {
        onLevelUp(this.level);
      }
    }
  }

  addGold(amount, addFloatingText = null) {
    this.gold += amount;
    this.totalGoldEarned = (this.totalGoldEarned || 0) + amount;
    if (this.isPlayer && addFloatingText) {
      addFloatingText(`+${Math.round(amount)} 💰`, this.x + (Math.random() * 24 - 12), this.y - 32, '#ffd700');
    }
  }

  takeDamage(amount, attacker = null, addFloatingText = null) {
    if (!this.alive || this.isStasis || this.isReviving) return;

    // Garen Passive 10% innate damage reduction & Garen W 40% damage reduction
    if (this.championId === 'fighter') {
      amount *= 0.90;
    }
    if (this.garenWTimer > 0) {
      amount *= 0.60;
    }
    this.outOfCombatTimer = 0;

    const armorMitigation = 100 / (100 + Math.max(0, this.armor));
    let finalDamage = Math.round(amount * armorMitigation);

    let absorbed = 0;
    if (this.shield > 0) {
      if (this.shield >= finalDamage) {
        this.shield -= finalDamage;
        absorbed = finalDamage;
        finalDamage = 0;
      } else {
        finalDamage -= this.shield;
        absorbed = this.shield;
        this.shield = 0;
      }
    }

    if (this.hasShieldbow && this.shieldbowCooldown <= 0 && (this.hp - finalDamage) / this.maxHp <= 0.30) {
      this.shield = 400;
      this.shieldbowCooldown = 90.0;
      if (addFloatingText) addFloatingText('🛡️ NỎ TỬ THỦ (+400 KHIÊN)!', this.x, this.y - 45, '#e84393');
    }

    this.hp -= finalDamage;
    const actualDamage = finalDamage + absorbed;
    this.damageTaken = (this.damageTaken || 0) + actualDamage;
    if (attacker && attacker !== this) {
      attacker.damageDealt = (attacker.damageDealt || 0) + actualDamage;
    }

    if (this.hasThornmail && attacker && attacker.alive && attacker.takeDamage && this.thornRatio > 0) {
      const reflectDmg = Math.round(finalDamage * this.thornRatio);
      if (reflectDmg > 0) {
        attacker.takeDamage(reflectDmg, this, addFloatingText);
        if (addFloatingText) addFloatingText(`🌵 -${reflectDmg}`, attacker.x, attacker.y - 25, '#d63031');
      }
    }

    if (this.hp <= 0) {
      this.hp = 0;
      if (this.hasGuardianAngel && this.gaCooldown <= 0) {
        this.isReviving = true;
        this.reviveTimer = 4.0;
        this.gaCooldown = 240.0;
        if (addFloatingText) addFloatingText('👼 HỒI SINH (4s)!', this.x, this.y - 45, '#fdcb6e');
        return;
      }
      this.die(attacker);
    }
  }

  castSummonerSpell(slot, targetX, targetY, heroes = [], minions = [], monsters = [], walls = [], addFloatingText = null, createClickWave = null, projectiles = []) {
    if (!this.alive || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0 || this.silenceTimer > 0) {
      if (this.isPlayer && addFloatingText && this.silenceTimer > 0) addFloatingText('🤐 Đang bị CÂM LẶNG!', this.x, this.y - 35, '#ff7b72');
      return false;
    }
    const spellKey = this.spells ? this.spells[slot] : null;
    if (!spellKey) return false;
    if (this.cooldowns[slot] > 0) return false;

    const spellsCatalog = window.SPELLS || {};
    const spellDef = spellsCatalog[spellKey];
    const maxCd = spellDef ? spellDef.cooldown : (slot === 'D' ? 240 : 180);

    if (spellKey === 'flash') {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);
      const angle = dist > 0.001 ? Math.atan2(dy, dx) : this.facingAngle;
      const blinkDist = Math.min(420, Math.max(80, dist));
      let newX = Math.max(100, Math.min(14900, this.x + Math.cos(angle) * blinkDist));
      let newY = Math.max(100, Math.min(14900, this.y + Math.sin(angle) * blinkDist));

      if (walls) {
        for (let w of walls) {
          if (newX >= w.x && newX <= w.x + w.w && newY >= w.y && newY <= w.y + w.h) {
            const leftDist = Math.abs(newX - w.x);
            const rightDist = Math.abs(newX - (w.x + w.w));
            const topDist = Math.abs(newY - w.y);
            const botDist = Math.abs(newY - (w.y + w.h));
            const minEdge = Math.min(leftDist, rightDist, topDist, botDist);
            if (minEdge === leftDist) newX = w.x - this.radius - 2;
            else if (minEdge === rightDist) newX = w.x + w.w + this.radius + 2;
            else if (minEdge === topDist) newY = w.y - this.radius - 2;
            else newY = w.y + w.h + this.radius + 2;
            break;
          }
        }
      }

      this.x = newX;
      this.y = newY;
      this.targetX = newX;
      this.targetY = newY;
      this.cooldowns[slot] = maxCd;

      if (createClickWave) createClickWave(newX, newY, '#ffd700');
      if (addFloatingText) addFloatingText('⚡ TỐC BIẾN!', newX, newY - 45, '#ffd700');
      return true;
    } else if (spellKey === 'heal') {
      const healAmount = Math.round(300 + 20 * this.level);
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
      this.speedBoostTimer = 2.0;
      this.recalculateStats();
      this.cooldowns[slot] = maxCd;

      if (addFloatingText) addFloatingText(`+${healAmount} HP 🩸`, this.x, this.y - 45, '#2ea043');
      if (createClickWave) createClickWave(this.x, this.y, '#2ea043');

      if (heroes) {
        let lowestAlly = null;
        let lowestRatio = 1.0;
        for (let h of heroes) {
          if (h !== this && h.alive && h.team === this.team) {
            const d = Math.hypot(h.x - this.x, h.y - this.y);
            if (d <= 600) {
              const r = h.hp / h.maxHp;
              if (r < lowestRatio) {
                lowestRatio = r;
                lowestAlly = h;
              }
            }
          }
        }
        if (lowestAlly) {
          lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + healAmount);
          lowestAlly.speedBoostTimer = 2.0;
          lowestAlly.recalculateStats();
          if (addFloatingText) addFloatingText(`+${healAmount} HP 🩸`, lowestAlly.x, lowestAlly.y - 45, '#2ea043');
          if (createClickWave) createClickWave(lowestAlly.x, lowestAlly.y, '#2ea043');
        }
      }
      return true;
    } else if (spellKey === 'smite') {
      const smiteDamage = Math.round(650 + 35 * this.level);
      const candidates = [];
      if (monsters) {
        for (let m of monsters) {
          if (m.alive && Math.hypot(m.x - this.x, m.y - this.y) <= 550) {
            candidates.push(m);
          }
        }
      }
      if (minions) {
        for (let mn of minions) {
          if (mn.alive && mn.team !== this.team && Math.hypot(mn.x - this.x, mn.y - this.y) <= 550) {
            candidates.push(mn);
          }
        }
      }

      let bestTarget = null;
      let closestDist = 99999;
      for (let c of candidates) {
        const d = Math.hypot(c.x - targetX, c.y - targetY);
        if (d < closestDist) {
          closestDist = d;
          bestTarget = c;
        }
      }

      if (bestTarget) {
        bestTarget.takeDamage(smiteDamage, this, addFloatingText);
        const selfHeal = Math.round(this.maxHp * 0.15);
        this.hp = Math.min(this.maxHp, this.hp + selfHeal);
        this.cooldowns[slot] = maxCd;
        if (addFloatingText) {
          addFloatingText(`⚔️ TRỪNG PHẠT -${smiteDamage}!`, bestTarget.x, bestTarget.y - 40, '#ffd700');
          addFloatingText(`+${selfHeal} HP 🩸`, this.x, this.y - 40, '#2ea043');
        }
        if (createClickWave) createClickWave(bestTarget.x, bestTarget.y, '#ffd700');
        return true;
      } else {
        if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Không có quái hoặc lính trong tầm Trừng Phạt!', this.x, this.y - 35, '#ff7b72');
        return false;
      }
    } else if (spellKey === 'ignite') {
      const totalBurn = Math.round(80 + 25 * this.level);
      let bestHero = null;
      let closestDist = 99999;
      if (heroes) {
        for (let h of heroes) {
          if (h.alive && h.team !== this.team && Math.hypot(h.x - this.x, h.y - this.y) <= 600) {
            const d = Math.hypot(h.x - targetX, h.y - targetY);
            if (d < closestDist) {
              closestDist = d;
              bestHero = h;
            }
          }
        }
      }

      if (bestHero) {
        bestHero.igniteTimer = 5.0;
        bestHero.igniteDps = totalBurn / 5.0;
        bestHero.igniteAttacker = this;
        this.cooldowns[slot] = maxCd;
        if (addFloatingText) addFloatingText('🔥 THIÊU ĐỐT (5s)!', bestHero.x, bestHero.y - 40, '#f85149');
        if (createClickWave) createClickWave(bestHero.x, bestHero.y, '#f85149');
        return true;
      } else {
        if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Không có tướng địch trong tầm Thiêu Đốt!', this.x, this.y - 35, '#ff7b72');
        return false;
      }
    } else if (spellKey === 'barrier') {
      const shieldAmt = Math.round(350 + 25 * this.level);
      this.shield = Math.max(this.shield, shieldAmt);
      this.cooldowns[slot] = maxCd;
      if (addFloatingText) addFloatingText(`🛡️ LÁ CHẮN (+${shieldAmt})!`, this.x, this.y - 45, '#58a6ff');
      if (createClickWave) createClickWave(this.x, this.y, '#58a6ff');
      return true;
    }
    return false;
  }

  // ================= INVENTORY & ITEM MANAGEMENT =================
  recalculateStats() {
    let bonusAd = 0;
    let bonusAp = 0;
    let bonusArmor = 0;
    let bonusHp = 0;
    let bonusMana = 0;
    let bonusSpeed = 0;
    let bonusAttackSpeed = 0;
    let bonusLifesteal = 0;
    let bonusCrit = 0;
    let bonusCdr = 0;
    let bonusHpRegen = 0;
    let bonusManaRegen = 0;
    let rabadonMultiplier = 0;

    this.hasThornmail = false;
    this.thornRatio = 0;
    this.hasStatikk = false;
    this.hasLuden = false;
    this.hasSpellblade = null;
    this.hasGuardianAngel = false;
    this.hasShieldbow = false;
    this.hasSunfire = false;
    this.burnAuraDps = 0;
    this.burnAuraRadius = 0;
    this.hasRylai = false;
    this.hasNashor = false;
    this.hasSpiritVisage = false;
    this.critMultiplier = 2.0;

    const catalog = window.ITEMS || {};
    for (let slot of this.inventory) {
      if (!slot) continue;
      const item = catalog[slot.id];
      if (!item) continue;

      if (item.stats) {
        if (item.stats.ad) bonusAd += item.stats.ad;
        if (item.stats.ap) bonusAp += item.stats.ap;
        if (item.stats.armor) bonusArmor += item.stats.armor;
        if (item.stats.hp) bonusHp += item.stats.hp;
        if (item.stats.mana) bonusMana += item.stats.mana;
        if (item.stats.speed) bonusSpeed += item.stats.speed;
        if (item.stats.attackSpeed) bonusAttackSpeed += item.stats.attackSpeed;
        if (item.stats.lifesteal) bonusLifesteal += item.stats.lifesteal;
        if (item.stats.critChance) bonusCrit += item.stats.critChance;
        if (item.stats.cdr) bonusCdr += item.stats.cdr;
        if (item.stats.hpRegen) bonusHpRegen += item.stats.hpRegen;
        if (item.stats.manaRegen) bonusManaRegen += item.stats.manaRegen;
      }

      if (item.passive) {
        if (item.passive.type === 'rabadon_amp') rabadonMultiplier += item.passive.multiplier;
        if (item.passive.type === 'thorn_reflect') {
          this.hasThornmail = true;
          this.thornRatio = Math.max(this.thornRatio, item.passive.ratio || 0.20);
        }
        if (item.passive.type === 'chain_lightning') this.hasStatikk = true;
        if (item.passive.type === 'luden_burst') this.hasLuden = true;
        if (item.passive.type === 'spellblade') {
          this.hasSpellblade = item.id === 'trinity_force' ? 'trinity' : 'sheen';
        }
        if (item.passive.type === 'revive') this.hasGuardianAngel = true;
        if (item.passive.type === 'lifeline') this.hasShieldbow = true;
        if (item.passive.type === 'burn_aura') {
          this.hasSunfire = true;
          this.burnAuraDps = Math.max(this.burnAuraDps, item.passive.dps || 15);
          this.burnAuraRadius = Math.max(this.burnAuraRadius, item.passive.radius || 220);
        }
        if (item.passive.type === 'slow_on_skill') this.hasRylai = true;
        if (item.passive.type === 'nashor_onhit') this.hasNashor = true;
        if (item.passive.type === 'spirit_healing') this.hasSpiritVisage = true;
        if (item.passive.type === 'crit_amp') this.critMultiplier = Math.max(this.critMultiplier, item.passive.multiplier || 2.2);
      }
    }

    // Champion Passives on Stats
    if (this.championId === 'tank') {
      bonusArmor = Math.round(bonusArmor * 1.25); // +25% giáp từ trang bị
    } else if (this.championId === 'adc') {
      bonusCrit += 0.15; // +15% chí mạng nội tại
    } else if (this.championId === 'assassin') {
      bonusCrit *= 2.0; // Gấp đôi tỉ lệ chí mạng
    }

    // Baron Buff (Hand of Baron: +40 AD, +60 AP)
    if (this.hasBaronBuff && this.baronTimer > 0) {
      bonusAd += 40;
      bonusAp += 60;
    }

    // Elemental Dragon Stacks
    if (this.dragonStacks >= 2) {
      bonusArmor += 25; // Bùa Rồng Đất
    }
    if (this.dragonStacks >= 3) {
      bonusSpeed += 35; // Bùa Rồng Gió
      bonusCdr += 0.10;
    }
    if (this.dragonStacks >= 4) {
      bonusHpRegen += 15; // Linh Hồn Rồng Nước
      bonusManaRegen += 15;
      this.hasDragonSoul = true;
    }

    // Elixir Buffs
    if (this.elixirTimer > 0 && this.elixirType) {
      if (this.elixirType === 'wrath') {
        bonusAd += 30;
        bonusLifesteal += 0.12;
      } else if (this.elixirType === 'sorcery') {
        bonusAp += 50;
        bonusManaRegen += 15;
      } else if (this.elixirType === 'iron') {
        bonusHp += 300;
        bonusArmor += 20;
      }
    }

    if (rabadonMultiplier > 0) {
      bonusAp = Math.round(bonusAp * (1 + rabadonMultiplier));
    }

    const oldMaxHp = this.maxHp;
    this.maxHp = this.baseMaxHp + bonusHp;
    if (this.maxHp > oldMaxHp) {
      this.hp += (this.maxHp - oldMaxHp);
    }
    this.hp = Math.min(this.hp, this.maxHp);

    this.maxMana = this.baseMaxMana + bonusMana;
    this.mana = Math.min(this.mana, this.maxMana);

    let finalAd = this.baseAttackDamage + bonusAd;
    let finalAp = bonusAp;

    // Bùa Rồng Lửa (+10% AD & AP)
    if (this.dragonStacks >= 1) {
      finalAd = Math.round(finalAd * 1.10);
      finalAp = Math.round(finalAp * 1.10);
    }

    this.attackDamage = finalAd;
    this.abilityPower = finalAp;
    this.armor = (this.baseArmor || 0) + bonusArmor;

    let finalSpeed = this.baseSpeed + bonusSpeed;
    if (this.speedBoostTimer > 0) {
      finalSpeed *= 1.40;
    }
    this.speed = finalSpeed;

    this.lifesteal = bonusLifesteal;
    this.critChance = Math.min(1.0, bonusCrit);
    this.cooldownReduction = Math.min(0.40, bonusCdr);
    this.bonusAttackSpeed = bonusAttackSpeed;
    this.attackSpeed = Math.max(0.25, this.baseAttackSpeed / (1 + bonusAttackSpeed));
    this.hpRegen = this.baseHpRegen + bonusHpRegen;
    this.manaRegen = this.baseManaRegen + bonusManaRegen;
  }

  isInFountain() {
    const base = this.team === 'blue' ? { x: 1200, y: 13800, radius: 750 } : { x: 13800, y: 1200, radius: 750 };
    return Math.hypot(this.x - base.x, this.y - base.y) <= base.radius;
  }

  calculateItemCost(itemId) {
    const catalog = window.ITEMS || {};
    const itemDef = catalog[itemId];
    if (!itemDef) return { matchedSlots: [], discount: 0, finalCost: 0 };
    if (!itemDef.recipe || itemDef.recipe.length === 0) {
      return { matchedSlots: [], discount: 0, finalCost: itemDef.cost };
    }

    const availableSlots = this.inventory.map((slot, idx) => ({
      slotIdx: idx,
      id: slot ? slot.id : null,
      used: false
    }));

    function matchRequirement(reqId) {
      for (let s of availableSlots) {
        if (!s.used && s.id === reqId) {
          s.used = true;
          return [{ slotIdx: s.slotIdx, id: reqId, cost: (catalog[reqId] ? catalog[reqId].cost : 0) }];
        }
      }
      const reqDef = catalog[reqId];
      if (reqDef && reqDef.recipe && reqDef.recipe.length > 0) {
        let subMatches = [];
        for (let subId of reqDef.recipe) {
          const m = matchRequirement(subId);
          if (m.length > 0) subMatches.push(...m);
        }
        return subMatches;
      }
      return [];
    }

    const matched = [];
    for (let reqId of itemDef.recipe) {
      matched.push(...matchRequirement(reqId));
    }

    const totalDiscount = matched.reduce((sum, item) => sum + item.cost, 0);
    const finalCost = Math.max(0, itemDef.cost - totalDiscount);
    return {
      matchedSlots: matched.map(m => m.slotIdx),
      discount: totalDiscount,
      finalCost
    };
  }

  buyItem(itemId, addFloatingText = null) {
    if (!this.isInFountain()) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Phải ở Bệ Đá Cổ để Mua trang bị!', this.x, this.y - 45, '#ff7b72');
      return { success: false, reason: 'NOT_IN_FOUNTAIN' };
    }
    const catalog = window.ITEMS || {};
    const itemDef = catalog[itemId];
    if (!itemDef) return { success: false, reason: 'INVALID_ITEM' };

    const { matchedSlots, discount, finalCost } = this.calculateItemCost(itemId);

    if (this.gold < finalCost) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Không đủ Vàng!', this.x, this.y - 45, '#ff7b72');
      return { success: false, reason: 'NOT_ENOUGH_GOLD' };
    }

    // Xử lý đồ tiêu hao cộng dồn (Bình máu / Bình mana)
    if (itemDef.isConsumable && itemDef.maxStack > 1) {
      const existingIdx = this.inventory.findIndex(s => s && s.id === itemId);
      if (existingIdx !== -1 && this.inventory[existingIdx].count < itemDef.maxStack) {
        this.gold -= finalCost;
        this.inventory[existingIdx].count++;
        this.recalculateStats();
        if (this.isPlayer && addFloatingText) {
          addFloatingText(`+1 ${itemDef.name} (x${this.inventory[existingIdx].count})`, this.x, this.y - 45, '#ffd700');
        }
        return { success: true, slot: existingIdx, item: itemDef };
      }
    }

    // Tìm ô trống đầu tiên
    const emptyIdx = this.inventory.findIndex(s => s === null);
    if (emptyIdx === -1 && matchedSlots.length === 0) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Túi đồ đã đầy (6/6 ô)!', this.x, this.y - 45, '#ff7b72');
      return { success: false, reason: 'INVENTORY_FULL' };
    }

    this.gold -= finalCost;

    let targetSlot = emptyIdx;
    if (matchedSlots.length > 0) {
      targetSlot = matchedSlots[0];
      // Xóa các đồ thành phần cũ đã ghép vào món mới
      for (let i = 1; i < matchedSlots.length; i++) {
        this.inventory[matchedSlots[i]] = null;
        this.itemActiveCooldowns[matchedSlots[i]] = 0;
      }
    }

    this.inventory[targetSlot] = { id: itemId, count: 1 };
    this.itemActiveCooldowns[targetSlot] = 0;
    this.recalculateStats();

    if (this.isPlayer && addFloatingText) {
      const discountMsg = discount > 0 ? ` (Ghép tiết kiệm ${discount}💰)` : '';
      addFloatingText(`+ Mua ${itemDef.name}!${discountMsg}`, this.x, this.y - 45, '#ffd700');
    }
    return { success: true, slot: targetSlot, item: itemDef };
  }

  sellItem(slotIndex, addFloatingText = null) {
    if (!this.isInFountain()) {
      if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Phải ở Bệ Đá Cổ để Bán trang bị!', this.x, this.y - 45, '#ff7b72');
      return { success: false, reason: 'NOT_IN_FOUNTAIN' };
    }
    const slot = this.inventory[slotIndex];
    if (!slot) return { success: false, reason: 'EMPTY_SLOT' };

    const catalog = window.ITEMS || {};
    const itemDef = catalog[slot.id];
    if (!itemDef) return { success: false, reason: 'INVALID_ITEM' };

    const refund = Math.floor(itemDef.cost * 0.7);
    this.gold += refund;

    if (slot.count > 1) {
      slot.count--;
    } else {
      this.inventory[slotIndex] = null;
      this.itemActiveCooldowns[slotIndex] = 0;
    }
    this.recalculateStats();

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`💰 Bán ${itemDef.name} (+${refund} Vàng)`, this.x, this.y - 45, '#388bfd');
    }
    return { success: true, refund };
  }

  useActiveItem(slotIndex, addFloatingText = null) {
    if (!this.alive || this.isStasis || this.isReviving) return false;
    const slot = this.inventory[slotIndex];
    if (!slot) return false;

    if (this.itemActiveCooldowns[slotIndex] > 0) {
      if (this.isPlayer && addFloatingText) {
        addFloatingText(`⏳ Chưa hồi chiêu (${this.itemActiveCooldowns[slotIndex].toFixed(1)}s)`, this.x, this.y - 35, '#8b949e');
      }
      return false;
    }

    const catalog = window.ITEMS || {};
    const itemDef = catalog[slot.id];
    if (!itemDef || !itemDef.active) return false;

    this.itemActiveCooldowns[slotIndex] = itemDef.active.cd;
    const act = itemDef.active;

    if (act.type === 'stasis') {
      this.isStasis = true;
      this.stasisTimer = act.duration || 2.5;
      if (addFloatingText) addFloatingText('⏳ NGƯNG ĐỌNG BẤT TỬ!', this.x, this.y - 45, '#ffd700');
    } else if (act.type === 'shield') {
      const shieldVal = (act.value || 350) + (this.abilityPower * 0.3);
      this.shield = Math.max(this.shield, shieldVal);
      if (addFloatingText) addFloatingText(`☀️ KHIÊN SOLARI +${Math.round(shieldVal)}!`, this.x, this.y - 45, '#ffd700');
    } else if (act.type === 'speed_boost') {
      this.speedBoostTimer = act.duration || 5.0;
      this.recalculateStats();
      if (addFloatingText) addFloatingText('👻 BỨT TỐC YOUMUU (+40% Tốc Chạy)!', this.x, this.y - 45, '#a29bfe');
    } else if (act.type === 'potion') {
      this.potionTimer = act.duration || 5.0;
      this.potionRegenRate = (act.value || 250) / this.potionTimer;
      slot.count--;
      if (slot.count <= 0) {
        this.inventory[slotIndex] = null;
      }
      if (addFloatingText) addFloatingText('🧪 UỐNG BÌNH MÁU (+250 HP)', this.x, this.y - 45, '#3fb950');
    } else if (act.type === 'mana_potion') {
      this.manaPotionTimer = act.duration || 5.0;
      this.manaPotionRegenRate = (act.value || 180) / this.manaPotionTimer;
      slot.count--;
      if (slot.count <= 0) {
        this.inventory[slotIndex] = null;
      }
      if (addFloatingText) addFloatingText('💧 UỐNG BÌNH MANA (+180 MP)', this.x, this.y - 45, '#0984e3');
    } else if (act.type === 'elixir') {
      this.elixirTimer = act.duration || 60.0;
      this.elixirType = act.elixirType;
      slot.count--;
      if (slot.count <= 0) {
        this.inventory[slotIndex] = null;
      }
      this.recalculateStats();
      if (addFloatingText) addFloatingText(`🧪 UỐNG ${itemDef.name} (60s)!`, this.x, this.y - 45, '#e84393');
    }

    return true;
  }

  applySlow(ratio, duration) {
    if (!this.alive || this.isStasis || this.isReviving) return;
    this.slowRatio = Math.max(this.slowRatio || 0, ratio);
    this.slowTimer = Math.max(this.slowTimer || 0, duration);
  }

  canUpgradeSkill(slot) {
    if (this.skillPoints <= 0) return false;
    const info = SKILL_RANKS[slot];
    if (!info) return false;
    const currentRank = this.skillRanks[slot];
    if (currentRank >= info.maxRank) return false;

    if (slot === 'R') {
      const req = info.reqLevel[currentRank];
      if (this.level < req) return false;
    }
    return true;
  }

  upgradeSkill(slot, addFloatingText = null) {
    if (!this.canUpgradeSkill(slot)) return false;
    this.skillPoints--;
    this.skillRanks[slot]++;
    const newRank = this.skillRanks[slot];
    const info = SKILL_RANKS[slot];
    this.maxCooldowns[slot] = info.cd[newRank - 1];

    if (this.isPlayer && addFloatingText) {
      addFloatingText(`✨ NÂNG CẤP ${slot} (CẤP ${newRank})!`, this.x, this.y - 42, '#388bfd');
    }
    return true;
  }

  autoUpgradeBotSkill() {
    if (this.canUpgradeSkill('R')) {
      this.upgradeSkill('R');
      return;
    }
    for (let s of ['Q', 'W', 'E']) {
      if (this.canUpgradeSkill(s)) {
        this.upgradeSkill(s);
        return;
      }
    }
  }

  die(killer = null) {
    this.alive = false;
    this.isReviving = false;
    this.respawnTimer = 7.0;
  }

  distanceTo(other) {
    if (!other) return 999999;
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  // ================= SKILLS (ALL 4 CHAMPIONS) =================
  castSkillshot(targetX, targetY, projectiles, addFloatingText = null) {
    if (this.skillRanks.Q <= 0 || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0 || this.silenceTimer > 0) {
      if (this.isPlayer && addFloatingText && this.skillRanks.Q <= 0) addFloatingText('⚠️ Chưa học chiêu Q! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      if (this.isPlayer && addFloatingText && this.silenceTimer > 0) addFloatingText('🤐 Đang bị CÂM LẶNG!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.Q - 1;
    const cfg = (this.championDef && this.championDef.skills && this.championDef.skills.Q) || (typeof SKILL_RANKS !== 'undefined' ? SKILL_RANKS.Q : null);
    if (!cfg) return;
    const manaCost = cfg.mana[rankIdx];
    const cd = cfg.cd[rankIdx] * (1 - (this.cooldownReduction || 0));

    if (this.cooldowns.Q > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.Q = cd;

    if (this.hasSpellblade) {
      this.spellbladeActive = true;
      this.spellbladeTimer = 6.0;
    }

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    if (this.championId === 'mage') {
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.65);
      projectiles.push(new Projectile({
        x: this.x + Math.cos(angle) * (this.radius + 8),
        y: this.y + Math.sin(angle) * (this.radius + 8),
        vx: Math.cos(angle) * cfg.speed,
        vy: Math.sin(angle) * cfg.speed,
        radius: cfg.radius,
        range: cfg.range,
        rangeLeft: cfg.range,
        team: this.team,
        damage: damage,
        color: this.team === 'blue' ? '#388bfd' : '#f85149',
        owner: this
      }));
    } else if (this.championId === 'adc') {
      // Ashe Volley: 7 arrows in cone
      const damage = Math.round(cfg.damage[rankIdx] + (this.attackDamage || 0) * 0.70);
      const spread = 0.52;
      for (let i = 0; i < 7; i++) {
        const a = angle - spread / 2 + (spread / 6) * i;
        projectiles.push(new Projectile({
          x: this.x + Math.cos(a) * (this.radius + 8),
          y: this.y + Math.sin(a) * (this.radius + 8),
          vx: Math.cos(a) * cfg.speed,
          vy: Math.sin(a) * cfg.speed,
          radius: cfg.radius,
          range: cfg.range,
          rangeLeft: cfg.range,
          team: this.team,
          damage: damage,
          color: '#58a6ff',
          owner: this,
          isVolleyArrow: true
        }));
      }
      if (this.isPlayer && addFloatingText) addFloatingText('🏹 TÁN XẠ TIỄN (x7)!', this.x, this.y - 35, '#58a6ff');
    } else if (this.championId === 'assassin') {
      // Yasuo Steel Tempest / Tornado
      this.tempestStacks = (this.tempestStacks || 0) + 1;
      if (this.tempestStacks < 3) {
        const damage = Math.round(cfg.damage[rankIdx] + (this.attackDamage || 0) * 0.80);
        projectiles.push(new Projectile({
          x: this.x + Math.cos(angle) * (this.radius + 10),
          y: this.y + Math.sin(angle) * (this.radius + 10),
          vx: Math.cos(angle) * cfg.speed,
          vy: Math.sin(angle) * cfg.speed,
          radius: cfg.radius,
          range: cfg.range,
          rangeLeft: cfg.range,
          team: this.team,
          damage: damage,
          color: '#3fb950',
          owner: this
        }));
        if (this.tempestStacks === 2 && addFloatingText) {
          addFloatingText('🌪️ LỐC XOÁY SẴN SÀNG!', this.x, this.y - 45, '#3fb950');
        }
      } else {
        // Cast 3: Fire Tornado!
        this.tempestStacks = 0;
        const damage = Math.round(cfg.damage[rankIdx] + (this.attackDamage || 0) * 1.0);
        projectiles.push(new Projectile({
          x: this.x + Math.cos(angle) * (this.radius + 14),
          y: this.y + Math.sin(angle) * (this.radius + 14),
          vx: Math.cos(angle) * 1150,
          vy: Math.sin(angle) * 1150,
          radius: 24,
          range: cfg.tornadoRange || 1050,
          rangeLeft: cfg.tornadoRange || 1050,
          team: this.team,
          damage: damage,
          color: '#2ea043',
          owner: this,
          isTornado: true
        }));
        if (addFloatingText) addFloatingText('🌪️ BÃO LỐC XOÁY HẤT TUNG!', this.x, this.y - 45, '#2ea043');
      }
    } else if (this.championId === 'tank') {
      // Malphite Seismic Shard
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.60);
      projectiles.push(new Projectile({
        x: this.x + Math.cos(angle) * (this.radius + 10),
        y: this.y + Math.sin(angle) * (this.radius + 10),
        vx: Math.cos(angle) * cfg.speed,
        vy: Math.sin(angle) * cfg.speed,
        radius: cfg.radius,
        range: cfg.range,
        rangeLeft: cfg.range,
        team: this.team,
        damage: damage,
        color: '#f59e0b',
        owner: this,
        isSeismicShard: true
      }));
      if (this.isPlayer && addFloatingText) addFloatingText('🥌 LĂN ĐÁ NHAM THẠCH!', this.x, this.y - 35, '#f59e0b');
    } else if (this.championId === 'support') {
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.60);
      projectiles.push(new Projectile({
        x: this.x + Math.cos(angle) * (this.radius + 10),
        y: this.y + Math.sin(angle) * (this.radius + 10),
        vx: Math.cos(angle) * cfg.speed,
        vy: Math.sin(angle) * cfg.speed,
        radius: cfg.radius || 18,
        range: cfg.range || 1100,
        rangeLeft: cfg.range || 1100,
        team: this.team,
        damage: damage,
        color: '#ec4899',
        owner: this,
        isStarOrb: true
      }));
      this.speedBoostTimer = 2.5;
      this.recalculateStats();
      if (this.isPlayer && addFloatingText) addFloatingText('🌟 TINH CẦU ÁNH SÁNG!', this.x, this.y - 35, '#f472b6');
    } else if (this.championId === 'fighter') {
      this.slowRatio = 0;
      this.slowTimer = 0;
      this.garenQTimer = 3.0;
      this.speedBoostTimer = 3.0;
      this.recalculateStats();
      if (addFloatingText) addFloatingText('🗡️ ĐÒN QUYẾT ĐỊNH (+40% TỐC CHẠY)!', this.x, this.y - 45, '#388bfd');
    }
  }

  castShield(addFloatingText = null, allHeroes = []) {
    if (this.skillRanks.W <= 0 || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0 || this.silenceTimer > 0) {
      if (this.isPlayer && addFloatingText && this.skillRanks.W <= 0) addFloatingText('⚠️ Chưa học chiêu W! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      if (this.isPlayer && addFloatingText && this.silenceTimer > 0) addFloatingText('🤐 Đang bị CÂM LẶNG!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.W - 1;
    const cfg = (this.championDef && this.championDef.skills && this.championDef.skills.W) || (typeof SKILL_RANKS !== 'undefined' ? SKILL_RANKS.W : null);
    if (!cfg) return;
    const manaCost = cfg.mana[rankIdx];
    const cd = cfg.cd[rankIdx] * (1 - (this.cooldownReduction || 0));

    if (this.cooldowns.W > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.W = cd;

    if (this.hasSpellblade) {
      this.spellbladeActive = true;
      this.spellbladeTimer = 6.0;
    }

    if (this.championId === 'mage') {
      const shield = Math.round(((cfg.shield ? cfg.shield[rankIdx] : 250) + (this.abilityPower || 0) * 0.60) * (this.hasSpiritVisage ? 1.25 : 1.0));
      this.shield += shield;
      if (addFloatingText) addFloatingText(`🛡️ HỘ THỂ +${shield}!`, this.x, this.y - 35, '#a371f7');
    } else if (this.championId === 'adc') {
      this.rangersFocusTimer = 5.0;
      if (addFloatingText) addFloatingText('🏹 CHÚ TÂM TIỄN (+80% TỐC ĐÁNH)!', this.x, this.y - 45, '#58a6ff');
    } else if (this.championId === 'assassin') {
      this.spawnWindWall = {
        x: this.x + Math.cos(this.facingAngle) * 90,
        y: this.y + Math.sin(this.facingAngle) * 90,
        angle: this.facingAngle,
        timer: cfg.duration || 3.5,
        team: this.team
      };
      if (addFloatingText) addFloatingText('🛡️ TƯỜNG GIÓ BẤT BẠI (3.5s)!', this.x, this.y - 45, '#3fb950');
    } else if (this.championId === 'tank') {
      this.thunderclapTimer = 6.0;
      this.armor += (cfg.armorBoost ? cfg.armorBoost[rankIdx] : 30);
      setTimeout(() => { this.recalculateStats(); }, 6000);
      if (addFloatingText) addFloatingText('💥 NẮM ĐẤM SẤM SÉT (ĐÁNH LAN)!', this.x, this.y - 45, '#f59e0b');
    } else if (this.championId === 'support') {
      const shield = Math.round((cfg.shield[rankIdx] + (this.abilityPower || 0) * 0.50) * (this.hasSpiritVisage ? 1.25 : 1.0));
      this.shield += shield;
      for (let h of allHeroes) {
        if (h.alive && h.team === this.team && h !== this && this.distanceTo(h) <= (cfg.radius || 600)) {
          h.shield += shield;
          if (addFloatingText) addFloatingText(`🛡️ KHIÊN TINH TÚ +${shield}!`, h.x, h.y - 35, '#ec4899');
        }
      }
      this.speedBoostTimer = 2.5;
      this.recalculateStats();
      if (addFloatingText) addFloatingText(`🛡️ HỘ MỆNH TINH TÚ +${shield}!`, this.x, this.y - 35, '#ec4899');
    } else if (this.championId === 'fighter') {
      const shield = Math.round((cfg.shield[rankIdx] + this.maxHp * 0.15) * (this.hasSpiritVisage ? 1.25 : 1.0));
      this.shield += shield;
      this.garenWTimer = 3.5;
      if (addFloatingText) addFloatingText(`🔰 LÒNG DŨNG CẢM (GIẢM 40% DMG)!`, this.x, this.y - 45, '#388bfd');
    }
  }

  castDash(targetX, targetY, rockWalls, addFloatingText = null, enemyHeroes = [], allyHeroes = []) {
    if (this.skillRanks.E <= 0 || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0 || this.silenceTimer > 0) {
      if (this.isPlayer && addFloatingText && this.skillRanks.E <= 0) addFloatingText('⚠️ Chưa học chiêu E! Nhấn [+] để mở', this.x, this.y - 35, '#ff7b72');
      if (this.isPlayer && addFloatingText && this.silenceTimer > 0) addFloatingText('🤐 Đang bị CÂM LẶNG!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.E - 1;
    const cfg = (this.championDef && this.championDef.skills && this.championDef.skills.E) || (typeof SKILL_RANKS !== 'undefined' ? SKILL_RANKS.E : null);
    if (!cfg) return;
    const manaCost = cfg.mana[rankIdx];
    const cd = cfg.cd[rankIdx] * (1 - (this.cooldownReduction || 0));

    if (this.cooldowns.E > 0 || this.mana < manaCost) return;
    this.mana -= manaCost;
    this.cooldowns.E = cd;

    if (this.hasSpellblade) {
      this.spellbladeActive = true;
      this.spellbladeTimer = 6.0;
    }

    const angle = Math.atan2(targetY - this.y, targetX - this.x);

    if (this.championId === 'mage') {
      this.x += Math.cos(angle) * (cfg.dashDist || 450);
      this.y += Math.sin(angle) * (cfg.dashDist || 450);
      if (window.resolveWallCollisions) window.resolveWallCollisions(this);
      this.targetX = this.x;
      this.targetY = this.y;
      if (addFloatingText) addFloatingText(`✨ TỐC BIẾN HƯ KHÔNG!`, this.x, this.y - 35, '#a371f7');
    } else if (this.championId === 'adc') {
      // Ashe Swift Retreat: Dash backward & shoot stunning dart
      this.x -= Math.cos(angle) * (cfg.dashDist || 360);
      this.y -= Math.sin(angle) * (cfg.dashDist || 360);
      if (window.resolveWallCollisions) window.resolveWallCollisions(this);
      this.targetX = this.x;
      this.targetY = this.y;

      let closestEnemy = null;
      let minD = 650;
      for (let e of enemyHeroes) {
        if (e && e.alive && e.team !== this.team) {
          const d = this.distanceTo(e);
          if (d < minD) { minD = d; closestEnemy = e; }
        }
      }
      if (closestEnemy) {
        closestEnemy.takeDamage(120 + Math.round(this.attackDamage * 0.50), this, addFloatingText);
        closestEnemy.stunTimer = 1.0;
        if (addFloatingText) addFloatingText('❄️ CHOÁNG (1s)!', closestEnemy.x, closestEnemy.y - 35, '#58a6ff');
      }
      if (addFloatingText) addFloatingText(`💨 LƯỚT LÙI BĂNG GIÁ!`, this.x, this.y - 35, '#58a6ff');
    } else if (this.championId === 'assassin') {
      // Yasuo Sweeping Blade: Dash through target with low CD
      this.x += Math.cos(angle) * (cfg.dashDist || 380);
      this.y += Math.sin(angle) * (cfg.dashDist || 380);
      if (window.resolveWallCollisions) window.resolveWallCollisions(this);
      this.targetX = this.x;
      this.targetY = this.y;

      const damage = Math.round((cfg.damage ? cfg.damage[rankIdx] : 120) + this.attackDamage * 0.40);
      for (let e of enemyHeroes) {
        if (e && e.alive && e.team !== this.team && this.distanceTo(e) <= 150) {
          e.takeDamage(damage, this, addFloatingText);
        }
      }
      if (addFloatingText) addFloatingText(`⚡ QUÉT KIẾM!`, this.x, this.y - 35, '#3fb950');
    } else if (this.championId === 'tank') {
      // Malphite Ground Slam
      const damage = Math.round((cfg.damage ? cfg.damage[rankIdx] : 150) + this.armor * 0.40);
      const radius = cfg.range || 350;
      for (let e of enemyHeroes) {
        if (e && e.alive && e.team !== this.team && this.distanceTo(e) <= radius) {
          e.takeDamage(damage, this, addFloatingText);
          e.asDebuffTimer = 3.0;
          e.attackSpeedDebuff = 0.40;
          if (addFloatingText) addFloatingText('🐌 GIẢM 40% TỐC ĐÁNH!', e.x, e.y - 35, '#f59e0b');
        }
      }
      if (addFloatingText) addFloatingText(`🌋 DẬM ĐẤT CHẤN ĐỘNG!`, this.x, this.y - 35, '#d29922');
    } else if (this.championId === 'support') {
      // Lumina E: Fountain of Life
      const healAmt = Math.round(((cfg.heal ? cfg.heal[rankIdx] : 200) + (this.abilityPower || 0) * 0.55) * (this.hasSpiritVisage ? 1.25 : 1.0));
      this.hp = Math.min(this.maxHp, this.hp + healAmt);
      if (addFloatingText) addFloatingText(`💚 +${healAmt} HP`, this.x, this.y - 35, '#2ecc71');

      let lowestAlly = null;
      let minRatio = 1.0;
      for (let a of (allyHeroes || [])) {
        if (a && a.alive && a.team === this.team && a !== this && this.distanceTo(a) <= (cfg.range || 450)) {
          const ratio = a.hp / a.maxHp;
          if (ratio < minRatio) {
            minRatio = ratio;
            lowestAlly = a;
          }
        }
      }
      if (lowestAlly) {
        lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + healAmt);
        lowestAlly.armor += 30;
        setTimeout(() => { if (lowestAlly.recalculateStats) lowestAlly.recalculateStats(); }, 3000);
        if (addFloatingText) addFloatingText(`💚 +${healAmt} HP (HỒI MÁU)!`, lowestAlly.x, lowestAlly.y - 35, '#2ecc71');
      }
      this.speedBoostTimer = 2.5;
      this.recalculateStats();
    } else if (this.championId === 'fighter') {
      // Garen E: Judgment Spin
      this.garenSpinTimer = 3.0;
      this.garenSpinTickTimer = 0;
      if (addFloatingText) addFloatingText('⚔️ PHÁN QUYẾT BÃO KIẾM!', this.x, this.y - 45, '#388bfd');
    }
  }

  castUltimate(heroes, towers, monsters, minions, addFloatingText = null, onKill = null, projectiles = null, createClickWave = null) {
    if (this.skillRanks.R <= 0 || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0 || this.silenceTimer > 0) {
      if (this.isPlayer && addFloatingText && this.skillRanks.R <= 0) addFloatingText('⚠️ Chưa học chiêu R (Cần cấp 4)!', this.x, this.y - 35, '#ff7b72');
      if (this.isPlayer && addFloatingText && this.silenceTimer > 0) addFloatingText('🤐 Đang bị CÂM LẶNG!', this.x, this.y - 35, '#ff7b72');
      return;
    }
    const rankIdx = this.skillRanks.R - 1;
    const cfg = (this.championDef && this.championDef.skills && this.championDef.skills.R) || (typeof SKILL_RANKS !== 'undefined' ? SKILL_RANKS.R : null);
    if (!cfg) return;
    const manaCost = cfg.mana[rankIdx];
    const cd = cfg.cd[rankIdx] * (1 - (this.cooldownReduction || 0));

    if (this.cooldowns.R > 0 || this.mana < manaCost) return;

    if (this.championId === 'assassin') {
      // Yasuo Last Breath: Requires airborne or stunned enemy
      let airborneEnemy = null;
      let minD = 1200;
      for (let h of heroes) {
        if (h && h.alive && h.team !== this.team && (h.knockupTimer > 0 || h.stunTimer > 0)) {
          const d = this.distanceTo(h);
          if (d < minD) { minD = d; airborneEnemy = h; }
        }
      }
      if (!airborneEnemy) {
        if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Cần kẻ địch bị HẤT TUNG để dùng Trăn Trối!', this.x, this.y - 45, '#ff7b72');
        return;
      }
      this.mana -= manaCost;
      this.cooldowns.R = cd;

      // Blink to target & suspend
      this.x = airborneEnemy.x - 30;
      this.y = airborneEnemy.y;
      this.targetX = this.x;
      this.targetY = this.y;

      const damage = Math.round(cfg.damage[rankIdx] + (this.attackDamage || 0) * 1.10);
      for (let h of heroes) {
        if (h && h.alive && h.team !== this.team && Math.hypot(h.x - airborneEnemy.x, h.y - airborneEnemy.y) <= 260) {
          h.knockupTimer = 1.5;
          h.takeDamage(damage, this, addFloatingText);
          if (onKill && !h.alive) onKill(h, this);
        }
      }
      if (createClickWave) createClickWave(airborneEnemy.x, airborneEnemy.y, '#2ea043');
      if (addFloatingText) addFloatingText(`🌪️ TRĂN TRỐI TUYỆT KỸ (${damage})!`, this.x, this.y - 50, '#3fb950');
      return;
    }

    if (this.championId === 'fighter') {
      let bestTarget = null;
      let lowestHp = 999999;
      for (let h of heroes) {
        if (h && h.alive && h.team !== this.team && this.distanceTo(h) <= (cfg.range || 500)) {
          if (h.hp < lowestHp) {
            lowestHp = h.hp;
            bestTarget = h;
          }
        }
      }
      if (!bestTarget) {
        if (this.isPlayer && addFloatingText) addFloatingText('⚠️ Cần chọn mục tiêu trong tầm 500px!', this.x, this.y - 45, '#ff7b72');
        return;
      }

      this.mana -= manaCost;
      this.cooldowns.R = cd;

      const missingHp = Math.max(0, bestTarget.maxHp - bestTarget.hp);
      const baseDmg = cfg.damage[rankIdx];
      const trueDamage = Math.round(baseDmg + missingHp * 0.30);

      bestTarget.hp -= trueDamage;
      bestTarget.damageTaken = (bestTarget.damageTaken || 0) + trueDamage;
      this.damageDealt = (this.damageDealt || 0) + trueDamage;

      if (addFloatingText) {
        addFloatingText(`🗡️ CÔNG LÝ DEMACIA: -${trueDamage} CHUẨN!`, bestTarget.x, bestTarget.y - 55, '#ffd700');
      }
      if (createClickWave) createClickWave(bestTarget.x, bestTarget.y, '#ffd700');

      if (bestTarget.hp <= 0) {
        bestTarget.hp = 0;
        bestTarget.alive = false;
        bestTarget.respawnTimer = 25;
        this.kills = (this.kills || 0) + 1;
        bestTarget.deaths = (bestTarget.deaths || 0) + 1;
        if (onKill) onKill(bestTarget, this);
      }
      if (addFloatingText) addFloatingText('👑 DEMACIA!!!', this.x, this.y - 50, '#ffd700');
      return;
    }

    this.mana -= manaCost;
    this.cooldowns.R = cd;

    if (this.hasSpellblade) {
      this.spellbladeActive = true;
      this.spellbladeTimer = 6.0;
    }

    if (this.championId === 'mage') {
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.90);
      const radius = cfg.range || 950;
      for (let h of heroes) {
        if (h.team !== this.team && h.alive && this.distanceTo(h) <= radius) {
          const wasAlive = h.alive;
          h.takeDamage(damage, this, addFloatingText);
          if (this.hasRylai && h.applySlow) h.applySlow(0.30, 1.5);
          if (wasAlive && !h.alive && onKill) onKill(h, this);
        }
      }
      for (let tw of towers) {
        if (tw.team !== this.team && tw.alive && this.distanceTo(tw) <= radius) {
          const wasAlive = tw.alive;
          tw.takeDamage(Math.max(10, damage - 60), this);
          if (wasAlive && !tw.alive && onKill) onKill(tw, this);
        }
      }
      for (let m of monsters) {
        if (m.alive && this.distanceTo(m) <= radius) {
          const wasAlive = m.alive;
          m.takeDamage(damage, this, addFloatingText);
          if (wasAlive && !m.alive && onKill) onKill(m, this);
        }
      }
      if (minions) {
        for (let mn of minions) {
          if (mn.alive && mn.team !== this.team && this.distanceTo(mn) <= radius) {
            const wasAlive = mn.alive;
            mn.takeDamage(damage, this, addFloatingText);
            if (wasAlive && !mn.alive && onKill) onKill(mn, this);
          }
        }
      }
      if (createClickWave) createClickWave(this.x, this.y, this.team === 'blue' ? '#58a6ff' : '#f85149');
      if (addFloatingText) addFloatingText(`💥 THIÊN PHẠT ${damage}!`, this.x, this.y - 40, '#a371f7');
    } else if (this.championId === 'adc') {
      // Ashe Enchanted Crystal Arrow
      const damage = Math.round(cfg.damage[rankIdx] + (this.attackDamage || 0) * 1.0);
      const angle = this.facingAngle;
      if (projectiles) {
        projectiles.push(new Projectile({
          x: this.x + Math.cos(angle) * (this.radius + 18),
          y: this.y + Math.sin(angle) * (this.radius + 18),
          vx: Math.cos(angle) * cfg.speed,
          vy: Math.sin(angle) * cfg.speed,
          radius: cfg.radius,
          range: cfg.range,
          rangeLeft: cfg.range,
          team: this.team,
          damage: damage,
          color: '#58a6ff',
          owner: this,
          isCrystalArrow: true
        }));
      }
      if (addFloatingText) addFloatingText(`👑 ĐẠI BĂNG TIỄN TOÀN BẢN ĐỒ!`, this.x, this.y - 50, '#58a6ff');
    } else if (this.championId === 'tank') {
      // Malphite Unstoppable Force: Charge and Knockup in radius
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.80);
      const angle = this.facingAngle;
      const chargeDist = Math.min(cfg.range || 1200, Math.hypot(this.targetX - this.x, this.targetY - this.y) || 800);
      this.x += Math.cos(angle) * chargeDist;
      this.y += Math.sin(angle) * chargeDist;
      if (window.resolveWallCollisions) window.resolveWallCollisions(this);
      this.targetX = this.x;
      this.targetY = this.y;

      for (let h of heroes) {
        if (h.team !== this.team && h.alive && this.distanceTo(h) <= (cfg.radius || 360)) {
          h.knockupTimer = 1.5;
          h.takeDamage(damage, this, addFloatingText);
          if (onKill && !h.alive) onKill(h, this);
        }
      }
      if (createClickWave) createClickWave(this.x, this.y, '#f59e0b');
      if (addFloatingText) addFloatingText(`☄️ KHÔNG THỂ CẢN PHÁ (${damage})!`, this.x, this.y - 50, '#f59e0b');
    } else if (this.championId === 'support') {
      // Lumina Cosmic Blessing: 650px area silence, slow and damage
      const damage = Math.round(cfg.damage[rankIdx] + (this.abilityPower || 0) * 0.70);
      this.cosmicZone = {
        x: this.x,
        y: this.y,
        radius: cfg.radius || 650,
        timer: 4.0,
        team: this.team,
        damage: damage,
        owner: this
      };
      for (let h of heroes) {
        if (h && h.team !== this.team && h.alive && this.distanceTo(h) <= (cfg.radius || 650)) {
          h.takeDamage(damage, this, addFloatingText);
          h.silenceTimer = 1.5;
          if (h.applySlow) h.applySlow(0.50, 2.5);
          if (addFloatingText) addFloatingText('🤐 CÂM LẶNG (1.5s)!', h.x, h.y - 45, '#ec4899');
        }
      }
      if (createClickWave) createClickWave(this.x, this.y, '#ec4899');
      if (addFloatingText) addFloatingText(`🌌 KHÚC CA TINH VÂN!`, this.x, this.y - 50, '#ec4899');
    }
  }

  recall(addFloatingText = null) {
    if (this.cooldowns.B > 0 || !this.alive || this.stunTimer > 0 || this.knockupTimer > 0) return;
    this.cooldowns.B = 4.0;
    const recallDuration = (this.hasBaronBuff && this.baronTimer > 0) ? 2.0 : 4.0;
    const txt = (this.hasBaronBuff && this.baronTimer > 0) ? '👑 Biến về Siêu Tốc Baron (2s)...' : '✨ Đang biến về (4s)...';
    if (addFloatingText) addFloatingText(txt, this.x, this.y - 35, '#388bfd');

    setTimeout(() => {
      if (this.alive) {
        this.x = this.team === 'blue' ? 1200 : 13800;
        this.y = this.team === 'blue' ? 13800 : 1200;
        this.targetX = this.x;
        this.targetY = this.y;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        if (addFloatingText) addFloatingText('✨ ĐÃ VỀ TẾ ĐÀN (HỒI ĐẦY MÁU)', this.x, this.y - 45, '#3fb950');
      }
    }, recallDuration * 1000);
  }

  fireBasicAttack(target, projectiles) {
    if (!target || !target.alive || this.isStasis || this.isReviving || this.stunTimer > 0 || this.knockupTimer > 0) return;
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    this.facingAngle = angle;

    const isCrit = Math.random() < (this.critChance || 0);
    let finalDamage = Math.round(this.attackDamage * (isCrit ? (this.critMultiplier || 2.0) : 1.0));

    let isSpellblade = false;
    if (this.spellbladeActive) {
      const mult = this.hasSpellblade === 'trinity' ? 2.0 : 1.0;
      finalDamage += Math.round(this.baseAttackDamage * mult);
      this.spellbladeActive = false;
      this.spellbladeTimer = 0;
      isSpellblade = true;
    }

    if (this.hasNashor) {
      finalDamage += Math.round(30 + this.abilityPower * 0.20);
    }

    let isGarenQ = false;
    if (this.garenQTimer > 0) {
      const qRank = Math.max(1, this.skillRanks.Q);
      const qDmg = [160, 230, 300, 370][qRank - 1] + Math.round(this.attackDamage * 1.20);
      finalDamage += qDmg;
      if (target.silenceTimer !== undefined) {
        target.silenceTimer = 1.5;
      }
      this.garenQTimer = 0;
      isGarenQ = true;
    }

    projectiles.push(new Projectile({
      x: this.x + Math.cos(angle) * (this.radius + 8),
      y: this.y + Math.sin(angle) * (this.radius + 8),
      vx: Math.cos(angle) * 950,
      vy: Math.sin(angle) * 950,
      radius: isCrit ? 14 : 10,
      rangeLeft: this.attackRange + 300,
      range: this.attackRange + 300,
      team: this.team,
      damage: finalDamage,
      color: isCrit ? '#ffd700' : (isSpellblade ? '#00cec9' : (this.team === 'blue' ? '#58a6ff' : '#f85149')),
      owner: this,
      isHoming: true,
      isCrit: isCrit,
      isSpellblade: isSpellblade,
      target: target,
      speed: 950
    }));
  }

  // ================= UPDATE & MOVEMENT =================
  update(dt, rockWalls, bushes, projectiles) {
    // Respawn countdown
    if (!this.alive) {
      if (this.respawnTimer > 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.alive = true;
          this.isStasis = false;
          this.isReviving = false;
          this.potionTimer = 0;
          this.manaPotionTimer = 0;
          this.hp = this.maxHp;
          this.mana = this.maxMana;
          this.shield = 0;
          this.silenceTimer = 0;
          this.garenQTimer = 0;
          this.garenWTimer = 0;
          this.garenSpinTimer = 0;
          this.cosmicZone = null;
          this.x = this.team === 'blue' ? 1200 : 13800;
          this.y = this.team === 'blue' ? 13800 : 1200;
          this.targetX = this.x;
          this.targetY = this.y;
          this.attackTarget = null;
        }
      }
      return;
    }

    // Đang ngưng đọng hồi sinh từ Giáp Thiên Thần
    if (this.isReviving) {
      this.reviveTimer -= dt;
      if (this.reviveTimer <= 0) {
        this.isReviving = false;
        this.hp = Math.round(this.maxHp * 0.50);
        this.shield = 0;
      }
      return;
    }

    // Cooldown trang bị kích hoạt
    for (let i = 0; i < this.itemActiveCooldowns.length; i++) {
      if (this.itemActiveCooldowns[i] > 0) {
        this.itemActiveCooldowns[i] = Math.max(0, this.itemActiveCooldowns[i] - dt);
      }
    }

    // Cooldown nội tại Giáp Thiên Thần & Nỏ Tử Thủ
    if (this.gaCooldown > 0) this.gaCooldown = Math.max(0, this.gaCooldown - dt);
    if (this.shieldbowCooldown > 0) this.shieldbowCooldown = Math.max(0, this.shieldbowCooldown - dt);

    // Thời gian sẵn sàng Kiếm Phép (Spellblade)
    if (this.spellbladeTimer > 0) {
      this.spellbladeTimer -= dt;
      if (this.spellbladeTimer <= 0) {
        this.spellbladeActive = false;
      }
    }

    // Hồi phục từ Bình Máu
    if (this.potionTimer > 0) {
      const healAmt = this.potionRegenRate * dt * (this.hasSpiritVisage ? 1.25 : 1.0);
      this.hp = Math.min(this.maxHp, this.hp + healAmt);
      this.potionTimer -= dt;
    }

    // Hồi phục từ Bình Năng Lượng
    if (this.manaPotionTimer > 0) {
      this.mana = Math.min(this.maxMana, this.mana + this.manaPotionRegenRate * dt);
      this.manaPotionTimer -= dt;
    }

    // Thời gian tăng tốc Youmuu
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) {
        this.recalculateStats();
      }
    }

    // Thời gian Dược Phẩm (Elixir)
    if (this.elixirTimer > 0) {
      this.elixirTimer -= dt;
      if (this.elixirTimer <= 0) {
        this.elixirType = null;
        this.recalculateStats();
      }
    }

    // Thời gian Làm Chậm (Slow)
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowRatio = 0;
      }
    }

    // Thời gian Thiêu Đốt (Ignite)
    if (this.igniteTimer > 0) {
      this.igniteTimer -= dt;
      const burnTick = (this.igniteDps || 20) * dt;
      this.takeDamage(burnTick, this.igniteAttacker);
      if (this.igniteTimer <= 0) {
        this.igniteDps = 0;
        this.igniteAttacker = null;
      }
    }

    // Thời gian Câm Lặng (Silence)
    if (this.silenceTimer > 0) this.silenceTimer = Math.max(0, this.silenceTimer - dt);

    // Thời gian kỹ năng Garen
    if (this.garenQTimer > 0) this.garenQTimer = Math.max(0, this.garenQTimer - dt);
    if (this.garenWTimer > 0) this.garenWTimer = Math.max(0, this.garenWTimer - dt);
    if (this.garenSpinTimer > 0) this.garenSpinTimer = Math.max(0, this.garenSpinTimer - dt);

    // Thời gian Vùng Tinh Tú (Lumina Cosmic Zone)
    if (this.cosmicZone) {
      this.cosmicZone.timer -= dt;
      if (this.cosmicZone.timer <= 0) {
        this.cosmicZone = null;
      }
    }

    // Nội tại Garen - Hồi phục ngoài giao tranh (2.5% Max HP/s sau 6s)
    if (this.championId === 'fighter') {
      this.outOfCombatTimer = (this.outOfCombatTimer || 0) + dt;
      if (this.outOfCombatTimer >= 6.0 && this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.025) * dt);
      }
    }

    // Trạng thái Ngưng Đọng (Zhonya)
    if (this.isStasis) {
      this.stasisTimer -= dt;
      if (this.stasisTimer <= 0) {
        this.isStasis = false;
      }
      return;
    }

    // Khống chế: Hất tung & Choáng
    if (this.knockupTimer > 0) {
      this.knockupTimer = Math.max(0, this.knockupTimer - dt);
      return;
    }
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      return;
    }

    // Đếm ngược Bùa Baron
    if (this.baronTimer > 0) {
      this.baronTimer = Math.max(0, this.baronTimer - dt);
      if (this.baronTimer <= 0) {
        this.hasBaronBuff = false;
        this.recalculateStats();
      }
    }

    // Giảm tốc đánh
    if (this.asDebuffTimer > 0) {
      this.asDebuffTimer = Math.max(0, this.asDebuffTimer - dt);
      if (this.asDebuffTimer <= 0) {
        this.attackSpeedDebuff = 0;
      }
    }

    // Thời gian kỹ năng đặc thù tướng
    if (this.rangersFocusTimer > 0) {
      this.rangersFocusTimer = Math.max(0, this.rangersFocusTimer - dt);
    }
    if (this.thunderclapTimer > 0) {
      this.thunderclapTimer = Math.max(0, this.thunderclapTimer - dt);
    }

    // Regens
    if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * dt);
    if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);

    // Skill cooldowns
    for (let k in this.cooldowns) {
      if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Bush stealth check
    this.inBush = false;
    if (bushes) {
      for (let b of bushes) {
        if (Math.hypot(b.x - this.x, b.y - this.y) <= b.r) {
          this.inBush = true;
          break;
        }
      }
    }

    // Target locked basic attack
    if (this.attackTarget) {
      if (!this.attackTarget.alive) {
        this.attackTarget = null;
      } else {
        const distToTarget = Math.hypot(this.attackTarget.x - this.x, this.attackTarget.y - this.y);
        if (distToTarget <= this.attackRange) {
          this.targetX = this.x;
          this.targetY = this.y;
          if (this.attackCooldown <= 0 && projectiles) {
            this.attackCooldown = this.attackSpeed;
            this.fireBasicAttack(this.attackTarget, projectiles);
          }
        } else {
          this.targetX = this.attackTarget.x;
          this.targetY = this.attackTarget.y;
        }
      }
    }

    // Movement factoring Slow
    const effSpeed = this.slowRatio > 0 ? this.speed * (1 - this.slowRatio) : this.speed;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      this.facingAngle = Math.atan2(dy, dx);
      const step = Math.min(dist, effSpeed * dt);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }

    // Terrain Collision
    if (window.resolveWallCollisions) {
      window.resolveWallCollisions(this);
    }
  }

  // ================= RENDERING =================
  draw(ctx, camera, mouse = null) {
    const screenX = this.x - camera.x;
    let screenY = this.y - camera.y;

    if (!this.alive) {
      ctx.save();
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.fillText(`💀 Hồi sinh sau: ${Math.ceil(this.respawnTimer)}s`, screenX, screenY);
      ctx.restore();
      return;
    }

    // Bóng mặt đất & nâng cao độ khi bị Hất tung
    if (this.knockupTimer > 0) {
      const airOffset = Math.sin((this.knockupTimer / 1.5) * Math.PI) * 36;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + this.radius - 2, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();
      screenY -= airOffset;
    }

    ctx.save();
    if (this.inBush) {
      ctx.globalAlpha = 0.55;
    }

    // Golden Stasis Aura (Zhonya)
    if (this.isStasis) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Guardian Angel Revive Halo & Wings
    if (this.isReviving) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 234, 167, 0.45)';
      ctx.fill();
      ctx.strokeStyle = '#fdcb6e';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Angelic Halo above token
      ctx.beginPath();
      ctx.ellipse(screenX, screenY - this.radius - 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffeaa7';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Spellblade Aura (Sheen / Trinity Force)
    if (this.spellbladeActive) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Sunfire / Bami Burn Aura
    if (this.hasSunfire) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.burnAuraRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 118, 117, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Lumina Cosmic Zone field
    if (this.cosmicZone && this.cosmicZone.timer > 0) {
      const zx = this.cosmicZone.x - camera.x;
      const zy = this.cosmicZone.y - camera.y;
      ctx.save();
      ctx.beginPath();
      ctx.arc(zx, zy, this.cosmicZone.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.stroke();
      ctx.restore();
    }

    // Garen Judgment Spin vortex
    if (this.garenSpinTimer > 0) {
      ctx.save();
      const spinAngle = Date.now() * 0.015;
      ctx.translate(screenX, screenY);
      ctx.rotate(spinAngle);
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 6;
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(80, 0);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shield Aura
    if (this.shield > 0) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Outer Ring 1: HP Arc
    const hpRingRadius = this.radius + 7;
    ctx.beginPath();
    ctx.arc(screenX, screenY, hpRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(18, 22, 28, 0.85)';
    ctx.lineWidth = 5.5;
    ctx.stroke();

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    const hpColor = this.team === 'blue' ? '#3fb950' : '#f85149';
    ctx.beginPath();
    ctx.arc(screenX, screenY, hpRingRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = hpColor;
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Outer Ring 2: Mana Arc
    const manaRingRadius = this.radius + 14.5;
    ctx.beginPath();
    ctx.arc(screenX, screenY, manaRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10, 20, 35, 0.75)';
    ctx.lineWidth = 4;
    ctx.stroke();

    const manaRatio = Math.max(0, this.mana / this.maxMana);
    ctx.beginPath();
    ctx.arc(screenX, screenY, manaRingRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * manaRatio);
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Central Core & Avatar
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.avatarColor;
    ctx.fill();
    ctx.strokeStyle = this.team === 'blue' ? '#58a6ff' : '#ff7b72';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, screenX, screenY);

    // Direction pointer
    const aimAngle = (this.isPlayer && mouse)
      ? Math.atan2(mouse.worldY - this.y, mouse.worldX - this.x)
      : this.facingAngle;

    const tipX = screenX + Math.cos(aimAngle) * (this.radius + 20);
    const tipY = screenY + Math.sin(aimAngle) * (this.radius + 20);
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = this.team === 'blue' ? '#79c0ff' : '#ffa198';
    ctx.fill();

    // Level Badge on Token
    const badgeX = screenX + this.radius - 4;
    const badgeY = screenY + this.radius - 4;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1117';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(this.level, badgeX, badgeY);

    // Name
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText(this.name, screenX, screenY - this.radius - 20);

    // Crowd Control Label (Knockup / Stun / Silence)
    if (this.knockupTimer > 0) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#2ea043';
      ctx.textAlign = 'center';
      ctx.fillText('🌪️ HẤT TUNG!', screenX, screenY - this.radius - 36);
    } else if (this.stunTimer > 0) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#58a6ff';
      ctx.textAlign = 'center';
      ctx.fillText('💫 CHOÁNG!', screenX, screenY - this.radius - 36);
    } else if (this.silenceTimer > 0) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ff7b72';
      ctx.textAlign = 'center';
      ctx.fillText('🤐 CÂM LẶNG!', screenX, screenY - this.radius - 36);
    }

    // Baron Aura Ring
    if (this.hasBaronBuff && this.baronTimer > 0) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#a371f7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    if (this.isPlayer && this.attackTarget && this.attackTarget.alive) {
      this.drawTargetReticle(ctx, camera);
    }
  }

  drawTargetReticle(ctx, camera) {
    const t = this.attackTarget;
    if (!t || !t.alive) return;
    const tx = t.x - camera.x;
    const ty = t.y - camera.y;
    const r = t.radius + 12;

    ctx.save();
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.stroke();

    const crossLen = 8;
    ctx.beginPath();
    ctx.moveTo(tx - r - crossLen, ty); ctx.lineTo(tx - r + 2, ty);
    ctx.moveTo(tx + r - 2, ty); ctx.lineTo(tx + r + crossLen, ty);
    ctx.moveTo(tx, ty - r - crossLen); ctx.lineTo(tx, ty - r + 2);
    ctx.moveTo(tx, ty + r - 2); ctx.lineTo(tx, ty + r + crossLen);
    ctx.stroke();
    ctx.restore();
  }
}
