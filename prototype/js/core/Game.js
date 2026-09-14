/**
 * OOP Game Engine
 * Master Coordinator managing state, match loop, entities, physics, vision, rewards, and rendering
 */
class Game {
  constructor(canvas, minimapCanvas) {
    this.canvas = canvas || document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.minimapCanvas = minimapCanvas || document.getElementById('minimapCanvas');
    this.minimapWrapper = document.getElementById('minimap-wrapper');

    // Subsystems
    this.camera = new Camera();
    this.terrain = new TerrainRenderer();
    window.terrainRendererInstance = this.terrain;

    this.fogOfWar = new FogOfWar();
    this.minimap = new Minimap(this.minimapCanvas, this.minimapWrapper);
    this.hud = new HUD();
    this.input = new InputManager(this.canvas, this.minimapCanvas, this);

    // Entity Collections
    this.heroes = [];
    this.towers = [];
    this.monsters = [];
    this.minions = [];
    this.projectiles = [];
    this.particles = [];
    this.clickWaves = [];
    this.windWalls = [];
    this.botAIs = [];
    this.player = null;

    // Match Parameters
    this.mode = 'pve'; // 'pve' or 'solo'
    this.matchTime = 0;
    this.waveTimer = 60.0;
    this.waveInterval = 30.0;
    this.waveCount = 0;
    this.passiveGoldTimer = 0;
    this.blueScore = 0;
    this.redScore = 0;

    this.lastTime = performance.now();
    this.running = false;
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    this.initMatch();
  }

  handleResize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;

    if (this.minimapWrapper && this.minimapCanvas) {
      this.minimapCanvas.width = this.minimapWrapper.clientWidth;
      this.minimapCanvas.height = this.minimapWrapper.clientHeight;
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.initMatch();
  }

