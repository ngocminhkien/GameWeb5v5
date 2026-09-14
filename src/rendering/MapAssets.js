/**
 * MapAssets.js
 * Modular Asset & Texture Generator for 2.5D Top-Down MOBA Battlefield
 * Provides pre-rendered cached patterns (Grass, Volcanic, Cobblestone, Riverbed),
 * 3D multi-tier cliffs with drop shadows & stratified strata,
 * volumetric swaying bushes, sunken river depth with animated caustics, and elevated Hextech bases.
 */

export class MapAssets {
  constructor() {
    this.patterns = {};
    this.initialized = false;
  }

  init(ctx) {
    if (this.initialized) return;
    this.patterns.grass = this.createGrassPattern(ctx);
    this.patterns.volcanic = this.createVolcanicPattern(ctx);
    this.patterns.cobblestone = this.createCobblestonePattern(ctx);
    this.patterns.riverbed = this.createRiverbedPattern(ctx);
    this.initialized = true;
  }

  // 1. Radiant Verdant Grass Pattern (128x128)
  createGrassPattern(mainCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Deep lush base
    ctx.fillStyle = '#081813';
    ctx.fillRect(0, 0, 128, 128);

    // Varied mossy soil patches
    ctx.fillStyle = '#0c221a';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.arc(96, 80, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#06130f';
    ctx.beginPath();
    ctx.arc(80, 24, 20, 0, Math.PI * 2);
    ctx.arc(24, 96, 22, 0, Math.PI * 2);
    ctx.fill();

    // Grass blades & tufts
    ctx.strokeStyle = '#143829';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 48; i++) {
      const gx = (i * 29) % 128;
      const gy = (i * 37) % 128;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 2, gy - 6);
      ctx.moveTo(gx + 3, gy);
      ctx.lineTo(gx + 6, gy - 7);
      ctx.stroke();
    }

