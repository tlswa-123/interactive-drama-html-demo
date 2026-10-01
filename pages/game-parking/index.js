/* ============================================================
 *  停车场颜色匹配消除游戏 — 微信小程序 Canvas 2D 版
 *  核心保证：
 *    1. 点击只移动被点击的那辆车，不影响其他
 *    2. 逆向生成法保证关卡 100% 有解
 *    3. 2.5D 等距立体视觉
 * ============================================================ */
const app = getApp();
if (!app.globalData) app.globalData = { workers: 0, completedLevels: [], items: { refresh: 3, remove: 1, reorder: 3, flip: 3 } };
if (!app.save) app.save = function() { try { wx.setStorageSync('pk_workers', app.globalData.workers); wx.setStorageSync('pk_levels', JSON.stringify(app.globalData.completedLevels)); } catch(e){} };

const COLORS = {
  red:    { f: '#E53935', d: '#B71C1C', l: '#EF5350' },
  blue:   { f: '#1E88E5', d: '#0D47A1', l: '#42A5F5' },
  yellow: { f: '#FDD835', d: '#F9A825', l: '#FFEE58' },
  green:  { f: '#43A047', d: '#1B5E20', l: '#66BB6A' },
  pink:   { f: '#EC407A', d: '#AD1457', l: '#F06292' },
  purple: { f: '#7E57C2', d: '#4527A0', l: '#9575CD' }
};
const CK = ['red', 'blue', 'yellow', 'green', 'pink', 'purple'];
const DIR = {
  up:    { dx: 0, dy: -1, a: 0 },
  down:  { dx: 0, dy: 1,  a: Math.PI },
  left:  { dx: -1, dy: 0, a: -Math.PI / 2 },
  right: { dx: 1,  dy: 0, a: Math.PI / 2 }
};
const DK = ['up', 'down', 'left', 'right'];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* 关卡配置 */
function getLvlCfg(lv) {
  if (lv <= 1) return { cols: 4, rows: 5, cc: 2, cn: 6, pp: 2, sl: 4 };
  if (lv <= 2) return { cols: 4, rows: 5, cc: 2, cn: 8, pp: 2, sl: 4 };
  if (lv <= 4) return { cols: 5, rows: 6, cc: 3, cn: 12, pp: 2, sl: 4 };
  if (lv <= 6) return { cols: 5, rows: 7, cc: 3, cn: 15, pp: 3, sl: 4 };
  if (lv <= 8) return { cols: 6, rows: 7, cc: 4, cn: 20, pp: 3, sl: 4 };
  if (lv <= 10) return { cols: 6, rows: 8, cc: 4, cn: 25, pp: 3, sl: 4 };
  return { cols: 7, rows: 8, cc: Math.min(5, 4 + ((lv - 10) / 5 | 0)), cn: Math.min(30, 25 + lv - 10), pp: 3, sl: 4 };
}

/* ═══════════════════════════════════
 *  ★ 逆向生成法 — 100% 保证有解 ★
 * ═══════════════════════════════════ */
function canExit(g, cols, rows, col, row, dk) {
  const d = DIR[dk];
  let c = col + d.dx, r = row + d.dy;
  while (c >= 0 && c < cols && r >= 0 && r < rows) {
    if (g[r][c] !== -1) return false;
    c += d.dx; r += d.dy;
  }
  return true;
}