  initMatch() {
    this.heroes = [];
    this.towers = [];
    this.monsters = [];
    this.minions = [];
    this.projectiles = [];
    this.particles = [];
    this.clickWaves = [];
    this.windWalls = [];
    this.botAIs = [];

    this.matchTime = 0;
    this.waveTimer = 60.0;
    this.waveInterval = 30.0;
    this.waveCount = 0;
    this.passiveGoldTimer = 0;
    this.blueScore = 0;
    this.redScore = 0;

    this.hud.updateClock(0);
    this.hud.updateScores(0, 0);

    // 1. Towers
    for (let cfg of TOWERS_CONFIG) {
      this.towers.push(new Tower(cfg));
    }

    // 2. Neutral Monsters
    for (let cfg of MONSTERS_CONFIG) {
      this.monsters.push(new Monster(cfg));
    }

    // 3. Heroes & Bot AIs
    if (this.mode === 'solo') {
      this.player = new Hero({
        id: 'player',
        name: 'Bạn (Player)',
        championId: 'mage',
        team: 'blue',
        isPlayer: true,
        x: 7000,
        y: 8000,
        avatarColor: '#8957e5',
        symbol: '🧙‍♂️'
      });
      this.heroes.push(this.player);

      const botEnemy = new Hero({
        id: 'bot_enemy',
        name: 'Bot Cao Thủ (Yasuo)',
        championId: 'assassin',
        team: 'red',
        isPlayer: false,
        x: 8000,
        y: 7000,
        avatarColor: '#2ea043',
        symbol: '⚔️',
        lane: 'MID'
      });
      this.heroes.push(botEnemy);
      this.botAIs.push(new BotAI(botEnemy));

      this.hud.announce('Chế độ 1v1 Thử nghiệm AI đã bắt đầu!');
    } else {
      // 5v5 PvE
      this.player = new Hero({
        id: 'player',
        name: 'Bạn (Mage)',
        championId: 'mage',
        team: 'blue',
        isPlayer: true,
        x: 1800,
        y: 13200,
        avatarColor: '#8957e5',
        symbol: '🧙‍♂️',
        lane: 'MID'
      });
      this.heroes.push(this.player);

      const blueAllies = [
        { name: 'Đồng Minh (Tank - Malphite)', championId: 'tank', lane: 'TOP', symbol: '🗿', color: '#d29922', x: 1400, y: 12800 },
        { name: 'Đồng Minh (Yasuo)', championId: 'assassin', lane: 'MID', symbol: '⚔️', color: '#2ea043', x: 2200, y: 12800 },
        { name: 'Đồng Minh (ADC - Ashe)', championId: 'adc', lane: 'BOT', symbol: '🏹', color: '#58a6ff', x: 2400, y: 13600 },
        { name: 'Đồng Minh (Valhein)', championId: 'mage', lane: 'BOT', symbol: '🔮', color: '#8957e5', x: 1600, y: 14000 }
      ];
      blueAllies.forEach((a, i) => {
        const h = new Hero({
          id: `blue_bot_${i}`,
          name: a.name,
          championId: a.championId,
          team: 'blue',
          isPlayer: false,
          x: a.x,
          y: a.y,
          avatarColor: a.color,
          symbol: a.symbol,
          lane: a.lane
        });
        this.heroes.push(h);
        this.botAIs.push(new BotAI(h));
      });

      const redBots = [
        { name: 'Bot Đỏ (Tank - Malphite)', championId: 'tank', lane: 'TOP', symbol: '🗿', color: '#d29922', x: 13600, y: 2200 },
        { name: 'Bot Đỏ (Valhein)', championId: 'mage', lane: 'MID', symbol: '🔮', color: '#8957e5', x: 13200, y: 1800 },
        { name: 'Bot Đỏ (Yasuo)', championId: 'assassin', lane: 'MID', symbol: '⚔️', color: '#2ea043', x: 12800, y: 2200 },
        { name: 'Bot Đỏ (ADC - Ashe)', championId: 'adc', lane: 'BOT', symbol: '🏹', color: '#58a6ff', x: 12600, y: 1400 },
        { name: 'Bot Đỏ (Hỗ Trợ)', championId: 'tank', lane: 'BOT', symbol: '🛡️', color: '#da3633', x: 13400, y: 1000 }
      ];
      redBots.forEach((b, i) => {
        const h = new Hero({
          id: `red_bot_${i}`,
          name: b.name,
          championId: b.championId,
          team: 'red',
          isPlayer: false,
          x: b.x,
          y: b.y,
          avatarColor: b.color,
          symbol: b.symbol,
          lane: b.lane
        });
        this.heroes.push(h);
        this.botAIs.push(new BotAI(h));
      });

      this.hud.announce('Chế độ 5v5 PvE (OOP Architecture) đã bắt đầu!');
    }

    if (this.player) {
      this.camera.centerOn(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
      this.hud.updateProgression(this.player);
      this.hud.updateCooldowns(this.player);
      this.hud.initShop(
        this.player,
        (itemId) => {
          if (!this.player) return;
          const res = this.player.buyItem(itemId, this.hud.addFloatingText.bind(this.hud));
          if (res.success) {
            this.hud.updateProgression(this.player);
            this.hud.updateInventory(this.player);
          }
        },
        (slotIndex) => {
          if (!this.player) return;
          const res = this.player.sellItem(slotIndex, this.hud.addFloatingText.bind(this.hud));
          if (res.success) {
            this.hud.updateProgression(this.player);
            this.hud.updateInventory(this.player);
          }
        },
        (slotIndex) => {
          if (!this.player) return;
          this.player.useActiveItem(slotIndex, this.hud.addFloatingText.bind(this.hud));
          this.hud.updateInventory(this.player);
          this.hud.updateCooldowns(this.player);
        }
      );

      if (this.hud.initChampSelect) {
        this.hud.initChampSelect((champId) => {
          this.selectChampion(champId);
        });
      }
      if (this.hud.updateChampionSkills) {
        this.hud.updateChampionSkills(this.player.championId || 'mage');
      }
    }
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame((now) => this.gameLoop(now));
    }
  }

  addFloatingText(text, x, y, color = '#fff') {
    if (this.hud && this.hud.addFloatingText) {
      this.hud.addFloatingText(text, x, y, color);
    }
  }

  isTowerAlive(id) {
    const tw = this.towers.find(t => t.id === id);
    return tw ? tw.alive : false;
  }

  areAllInhibitorsDown(team) {
    const prefix = team === 'blue' ? 'b_' : 'r_';
    const top = this.isTowerAlive(prefix + 'top_3');
    const mid = this.isTowerAlive(prefix + 'mid_3');
    const bot = this.isTowerAlive(prefix + 'bot_3');
    return !top && !mid && !bot;
  }

  triggerChainLightning(owner, primaryTarget, damage) {
    const targets = [];
    const pool = [...this.heroes, ...this.minions, ...this.monsters];
    for (let e of pool) {
      if (e !== primaryTarget && e.alive && e.team !== owner.team) {
        const d = Math.hypot(e.x - primaryTarget.x, e.y - primaryTarget.y);
        if (d < 550) {
          targets.push(e);
          if (targets.length >= 3) break;
        }
      }
    }
    targets.forEach(t => {
      t.takeDamage(damage, owner, this.hud.addFloatingText.bind(this.hud));
      this.createClickWave(t.x, t.y, '#ffd700');
    });
  }

