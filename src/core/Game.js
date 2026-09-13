import { CONSTANTS } from '../config/constants.js';
import { ROCK_WALLS, BUSHES } from '../config/terrain.js';
import { TOWERS_CONFIG } from '../config/towers.js';
import { MONSTERS_CONFIG } from '../config/monsters.js';

import { Hero } from '../entities/Hero.js';
import { Tower } from '../entities/Tower.js';
import { Monster } from '../entities/Monster.js';
import { Minion } from '../entities/Minion.js';
import { BotAI } from '../ai/BotAI.js';

import { Camera } from './Camera.js';
import { Input } from './Input.js';
import { Renderer } from '../rendering/Renderer.js';
import { Minimap } from '../rendering/Minimap.js';
import { FogOfWar } from '../rendering/FogOfWar.js';
import { HUD } from '../ui/HUD.js';

/**
 * Main Game Controller
 */
export class Game {
  constructor(canvas, minimapCanvas, minimapWrapper) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Subsystems
    this.camera = new Camera();
    this.input = new Input(canvas, this.camera);
    this.renderer = new Renderer(canvas, this.ctx);
    this.minimap = new Minimap(minimapWrapper, minimapCanvas, minimapCanvas.getContext('2d'));
    this.fogOfWar = new FogOfWar(CONSTANTS.MAP_WIDTH, CONSTANTS.MAP_HEIGHT);
    this.hud = new HUD();

    // Edge pan DOM elements
    this.edgeIndicators = {
      top: document.getElementById('edge-top'),
      bottom: document.getElementById('edge-bottom'),
      left: document.getElementById('edge-left'),
      right: document.getElementById('edge-right')
    };

    // State
    this.mode = 'pve'; // 'pve' or 'solo'
    this.blueScore = 0;
    this.redScore = 0;

    this.heroes = [];
    this.player = null;
    this.botAIs = [];
    this.towers = [];
    this.monsters = [];
    this.minions = [];
    this.projectiles = [];
    this.particles = [];
    this.clickWaves = [];
    this.floatingTexts = [];

    // Match clock & Minion wave timers
    this.matchTime = 0;
    this.waveTimer = 60.0; // Đợt đầu tiên sau 1 phút
    this.waveInterval = 30.0; // Sau đó mỗi 30s một đợt
    this.waveCount = 0;

    this.lastTime = performance.now();