    // Emerald highlight blades
    ctx.strokeStyle = '#1b4d38';
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const gx = (i * 47) % 128;
      const gy = (i * 53) % 128;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 1, gy - 5);
      ctx.stroke();
    }

    // Tiny golden woodland flowers
    ctx.fillStyle = '#e5c07b';
    const flowers = [[20, 45], [75, 15], [110, 85], [45, 115], [90, 50]];
    for (let [fx, fy] of flowers) {
      ctx.fillRect(fx, fy, 2, 2);
    }

    return mainCtx.createPattern(canvas, 'repeat');
  }

  // 2. Dire Obsidian Volcanic Pattern (128x128)
  createVolcanicPattern(mainCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Scorched charcoal crust
    ctx.fillStyle = '#140a0e';
    ctx.fillRect(0, 0, 128, 128);

    // Dark basalt patches
    ctx.fillStyle = '#1c0e14';
    ctx.beginPath();
    ctx.arc(40, 40, 30, 0, Math.PI * 2);
    ctx.arc(100, 90, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f070a';
    ctx.beginPath();
    ctx.arc(88, 30, 24, 0, Math.PI * 2);
    ctx.arc(28, 92, 26, 0, Math.PI * 2);
    ctx.fill();

    // Veins of cooling molten lava (Subtle glow)
    ctx.strokeStyle = 'rgba(235, 75, 45, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.lineTo(35, 42);
    ctx.lineTo(65, 38);
    ctx.lineTo(85, 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(70, 90);
    ctx.lineTo(95, 110);
    ctx.lineTo(120, 105);
    ctx.stroke();

    // Hot magma core vein
    ctx.strokeStyle = 'rgba(255, 140, 50, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 17);
    ctx.lineTo(35, 42);
    ctx.lineTo(65, 38);
    ctx.stroke();

    // Volcanic ash specks
    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
    for (let i = 0; i < 16; i++) {
      const rx = (i * 41) % 128;
      const ry = (i * 31) % 128;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    return mainCtx.createPattern(canvas, 'repeat');
  }

  // 3. Ancient Cobblestone Road Pattern (128x128)
  createCobblestonePattern(mainCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dirt mortar base
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, 128, 128);

    // Irregular paving stones
    const stones = [
      { x: 4, y: 4, w: 36, h: 26, c: '#36322d' },
      { x: 44, y: 4, w: 46, h: 26, c: '#2c2925' },
      { x: 94, y: 4, w: 30, h: 26, c: '#3b3731' },
      { x: 4, y: 34, w: 56, h: 28, c: '#2e2b27' },
      { x: 64, y: 34, w: 60, h: 28, c: '#38342f' },
      { x: 4, y: 66, w: 42, h: 28, c: '#34302b' },
      { x: 50, y: 66, w: 40, h: 28, c: '#2a2723' },
      { x: 94, y: 66, w: 30, h: 28, c: '#37332d' },
      { x: 4, y: 98, w: 58, h: 26, c: '#312d29' },
      { x: 66, y: 98, w: 58, h: 26, c: '#2b2824' }
    ];

    for (let s of stones) {
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.roundRect(s.x, s.y, s.w, s.h, 4);
      ctx.fill();

      // Top-left highlight edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x + 2, s.y + s.h - 2);
      ctx.lineTo(s.x + 2, s.y + 2);
      ctx.lineTo(s.x + s.w - 2, s.y + 2);
      ctx.stroke();

      // Bottom-right shadow edge
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(s.x + s.w - 2, s.y + 2);
      ctx.lineTo(s.x + s.w - 2, s.y + s.h - 2);
      ctx.lineTo(s.x + 2, s.y + s.h - 2);
      ctx.stroke();
    }

    return mainCtx.createPattern(canvas, 'repeat');
  }

  // 4. Sunken Riverbed Pattern (128x128)
  createRiverbedPattern(mainCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Deep water bed
    ctx.fillStyle = '#061726';
    ctx.fillRect(0, 0, 128, 128);

    // River pebbles
    const pebbles = [
      { x: 25, y: 30, r: 5, c: '#142c3d' },
      { x: 70, y: 40, r: 8, c: '#0f2433' },
      { x: 105, y: 20, r: 4, c: '#193447' },
      { x: 45, y: 85, r: 6, c: '#112738' },
      { x: 90, y: 95, r: 7, c: '#163042' },
      { x: 15, y: 110, r: 5, c: '#0d202e' }
    ];
    for (let p of pebbles) {
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    return mainCtx.createPattern(canvas, 'repeat');
  }

  // ================= 2.5D MULTI-TIER CLIFFS & WALLS =================
  draw3DCliff(ctx, w, camera, time = 0) {
    const sx = w.x - camera.x;
    const sy = w.y - camera.y;
    const cliffHeight = 26; // Độ cao thẳng đứng (Z-elevation)

    ctx.save();

    // 1. Directional Drop Shadow (Bóng đổ dốc xuống dưới tạo cảm giác vách cao)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(sx - 4, sy + cliffHeight - 2, w.w + 8, w.h + 12, 14);
    ctx.fill();

    // 2. Vertical Cliff Facade (Mặt vách đá dựng đứng)
    const facadeGrad = ctx.createLinearGradient(sx, sy, sx, sy + w.h + cliffHeight);
    facadeGrad.addColorStop(0, '#151b22');
    facadeGrad.addColorStop(0.3, '#10151b');
    facadeGrad.addColorStop(1, '#080b0f');

    ctx.fillStyle = facadeGrad;
    ctx.beginPath();
    ctx.roundRect(sx, sy, w.w, w.h + cliffHeight, 12);
    ctx.fill();

    // Horizontal rock stratification bands (Vân đá xếp tầng)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      const bandY = sy + (w.h + cliffHeight) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(sx + 8, bandY);
      ctx.lineTo(sx + w.w - 8, bandY);
      ctx.stroke();
    }

    // Vertical rock fissures / cracks (Vết nứt thớ đá)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    const numCracks = Math.max(2, Math.floor(w.w / 120));
    for (let c = 1; c <= numCracks; c++) {
      const crackX = sx + (w.w / (numCracks + 1)) * c;
      ctx.beginPath();
      ctx.moveTo(crackX, sy + 10);
      ctx.lineTo(crackX + (c % 2 === 0 ? 5 : -4), sy + w.h / 2);
      ctx.lineTo(crackX, sy + w.h + cliffHeight - 6);
      ctx.stroke();
    }

    // 3. Top Plateau Cap (Bề mặt đỉnh vách núi phẳng có gờ sáng)
    const topGrad = ctx.createLinearGradient(sx, sy, sx, sy + w.h);
    const inRedSide = w.x > 7000 && w.y < 8000;
    if (inRedSide) {
      topGrad.addColorStop(0, '#2d1b22');
      topGrad.addColorStop(1, '#1e1217');
    } else {
      topGrad.addColorStop(0, '#1e2926');
      topGrad.addColorStop(1, '#141d1a');
    }

    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.roundRect(sx, sy, w.w, w.h, 12);
    ctx.fill();

    // Bevel top highlight edge (Viền sáng phản quang trên mép vách)
    ctx.strokeStyle = inRedSide ? 'rgba(248, 81, 73, 0.35)' : 'rgba(88, 166, 255, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Overhanging moss & foliage tufts along the front rim
    ctx.fillStyle = inRedSide ? 'rgba(180, 50, 30, 0.4)' : 'rgba(35, 134, 54, 0.6)';
    for (let m = 12; m < w.w - 12; m += 30) {
      ctx.beginPath();
      ctx.arc(sx + m, sy + w.h, 4, 0, Math.PI);
      ctx.fill();
    }

    // 4. Epic Pit Theme Enhancements (Hang Baron & Hang Rồng)
    if (w.label === 'Hang Baron') {
      // Glowing void purple runic fissures & crystals
      const pulse = Math.sin(time * 2.5) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(163, 113, 247, ${0.4 * pulse})`;
      ctx.shadowColor = '#a371f7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sx + w.w / 2, sy + w.h / 2, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (w.label === 'Hang Rồng') {
      // Molten dragon embers & heat glow
      const pulse = Math.sin(time * 2.5 + 1) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(240, 136, 62, ${0.4 * pulse})`;
      ctx.shadowColor = '#f0883e';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sx + w.w / 2, sy + w.h / 2, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Label text
    if (w.label) {
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.fillStyle = '#e6edf3';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(w.label, sx + w.w / 2, sy + w.h / 2 + 4);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // ================= SUNKEN RIVER WITH DEPTH & WATER CAUSTICS =================
  drawRiverWithDepth(ctx, riverPolygon, camera, time = 0) {
    if (!riverPolygon || riverPolygon.length === 0) return;
    ctx.save();

    // 1. Riverbed Sunken Base with Sand & Pebbles
    if (this.patterns.riverbed) {
      ctx.fillStyle = this.patterns.riverbed;
      ctx.beginPath();
      ctx.moveTo(riverPolygon[0].x - camera.x, riverPolygon[0].y - camera.y);
      for (let i = 1; i < riverPolygon.length; i++) {
        ctx.lineTo(riverPolygon[i].x - camera.x, riverPolygon[i].y - camera.y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // 2. Translucent Flowing Water Body (Gradient from Turquoise Shallows to Deep Ocean Navy)
    const pts = riverPolygon;
    const startPt = pts[0];
    const midPt = pts[Math.floor(pts.length / 2)];
    const waterGrad = ctx.createLinearGradient(
      startPt.x - camera.x, startPt.y - camera.y,
      midPt.x - camera.x, midPt.y - camera.y
    );
    waterGrad.addColorStop(0, 'rgba(10, 52, 85, 0.72)');
    waterGrad.addColorStop(0.5, 'rgba(6, 32, 58, 0.85)');
    waterGrad.addColorStop(1, 'rgba(10, 52, 85, 0.72)');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(pts[0].x - camera.x, pts[0].y - camera.y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x - camera.x, pts[i].y - camera.y);
    }
    ctx.closePath();
    ctx.fill();

    // 3. Shimmering Water Caustics (Dynamic Wave Reflections)
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.18)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 2; i < pts.length - 2; i += 3) {
      const px = pts[i].x - camera.x;
      const py = pts[i].y - camera.y;
      const waveShift = Math.sin(time * 2 + i) * 16;
      ctx.beginPath();
      ctx.moveTo(px - 45 + waveShift, py);
      ctx.quadraticCurveTo(px + waveShift, py - 8, px + 45 + waveShift, py);
      ctx.stroke();
    }

    // 4. Riverbank Cliff Slopes (Soft Earth & Shoreline Froth)
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.4)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // ================= VOLUMETRIC 3D SWAYING BUSHES =================
  drawVolumetricBush(ctx, b, camera, time = 0, hasHeroInside = false) {
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;
    const r = b.r;

    ctx.save();

    // 1. Ambient Drop Shadow on Ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(sx + 3, sy + 6, r * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Wind sway oscillation
    const swayX = Math.sin(time * 2.2 + b.x * 0.01) * 3;
    const swayY = Math.cos(time * 1.8 + b.y * 0.01) * 2;

    // 2. Base Dark Leaf Layer (Dưới gốc râm mát)
    ctx.fillStyle = hasHeroInside ? 'rgba(35, 134, 54, 0.4)' : '#0d2818';
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3. Mid-tone Leaf Rosettes (5-6 cụm tán lá bồng bềnh)
    const clusterColors = hasHeroInside 
      ? ['rgba(46, 160, 67, 0.5)', 'rgba(63, 185, 80, 0.6)', 'rgba(86, 211, 100, 0.65)']
      : ['#143d24', '#1e5432', '#286e42'];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const cx = sx + Math.cos(angle) * (r * 0.48) + swayX * 0.6;
      const cy = sy + Math.sin(angle) * (r * 0.48) + swayY * 0.6;
      const cr = r * 0.52;

      ctx.fillStyle = clusterColors[i % clusterColors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Center Top Highlight Crown (Chỏm lá đỉnh đón sáng)
    ctx.fillStyle = hasHeroInside ? 'rgba(126, 231, 135, 0.7)' : '#348651';
    ctx.beginPath();
    ctx.arc(sx + swayX, sy - r * 0.15 + swayY, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // 5. Hero Camouflage Golden/Green Glow Sparkle when inside
    if (hasHeroInside) {
      ctx.strokeStyle = '#56d364';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.fillStyle = '#7ee787';
      ctx.textAlign = 'center';
      ctx.fillText('ẨN NẤP', sx, sy - r - 8);
    }

    ctx.restore();
  }

  // ================= ELEVATED HEXTECH BASE PLATFORM =================
  drawBasePlatform(ctx, baseConfig, team, camera, time = 0) {
    const sx = baseConfig.x - camera.x;
    const sy = baseConfig.y - camera.y;
    const r = baseConfig.radius;
    const isBlue = team === 'blue';

    ctx.save();

    // 1. Octagonal Elevated Foundation Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(sx + 6, sy + 12, r + 15, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer Stone Steps (Bậc thang đá)
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.arc(sx, sy, r + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Main Runic Platform (Mặt đài tế đàn)
    const platGrad = ctx.createRadialGradient(sx, sy, 20, sx, sy, r);
    if (isBlue) {
      platGrad.addColorStop(0, '#0c2d48');
      platGrad.addColorStop(0.7, '#071e33');
      platGrad.addColorStop(1, '#051321');
    } else {
      platGrad.addColorStop(0, '#4a1215');
      platGrad.addColorStop(0.7, '#310c0e');
      platGrad.addColorStop(1, '#1c0607');
    }

    ctx.fillStyle = platGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // 4. Hextech Faction Inlay Rings & Energy Conduits
    const pulse = Math.sin(time * 3) * 0.2 + 0.8;
    ctx.strokeStyle = isBlue 
      ? `rgba(56, 139, 253, ${0.7 * pulse})` 
      : `rgba(248, 81, 73, ${0.7 * pulse})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Radial Energy Channels
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + time * 0.2;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (r * 0.2), sy + Math.sin(a) * (r * 0.2));
      ctx.lineTo(sx + Math.cos(a) * (r * 0.75), sy + Math.sin(a) * (r * 0.75));
      ctx.stroke();
    }

    // 5. Center Nexus Power Core (Pha lê nguồn năng lượng Tế Đàn)
    ctx.fillStyle = isBlue ? '#388bfd' : '#f85149';
    ctx.shadowColor = isBlue ? '#58a6ff' : '#ff7b72';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(sx, sy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export const mapAssetsInstance = new MapAssets();