  spawnMinionWave() {
    if (this.waveCount === 1) {
      this.hud.announce('⚔️ ĐỢT LÍNH ĐẦU TIÊN ĐÃ XUẤT TRẬN!');
    }

    const redAllInhibsDown = this.areAllInhibitorsDown('red');
    const blueAllInhibsDown = this.areAllInhibitorsDown('blue');

    ['blue', 'red'].forEach(team => {
      const opposingTeam = team === 'blue' ? 'red' : 'blue';
      const allInhibsDown = opposingTeam === 'red' ? redAllInhibsDown : blueAllInhibsDown;

      ['TOP', 'MID', 'BOT'].forEach(lane => {
        const wp = MINION_WAYPOINTS[team][lane];
        const startX = wp[0].x;
        const startY = wp[0].y;

        const isCannonWave = (this.waveCount % 3 === 0);
        const inhibTowerId = (opposingTeam === 'blue' ? 'b_' : 'r_') + lane.toLowerCase() + '_3';
        const inhibDown = !this.isTowerAlive(inhibTowerId);

        const pattern = ['MELEE', 'MELEE', 'MELEE', 'RANGED', 'RANGED'];
        if (isCannonWave) pattern.push('CANNON');
        if (inhibDown) pattern.push('SUPER');
        if (allInhibsDown) pattern.push('SUPER');

        pattern.forEach((type, idx) => {
          const offsetX = (idx % 2 === 0 ? 1 : -1) * (idx * 24);
          const offsetY = idx * 30;
          this.minions.push(new Minion({
            id: `minion_${team}_${lane}_${this.waveCount}_${idx}`,
            team: team,
            lane: lane,
            type: type,
            x: startX + offsetX,
            y: startY + offsetY,
            waypoints: wp
          }));
        });
      });
    });
  }

  distributeRewards(target, killer, baseExp, baseGold, teamExp = 0, teamGold = 0) {
    if (!target) return;

    let killerHero = killer;
    if (killer && killer.owner && killer.owner.isPlayer !== undefined) {
      killerHero = killer.owner;
    }

    let team = 'blue';
    if (killerHero && killerHero.team) {
      team = killerHero.team;
    } else if (target.team) {
      team = target.team === 'blue' ? 'red' : 'blue';
    }

    // 1. Killer
    if (killerHero && killerHero.addExp && killerHero.alive) {
      killerHero.addExp(baseExp, (lvl) => {
        this.hud.addFloatingText(`🌟 CẤP ĐỘ ${lvl}!`, killerHero.x, killerHero.y - 55, '#ffd700');
        this.hud.announce(`🌟 BẠN ĐÃ ĐẠT CẤP ĐỘ ${lvl}!`);
      }, this.hud.addFloatingText.bind(this.hud));

      killerHero.addGold(baseGold, this.hud.addFloatingText.bind(this.hud));
    }

    // 2. Assists (allies within 1000px)
    for (let h of this.heroes) {
      if (h.alive && h.team === team && h !== killerHero) {
        const d = Math.hypot(h.x - target.x, h.y - target.y);
        if (d <= ECONOMY.ASSIST_RADIUS) {
          const expShare = killerHero && killerHero.addExp ? Math.round(baseExp * 0.5) : baseExp;
          const goldShare = killerHero && killerHero.addGold ? Math.round(baseGold * 0.5) : baseGold;
          h.addExp(expShare, null, this.hud.addFloatingText.bind(this.hud));
          h.addGold(goldShare, this.hud.addFloatingText.bind(this.hud));
        }
      }
    }

    // 3. Teamwide (Dragon/Baron/Tower)
    if (teamExp > 0 || teamGold > 0) {
      for (let h of this.heroes) {
        if (h.alive && h.team === team) {
          if (teamExp > 0) h.addExp(teamExp, null, this.hud.addFloatingText.bind(this.hud));
          if (teamGold > 0) h.addGold(teamGold, this.hud.addFloatingText.bind(this.hud));
        }
      }
    }

    if (this.player) {
      this.hud.updateProgression(this.player);
    }
  }