    this.bindEvents();
    this.initMatch();
  }

  bindEvents() {
    // Input actions
    this.input.listeners.onSkill = (slot) => this.usePlayerSkill(slot);
    this.input.listeners.onUpgradeSkill = (slot) => this.upgradePlayerSkill(slot);
    this.hud.bindUpgradeButtons((slot) => this.upgradePlayerSkill(slot));

    this.input.listeners.onToggleCamera = () => {
      const locked = this.camera.toggleLock();
      this.hud.updateCameraBtn(locked);
      this.hud.announce(locked ? '📷 [Y] Đã KHÓA Camera (Bám theo tướng)' : '📷 [Y] Đã MỞ KHÓA Camera (Rê chuột mép để lướt map)');
    };
    this.input.listeners.onRightClickMove = (worldX, worldY) => {
      if (!this.player || !this.player.alive) return;

      const alliedVision = this.getAlliedVisionSources();
      let clickedEnemy = null;

      // 1. Check enemy heroes (must be visible in Fog of War)
      for (let h of this.heroes) {
        if (h.team !== this.player.team && h.alive) {
          if (this.fogOfWar.isVisible(h.x, h.y, h.radius, h.inBush, alliedVision)) {
            if (Math.hypot(h.x - worldX, h.y - worldY) <= h.radius + 20) {
              clickedEnemy = h;
              break;
            }
          }
        }
      }

      // 2. Check enemy minions
      if (!clickedEnemy) {
        for (let mn of this.minions) {
          if (mn.team !== this.player.team && mn.alive) {
            if (this.fogOfWar.isVisible(mn.x, mn.y, mn.radius, false, alliedVision)) {
              if (Math.hypot(mn.x - worldX, mn.y - worldY) <= mn.radius + 16) {
                clickedEnemy = mn;
                break;
              }
            }
          }
        }
      }

      // 3. Check enemy towers
      if (!clickedEnemy) {
        for (let tw of this.towers) {
          if (tw.team !== this.player.team && tw.alive) {
            if (Math.hypot(tw.x - worldX, tw.y - worldY) <= tw.radius + 16) {
              clickedEnemy = tw;
              break;
            }
          }
        }
      }

      // 4. Check neutral monsters
      if (!clickedEnemy) {
        for (let m of this.monsters) {
          if (m.alive && this.fogOfWar.isVisible(m.x, m.y, m.radius, false, alliedVision)) {
            if (Math.hypot(m.x - worldX, m.y - worldY) <= m.radius + 20) {
              clickedEnemy = m;
              break;
            }
          }
        }
      }

      if (clickedEnemy) {
        this.player.attackTarget = clickedEnemy;
        this.createClickWave(clickedEnemy.x, clickedEnemy.y, '#f85149');
      } else {
        this.player.attackTarget = null;
        this.player.targetX = worldX;
        this.player.targetY = worldY;
        this.createClickWave(worldX, worldY, '#388bfd');
      }
    };

    // Minimap actions
    this.minimap.onJumpCamera = (worldX, worldY) => {
      this.camera.targetX = worldX - this.canvas.width / 2;
      this.camera.targetY = worldY - this.canvas.height / 2;
      if (this.camera.locked) {
        this.camera.toggleLock();
        this.hud.updateCameraBtn(false);
      }
    };
    this.minimap.onMoveHero = (worldX, worldY) => {
      if (this.player && this.player.alive) {
        this.player.attackTarget = null;
        this.player.targetX = worldX;
        this.player.targetY = worldY;
        this.createClickWave(worldX, worldY, '#388bfd');
      }
    };
  }

  upgradePlayerSkill(slot) {
    if (!this.player || !this.player.alive) return;
    const success = this.player.upgradeSkill(slot, this.addFloatingText.bind(this));
    if (success) {
      this.hud.updateProgression(this.player);
      this.hud.updateCooldowns(this.player);
    }
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

    // 1. Direct killer reward
    if (killerHero && killerHero.addExp && killerHero.alive) {
      killerHero.addExp(baseExp, (hero) => {
        this.hud.announce(`🌟 ${hero.name} ĐẠT CẤP ĐỘ ${hero.level}!`);
      }, this.addFloatingText.bind(this));
      killerHero.addGold(baseGold, this.addFloatingText.bind(this));
    }

    // 2. Nearby assist share
    for (let h of this.heroes) {
      if (h.alive && h.team === team && h !== killerHero) {
        const d = Math.hypot(h.x - target.x, h.y - target.y);
        if (d <= CONSTANTS.ECONOMY.ASSIST_RADIUS) {
          const expShare = killerHero && killerHero.addExp ? Math.round(baseExp * 0.5) : baseExp;
          const goldShare = killerHero && killerHero.addGold ? Math.round(baseGold * 0.5) : baseGold;
          h.addExp(expShare, (hero) => {
            this.hud.announce(`🌟 ${hero.name} ĐẠT CẤP ĐỘ ${hero.level}!`);
          }, this.addFloatingText.bind(this));
          h.addGold(goldShare, this.addFloatingText.bind(this));
        }
      }
    }

    // 3. Teamwide reward (Dragon, Baron, Towers)
    if (teamExp > 0 || teamGold > 0) {
      for (let h of this.heroes) {
        if (h.alive && h.team === team) {
          if (teamExp > 0) {
            h.addExp(teamExp, (hero) => {
              this.hud.announce(`🌟 ${hero.name} ĐẠT CẤP ĐỘ ${hero.level}!`);
            }, this.addFloatingText.bind(this));
          }
          if (teamGold > 0) {
            h.addGold(teamGold, this.addFloatingText.bind(this));
          }
        }
      }
    }
  }

  getAlliedVisionSources() {
    const sources = [];

    // Tế đàn Xanh (Blue Base)
    sources.push({
      x: CONSTANTS.BLUE_BASE.x,
      y: CONSTANTS.BLUE_BASE.y,
      visionRadius: 1200,
      alive: true
    });

    // Người chơi (Player)
    if (this.player && this.player.alive) {
      sources.push(this.player);
    }

    // Tướng đồng minh (Allied Heroes)
    for (let h of this.heroes) {
      if (h.team === 'blue' && h.alive && h !== this.player) {
        sources.push(h);
      }
    }

    // Trụ đồng minh (Allied Towers)
    for (let tw of this.towers) {
      if (tw.team === 'blue' && tw.alive) {
        sources.push(tw);
      }
    }

    // Lính đồng minh (Allied Minions)
    for (let mn of this.minions) {
      if (mn.team === 'blue' && mn.alive) {
        sources.push(mn);
      }
    }

    return sources;
  }

  createClickWave(x, y, color = '#388bfd') {
    this.clickWaves.push({ x, y, r: 6, maxR: 35, color, alpha: 1.0 });
  }

  addFloatingText(text, x, y, color = '#fff') {
    this.floatingTexts.push({ text, x, y, vy: -1.3, color, alpha: 1.0, life: 50 });
  }

  initMatch() {
    this.heroes = [];
    this.botAIs = [];
    this.towers = [];
    this.monsters = [];
    this.minions = [];
    this.projectiles = [];
    this.particles = [];
    this.clickWaves = [];
    this.floatingTexts = [];
    this.blueScore = 0;
    this.redScore = 0;
    this.matchTime = 0;
    this.waveTimer = 60.0;
    this.waveInterval = 30.0;
    this.waveCount = 0;
    this.hud.updateScores(0, 0);
    this.hud.updateClock(0);

    // Towers
    this.towers = TOWERS_CONFIG.map(cfg => new Tower(cfg));

    // Monsters
    this.monsters = MONSTERS_CONFIG.map(cfg => new Monster(cfg));

    // Heroes
    if (this.mode === 'solo') {
      this.player = new Hero({
        id: 'player',
        name: 'Bạn (Player)',
        team: 'blue',
        isPlayer: true,
        x: 7000,
        y: 8000,
        avatarColor: '#1f6feb',
        symbol: '⚡'
      });
      this.heroes.push(this.player);

      const botEnemy = new Hero({
        id: 'bot_enemy',
        name: 'Bot Cao Thủ (AI)',
        team: 'red',
        isPlayer: false,
        x: 8000,
        y: 7000,
        avatarColor: '#da3633',
        symbol: '🔥',
        lane: 'MID'
      });
      this.heroes.push(botEnemy);
      this.botAIs.push(new BotAI(botEnemy));

      this.hud.announce('Chế độ 1v1 Thử nghiệm AI đã bắt đầu!');
    } else {
      // 5v5 PvE
      this.player = new Hero({
        id: 'player',
        name: 'Bạn (Mid)',
        team: 'blue',
        isPlayer: true,
        x: 1800,
        y: 13200,
        avatarColor: '#1f6feb',
        symbol: '⚡',
        lane: 'MID'
      });
      this.heroes.push(this.player);

      // 4 Blue Allies
      const blueAllies = [
        { name: 'Đồng Minh (Top)', lane: 'TOP', symbol: '🛡️', color: '#238636', x: 1400, y: 12800 },
        { name: 'Đồng Minh (Rừng)', lane: 'MID', symbol: '🗡️', color: '#8957e5', x: 2200, y: 12800 },
        { name: 'Đồng Minh (ADC)', lane: 'BOT', symbol: '🏹', color: '#1f6feb', x: 2400, y: 13600 },
        { name: 'Đồng Minh (SP)', lane: 'BOT', symbol: '✨', color: '#bf8700', x: 1600, y: 14000 },
      ];
      blueAllies.forEach((a, i) => {
        const h = new Hero({
          id: `blue_bot_${i}`,
          name: a.name,
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

      // 5 Red Bots
      const redBots = [
        { name: 'Bot Đỏ (Top)', lane: 'TOP', symbol: '👹', color: '#da3633', x: 13600, y: 2200 },
        { name: 'Bot Đỏ (Mid)', lane: 'MID', symbol: '🔮', color: '#da3633', x: 13200, y: 1800 },
        { name: 'Bot Đỏ (Rừng)', lane: 'MID', symbol: '🐺', color: '#9e1c23', x: 12800, y: 2200 },
        { name: 'Bot Đỏ (ADC)', lane: 'BOT', symbol: '🎯', color: '#da3633', x: 12600, y: 1400 },
        { name: 'Bot Đỏ (SP)', lane: 'BOT', symbol: '💀', color: '#6e1116', x: 13400, y: 1000 },
      ];
      redBots.forEach((b, i) => {
        const h = new Hero({
          id: `red_bot_${i}`,
          name: b.name,
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

      this.hud.announce('Chế độ 5v5 PvE (Kiến trúc Modular mới) đã bắt đầu!');
    }

    this.passiveGoldTimer = 0;

    // Initial camera position
    if (this.player) {
      this.camera.centerOn(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
      this.camera.x = this.camera.targetX;
      this.camera.y = this.camera.targetY;
      this.hud.updateProgression(this.player);
      this.hud.updateCooldowns(this.player);
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.initMatch();
  }

  usePlayerSkill(slot) {
    if (!this.player || !this.player.alive) return;
    const mouse = this.input.mouse;

    if (slot === 'Q') {
      this.player.castSkillshot(mouse.worldX, mouse.worldY, this.projectiles, this.addFloatingText.bind(this));
    } else if (slot === 'W') {
      this.player.castShield(this.addFloatingText.bind(this));
    } else if (slot === 'E') {
      this.player.castDash(mouse.worldX, mouse.worldY, ROCK_WALLS, this.addFloatingText.bind(this));
    } else if (slot === 'R') {
      this.player.castUltimate(this.heroes, this.towers, this.monsters, this.createClickWave.bind(this), this.addFloatingText.bind(this), (deadTarget, killer) => {
        if (deadTarget.isPlayer !== undefined) {
          const b = CONSTANTS.BOUNTIES.HERO_KILL;
          this.distributeRewards(deadTarget, killer, b.exp, b.gold);
          if (killer.team === 'blue') this.blueScore++; else this.redScore++;
          this.hud.updateScores(this.blueScore, this.redScore);
        } else if (deadTarget.buffType !== undefined) {
          let b = CONSTANTS.BOUNTIES.MONSTER_SMALL;
          if (deadTarget.buffType === 'dragon') b = CONSTANTS.BOUNTIES.MONSTER_DRAGON;
          else if (deadTarget.buffType === 'baron') b = CONSTANTS.BOUNTIES.MONSTER_BARON;
          else if (deadTarget.buffType) b = CONSTANTS.BOUNTIES.MONSTER_BUFF;
          this.distributeRewards(deadTarget, killer, b.exp, b.gold, b.teamExp || 0, b.teamGold || 0);
        } else if (deadTarget.isInhibitor !== undefined) {
          const b = CONSTANTS.BOUNTIES.TOWER_DESTROY;
          this.distributeRewards(deadTarget, killer, 0, b.gold, b.teamExp || 0, b.teamGold || 0);
        }
      });
    } else if (slot === 'B') {
      this.player.recall(this.addFloatingText.bind(this));
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

  spawnMinionWave() {
    if (this.waveCount === 1) {
      this.hud.announce('⚔️ ĐỢT LÍNH ĐẦU TIÊN ĐÃ XUẤT TRẬN!');
    }

    const waypoints = {
      blue: {
        TOP: [{ x: 1200, y: 13000 }, { x: 1200, y: 1200 }, { x: 13800, y: 1200 }],
        MID: [{ x: 1600, y: 13400 }, { x: 7500, y: 7500 }, { x: 13800, y: 1200 }],
        BOT: [{ x: 2000, y: 13800 }, { x: 13800, y: 13800 }, { x: 13800, y: 1200 }]
      },
      red: {
        TOP: [{ x: 13000, y: 1200 }, { x: 1200, y: 1200 }, { x: 1200, y: 13800 }],
        MID: [{ x: 13400, y: 1600 }, { x: 7500, y: 7500 }, { x: 1200, y: 13800 }],
        BOT: [{ x: 13800, y: 2000 }, { x: 13800, y: 13800 }, { x: 1200, y: 13800 }]
      }
    };

    const redAllInhibsDown = this.areAllInhibitorsDown('red');
    const blueAllInhibsDown = this.areAllInhibitorsDown('blue');

    ['TOP', 'MID', 'BOT'].forEach(lane => {
      // 1. Đội Xanh sinh lính
      const redT3Dead = !this.isTowerAlive('r_' + lane.toLowerCase() + '_3');
      let blueSuper = redT3Dead ? 1 : 0;
      if (redAllInhibsDown) blueSuper++; // Thêm 1 lính siêu cấp nếu cả 3 trụ 3 đều bị phá

      const blueTypes = ['MELEE', 'MELEE', 'CANNON', 'RANGED', 'RANGED'];
      for (let s = 0; s < blueSuper; s++) blueTypes.unshift('SUPER');

      const blueOrigin = waypoints.blue[lane][0];
      blueTypes.forEach((type, idx) => {
        this.minions.push(new Minion({
          id: `minion_b_${lane}_${this.waveCount}_${idx}`,
          team: 'blue',
          lane: lane,
          type: type,
          x: blueOrigin.x - idx * 28,
          y: blueOrigin.y + idx * 28,
          waypoints: waypoints.blue[lane]
        }));
      });

      // 2. Đội Đỏ sinh lính
      const blueT3Dead = !this.isTowerAlive('b_' + lane.toLowerCase() + '_3');
      let redSuper = blueT3Dead ? 1 : 0;
      if (blueAllInhibsDown) redSuper++; // Thêm 1 lính siêu cấp nếu cả 3 trụ 3 đều bị phá

      const redTypes = ['MELEE', 'MELEE', 'CANNON', 'RANGED', 'RANGED'];
      for (let s = 0; s < redSuper; s++) redTypes.unshift('SUPER');

      const redOrigin = waypoints.red[lane][0];
      redTypes.forEach((type, idx) => {
        this.minions.push(new Minion({
          id: `minion_r_${lane}_${this.waveCount}_${idx}`,
          team: 'red',
          lane: lane,
          type: type,
          x: redOrigin.x + idx * 28,
          y: redOrigin.y - idx * 28,
          waypoints: waypoints.red[lane]
        }));
      });
    });
  }

  update(dt) {
    // Đồng hồ trận đấu & Đợt lính (60s đầu, 30s lặp lại)
    this.matchTime += dt;
    this.hud.updateClock(this.matchTime);

    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.waveCount++;
      this.spawnMinionWave();
      this.waveTimer = this.waveInterval;
    }

    // Passive gold income (+3 vàng/giây cho tất cả tướng còn sống)
    this.passiveGoldTimer = (this.passiveGoldTimer || 0) + dt;
    if (this.passiveGoldTimer >= 1.0) {
      this.passiveGoldTimer -= 1.0;
      const passiveGold = CONSTANTS.ECONOMY.PASSIVE_GOLD_PER_SEC || 3;
      for (let h of this.heroes) {
        if (h.alive) {
          h.gold += passiveGold;
        }
      }
    }

    // Continuous right click move
    if (this.input.mouse.rightDown && this.player && this.player.alive && !this.player.attackTarget) {
      this.input.updateWorldCoords();
      this.player.targetX = this.input.mouse.worldX;
      this.player.targetY = this.input.mouse.worldY;
    }

    // Update Heroes
    for (let h of this.heroes) {
      h.update(dt, ROCK_WALLS, BUSHES, this.projectiles);
    }

    // Update Bot AIs
    for (let ai of this.botAIs) {
      ai.update(dt, this);
    }

    // Update Towers (Ưu tiên lính, đếm ngược 5p hồi sinh Trụ 3)
    for (let tw of this.towers) {
      tw.update(dt, this.minions, this.heroes, this.projectiles, (revived) => {
        this.hud.announce(`✨ ${revived.name} ĐÃ HỒI SINH với 50% máu!`);
      });
    }

    // Update Minions (3 đường)
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (!m.alive) {
        this.minions.splice(i, 1);
        continue;
      }
      m.update(dt, this.minions, this.towers, this.heroes, this.projectiles, this.createClickWave.bind(this), (deadTarget, killerMinion) => {
        if (deadTarget.type) {
          const bKey = 'MINION_' + (deadTarget.type || 'MELEE');
          const b = CONSTANTS.BOUNTIES[bKey] || CONSTANTS.BOUNTIES.MINION_MELEE;
          this.distributeRewards(deadTarget, killerMinion, b.exp, b.gold);
        } else if (deadTarget.isPlayer !== undefined) {
          const b = CONSTANTS.BOUNTIES.HERO_KILL;
          this.distributeRewards(deadTarget, killerMinion, b.exp, b.gold);
        }
      });
    }

    // Update Monsters
    for (let m of this.monsters) {
      m.update(dt, this.createClickWave.bind(this));
    }

    // Update Projectiles & Check Collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);

      let hit = false;

      // Hit Heroes
      for (let h of this.heroes) {
        if (p.checkCollision(h)) {
          const wasAlive = h.alive;
          h.takeDamage(p.damage, p.owner, this.addFloatingText.bind(this));
          if (wasAlive && !h.alive) {
            const b = CONSTANTS.BOUNTIES.HERO_KILL;
            this.distributeRewards(h, p.owner, b.exp, b.gold);
            if (p.owner && p.owner.team === 'blue') this.blueScore++;
            else if (p.owner && p.owner.team === 'red') this.redScore++;
            this.hud.updateScores(this.blueScore, this.redScore);
          }
          hit = true;
          break;
        }
      }

      // Hit Minions
      if (!hit) {
        for (let m of this.minions) {
          if (m.alive && m.team !== p.team && Math.hypot(m.x - p.x, m.y - p.y) <= m.radius + p.radius) {
            const wasAlive = m.alive;
            m.takeDamage(p.damage, p.owner, this.addFloatingText.bind(this));
            if (wasAlive && !m.alive) {
              const bKey = 'MINION_' + (m.type || 'MELEE');
              const b = CONSTANTS.BOUNTIES[bKey] || CONSTANTS.BOUNTIES.MINION_MELEE;
              this.distributeRewards(m, p.owner, b.exp, b.gold);
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
            m.takeDamage(p.damage, p.owner);
            if (wasAlive && !m.alive) {
              let b = CONSTANTS.BOUNTIES.MONSTER_SMALL;
              if (m.buffType === 'dragon') b = CONSTANTS.BOUNTIES.MONSTER_DRAGON;
              else if (m.buffType === 'baron') b = CONSTANTS.BOUNTIES.MONSTER_BARON;
              else if (m.buffType) b = CONSTANTS.BOUNTIES.MONSTER_BUFF;

              this.distributeRewards(m, p.owner, b.exp, b.gold, b.teamExp || 0, b.teamGold || 0);
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
            tw.takeDamage(p.damage, (downTower) => {
              if (downTower.isInhibitor) {
                this.hud.announce(`⚠️ ${downTower.name} ĐÃ BỊ PHÁ HỦY! Lính Siêu Cấp sẽ xuất hiện trong 5 phút!`);
              } else {
                this.hud.announce(`🏰 ${downTower.name} ĐÃ BỊ PHÁ HỦY!`);
              }
            }, this.addFloatingText.bind(this));
            if (wasAlive && !tw.alive) {
              const b = CONSTANTS.BOUNTIES.TOWER_DESTROY;
              this.distributeRewards(tw, p.owner, 0, b.gold, b.teamExp || 0, b.teamGold || 0);
            }
            hit = true;
            break;
          }
        }
      }

      // Hit Walls (Only non-homing skillshots)
      if (!hit && !p.isHoming && !p.isTowerShot) {
        for (let w of ROCK_WALLS) {
          if (p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h) {
            hit = true;
            break;
          }
        }
      }

      if (hit || !p.active) {
        // Impact particle effect
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

    // Update Click waves
    for (let i = this.clickWaves.length - 1; i >= 0; i--) {
      const w = this.clickWaves[i];
      w.r += 40 * dt;
      w.alpha -= 1.8 * dt;
      if (w.alpha <= 0) this.clickWaves.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life--;
      pt.alpha = pt.life / 40;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Update Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      ft.alpha = ft.life / 50;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Update Camera
    this.camera.update(dt, this.player, this.input.mouse, this.input.keys, this.canvas.width, this.canvas.height, this.edgeIndicators);

    // Update HUD
    this.hud.updateCooldowns(this.player);
    this.hud.updateProgression(this.player);
  }

  start() {
    const loop = (now) => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.update(dt);
      this.renderer.render(this);
      this.minimap.render(this);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
