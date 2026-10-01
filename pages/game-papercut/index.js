// pages/index/index.js
const DEG60 = Math.PI / 3;
const DEG120 = Math.PI * 2 / 3;

Page({
  data: {
    phase: 'show', // show | folding | ready | cut | result
    cutCount: 0,
    showToast: false,
    toastText: '',
    uiHidden: false,
    liked: false
  },

  onToggleUI() { this.setData({ uiHidden: !this.data.uiHidden }); },
  onLikeTap() { this.setData({ liked: !this.data.liked }); },

  // ========== 生命周期 ==========
  onReady() {
    this.initCanvas();
  },

  async initCanvas() {
    const query = wx.createSelectorQuery();

    // 主画布
    const mainRes = await new Promise(resolve => {
      query.select('#mainCanvas')
        .fields({ node: true, size: true })
        .exec(resolve);
    });

    const mainNode = mainRes[0];
    this.canvas = mainNode.node;
    this.ctx = this.canvas.getContext('2d');

    const dpr = wx.getWindowInfo().pixelRatio;
    this.dpr = dpr;
    this.canvasW = mainNode.width;
    this.canvasH = mainNode.height;
    this.canvas.width = this.canvasW * dpr;
    this.canvas.height = this.canvasH * dpr;
    this.ctx.scale(dpr, dpr);

    // 纸张参数
    this.paperSize = Math.min(this.canvasW, this.canvasH) * 0.85;
    this.paperX = (this.canvasW - this.paperSize) / 2;
    this.paperY = (this.canvasH - this.paperSize) / 2;
    this.centerX = this.canvasW / 2;
    this.centerY = this.canvasH / 2;

    // 剪切数据
    this.cuts = []; // 存储每一刀的路径点
    this.currentPath = []; // 当前正在画的路径
    this.isCutting = false;

    // 折叠后三角形的顶点（会在折叠后计算）
    this.triPoints = [];

    this.drawPaper();
  },

  // ========== 绘制：红纸 ==========
  drawPaper() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    // 纸张阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // 红纸
    ctx.fillStyle = '#D42A20';
    ctx.fillRect(this.paperX, this.paperY, this.paperSize, this.paperSize);
    ctx.restore();

    // 宣纸纹理模拟（噪点）
    this.drawPaperTexture(this.paperX, this.paperY, this.paperSize, this.paperSize);
  },

  drawPaperTexture(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.06;
    const step = 4;
    for (let i = 0; i < w; i += step) {
      for (let j = 0; j < h; j += step) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : '#000';
          ctx.fillRect(x + i, y + j, step, step);
        }
      }
    }
    ctx.restore();
  },

  // ========== 阶段二：折叠动画 ==========
  startFolding() {
    this.setData({ phase: 'folding' });
    this.animateFolding();
  },

  async animateFolding() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const s = this.paperSize;
    const px = this.paperX;
    const py = this.paperY;

    // ---------- 第 1 折：上下对折 ----------
    await this.sleep(300);
    await this.animateStep(() => {
      ctx.clearRect(0, 0, this.canvasW, this.canvasH);
      const rectH = s / 2;
      const rectY = py + s / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#C42418';
      ctx.fillRect(px, rectY, s, rectH);
      ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, rectY);
      ctx.lineTo(px + s, rectY);
      ctx.stroke();
      this.drawPaperTexture(px, rectY, s, rectH);
    });

    // ---------- 第 2 折：以底边中点为基准，左侧向右折 60° ----------
    await this.sleep(300);
    const halfW = s / 2;
    const halfH = s / 2;
    const bx = cx;
    const by = py + s;
    await this.animateStep(() => {
      ctx.clearRect(0, 0, this.canvasW, this.canvasH);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#B52015';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      const r = halfH;
      const angle1 = -Math.PI / 2 - DEG60 / 2;
      const angle2 = -Math.PI / 2 + DEG60 / 2;
      ctx.lineTo(bx + r * Math.cos(angle1), by + r * Math.sin(angle1));
      ctx.lineTo(bx + r * Math.cos(angle2), by + r * Math.sin(angle2));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // ---------- 第 3 折：右侧向左折 60°，对齐 ----------
    await this.sleep(300);
    await this.animateStep(() => {
      ctx.clearRect(0, 0, this.canvasW, this.canvasH);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#A51C12';
      ctx.beginPath();
      const r = halfH;
      ctx.moveTo(bx, by);
      const a1 = -Math.PI / 2 - DEG60 / 4;
      const a2 = -Math.PI / 2 + DEG60 / 4;
      ctx.lineTo(bx + r * Math.cos(a1), by + r * Math.sin(a1));
      ctx.lineTo(bx + r * Math.cos(a2), by + r * Math.sin(a2));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // ---------- 第 4 折：沿中线对折 ----------
    await this.sleep(300);
    const finalR = halfH * 0.9;
    const triP0 = { x: bx, y: by - 10 };
    const triP1 = { x: bx, y: by - finalR };
    const triP2 = { x: bx + finalR * Math.sin(DEG60 / 4), y: by - finalR * Math.cos(DEG60 / 4) };

    const triCenterY = (triP0.y + triP1.y + triP2.y) / 3;
    const offsetY = cy - triCenterY;
    this.triPoints = [
      { x: triP0.x, y: triP0.y + offsetY },
      { x: triP1.x, y: triP1.y + offsetY },
      { x: triP2.x, y: triP2.y + offsetY }
    ];

    await this.animateStep(() => {
      ctx.clearRect(0, 0, this.canvasW, this.canvasH);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#961810';
      ctx.beginPath();
      ctx.moveTo(this.triPoints[0].x, this.triPoints[0].y);
      ctx.lineTo(this.triPoints[1].x, this.triPoints[1].y);
      ctx.lineTo(this.triPoints[2].x, this.triPoints[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.triPoints[0].x, this.triPoints[0].y);
      ctx.lineTo(this.triPoints[1].x, this.triPoints[1].y);
      ctx.stroke();
    });

    this.setData({ phase: 'ready' });
  },

  animateStep(drawFn) {
    return new Promise(resolve => {
      drawFn();
      setTimeout(resolve, 600);
    });
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ========== 阶段三：剪纸操作 ==========
  startCutting() {
    this.setData({ phase: 'cut', cutCount: 0 });
    this.cuts = [];       // 存储的是放大后的屏幕坐标
    this.cutsLocal = [];  // 存储的是相对于三角形原点的归一化坐标（用于展开）

    // 计算放大参数：将折叠后的小三角形放大到占满画布 85%
    const tri = this.triPoints;
    const xs = tri.map(p => p.x);
    const ys = tri.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const triW = maxX - minX;
    const triH = maxY - minY;
    const triCx = (minX + maxX) / 2;
    const triCy = (minY + maxY) / 2;

    // 目标：放大后三角形占画布的 85%
    const targetSize = Math.min(this.canvasW, this.canvasH) * 0.85;
    const scale = targetSize / Math.max(triW, triH);
    this.cutScale = scale;

    // 放大后三角形的中心对齐画布中心
    this.cutOffsetX = this.centerX - triCx * scale;
    this.cutOffsetY = this.centerY - triCy * scale;

    // 计算放大后的三角形顶点（用于剪纸阶段的绘制和碰撞检测）
    this.bigTriPoints = tri.map(p => ({
      x: p.x * scale + this.cutOffsetX,
      y: p.y * scale + this.cutOffsetY
    }));

    this.drawTriangleWithCuts();
  },

  // 将放大后的屏幕坐标转回折叠阶段的原始坐标
  screenToLocal(pt) {
    return {
      x: (pt.x - this.cutOffsetX) / this.cutScale,
      y: (pt.y - this.cutOffsetY) / this.cutScale
    };
  },

  drawTriangleWithCuts() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    const tri = this.bigTriPoints; // 使用放大后的三角形

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(tri[0].x, tri[0].y);
    ctx.lineTo(tri[1].x, tri[1].y);
    ctx.lineTo(tri[2].x, tri[2].y);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = '#961810';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    if (this.cuts.length > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      this.cuts.forEach(cut => {
        this.drawLeafShape(ctx, cut);
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();

    if (this.cuts.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      this.cuts.forEach(cut => {
        this.strokeLeafShape(ctx, cut);
      });
      ctx.restore();
    }

    if (this.currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      for (let i = 1; i < this.currentPath.length; i++) {
        ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  // 生成柳叶形状并填充
  drawLeafShape(ctx, pathPoints) {
    if (pathPoints.length < 2) return;
    const leafPath = this.computeLeafPath(pathPoints);
    ctx.beginPath();
    ctx.moveTo(leafPath.upper[0].x, leafPath.upper[0].y);
    for (let i = 1; i < leafPath.upper.length; i++) {
      ctx.lineTo(leafPath.upper[i].x, leafPath.upper[i].y);
    }
    for (let i = leafPath.lower.length - 1; i >= 0; i--) {
      ctx.lineTo(leafPath.lower[i].x, leafPath.lower[i].y);
    }
    ctx.closePath();
    ctx.fill();
  },

  strokeLeafShape(ctx, pathPoints) {
    if (pathPoints.length < 2) return;
    const leafPath = this.computeLeafPath(pathPoints);
    ctx.beginPath();
    ctx.moveTo(leafPath.upper[0].x, leafPath.upper[0].y);
    for (let i = 1; i < leafPath.upper.length; i++) {
      ctx.lineTo(leafPath.upper[i].x, leafPath.upper[i].y);
    }
    for (let i = leafPath.lower.length - 1; i >= 0; i--) {
      ctx.lineTo(leafPath.lower[i].x, leafPath.lower[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  },

  // 从中轴线路径计算柳叶形轮廓
  computeLeafPath(pathPoints) {
    const pts = this.simplifyPath(pathPoints, 3);
    if (pts.length < 2) return { upper: pts, lower: pts };

    let totalLen = 0;
    for (let i = 1; i < pts.length; i++) {
      totalLen += this.dist(pts[i - 1], pts[i]);
    }
    const maxWidth = Math.max(totalLen * 0.18, 6);

    const upper = [];
    const lower = [];
    let accLen = 0;

    for (let i = 0; i < pts.length; i++) {
      if (i > 0) accLen += this.dist(pts[i - 1], pts[i]);
      const t = totalLen > 0 ? accLen / totalLen : 0;
      const w = maxWidth * Math.sin(t * Math.PI);

      let nx, ny;
      if (i === 0) {
        nx = pts[1].x - pts[0].x;
        ny = pts[1].y - pts[0].y;
      } else if (i === pts.length - 1) {
        nx = pts[i].x - pts[i - 1].x;
        ny = pts[i].y - pts[i - 1].y;
      } else {
        nx = pts[i + 1].x - pts[i - 1].x;
        ny = pts[i + 1].y - pts[i - 1].y;
      }
      const len = Math.sqrt(nx * nx + ny * ny) || 1;
      const perpX = -ny / len;
      const perpY = nx / len;

      upper.push({ x: pts[i].x + perpX * w, y: pts[i].y + perpY * w });
      lower.push({ x: pts[i].x - perpX * w, y: pts[i].y - perpY * w });
    }

    return { upper, lower };
  },

  simplifyPath(points, minDist) {
    if (points.length < 2) return points;
    const result = [points[0]];
    for (let i = 1; i < points.length; i++) {
      if (this.dist(result[result.length - 1], points[i]) >= minDist) {
        result.push(points[i]);
      }
    }
    if (result.length === 1) result.push(points[points.length - 1]);
    return result;
  },

  dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  },

  pointInTriangle(px, py) {
    const [a, b, c] = this.triPoints;
    const d1 = this.sign(px, py, a.x, a.y, b.x, b.y);
    const d2 = this.sign(px, py, b.x, b.y, c.x, c.y);
    const d3 = this.sign(px, py, c.x, c.y, a.x, a.y);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  },

  sign(px, py, x1, y1, x2, y2) {
    return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
  },

  // 判断路径是否触及三角形边缘（使用放大后的三角形）
  pathTouchesEdge(pathPoints) {
    if (pathPoints.length < 2) return false;
    const margin = 12;
    const first = pathPoints[0];
    const last = pathPoints[pathPoints.length - 1];
    return this.nearTriEdge(first, margin) || this.nearTriEdge(last, margin);
  },

  nearTriEdge(pt, margin) {
    const tri = this.bigTriPoints || this.triPoints;
    const [a, b, c] = tri;
    const edges = [[a, b], [b, c], [c, a]];
    for (const [p1, p2] of edges) {
      const d = this.pointToSegDist(pt, p1, p2);
      if (d < margin) return true;
    }
    return false;
  },

  pointToSegDist(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return this.dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return this.dist(p, { x: a.x + t * dx, y: a.y + t * dy });
  },

  // ========== 触控事件 ==========
  onTouchStart(e) {
    if (this.data.phase !== 'cut') return;
    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;
    this.isCutting = true;
    this.currentPath = [{ x, y }];
  },

  onTouchMove(e) {
    if (!this.isCutting) return;
    const touch = e.touches[0];
    this.currentPath.push({ x: touch.x, y: touch.y });
    this.drawTriangleWithCuts();
  },

  onTouchEnd() {
    if (!this.isCutting) return;
    this.isCutting = false;

    if (this.currentPath.length < 3) {
      this.currentPath = [];
      this.drawTriangleWithCuts();
      return;
    }

    if (this.data.cutCount >= 10) {
      this.showToastMsg('最多剪 10 刀哦~');
      this.currentPath = [];
      this.drawTriangleWithCuts();
      return;
    }

    // 检查是否从边缘切入
    if (!this.pathTouchesEdge(this.currentPath)) {
      this.showToastMsg('剪刀要从纸边切入哦~');
      this.currentPath = [];
      this.drawTriangleWithCuts();
      return;
    }

    // 保存放大版本（用于剪纸阶段绘制）
    this.cuts.push([...this.currentPath]);
    // 同时保存转换回原始折叠坐标的版本（用于展开算法）
    const localCut = this.currentPath.map(pt => this.screenToLocal(pt));
    this.cutsLocal.push(localCut);

    this.currentPath = [];
    this.setData({ cutCount: this.cuts.length });
    this.drawTriangleWithCuts();
  },

  undoCut() {
    if (this.cuts.length > 0) {
      this.cuts.pop();
      this.cutsLocal.pop();
      this.setData({ cutCount: this.cuts.length });
      this.drawTriangleWithCuts();
    }
  },

  clearCuts() {
    this.cuts = [];
    this.cutsLocal = [];
    this.setData({ cutCount: 0 });
    this.drawTriangleWithCuts();
  },

  showToastMsg(text) {
    this.setData({ showToast: true, toastText: text });
    setTimeout(() => this.setData({ showToast: false }), 1500);
  },

  // ========== 阶段四：展开 ==========
  unfold() {
    if (this.cuts.length === 0) {
      this.showToastMsg('还没剪呢，动动手指~');
      return;
    }
    this.setData({ phase: 'result' });
    this.drawResult();
  },

  drawResult() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    const cx = this.centerX;
    const cy = this.centerY;
    const radius = this.paperSize * 0.42;

    // 画六边形底色
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = '#D42A20';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = DEG60 * i - Math.PI / 2;
      const hx = cx + radius * Math.cos(angle);
      const hy = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 使用原始坐标的剪切数据（cutsLocal），以折叠原点为基准
    const origin = this.triPoints[0];
    const localCuts = this.cutsLocal.map(cut => {
      return cut.map(pt => ({
        x: pt.x - origin.x,
        y: pt.y - origin.y
      }));
    });

    // 展开算法：镜像 + 旋转复制6次 = 12重对称
    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = DEG60 * i - Math.PI / 2;
      const hx = cx + radius * Math.cos(angle);
      const hy = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.clip();

    ctx.globalCompositeOperation = 'destination-out';

    for (let rot = 0; rot < 6; rot++) {
      for (let mirror = 0; mirror < 2; mirror++) {
        localCuts.forEach(cut => {
          const transformedCut = cut.map(pt => {
            let { x, y } = pt;

            if (mirror === 1) x = -x;

            const angle = rot * DEG60;
            const rx = x * Math.cos(angle) - y * Math.sin(angle);
            const ry = x * Math.sin(angle) + y * Math.cos(angle);

            return { x: rx + cx, y: ry + cy };
          });

          this.drawLeafShape(ctx, transformedCut);
        });
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // 宣纸纹理覆盖
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = DEG60 * i - Math.PI / 2;
      const hx = cx + radius * Math.cos(angle);
      const hy = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.clip();
    this.drawPaperTexture(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
  },

  // ========== 保存图片 ==========
  async saveImage() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas: this.canvas,
          fileType: 'png',
          quality: 1,
          success: resolve,
          fail: reject
        });
      });

      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: resolve,
          fail: reject
        });
      });

      this.showToastMsg('已保存到相册 🎉');
    } catch (err) {
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        this.showToastMsg('请允许相册权限');
      } else {
        this.showToastMsg('保存失败，请重试');
      }
    }
  },

  // ========== 重新开始 ==========
  restart() {
    this.cuts = [];
    this.cutsLocal = [];
    this.currentPath = [];
    this.setData({ phase: 'show', cutCount: 0 });
    this.drawPaper();
  },

  goBack() {
    wx.navigateBack();
  }
});