  onKillReward(deadTarget, killer) {
    if (deadTarget.isPlayer !== undefined) {
      // Hero Kill
      const b = BOUNTIES.HERO_KILL;
      this.distributeRewards(deadTarget, killer, b.exp, b.gold);
      if (killer && killer.team === 'blue') this.blueScore++;
      else if (killer && killer.team === 'red') this.redScore++;
      this.hud.updateScores(this.blueScore, this.redScore);
      this.hud.announce(`${deadTarget.name} đã bị hạ gục!`);
    } else if (deadTarget.type) {
      // Minion Kill
      const bKey = 'MINION_' + (deadTarget.type || 'MELEE');
      const b = BOUNTIES[bKey] || BOUNTIES.MINION_MELEE;
      this.distributeRewards(deadTarget, killer, b.exp, b.gold);
    } else if (deadTarget.buffType !== undefined) {
      // Neutral Monster Kill
      let b = BOUNTIES.MONSTER_SMALL;
      if (deadTarget.buffType === 'dragon') b = BOUNTIES.MONSTER_DRAGON;
      else if (deadTarget.buffType === 'baron') b = BOUNTIES.MONSTER_BARON;
      else if (deadTarget.buffType) b = BOUNTIES.MONSTER_BUFF;
      this.distributeRewards(deadTarget, killer, b.exp, b.gold, b.teamExp || 0, b.teamGold || 0);
      this.applyMonsterBuffs(deadTarget, killer);
    } else if (deadTarget.isInhibitor !== undefined) {
      // Tower Destroy
      const b = BOUNTIES.TOWER_DESTROY;
      this.distributeRewards(deadTarget, killer, 0, b.gold, b.teamExp || 0, b.teamGold || 0);
    }
  }

  selectChampion(champId) {
    if (!this.player) return;
    this.player.setChampion(champId);
    this.hud.updateProgression(this.player);
    if (this.hud.updateChampionSkills) {
      this.hud.updateChampionSkills(champId);
    }
    this.hud.addFloatingText(`🧙‍♂️ ĐÃ CHỌN: ${this.player.name}!`, this.player.x, this.player.y - 50, '#3fb950');
  }

  applyMonsterBuffs(monster, killer) {
    let killerHero = killer;
    if (killer && killer.owner && killer.owner.isPlayer !== undefined) {
      killerHero = killer.owner;
    }
    if (!killerHero || !killerHero.team) return;
    const team = killerHero.team;
    const teamName = team === 'blue' ? 'Đội Xanh' : 'Đội Đỏ';

    if (monster.buffType === 'dragon') {
      for (let h of this.heroes) {
        if (h.team === team) {
          h.dragonStacks = (h.dragonStacks || 0) + 1;
          h.recalculateStats();
        }
      }
      const stacks = killerHero.dragonStacks || 1;
      let desc = '';
      if (stacks === 1) desc = '🔥 BÙA RỒNG LỬA (+10% AD & AP)!';
      else if (stacks === 2) desc = '⛰️ BÙA RỒNG ĐẤT (+25 Giáp toàn đội)!';
      else if (stacks === 3) desc = '💨 BÙA RỒNG GIÓ (+35 Tốc chạy & +10% CDR)!';
      else desc = '🌊 LINH HỒN RỒNG NƯỚC (Hồi phục +15 HP & Mana)!';

      this.hud.announce(`🐉 ${teamName} ĐÃ HẠ GỤC RỒNG NGUYÊN TỐ (Cộng dồn x${stacks})!\n${desc}`);
      if (this.player && this.player.team === team) {
        this.hud.addFloatingText(`🐉 BÙA RỒNG x${stacks}!`, this.player.x, this.player.y - 50, '#ff7675');
      }
      if (this.hud.updateBuffs) this.hud.updateBuffs(this.player);
    } else if (monster.buffType === 'baron') {
      for (let h of this.heroes) {
        if (h.team === team && h.alive) {
          h.hasBaronBuff = true;
          h.baronTimer = 180.0;
          h.recalculateStats();
        }
      }
      this.hud.announce(`👑 ${teamName} ĐÃ CHIẾM ĐƯỢC BÙA HÀNG HIỆU BARON (180s)!\n+40 AD, +60 AP, Biến về 2s và Cường hoá Lính siêu cấp xung quanh!`);
      if (this.player && this.player.team === team && this.player.alive) {
        this.hud.addFloatingText('👑 BÙA HÀNG HIỆU BARON (180s)!', this.player.x, this.player.y - 55, '#a371f7');
      }
      if (this.hud.updateBuffs) this.hud.updateBuffs(this.player);
    }
  }

  usePlayerSkill(slot) {
    if (!this.player || !this.player.alive) return;
    const mouse = this.input.mouse;

    if (slot === 'Q') {
      this.player.castSkillshot(mouse.worldX, mouse.worldY, this.projectiles, this.hud.addFloatingText.bind(this.hud));
    } else if (slot === 'W') {
      this.player.castShield(this.hud.addFloatingText.bind(this.hud));
    } else if (slot === 'E') {
      this.player.castDash(mouse.worldX, mouse.worldY, ROCK_WALLS, this.hud.addFloatingText.bind(this.hud), this.heroes);
    } else if (slot === 'R') {
      this.player.castUltimate(this.heroes, this.towers, this.monsters, this.minions, this.hud.addFloatingText.bind(this.hud), this.onKillReward.bind(this), this.projectiles, (x, y, color) => {
        this.clickWaves.push({ x, y, r: 6, maxR: 35, color: color || '#388bfd', alpha: 1.0 });
      });
    } else if (slot === 'B') {
      this.player.recall(this.hud.addFloatingText.bind(this.hud));
    }
  }