function placeReverse(g, cols, rows, id, color) {
  for (let a = 0; a < 300; a++) {
    const col = (Math.random() * cols) | 0;
    const row = (Math.random() * rows) | 0;
    if (g[row][col] !== -1) continue;
    const ds = shuffle([...DK]);
    for (const dk of ds) {
      if (canExit(g, cols, rows, col, row, dk)) {
        g[row][col] = id;
        return { id, color, dir: dk, col, row, active: true };
      }
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (g[r][c] !== -1) continue;
      for (const dk of DK) {
        if (canExit(g, cols, rows, c, r, dk)) {
          g[r][c] = id;
          return { id, color, dir: dk, col: c, row: r, active: true };
        }
      }
    }
  return null;
}

function genLevel(cfg) {
  const { cols, rows, cc, cn, pp } = cfg;
  const uc = CK.slice(0, cc);
  const ca = [];
  for (let i = 0; i < cn; i++) ca.push(uc[i % cc]);
  shuffle(ca);

  const g = [];
  for (let r = 0; r < rows; r++) g.push(new Array(cols).fill(-1));

  const carsArr = [];
  const solOrder = [];

  for (let i = cn - 1; i >= 0; i--) {
    const placed = placeReverse(g, cols, rows, i, ca[i]);
    if (placed) {
      carsArr.push(placed);
      solOrder.unshift(placed.id);
    }
  }

  const pass = [];
  for (const id of solOrder) {
    const car = carsArr.find(c => c.id === id);
    if (car) for (let p = 0; p < pp; p++) pass.push(car.color);
  }

  return { cars: carsArr.filter(Boolean), passengers: pass, sol: solOrder };
}

/* ═══════════════════════════════
 *  Page
 * ═══════════════════════════════ */
Page({
  data: {
    uiHidden: false,
    liked: false
  },

  onToggleUI() { this.setData({ uiHidden: !this.data.uiHidden }); },
  onLikeTap() { this.setData({ liked: !this.data.liked }); },

  onLoad(options) {
    this.level = parseInt(options.level) || 1;
    this.items = { refresh: 3, remove: 1, reorder: 3, flip: 3 };

    const sys = wx.getWindowInfo();
    this.W = sys.windowWidth;
    this.H = sys.windowHeight;
    this.dpr = sys.pixelRatio;

    // 状态
    this.cars = [];
    this.waitSlots = [];
    this.passengers = [];
    this.passPerCar = 2;
    this.totalPass = 0;
    this.boarded = 0;
    this.gameState = 'playing';
    this.animating = false;
    this.shakeCar = -1;
    this.shakeT = 0;
    this.movingCar = null;
    this.cfg = null;

    this.initCanvas();
  },

  initCanvas() {
    const query = this.createSelectorQuery();
    query.select('#gameCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        setTimeout(() => this.initCanvas(), 50);
        return;
      }
      const canvas = res[0].node;
      canvas.width = this.W * this.dpr;
      canvas.height = this.H * this.dpr;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ctx.scale(this.dpr, this.dpr);
      this.startLevel(this.level);
    });
  },

  startLevel(lv) {
    this.level = lv;
    this.cfg = getLvlCfg(lv);
    const data = genLevel(this.cfg);
    this.cars = data.cars;
    this.passengers = data.passengers;
    this.passPerCar = this.cfg.pp;
    this.waitSlots = new Array(this.cfg.sl).fill(null);
    this.totalPass = this.passengers.length;
    this.boarded = 0;
    this.gameState = 'playing';
    this.animating = false;
    this.shakeCar = -1;
    this.movingCar = null;

    // 布局计算
    const W = this.W, H = this.H;
    const padX = W * 0.04;
    let lotW = W - padX * 2;
    let cellW = lotW / this.cfg.cols;
    let lotY = H * 0.26;
    const lotBottom = H * 0.84;
    let lotH = lotBottom - lotY;
    let cellH = lotH / this.cfg.rows;
    const cs = Math.min(cellW, cellH);
    cellW = cs; cellH = cs;
    lotW = cellW * this.cfg.cols;
    lotH = cellH * this.cfg.rows;
    let lotX = (W - lotW) / 2;
    if (lotY + lotH > H * 0.84) {
      const scale = (H * 0.84 - lotY) / lotH;
      cellW *= scale; cellH *= scale;
      lotW = cellW * this.cfg.cols;
      lotH = cellH * this.cfg.rows;
      lotX = (W - lotW) / 2;
    }
    this.cellW = cellW; this.cellH = cellH;
    this.lotX = lotX; this.lotY = lotY;
    this.lotW = lotW; this.lotH = lotH;
    this.slotH = H * 0.07;
    this.slotStartX = W * 0.06;
    this.slotW = (W * 0.88) / this.cfg.sl;
    this.slotY = H * 0.08;

    this.render();
  },

  buildGrid() {
    const g = [];
    for (let r = 0; r < this.cfg.rows; r++) g.push(new Array(this.cfg.cols).fill(-1));
    this.cars.forEach((c, i) => { if (c && c.active) g[c.row][c.col] = i; });
    return g;
  },

  /* ═══════════════════════════════
   *  触摸 — 只影响被点击的车！
   * ═══════════════════════════════ */
  onTouchStart(e) {
    const t = e.touches[0];
    this._tapX = t.x; this._tapY = t.y;
  },
  onTouchMove() {},
  onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.x - this._tapX), dy = Math.abs(t.y - this._tapY);
    if (dx > 10 || dy > 10) return; // 滑动忽略
    this.handleTap(this._tapX, this._tapY);
  },

  handleTap(px, py) {
    const W = this.W, H = this.H;

    // 结果弹窗
    if (this.gameState === 'won' || this.gameState === 'lost') {
      const pw = W * 0.72, ph = H * 0.26;
      const panelX = (W - pw) / 2, panelY = (H - ph) / 2;
      const bw = pw * 0.45, bh = 36;
      const bx = W / 2 - bw / 2, by = panelY + ph * 0.77;
      if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
        if (this.gameState === 'won') this.startLevel(this.level + 1);
        else this.startLevel(this.level);
      }
      return;
    }

    if (this.animating) return;

    // 返回按钮
    if (px <= 50 && py >= H * 0.05 && py <= H * 0.05 + 28) {
      wx.navigateBack();
      return;
    }

    // 道具栏
    const tbY = H * 0.885, tbH = H * 0.075;
    if (py >= tbY - 8 && py <= tbY + tbH + 8) {
      const gap = 10, bw = (W - gap * 5) / 4;
      const idx = Math.floor((px - gap) / (bw + gap));
      if (idx >= 0 && idx < 4) this.handleItem(idx);
      return;
    }

    // 停车场点击 — 找被点击的车
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (!car || !car.active) continue;
      const cx = this.lotX + car.col * this.cellW;
      const cy = this.lotY + car.row * this.cellH;
      if (px >= cx && px <= cx + this.cellW && py >= cy && py <= cy + this.cellH) {
        this.tryMove(i);
        return;
      }
    }
  },

  /**
   * ★ 核心：只检查并移动这一辆车 ★
   */
  tryMove(idx) {
    const car = this.cars[idx];
    if (!car || !car.active) return;
    const d = DIR[car.dir];
    const g = this.buildGrid();

    // 检查此车箭头方向沿途是否畅通
    let c = car.col + d.dx, r = car.row + d.dy;
    while (c >= 0 && c < this.cfg.cols && r >= 0 && r < this.cfg.rows) {
      if (g[r][c] !== -1) { this.doShake(idx); return; }
      c += d.dx; r += d.dy;
    }

    // 检查等候车位有无空位
    const si = this.waitSlots.indexOf(null);
    if (si === -1) { this.doShake(idx); return; }

    // 驶出
    this.animating = true;
    car.active = false;
    this.waitSlots[si] = { color: car.color, boarded: 0, id: car.id };

    const fx = this.lotX + car.col * this.cellW + this.cellW / 2;
    const fy = this.lotY + car.row * this.cellH + this.cellH / 2;
    const tx = this.slotStartX + si * this.slotW + this.slotW / 2;
    const ty = this.slotY + this.slotH / 2;
    this.movingCar = { car, fx, fy, tx, ty, p: 0 };
    this.animLoop();
  },

  doShake(idx) {
    this.shakeCar = idx; this.shakeT = 0;
    const tick = () => {
      this.shakeT++;
      if (this.shakeT > 8) { this.shakeCar = -1; this.render(); return; }
      this.render();
      this.canvas.requestAnimationFrame(tick);
    };
    this.canvas.requestAnimationFrame(tick);
  },

  animLoop() {
    if (this.movingCar) {
      this.movingCar.p += 0.06;
      if (this.movingCar.p >= 1) {
        this.movingCar = null;
        this.doMatch();
        return;
      }
      this.render();
      this.canvas.requestAnimationFrame(() => this.animLoop());
      return;
    }
    this.animating = false;
    this.render();
    this.checkEnd();
  },

  doMatch() {
    let changed = false;
    while (this.passengers.length > 0) {
      const nc = this.passengers[0];
      let found = -1;
      for (let s = 0; s < this.waitSlots.length; s++) {
        if (this.waitSlots[s] && this.waitSlots[s].color === nc) { found = s; break; }
      }
      if (found === -1) break;
      this.passengers.shift();
      this.boarded++;
      this.waitSlots[found].boarded++;
      changed = true;
      if (this.waitSlots[found].boarded >= this.passPerCar) {
        this.waitSlots[found] = null;
      }
    }
    this.render();
    if (changed) {
      setTimeout(() => {
        this.animating = false;
        this.render();
        this.checkEnd();
      }, 200);
    } else {
      this.animating = false;
      this.checkEnd();
    }
  },

  checkEnd() {
    if (this.cars.every(c => !c || !c.active) && this.passengers.length === 0) {
      this.gameState = 'won';
      app.globalData.workers++;
      if (!app.globalData.completedLevels.includes(this.level)) {
        app.globalData.completedLevels.push(this.level);
      }
      app.save();
      this.render();
      return;
    }
    if (this.waitSlots.every(s => s !== null) && this.passengers.length > 0) {
      const nc = this.passengers[0];
      const canMatch = this.waitSlots.some(s => s && s.color === nc);
      if (!canMatch) {
        const hasMovable = this.cars.some((c) => {
          if (!c || !c.active) return false;
          const d = DIR[c.dir], g = this.buildGrid();
          let cc = c.col + d.dx, rr2 = c.row + d.dy;
          while (cc >= 0 && cc < this.cfg.cols && rr2 >= 0 && rr2 < this.cfg.rows) {
            if (g[rr2][cc] !== -1) return false;
            cc += d.dx; rr2 += d.dy;
          }
          return true;
        });
        if (!hasMovable) { this.gameState = 'lost'; this.render(); }
      }
    }
  },

  /* 道具 */
  handleItem(idx) {
    const keys = ['refresh', 'remove', 'reorder', 'flip'];
    const k = keys[idx];
    if (!this.items[k] || this.items[k] <= 0) {
      wx.showToast({ title: '道具不足', icon: 'none' }); return;
    }
    this.items[k]--;
    if (k === 'refresh') {
      const ac = this.cars.filter(c => c && c.active).map(c => c.color);
      shuffle(ac);
      let i = 0; this.cars.forEach(c => { if (c && c.active) c.color = ac[i++]; });
    } else if (k === 'reorder') {
      shuffle(this.passengers);
    } else if (k === 'flip') {
      for (const c of this.cars) {
        if (!c || !c.active) continue;
        const g = this.buildGrid();
        if (!canExit(g, this.cfg.cols, this.cfg.rows, c.col, c.row, c.dir)) {
          const ds = shuffle([...DK]);
          for (const dk of ds) {
            if (canExit(g, this.cfg.cols, this.cfg.rows, c.col, c.row, dk)) { c.dir = dk; break; }
          }
          break;
        }
      }
    } else if (k === 'remove') {
      for (let i = this.cars.length - 1; i >= 0; i--) {
        if (this.cars[i] && this.cars[i].active) { this.cars[i].active = false; break; }
      }
    }
    this.render();
  },

  /* ═══════════════════════════════
   *  ★ Canvas 2D 渲染 ★
   * ═══════════════════════════════ */
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.clearRect(0, 0, W, H);

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#e8eaf6'); bg.addColorStop(1, '#c5cae9');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    this.drawRoad(ctx, W, H);
    this.drawWaitSlots(ctx);
    this.drawPassengerQueue(ctx, W, H);
    this.drawParkingLot(ctx);
    this.drawAllCars(ctx);
    this.drawMoving(ctx);
    this.drawHUD(ctx, W, H);
    this.drawToolbar(ctx, W, H);
    if (this.gameState === 'won' || this.gameState === 'lost') this.drawResult(ctx, W, H);
  },

  drawRoad(ctx, W, H) {
    const rh = H * 0.05;
    ctx.fillStyle = '#546e7a'; ctx.fillRect(0, 0, W, rh);
    ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 2; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(0, rh / 2); ctx.lineTo(W, rh / 2); ctx.stroke();
    ctx.setLineDash([]);
    const bw = 60, bh = 22, bx = W - 80, by = rh / 2 - bh / 2;
    ctx.fillStyle = '#2196F3'; rr(ctx, bx, by, bw, bh, 6); ctx.fill();
    ctx.fillStyle = '#BBDEFB';
    ctx.fillRect(bx + 8, by + 3, 12, 10);
    ctx.fillRect(bx + 24, by + 3, 12, 10);
    ctx.fillRect(bx + 40, by + 3, 12, 10);
  },

  drawWaitSlots(ctx) {
    for (let i = 0; i < (this.cfg ? this.cfg.sl : 4); i++) {
      const sx = this.slotStartX + i * this.slotW;
      ctx.fillStyle = '#90a4ae'; rr(ctx, sx + 4, this.slotY + 3, this.slotW - 8, this.slotH, 8); ctx.fill();
      ctx.fillStyle = '#eceff1'; rr(ctx, sx + 4, this.slotY, this.slotW - 8, this.slotH, 8); ctx.fill();
      ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 1.5; rr(ctx, sx + 4, this.slotY, this.slotW - 8, this.slotH, 8); ctx.stroke();

      const sl = this.waitSlots[i];
      if (sl) {
        this.drawSlotCar(ctx, sx + this.slotW / 2, this.slotY + this.slotH / 2, this.slotW * 0.65, this.slotH * 0.75, sl.color, sl.boarded);
      } else {
        ctx.fillStyle = '#b0bec5'; ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('P', sx + this.slotW / 2, this.slotY + this.slotH / 2);
      }
    }
  },

  drawSlotCar(ctx, cx, cy, w, h, ck, bd) {
    const co = COLORS[ck];
    ctx.fillStyle = co.d; rr(ctx, cx - w / 2, cy - h / 2 + 3, w, h, 5); ctx.fill();
    ctx.fillStyle = co.f; rr(ctx, cx - w / 2, cy - h / 2, w, h, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, cx - w / 4, cy - h / 2 + 2, w / 2, h * 0.3, 3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(bd + '/' + this.passPerCar, cx, cy + 1);
  },

  drawPassengerQueue(ctx, W, H) {
    const qy = H * 0.205, mx = 20;
    const max = Math.min(this.passengers.length, Math.floor((W - 40) / 16));
    const gap = Math.min(16, (W - 40) / (max || 1));
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(ctx, mx - 4, qy - 12, (max || 1) * gap + 12, 24, 6); ctx.fill();
    ctx.fillStyle = '#37474f'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('排队 ' + this.passengers.length + '人', mx, qy - 20);
    for (let i = 0; i < max; i++) {
      const co = COLORS[this.passengers[i]]; if (!co) continue;
      const px = mx + i * gap + gap / 2;
      ctx.beginPath(); ctx.arc(px, qy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = co.f; ctx.fill();
      ctx.strokeStyle = co.d; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (this.passengers.length > max) {
      ctx.fillStyle = '#546e7a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('+' + (this.passengers.length - max), mx + max * gap + 6, qy);
    }
  },

  drawParkingLot(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; rr(ctx, this.lotX + 5, this.lotY + 5, this.lotW, this.lotH, 10); ctx.fill();
    ctx.fillStyle = '#78909c'; rr(ctx, this.lotX, this.lotY, this.lotW, this.lotH, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    for (let r = 0; r <= this.cfg.rows; r++) {
      const y = this.lotY + r * this.cellH;
      ctx.beginPath(); ctx.moveTo(this.lotX, y); ctx.lineTo(this.lotX + this.lotW, y); ctx.stroke();
    }
    for (let c = 0; c <= this.cfg.cols; c++) {
      const x = this.lotX + c * this.cellW;
      ctx.beginPath(); ctx.moveTo(x, this.lotY); ctx.lineTo(x, this.lotY + this.lotH); ctx.stroke();
    }
    ctx.setLineDash([]);
  },

  drawAllCars(ctx) {
    this.cars.forEach((car, i) => {
      if (!car || !car.active) return;
      let cx = this.lotX + car.col * this.cellW + this.cellW / 2;
      let cy = this.lotY + car.row * this.cellH + this.cellH / 2;
      if (this.shakeCar === i && this.shakeT > 0) cx += (this.shakeT % 2 ? 3 : -3);
      this.draw25DCar(ctx, cx, cy, this.cellW * 0.85, this.cellH * 0.85, car.color, car.dir);
    });
  },

  draw25DCar(ctx, cx, cy, w, h, ck, dk) {
    const co = COLORS[ck];
    const cw = w * 0.82, ch = h * 0.58, dep = 4;
    ctx.fillStyle = co.d; rr(ctx, cx - cw / 2, cy - ch / 2 + dep, cw, ch, 5); ctx.fill();
    const g = ctx.createLinearGradient(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2);
    g.addColorStop(0, co.l); g.addColorStop(0.5, co.f); g.addColorStop(1, co.d);
    ctx.fillStyle = g; rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; rr(ctx, cx - cw * 0.3, cy - ch / 2 + 2, cw * 0.6, ch * 0.25, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    const ww = cw * 0.45, wh = ch * 0.28;
    rr(ctx, cx - ww / 2, cy - wh / 2 - 1, ww, wh, 2); ctx.fill();
    this.drawArrow(ctx, cx, cy, cw * 0.35, dk);
  },

  drawArrow(ctx, cx, cy, sz, dk) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(DIR[dk].a);
    const s = sz * 0.38;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.lineTo(s * 0.65, s * 0.15);
    ctx.lineTo(s * 0.2, s * 0.15); ctx.lineTo(s * 0.2, s);
    ctx.lineTo(-s * 0.2, s); ctx.lineTo(-s * 0.2, s * 0.15);
    ctx.lineTo(-s * 0.65, s * 0.15); ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  drawMoving(ctx) {
    if (!this.movingCar) return;
    const { car, fx, fy, tx, ty, p } = this.movingCar;
    const t = easeOut(Math.min(p, 1));
    const x = lerp(fx, tx, t), y = lerp(fy, ty, t);
    this.draw25DCar(ctx, x, y, this.cellW * 0.85, this.cellH * 0.85, car.color, car.dir);
  },

  drawHUD(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(ctx, 8, H * 0.052, 32, 24, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('<', 24, H * 0.052 + 12);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(ctx, W / 2 - 45, H * 0.052, 90, 24, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('第 ' + this.level + ' 关', W / 2, H * 0.052 + 12);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(ctx, W - 115, H * 0.052, 108, 22, 11); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('乘客 ' + this.boarded + '/' + this.totalPass, W - 14, H * 0.052 + 11);
  },

  drawToolbar(ctx, W, H) {
    const ty = H * 0.885, th = H * 0.075;
    ctx.fillStyle = 'rgba(38,50,56,0.88)'; rr(ctx, 0, ty - 10, W, th + 24, 14); ctx.fill();
    const its = [
      { icon: '刷新', cnt: this.items.refresh },
      { icon: '消除', cnt: this.items.remove },
      { icon: '排序', cnt: this.items.reorder },
      { icon: '翻转', cnt: this.items.flip }
    ];
    const gap = 10, bw = (W - gap * 5) / 4;
    its.forEach((it, i) => {
      const bx = gap + i * (bw + gap);
      ctx.fillStyle = it.cnt > 0 ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.04)';
      rr(ctx, bx, ty, bw, th, 8); ctx.fill();
      ctx.fillStyle = it.cnt > 0 ? '#fff' : '#666';
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(it.icon, bx + bw / 2, ty + th * 0.5);
      ctx.fillStyle = it.cnt > 0 ? '#4FC3F7' : '#555';
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(it.cnt + '', bx + bw - 6, ty + 12);
    });
  },

  drawResult(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    const pw = W * 0.72, ph = H * 0.26;
    const px = (W - pw) / 2, py = (H - ph) / 2;
    ctx.fillStyle = '#fff'; rr(ctx, px, py, pw, ph, 18); ctx.fill();
    const win = this.gameState === 'won';
    ctx.fillStyle = win ? '#43A047' : '#E53935';
    ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(win ? '通关成功!' : '挑战失败', W / 2, py + ph * 0.3);
    if (win) {
      ctx.fillStyle = '#666'; ctx.font = '14px sans-serif';
      ctx.fillText('获得 1 个工人', W / 2, py + ph * 0.5);
      ctx.fillText('当前工人: ' + app.globalData.workers, W / 2, py + ph * 0.63);
    }
    const bw2 = pw * 0.45, bh2 = 36, bx2 = W / 2 - bw2 / 2, by2 = py + ph * 0.77;
    ctx.fillStyle = win ? '#43A047' : '#FF7043'; rr(ctx, bx2, by2, bw2, bh2, 18); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText(win ? '下一关' : '重新挑战', W / 2, by2 + bh2 / 2);
  }
});
