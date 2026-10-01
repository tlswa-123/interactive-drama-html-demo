// pages/game/game.js
const TOTAL_LEVELS = 300;
const VISIBLE_RINGS = 10;
const GAP_ANGLE = Math.PI / 4.5;   // 缺口40度，稍微宽一点好操作
const BALL_RADIUS = 7;
const RING_WIDTH = 3;
const BOUNCE_SPEED = 2.0;
const FALL_DURATION = 18;           // 下坠动画帧数

// 颜色渐变：蓝 → 青 → 绿 → 黄 → 橙 → 红 → 粉 → 紫 → 蓝（循环）
const COLOR_STOPS = [
  { r: 40,  g: 120, b: 255 },  // 蓝
  { r: 0,   g: 220, b: 255 },  // 青
  { r: 0,   g: 255, b: 160 },  // 绿
  { r: 180, g: 255, b: 50  },  // 黄绿
  { r: 255, g: 230, b: 30  },  // 黄
  { r: 255, g: 160, b: 20  },  // 橙
  { r: 255, g: 60,  b: 60  },  // 红
  { r: 255, g: 80,  b: 180 },  // 粉
  { r: 180, g: 60,  b: 255 },  // 紫
  { r: 40,  g: 120, b: 255 },  // 回到蓝（循环）
];

function lerpColor(t) {
  const total = COLOR_STOPS.length - 1;
  const scaled = t * total;
  const idx = Math.min(Math.floor(scaled), total - 1);
  const frac = scaled - idx;
  const c1 = COLOR_STOPS[idx];
  const c2 = COLOR_STOPS[idx + 1];
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * frac),
    g: Math.round(c1.g + (c2.g - c1.g) * frac),
    b: Math.round(c1.b + (c2.b - c1.b) * frac)
  };
}

function colorStr(c, alpha) {
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
}

function hexColor(c) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return '#' + toHex(c.r) + toHex(c.g) + toHex(c.b);
}