  upgradePlayerSkill(slot) {
    if (!this.player || !this.player.alive) return;
    const success = this.player.upgradeSkill(slot, this.hud.addFloatingText.bind(this.hud));
    if (success) {
      this.hud.updateProgression(this.player);
    }
  }

  findEnemyAt(worldX, worldY) {
    const alliedVision = this.fogOfWar.getAlliedVisionSources(this.heroes, this.minions, this.towers);

    // 1. Enemy Heroes (Must be in vision)
    for (let h of this.heroes) {
      if (h.team !== 'blue' && h.alive) {
        if (this.fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) {
          if (Math.hypot(h.x - worldX, h.y - worldY) <= h.radius + 20) return h;
        }
      }
    }
    // 2. Enemy Minions
    for (let mn of this.minions) {
      if (mn.team !== 'blue' && mn.alive) {
        if (this.fogOfWar.isVisible(mn.x, mn.y, mn.radius, false, alliedVision)) {
          if (Math.hypot(mn.x - worldX, mn.y - worldY) <= mn.radius + 16) return mn;
        }
      }
    }
    // 3. Enemy Towers
    for (let tw of this.towers) {
      if (tw.team !== 'blue' && tw.alive) {
        if (Math.hypot(tw.x - worldX, tw.y - worldY) <= tw.radius + 16) return tw;
      }
    }
    // 4. Neutral Monsters
    for (let m of this.monsters) {
      if (m.alive && this.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
        if (Math.hypot(m.x - worldX, m.y - worldY) <= m.radius + 20) return m;
      }
    }
    return null;
  }

  createClickWave(x, y, color) {
    this.clickWaves.push({ x, y, r: 5, color, alpha: 1.0 });
  }

  // ================= MAIN LOOP =================
  gameLoop(now) {
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Right-click move hold
    if (this.input.mouse.rightDown && this.player && this.player.alive && !this.player.attackTarget) {
      this.input.updateWorldCoords();
      this.player.targetX = this.input.mouse.worldX;
      this.player.targetY = this.input.mouse.worldY;
    }

    // Match Clock & Wave Spawning
    this.matchTime += dt;
    this.hud.updateClock(this.matchTime);

    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.waveCount++;
      this.spawnMinionWave();
      this.waveTimer = this.waveInterval;
    }

    // Passive Gold Income (+3g/sec for living heroes)
    this.passiveGoldTimer += dt;
    if (this.passiveGoldTimer >= 1.0) {
      this.passiveGoldTimer -= 1.0;
      const passiveGold = ECONOMY.PASSIVE_GOLD_PER_SEC || 3;
      for (let h of this.heroes) {
        if (h.alive) {
          h.gold += passiveGold;
        }
      }
      if (this.player) this.hud.updateProgression(this.player);
    }

    // Sunfire / Bami Burn Aura tick (every 1.0s)
    for (let h of this.heroes) {
      if (h.alive && h.hasSunfire && h.burnAuraDps > 0) {
        h.burnTimer = (h.burnTimer || 0) + dt;
        if (h.burnTimer >= 1.0) {
          h.burnTimer -= 1.0;
          const radius = h.burnAuraRadius || 220;
          const dmg = h.burnAuraDps;
          // Burn enemy heroes
          for (let enemy of this.heroes) {
            if (enemy.alive && enemy.team !== h.team && Math.hypot(enemy.x - h.x, enemy.y - h.y) <= radius) {
              enemy.takeDamage(dmg, h, this.hud.addFloatingText.bind(this.hud));
            }
          }
          // Burn enemy minions
          for (let enemyMn of this.minions) {
            if (enemyMn.alive && enemyMn.team !== h.team && Math.hypot(enemyMn.x - h.x, enemyMn.y - h.y) <= radius) {
              enemyMn.takeDamage(dmg, h, (deadMinion, killer) => {
                this.onKillReward(deadMinion, killer);
              });
            }
          }
          // Burn monsters
          for (let m of this.monsters) {
            if (m.alive && Math.hypot(m.x - h.x, m.y - h.y) <= radius) {
              m.takeDamage(dmg, h, this.hud.addFloatingText.bind(this.hud));
            }
          }
        }
      }
    }

