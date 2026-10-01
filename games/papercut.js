// 剪纸工坊游戏引擎 - 可嵌入任意 canvas
var DEG60 = Math.PI / 3

function create() {
  var engine = {
    canvas: null, ctx: null, W: 0, H: 0, dpr: 1,
    paperSize: 0, paperX: 0, paperY: 0, centerX: 0, centerY: 0,
    cuts: [], cutsLocal: [], currentPath: [], isCutting: false, triPoints: [],
    bigTriPoints: [], cutScale: 1, cutOffsetX: 0, cutOffsetY: 0,
    phase: 'show', cutCount: 0,
    onPhaseChange: null,

    init: function(canvas, w, h) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d')
      this.W = w; this.H = h
      this.paperSize = Math.min(w, h) * 0.85
      this.paperX = (w - this.paperSize) / 2
      this.paperY = (h - this.paperSize) / 2
      this.centerX = w / 2; this.centerY = h / 2
      this.cuts = []; this.cutsLocal = []; this.currentPath = []; this.isCutting = false; this.triPoints = []
      this.bigTriPoints = []; this.cutScale = 1; this.cutOffsetX = 0; this.cutOffsetY = 0
      this.phase = 'show'; this.cutCount = 0
      this.drawPaper()
      if (this.onPhaseChange) this.onPhaseChange('show', 0)
    },

    destroy: function() { /* static game, nothing to stop */ },

    drawPaper: function() {
      var ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H)
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4
      ctx.fillStyle = '#D42A20'; ctx.fillRect(this.paperX, this.paperY, this.paperSize, this.paperSize)
      ctx.restore(); this.drawTexture(this.paperX, this.paperY, this.paperSize, this.paperSize)
    },

    drawTexture: function(x, y, w, h) {
      var ctx = this.ctx; ctx.save(); ctx.globalAlpha = 0.06
      for (var i = 0; i < w; i += 4) for (var j = 0; j < h; j += 4) {
        if (Math.random() > 0.5) { ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : '#000'; ctx.fillRect(x + i, y + j, 4, 4) }
      }
      ctx.restore()
    },

    action: function(name) {
      if (name === 'fold') this.startFolding()
      else if (name === 'cut') this.startCutting()
      else if (name === 'undo') this.undoCut()
      else if (name === 'clear') this.clearCuts()
      else if (name === 'unfold') this.unfold()
      else if (name === 'restart') this.restart()
      else if (name === 'save') this.saveImage()
    },

    sleep: function(ms) { return new Promise(function(r) { setTimeout(r, ms) }) },
    animStep: function(fn) { return new Promise(function(r) { fn(); setTimeout(r, 600) }) },

    startFolding: function() {
      this.phase = 'folding'
      if (this.onPhaseChange) this.onPhaseChange('folding', 0)
      this.animateFolding()
    },

    animateFolding: function() {
      var ctx = this.ctx, cx = this.centerX, cy = this.centerY, s = this.paperSize, px = this.paperX, py = this.paperY
      var self = this
      var DEG60_local = DEG60

      setTimeout(function() {
        ctx.clearRect(0, 0, self.W, self.H); ctx.save()
        ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3
        ctx.fillStyle='#C42418'; ctx.fillRect(px, py+s/2, s, s/2); ctx.restore()
        self.drawTexture(px, py+s/2, s, s/2)

        setTimeout(function() {
          var bx = cx, by = py + s, halfH = s / 2
          ctx.clearRect(0, 0, self.W, self.H); ctx.save()
          ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8; ctx.fillStyle='#B52015'
          ctx.beginPath(); ctx.moveTo(bx, by)
          var a1 = -Math.PI/2 - DEG60_local/2, a2 = -Math.PI/2 + DEG60_local/2
          ctx.lineTo(bx + halfH*Math.cos(a1), by + halfH*Math.sin(a1))
          ctx.lineTo(bx + halfH*Math.cos(a2), by + halfH*Math.sin(a2))
          ctx.closePath(); ctx.fill(); ctx.restore()

          setTimeout(function() {
            ctx.clearRect(0, 0, self.W, self.H); ctx.save()
            ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8; ctx.fillStyle='#A51C12'
            ctx.beginPath(); ctx.moveTo(bx, by)
            var a3 = -Math.PI/2 - DEG60_local/4, a4 = -Math.PI/2 + DEG60_local/4
            ctx.lineTo(bx + halfH*Math.cos(a3), by + halfH*Math.sin(a3))
            ctx.lineTo(bx + halfH*Math.cos(a4), by + halfH*Math.sin(a4))
            ctx.closePath(); ctx.fill(); ctx.restore()

            setTimeout(function() {
              var fR = halfH * 0.9
              var t0 = {x: bx, y: by - 10}, t1 = {x: bx, y: by - fR}
              var t2 = {x: bx + fR * Math.sin(DEG60_local/4), y: by - fR * Math.cos(DEG60_local/4)}
              var tcy = (t0.y + t1.y + t2.y) / 3, oy = cy - tcy
              self.triPoints = [{x:t0.x,y:t0.y+oy},{x:t1.x,y:t1.y+oy},{x:t2.x,y:t2.y+oy}]
              var tp = self.triPoints
              ctx.clearRect(0, 0, self.W, self.H); ctx.save()
              ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8; ctx.fillStyle='#961810'
              ctx.beginPath(); ctx.moveTo(tp[0].x,tp[0].y); ctx.lineTo(tp[1].x,tp[1].y); ctx.lineTo(tp[2].x,tp[2].y)
              ctx.closePath(); ctx.fill(); ctx.restore()
              self.phase = 'ready'
              if (self.onPhaseChange) self.onPhaseChange('ready', 0)
            }, 900)
          }, 900)
        }, 900)
      }, 300)
    },

    startCutting: function() {
      this.phase = 'cut'; this.cuts = []; this.cutsLocal = []; this.cutCount = 0

      // 计算放大参数：将折叠后的小三角形放大到占满画布 85%
      var tri = this.triPoints
      var xs = tri.map(function(p){return p.x})
      var ys = tri.map(function(p){return p.y})
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs)
      var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys)
      var triW = maxX - minX, triH = maxY - minY
      var triCx = (minX + maxX) / 2, triCy = (minY + maxY) / 2

      var targetSize = Math.min(this.W, this.H) * 0.85
      var scale = targetSize / Math.max(triW, triH)
      this.cutScale = scale

      this.cutOffsetX = this.centerX - triCx * scale
      this.cutOffsetY = this.centerY - triCy * scale

      this.bigTriPoints = tri.map(function(p) {
        return { x: p.x * scale + this.cutOffsetX, y: p.y * scale + this.cutOffsetY }
      }.bind(this))

      this.drawTriWithCuts()
      if (this.onPhaseChange) this.onPhaseChange('cut', 0)
    },

    screenToLocal: function(pt) {
      return {
        x: (pt.x - this.cutOffsetX) / this.cutScale,
        y: (pt.y - this.cutOffsetY) / this.cutScale
      }
    },

    drawTriWithCuts: function() {
      var ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H)
      var tri = this.bigTriPoints
      ctx.save(); ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8
      ctx.beginPath(); ctx.moveTo(tri[0].x,tri[0].y)
      ctx.lineTo(tri[1].x,tri[1].y); ctx.lineTo(tri[2].x,tri[2].y)
      ctx.closePath(); ctx.clip()
      ctx.fillStyle='#961810'; ctx.fillRect(0,0,this.W,this.H)
      if (this.cuts.length > 0) {
        ctx.globalCompositeOperation='destination-out'
        for (var i=0;i<this.cuts.length;i++) this.drawLeaf(ctx, this.cuts[i])
        ctx.globalCompositeOperation='source-over'
      }
      ctx.restore()
      if (this.cuts.length > 0) {
        ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1.5
        for (var i=0;i<this.cuts.length;i++) this.strokeLeaf(ctx, this.cuts[i])
        ctx.restore()
      }
      if (this.currentPath.length > 1) {
        ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2; ctx.setLineDash([6,6])
        ctx.beginPath(); ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y)
        for (var i=1;i<this.currentPath.length;i++) ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y)
        ctx.stroke(); ctx.setLineDash([]); ctx.restore()
      }
    },

    computeLeaf: function(pts) {
      var sp = this.simplify(pts, 3); if (sp.length < 2) return {u:sp,l:sp}
      var tl=0; for (var i=1;i<sp.length;i++) tl+=this.dist(sp[i-1],sp[i])
      var mw = Math.max(tl*0.18, 6), u=[], l=[], al=0
      for (var i=0;i<sp.length;i++) {
        if (i>0) al+=this.dist(sp[i-1],sp[i])
        var t=tl>0?al/tl:0, w=mw*Math.sin(t*Math.PI)
        var nx,ny
        if (i===0){nx=sp[1].x-sp[0].x;ny=sp[1].y-sp[0].y}
        else if(i===sp.length-1){nx=sp[i].x-sp[i-1].x;ny=sp[i].y-sp[i-1].y}
        else{nx=sp[i+1].x-sp[i-1].x;ny=sp[i+1].y-sp[i-1].y}
        var len=Math.sqrt(nx*nx+ny*ny)||1, px=-ny/len, py=nx/len
        u.push({x:sp[i].x+px*w,y:sp[i].y+py*w}); l.push({x:sp[i].x-px*w,y:sp[i].y-py*w})
      }
      return {u:u,l:l}
    },

    drawLeaf: function(ctx, pp) {
      if (pp.length<2) return; var lp=this.computeLeaf(pp); ctx.beginPath()
      ctx.moveTo(lp.u[0].x,lp.u[0].y); for(var i=1;i<lp.u.length;i++) ctx.lineTo(lp.u[i].x,lp.u[i].y)
      for(var i=lp.l.length-1;i>=0;i--) ctx.lineTo(lp.l[i].x,lp.l[i].y)
      ctx.closePath(); ctx.fill()
    },

    strokeLeaf: function(ctx, pp) {
      if (pp.length<2) return; var lp=this.computeLeaf(pp); ctx.beginPath()
      ctx.moveTo(lp.u[0].x,lp.u[0].y); for(var i=1;i<lp.u.length;i++) ctx.lineTo(lp.u[i].x,lp.u[i].y)
      for(var i=lp.l.length-1;i>=0;i--) ctx.lineTo(lp.l[i].x,lp.l[i].y)
      ctx.closePath(); ctx.stroke()
    },

    simplify: function(pts, md) {
      if (pts.length<2) return pts; var r=[pts[0]]
      for (var i=1;i<pts.length;i++) if(this.dist(r[r.length-1],pts[i])>=md) r.push(pts[i])
      if (r.length===1) r.push(pts[pts.length-1]); return r
    },

    dist: function(a,b) { return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)) },

    nearEdge: function(pt, m) {
      var tp=this.bigTriPoints.length ? this.bigTriPoints : this.triPoints
      var edges=[[tp[0],tp[1]],[tp[1],tp[2]],[tp[2],tp[0]]]
      for (var i=0;i<edges.length;i++) {
        var a=edges[i][0],b=edges[i][1],dx=b.x-a.x,dy=b.y-a.y,ls=dx*dx+dy*dy
        if(ls===0){if(this.dist(pt,a)<m)return true;continue}
        var t=Math.max(0,Math.min(1,((pt.x-a.x)*dx+(pt.y-a.y)*dy)/ls))
        if(this.dist(pt,{x:a.x+t*dx,y:a.y+t*dy})<m) return true
      }
      return false
    },

    onTouchStart: function(e) {
      if (this.phase !== 'cut') return
      var t = e.touches ? e.touches[0] : e
      this.isCutting = true; this.currentPath = [{x:t.x, y:t.y}]
    },

    onTouchMove: function(e) {
      if (!this.isCutting) return
      var t = e.touches ? e.touches[0] : e
      this.currentPath.push({x:t.x, y:t.y}); this.drawTriWithCuts()
    },

    onTouchEnd: function() {
      if (!this.isCutting) return; this.isCutting = false
      if (this.currentPath.length < 3 || this.cutCount >= 10) { this.currentPath = []; this.drawTriWithCuts(); return }
      var first = this.currentPath[0], last = this.currentPath[this.currentPath.length-1]
      if (!this.nearEdge(first,12) && !this.nearEdge(last,12)) { this.currentPath = []; this.drawTriWithCuts(); return }
      // 保存放大版本
      this.cuts.push(this.currentPath.slice())
      // 保存原始坐标版本
      var self = this
      var localCut = this.currentPath.map(function(pt){ return self.screenToLocal(pt) })
      this.cutsLocal.push(localCut)
      this.currentPath = []
      this.cutCount = this.cuts.length; this.drawTriWithCuts()
      if (this.onPhaseChange) this.onPhaseChange('cut', this.cutCount)
    },

    undoCut: function() {
      if (this.cuts.length>0) { this.cuts.pop(); this.cutsLocal.pop(); this.cutCount=this.cuts.length; this.drawTriWithCuts() }
      if (this.onPhaseChange) this.onPhaseChange('cut', this.cutCount)
    },
    clearCuts: function() { this.cuts=[]; this.cutsLocal=[]; this.cutCount=0; this.drawTriWithCuts(); if(this.onPhaseChange) this.onPhaseChange('cut',0) },

    unfold: function() {
      if (this.cuts.length===0) return
      this.phase = 'result'; this.drawResult()
      if (this.onPhaseChange) this.onPhaseChange('result', this.cutCount)
    },

    drawResult: function() {
      var ctx=this.ctx, cx=this.centerX, cy=this.centerY, r=this.paperSize*0.42
      ctx.clearRect(0,0,this.W,this.H)
      ctx.save(); ctx.shadowColor='rgba(0,0,0,0.2)'; ctx.shadowBlur=15; ctx.shadowOffsetY=5
      ctx.fillStyle='#D42A20'; ctx.beginPath()
      for(var i=0;i<6;i++){var a=DEG60*i-Math.PI/2;var hx=cx+r*Math.cos(a),hy=cy+r*Math.sin(a);if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy)}
      ctx.closePath(); ctx.fill(); ctx.restore()
      // 使用原始坐标的剪切数据（cutsLocal）
      var origin=this.triPoints[0]
      var localCuts=this.cutsLocal.map(function(c){return c.map(function(p){return{x:p.x-origin.x,y:p.y-origin.y}})})
      ctx.save()
      ctx.beginPath(); for(var i=0;i<6;i++){var a=DEG60*i-Math.PI/2;var hx=cx+r*Math.cos(a),hy=cy+r*Math.sin(a);if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy)}
      ctx.closePath(); ctx.clip()
      ctx.globalCompositeOperation='destination-out'
      var self=this
      for(var rot=0;rot<6;rot++) for(var mir=0;mir<2;mir++) localCuts.forEach(function(cut){
        var tc=cut.map(function(pt){var x=pt.x,y=pt.y;if(mir===1)x=-x;var a=rot*DEG60
          var rx=x*Math.cos(a)-y*Math.sin(a),ry=x*Math.sin(a)+y*Math.cos(a);return{x:rx+cx,y:ry+cy}})
        self.drawLeaf(ctx, tc)
      })
      ctx.globalCompositeOperation='source-over'; ctx.restore()
      ctx.save()
      ctx.beginPath(); for(var i=0;i<6;i++){var a=DEG60*i-Math.PI/2;var hx=cx+r*Math.cos(a),hy=cy+r*Math.sin(a);if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy)}
      ctx.closePath(); ctx.clip(); self.drawTexture(cx-r,cy-r,r*2,r*2); ctx.restore()
    },

    restart: function() {
      this.cuts=[]; this.cutsLocal=[]; this.currentPath=[]; this.phase='show'; this.cutCount=0
      this.triPoints=[]; this.bigTriPoints=[]; this.cutScale=1; this.cutOffsetX=0; this.cutOffsetY=0
      this.drawPaper()
      if(this.onPhaseChange) this.onPhaseChange('show', 0)
    },

    saveImage: function() {
      var self = this
      wx.canvasToTempFilePath({ canvas:self.canvas, fileType:'png', quality:1,
        success:function(res){ wx.saveImageToPhotosAlbum({ filePath:res.tempFilePath, success:function(){wx.showToast({title:'已保存🎉',icon:'none'})}, fail:function(){wx.showToast({title:'请允许相册权限',icon:'none'})} }) },
        fail:function(){wx.showToast({title:'保存失败',icon:'none'})}
      })
    }
  }
  return engine
}

module.exports = { create: create }