Page({
  data: {
    currentLevel: 1,
    totalLevels: TOTAL_LEVELS,
    timeDisplay: '00:00',
    gameWon: false,
    themeColor: '#2878ff',
    uiHidden: false,
    liked: false
  },

  onLoad() {
    this.initGame();
  },

  onReady() {
    this.setupCanvas();
  },

  onUnload() {
    this.stopGame();
  },

  onToggleUI() {
    this.setData({ uiHidden: !this.data.uiHidden });
  },

  onLikeTap() {
    this.setData({ liked: !this.data.liked });
  },

  initGame() {
    this.levels = [];
    this.currentLevelIndex = 0;
    this.ballAngle = 0;
    this.ballBounceOffset = 0;
    this.bounceDirection = 1;
    this.isFalling = false;
    this.fallFrame = 0;
    this.startTime = Date.now();
    this.gameRunning = true;
    this.touchStartAngle = null;

    for (let i = 0; i < TOTAL_LEVELS; i++) {
      this.levels.push({
        gapAngle: Math.random() * Math.PI * 2,
        rotation: 0
      });
    }
  },

  setupCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getWindowInfo().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;
        this.centerX = this.canvasWidth / 2;
        this.centerY = this.canvasHeight / 2;
        this.maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.42;

        this.startGameLoop();
      });
  },

  startGameLoop() {
    const loop = () => {
      if (!this.gameRunning) return;
      this.update();
      this.draw();
      this.updateTimer();
      this.animFrame = this.canvas.requestAnimationFrame(loop);
    };
    loop();
  },

  stopGame() {
    this.gameRunning = false;
    if (this.animFrame && this.canvas) {
      this.canvas.cancelAnimationFrame(this.animFrame);
    }
  },

  // 获取某一层在视觉上的半径（非线性缩小）
  getRingRadius(ringIndex) {
    const t = ringIndex / VISIBLE_RINGS;
    return this.maxRadius * (1 - t * t * 0.85);
  },

  // 获取当前层级对应的主题色
  getLevelColor(levelIdx) {
    const t = (levelIdx % 60) / 60;
    return lerpColor(t);
  },

  // ===== 游戏更新 =====
  update() {
    if (this.data.gameWon) return;

    if (this.isFalling) {
      this.fallFrame++;
      if (this.fallFrame >= FALL_DURATION) {
        this.isFalling = false;
        this.fallFrame = 0;
        this.currentLevelIndex++;
        this.ballBounceOffset = 0;
        this.bounceDirection = -1;

        if (this.currentLevelIndex >= TOTAL_LEVELS) {
          this.setData({ gameWon: true });
          this.stopGame();
          return;
        }
        this.setData({
          currentLevel: this.currentLevelIndex + 1,
          themeColor: hexColor(this.getLevelColor(this.currentLevelIndex))
        });
      }
    } else {
      // 弹跳
      this.ballBounceOffset += BOUNCE_SPEED * this.bounceDirection;
      const bounceLimit = 14;
      if (this.ballBounceOffset > bounceLimit) {
        this.ballBounceOffset = bounceLimit;
        this.bounceDirection = -1;
      } else if (this.ballBounceOffset < -bounceLimit) {
        this.ballBounceOffset = -bounceLimit;
        this.bounceDirection = 1;
      }
      this.checkGapPass();
    }
  },

  checkGapPass() {
    const level = this.levels[this.currentLevelIndex];
    if (!level) return;

    const effectiveGap = level.gapAngle + level.rotation;
    const norm = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const ballA = norm(this.ballAngle);
    const gapA = norm(effectiveGap);

    let diff = Math.abs(ballA - gapA);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;

    // 小球在缺口范围内 + 正在弹跳经过圆环位置附近
    if (diff < GAP_ANGLE / 2 && Math.abs(this.ballBounceOffset) < 5) {
      this.isFalling = true;
      this.fallFrame = 0;
    }
  },

  // ===== 绘制 =====
  draw() {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    // 清屏
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    const fallT = this.isFalling ? this.fallFrame / FALL_DURATION : 0;
    // easeInOut让下坠更顺滑
    const easedT = fallT < 0.5
      ? 2 * fallT * fallT
      : 1 - Math.pow(-2 * fallT + 2, 2) / 2;

    // ===== 绘制圆环 (从远到近) =====
    for (let i = VISIBLE_RINGS; i >= 0; i--) {
      let levelIdx;

      if (this.isFalling) {
        levelIdx = this.currentLevelIndex + i;
        if (levelIdx >= TOTAL_LEVELS) continue;

        const radiusCur = this.getRingRadius(i);
        const radiusNext = i > 0 ? this.getRingRadius(i - 1) : this.maxRadius * 1.4;
        var radius = radiusCur + (radiusNext - radiusCur) * easedT;
      } else {
        levelIdx = this.currentLevelIndex + i;
        if (levelIdx >= TOTAL_LEVELS) continue;
        var radius = this.getRingRadius(i);
      }

      if (radius <= 0 || radius > w) continue;

      const level = this.levels[levelIdx];
      const themeColor = this.getLevelColor(levelIdx);

      // 透明度：近的亮，远的暗
      const depthAlpha = i === 0
        ? (this.isFalling ? Math.max(0, 0.9 - easedT * 1.2) : 0.9)
        : Math.max(0.06, 0.8 * (1 - i / VISIBLE_RINGS));

      // 绘制带缺口的圆环
      const gapCenter = level.gapAngle + level.rotation;
      const gapStart = gapCenter - GAP_ANGLE / 2;
      const gapEnd = gapCenter + GAP_ANGLE / 2;

      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, gapEnd, gapStart + Math.PI * 2);
      ctx.strokeStyle = colorStr(themeColor, depthAlpha);
      ctx.lineWidth = i === 0 ? RING_WIDTH + 1.5 : Math.max(1, RING_WIDTH * (1 - i * 0.06));
      ctx.stroke();

      // 当前层缺口标记
      if (i === 0 && !this.isFalling) {
        const dotR = 4;
        for (const angle of [gapStart, gapEnd]) {
          const dx = this.centerX + Math.cos(angle) * radius;
          const dy = this.centerY + Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
          ctx.fillStyle = colorStr(themeColor, 1);
          ctx.fill();
        }

        // 缺口区域提示弧线（虚线风格）
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, radius, gapStart, gapEnd);
        ctx.strokeStyle = colorStr(themeColor, 0.2);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ===== 绘制小球 =====
    if (!this.data.gameWon) {
      const themeColor = this.getLevelColor(this.currentLevelIndex);
      let ballDist, ballR;

      if (this.isFalling) {
        const fromRadius = this.maxRadius;
        const toRadiusAnimated = this.getRingRadius(1) + (this.getRingRadius(0) - this.getRingRadius(1)) * easedT;
        ballDist = fromRadius + (toRadiusAnimated - fromRadius) * easedT;
        ballR = BALL_RADIUS;
      } else {
        ballDist = this.maxRadius + this.ballBounceOffset;
        ballR = BALL_RADIUS;
      }

      const bx = this.centerX + Math.cos(this.ballAngle) * ballDist;
      const by = this.centerY + Math.sin(this.ballAngle) * ballDist;

      // 发光
      ctx.beginPath();
      ctx.arc(bx, by, ballR * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = colorStr(themeColor, 0.25);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, ballR * 2, 0, Math.PI * 2);
      ctx.fillStyle = colorStr(themeColor, 0.15);
      ctx.fill();

      // 本体
      ctx.beginPath();
      ctx.arc(bx, by, ballR, 0, Math.PI * 2);
      ctx.fillStyle = hexColor(themeColor);
      ctx.fill();

      // 高光
      ctx.beginPath();
      ctx.arc(bx - ballR * 0.3, by - ballR * 0.3, ballR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }

    // ===== 中心深渊 =====
    const innerR = this.getRingRadius(VISIBLE_RINGS) * 0.8;
    if (innerR > 0) {
      const gradient = ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, innerR * 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, innerR * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  },

  // ===== 触控 =====
  onTouchStart(e) {
    if (this.data.gameWon || this.isFalling) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.centerX;
    const dy = touch.clientY - this.centerY;
    this.touchStartAngle = Math.atan2(dy, dx);
    this.touchStartRotation = this.levels[this.currentLevelIndex].rotation;
  },

  onTouchMove(e) {
    if (this.data.gameWon || this.isFalling || this.touchStartAngle === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.centerX;
    const dy = touch.clientY - this.centerY;
    const currentAngle = Math.atan2(dy, dx);
    let delta = currentAngle - this.touchStartAngle;
    this.levels[this.currentLevelIndex].rotation = this.touchStartRotation + delta;
  },

  onTouchEnd() {
    this.touchStartAngle = null;
  },

  // ===== 计时器 =====
  updateTimer() {
    const elapsed = Date.now() - this.startTime;
    const s = Math.floor(elapsed / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const display = (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
    if (display !== this.data.timeDisplay) {
      this.setData({ timeDisplay: display });
    }
  },

  restartGame() {
    this.initGame();
    this.setData({
      currentLevel: 1,
      timeDisplay: '00:00',
      gameWon: false,
      themeColor: '#2878ff'
    });
    this.startGameLoop();
  },

  goBack() {
    this.stopGame();
    wx.navigateBack();
  }
});