    // Update Heroes
    for (let h of this.heroes) {
      h.update(dt, ROCK_WALLS, BUSHES, this.projectiles);
    }

    // Update Bot AIs
    for (let ai of this.botAIs) {
      ai.update(dt, this);
    }

    // Update Towers
    for (let tw of this.towers) {
      tw.update(dt, this.minions, this.heroes, this.projectiles, (revived) => {
        this.hud.announce(`✨ ${revived.name} ĐÃ HỒI SINH với 50% máu!`);
      });
    }

    // Cập nhật Tường Gió (Wind Walls)
    for (let h of this.heroes) {
      if (h.spawnWindWall) {
        this.windWalls.push({
          ...h.spawnWindWall,
          length: 220
        });
        h.spawnWindWall = null;
      }
    }
    for (let i = this.windWalls.length - 1; i >= 0; i--) {
      const ww = this.windWalls[i];
      ww.timer -= dt;
      if (ww.timer <= 0) {
        this.windWalls.splice(i, 1);
      }
    }

    // Cường hoá Lính từ Bùa Baron
    const baronHeroes = this.heroes.filter(h => h.alive && h.hasBaronBuff && h.baronTimer > 0);
    for (let mn of this.minions) {
      if (!mn.alive) continue;
      let shouldEmpower = false;
      for (let bh of baronHeroes) {
        if (bh.team === mn.team && Math.hypot(bh.x - mn.x, bh.y - mn.y) <= 1000) {
          shouldEmpower = true;
          break;
        }
      }
      mn.applyBaronBuff(shouldEmpower);
    }

    // Update Minions
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (!m.alive) {
        this.minions.splice(i, 1);
        continue;
      }
      m.update(dt, this.minions, this.towers, this.heroes, this.projectiles, (deadTarget, killer) => {
        this.onKillReward(deadTarget, killer);
      });
    }

    // Update Monsters
    for (let m of this.monsters) {
      m.update(dt);
    }

    // Update Projectiles & Check Collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);

      let hit = false;

      // Va chạm Tường Gió (Wind Wall)
      if (!p.isTowerShot && this.windWalls.length > 0) {
        for (let ww of this.windWalls) {
          if (p.team !== ww.team) {
            const perp = ww.angle + Math.PI / 2;
            const halfLen = (ww.length || 220) / 2;
            const x1 = ww.x - Math.cos(perp) * halfLen;
            const y1 = ww.y - Math.sin(perp) * halfLen;
            const x2 = ww.x + Math.cos(perp) * halfLen;
            const y2 = ww.y + Math.sin(perp) * halfLen;

            const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            let t = ((p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = x1 + t * (x2 - x1);
            const projY = y1 + t * (y2 - y1);
            const distToWall = Math.hypot(p.x - projX, p.y - projY);

            if (distToWall <= p.radius + 18) {
              p.active = false;
              hit = true;
              this.clickWaves.push({ x: p.x, y: p.y, r: 6, maxR: 35, color: '#3fb950', alpha: 1.0 });
              this.hud.addFloatingText('🛡️ CHẶN BỞI TƯỜNG GIÓ!', p.x, p.y - 30, '#3fb950');
              break;
            }
          }
        }
      }

      // Hit Heroes
      if (!hit) {
        for (let h of this.heroes) {
          if (p.checkCollision(h)) {
            const wasAlive = h.alive;
            if (p.isCrit) {
              this.hud.addFloatingText('💥 CHÍ MẠNG!', h.x, h.y - 48, '#ff4757');
            }
            if (p.isSpellblade) {
              this.hud.addFloatingText('⚔️ KIẾM PHÉP!', h.x, h.y - 48, '#00cec9');
            }
            if (!p.isBasicAttack && p.owner && p.owner.hasRylai && h.applySlow) {
              h.applySlow(0.30, 1.5);
              this.hud.addFloatingText('❄️ RYLAI (30%)', h.x, h.y - 32, '#74b9ff');
            }

            // Hiệu ứng đặc thù tướng
            if (p.isTornado) {
              h.knockupTimer = 1.5;
              this.hud.addFloatingText('🌪️ HẤT TUNG!', h.x, h.y - 40, '#2ea043');
            }
            if (p.isCrystalArrow) {
              h.stunTimer = 2.5;
              this.hud.addFloatingText('❄️ CHOÁNG (2.5s)!', h.x, h.y - 45, '#58a6ff');
              this.clickWaves.push({ x: h.x, y: h.y, r: 6, maxR: 35, color: '#58a6ff', alpha: 1.0 });
              for (let other of this.heroes) {
                if (other !== h && other.alive && other.team !== p.team && Math.hypot(other.x - h.x, other.y - h.y) <= 280) {
                  other.takeDamage(Math.round(p.damage * 0.6), p.owner, this.hud.addFloatingText.bind(this.hud));
                  if (other.applySlow) other.applySlow(0.50, 2.0);
                }
              }
            }
            if (p.isSeismicShard) {
              if (h.applySlow) h.applySlow(0.25, 2.5);
              if (p.owner && p.owner.alive) {
                p.owner.speedBoostTimer = 2.5;
                p.owner.recalculateStats();
              }
              this.hud.addFloatingText('🥌 ĐOẠT TỐC ĐỘ!', h.x, h.y - 40, '#f59e0b');
            }

            h.takeDamage(p.damage, p.owner, this.hud.addFloatingText.bind(this.hud));

            // Lifesteal
            if (p.isBasicAttack && p.owner && p.owner.alive && p.owner.lifesteal > 0) {
              const heal = Math.round(p.damage * p.owner.lifesteal);
              if (heal > 0) {
                p.owner.hp = Math.min(p.owner.maxHp, p.owner.hp + heal);
                this.hud.addFloatingText(`+${heal} HP 🩸`, p.owner.x, p.owner.y - 28, '#3fb950');
              }
            }

            // Statikk lightning
            if (p.isBasicAttack && p.owner && p.owner.hasStatikk) {
              this.triggerChainLightning(p.owner, h, 110);
            }

            if (wasAlive && !h.alive) {
              this.onKillReward(h, p.owner);
            }
            hit = true;
            break;
          }
        }
      }

      // Hit Minions
      if (!hit) {
        for (let m of this.minions) {
          if (m.alive && m.team !== p.team && Math.hypot(m.x - p.x, m.y - p.y) <= m.radius + p.radius) {
            const wasAlive = m.alive;
            if (p.isCrit) {
              this.hud.addFloatingText('💥 CHÍ MẠNG!', m.x, m.y - 40, '#ff4757');
            }
            if (p.isSpellblade) {
              this.hud.addFloatingText('⚔️ KIẾM PHÉP!', m.x, m.y - 40, '#00cec9');
            }
            m.takeDamage(p.damage, p.owner, (deadMinion, killer) => {
              this.onKillReward(deadMinion, killer);
            });

            if (p.isBasicAttack && p.owner && p.owner.alive && p.owner.lifesteal > 0) {
              const heal = Math.round(p.damage * p.owner.lifesteal);
              if (heal > 0) {
                p.owner.hp = Math.min(p.owner.maxHp, p.owner.hp + heal);
                this.hud.addFloatingText(`+${heal} HP 🩸`, p.owner.x, p.owner.y - 28, '#3fb950');
              }
            }

            hit = true;
            break;
          }
        }
      }

      // Hit Monsters
      if (!hit && !p.isTowerShot && !p.isMinionShot) {
        for (let m of this.monsters) {
          if (p.checkCollision(m)) {
            const wasAlive = m.alive;
            if (p.isCrit) {
              this.hud.addFloatingText('💥 CHÍ MẠNG!', m.x, m.y - 45, '#ff4757');
            }
            if (p.isSpellblade) {
              this.hud.addFloatingText('⚔️ KIẾM PHÉP!', m.x, m.y - 45, '#00cec9');
            }
            m.takeDamage(p.damage, p.owner, this.hud.addFloatingText.bind(this.hud));

            if (p.isBasicAttack && p.owner && p.owner.alive && p.owner.lifesteal > 0) {
              const heal = Math.round(p.damage * p.owner.lifesteal);
              if (heal > 0) {
                p.owner.hp = Math.min(p.owner.maxHp, p.owner.hp + heal);
                this.hud.addFloatingText(`+${heal} HP 🩸`, p.owner.x, p.owner.y - 28, '#3fb950');
              }
            }

            if (wasAlive && !m.alive) {
              m.die(p.owner, this.hud.addFloatingText.bind(this.hud), this.hud.announce.bind(this.hud), this.distributeRewards.bind(this));
            }
            hit = true;
            break;
          }
        }
      }

      // Hit Towers
      if (!hit && !p.isTowerShot) {
        for (let tw of this.towers) {
          if (tw.team !== p.team && tw.alive && Math.hypot(tw.x - p.x, tw.y - p.y) <= tw.radius + p.radius) {
            const wasAlive = tw.alive;
            tw.takeDamage(p.damage, p.owner, (deadTower, killer) => {
              if (deadTower.isInhibitor) {
                this.hud.announce(`⚠️ ${deadTower.name} ĐÃ BỊ PHÁ HỦY! Lính Siêu Cấp sẽ xuất hiện trong 5 phút!`);
              } else {
                this.hud.announce(`🏰 ${deadTower.name} ĐÃ BỊ PHÁ HỦY!`);
              }
              const b = BOUNTIES.TOWER_DESTROY;
              this.distributeRewards(deadTower, killer, 0, b.gold, b.teamExp, b.teamGold);
            });
            hit = true;
            break;
          }
        }
      }

      // Hit Walls (Non-homing skillshots)
      if (!hit && !p.isHoming && !p.isTowerShot) {
        for (let w of ROCK_WALLS) {
          if (p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h) {
            hit = true;
            break;
          }
        }
      }

      if (hit || !p.active) {
        // Particle Burst
        for (let k = 0; k < 6; k++) {
          this.particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            radius: 4,
            color: p.color,
            alpha: 1,
            life: 20
          });
        }
        this.projectiles.splice(i, 1);
      }
    }

    // Camera update
    this.camera.update(
      dt,
      this.player,
      this.input.mouse,
      this.input.keys,
      this.canvas.width,
      this.canvas.height
    );

    // Update HUD
    if (this.player) {
      this.hud.updateProgression(this.player);
      if (this.hud.updateBuffs) {
        this.hud.updateBuffs(this.player);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-cx, -cy);

    // 1. Terrain
    this.terrain.draw(ctx, this.camera, this.canvas.width, this.canvas.height);

    // 2. Fog of War
    const alliedVision = this.fogOfWar.getAlliedVisionSources(this.heroes, this.minions, this.towers);
    this.fogOfWar.render(ctx, this.camera, alliedVision, this.canvas.width, this.canvas.height);

    // 3. Click Waves
    for (let i = this.clickWaves.length - 1; i >= 0; i--) {
      const w = this.clickWaves[i];
      w.r += 40 * 0.016;
      w.alpha -= 1.8 * 0.016;
      if (w.alpha <= 0) this.clickWaves.splice(i, 1);
      else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(w.x - this.camera.x, w.y - this.camera.y, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = Math.max(0, w.alpha);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Towers
    this.towers.forEach(t => t.draw(ctx, this.camera));

    // 5. Minions (Filtered by Vision)
    this.minions.forEach(m => {
      if (m.team === 'blue' || this.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
        m.draw(ctx, this.camera);
      }
    });

    // 6. Neutral Monsters (Filtered by Vision)
    this.monsters.forEach(m => {
      if (this.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
        m.draw(ctx, this.camera);
      }
    });

    // 6.5. Tường Gió (Wind Walls)
    if (this.windWalls) {
      for (let ww of this.windWalls) {
        const sx = ww.x - this.camera.x;
        const sy = ww.y - this.camera.y;
        const perp = ww.angle + Math.PI / 2;
        const halfLen = (ww.length || 220) / 2;
        const x1 = sx - Math.cos(perp) * halfLen;
        const y1 = sy - Math.sin(perp) * halfLen;
        const x2 = sx + Math.cos(perp) * halfLen;
        const y2 = sy + Math.sin(perp) * halfLen;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = ww.team === 'blue' ? 'rgba(46, 160, 67, 0.75)' : 'rgba(248, 81, 73, 0.75)';
        ctx.lineCap = 'round';
        ctx.shadowColor = ww.team === 'blue' ? '#3fb950' : '#f85149';
        ctx.shadowBlur = 18;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      }
    }

    // 7. Projectiles
    for (let p of this.projectiles) {
      if (p.team === 'blue' || this.fogOfWar.isVisible(p.x, p.y, p.radius, false, alliedVision)) {
        p.draw(ctx, this.camera);
      }
    }

    // 8. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * 0.016;
      pt.y += pt.vy * 0.016;
      pt.life--;
      pt.alpha = pt.life / 40;
      if (pt.life <= 0) this.particles.splice(i, 1);
      else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x - this.camera.x, pt.y - this.camera.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fill();
        ctx.restore();
      }
    }

    // 9. Heroes (Filtered by Vision & Bushes)
    this.heroes.forEach(h => {
      if (h.team === 'blue' || this.fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) {
        h.draw(ctx, this.camera, this.input.mouse);
      }
    });

    // 10. Floating Texts
    this.hud.drawFloatingTexts(ctx, this.camera);

    ctx.restore();

    // 11. HUD Cooldowns
    if (this.player) {
      this.hud.updateCooldowns(this.player);
    }

    // 12. Minimap
    this.minimap.render(
      this.towers,
      this.monsters,
      this.minions,
      this.heroes,
      this.fogOfWar,
      this.camera,
      this.camera.zoom,
      this.canvas.width,
      this.canvas.height,
      RIVER_POLYGON
    );
  }
}
