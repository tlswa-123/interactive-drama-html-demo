// 坠落球游戏引擎 - 可嵌入任意 canvas
var TOTAL_LEVELS = 300
var VISIBLE_RINGS = 10
var GAP_ANGLE = Math.PI / 4.5   // 缺口40度
var BALL_RADIUS = 7
var RING_WIDTH = 3
var BOUNCE_SPEED = 2.0
var FALL_DURATION = 18           // 下坠动画帧数

// 颜色渐变
var COLOR_STOPS = [
  { r: 40,  g: 120, b: 255 },
  { r: 0,   g: 220, b: 255 },
  { r: 0,   g: 255, b: 160 },
  { r: 180, g: 255, b: 50  },
  { r: 255, g: 230, b: 30  },
  { r: 255, g: 160, b: 20  },
  { r: 255, g: 60,  b: 60  },
  { r: 255, g: 80,  b: 180 },
  { r: 180, g: 60,  b: 255 },
  { r: 40,  g: 120, b: 255 }
]

function lerpColor(t) {
  var total = COLOR_STOPS.length - 1
  var scaled = t * total
  var idx = Math.min(Math.floor(scaled), total - 1)
  var frac = scaled - idx
  var c1 = COLOR_STOPS[idx], c2 = COLOR_STOPS[idx + 1]
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * frac),
    g: Math.round(c1.g + (c2.g - c1.g) * frac),
    b: Math.round(c1.b + (c2.b - c1.b) * frac)
  }
}

function colorStr(c, alpha) {
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')'
}

function hexColor(c) {
  var toHex = function(v) { var s = v.toString(16); return s.length < 2 ? '0' + s : s }
  return '#' + toHex(c.r) + toHex(c.g) + toHex(c.b)
}

function create() {
  var engine = {
    canvas: null, ctx: null, W: 0, H: 0,
    centerX: 0, centerY: 0, maxRadius: 0,
    levels: [], currentLevelIndex: 0,
    ballAngle: 0, ballBounceOffset: 0, bounceDirection: 1,
    isFalling: false, fallFrame: 0,
    startTime: 0, gameRunning: false, gameWon: false,
    touchStartAngle: null, touchStartRotation: 0,
    animFrame: null,
    onUpdate: null,

    init: function(canvas, w, h) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.W = w; this.H = h
      this.centerX = w / 2; this.centerY = h / 2
      this.maxRadius = Math.min(w, h) * 0.42
      this.levels = []
      this.currentLevelIndex = 0
      this.ballAngle = 0; this.ballBounceOffset = 0; this.bounceDirection = 1
      this.isFalling = false; this.fallFrame = 0
      this.startTime = Date.now()
      this.gameRunning = true; this.gameWon = false
      for (var i = 0; i < TOTAL_LEVELS; i++) {
        this.levels.push({ gapAngle: Math.random() * Math.PI * 2, rotation: 0 })
      }
      this.startLoop()
    },

    destroy: function() {
      this.gameRunning = false
      if (this.animFrame && this.canvas) {
        this.canvas.cancelAnimationFrame(this.animFrame)
      }
    },

    startLoop: function() {
      var self = this
      var loop = function() {
        if (!self.gameRunning) return
        self.update()
        self.draw()
        self.animFrame = self.canvas.requestAnimationFrame(loop)
      }
      loop()
    },

    getRingRadius: function(ringIndex) {
      var t = ringIndex / VISIBLE_RINGS
      return this.maxRadius * (1 - t * t * 0.85)
    },

    getLevelColor: function(levelIdx) {
      var t = (levelIdx % 60) / 60
      return lerpColor(t)
    },

    update: function() {
      if (this.gameWon) return
      if (this.isFalling) {
        this.fallFrame++
        if (this.fallFrame >= FALL_DURATION) {
          this.isFalling = false; this.fallFrame = 0
          this.currentLevelIndex++
          this.ballBounceOffset = 0; this.bounceDirection = -1
          if (this.currentLevelIndex >= TOTAL_LEVELS) {
            this.gameWon = true; this.gameRunning = false; return
          }
          if (this.onUpdate) this.onUpdate(this.currentLevelIndex + 1, this.getTime())
        }
      } else {
        this.ballBounceOffset += BOUNCE_SPEED * this.bounceDirection
        if (this.ballBounceOffset > 14) { this.ballBounceOffset = 14; this.bounceDirection = -1 }
        else if (this.ballBounceOffset < -14) { this.ballBounceOffset = -14; this.bounceDirection = 1 }
        this.checkGapPass()
      }
    },

    checkGapPass: function() {
      var level = this.levels[this.currentLevelIndex]
      if (!level) return
      var effectiveGap = level.gapAngle + level.rotation
      var norm = function(a) { return ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) }
      var ballA = norm(this.ballAngle), gapA = norm(effectiveGap)
      var diff = Math.abs(ballA - gapA)
      if (diff > Math.PI) diff = Math.PI * 2 - diff
      if (diff < GAP_ANGLE / 2 && Math.abs(this.ballBounceOffset) < 5) {
        this.isFalling = true; this.fallFrame = 0
      }
    },

    draw: function() {
      var ctx = this.ctx, w = this.W, h = this.H
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h)

      var fallT = this.isFalling ? this.fallFrame / FALL_DURATION : 0
      var easedT = fallT < 0.5 ? 2 * fallT * fallT : 1 - Math.pow(-2 * fallT + 2, 2) / 2

      // 绘制圆环
      for (var i = VISIBLE_RINGS; i >= 0; i--) {
        var levelIdx
        var radius

        if (this.isFalling) {
          levelIdx = this.currentLevelIndex + i
          if (levelIdx >= TOTAL_LEVELS) continue
          var radiusCur = this.getRingRadius(i)
          var radiusNext = i > 0 ? this.getRingRadius(i - 1) : this.maxRadius * 1.4
          radius = radiusCur + (radiusNext - radiusCur) * easedT
        } else {
          levelIdx = this.currentLevelIndex + i
          if (levelIdx >= TOTAL_LEVELS) continue
          radius = this.getRingRadius(i)
        }

        if (radius <= 0 || radius > w) continue

        var level = this.levels[levelIdx]
        var themeColor = this.getLevelColor(levelIdx)

        var depthAlpha = i === 0
          ? (this.isFalling ? Math.max(0, 0.9 - easedT * 1.2) : 0.9)
          : Math.max(0.06, 0.8 * (1 - i / VISIBLE_RINGS))

        var gapCenter = level.gapAngle + level.rotation
        var gapStart = gapCenter - GAP_ANGLE / 2
        var gapEnd = gapCenter + GAP_ANGLE / 2

        ctx.beginPath(); ctx.arc(this.centerX, this.centerY, radius, gapEnd, gapStart + Math.PI * 2)
        ctx.strokeStyle = colorStr(themeColor, depthAlpha)
        ctx.lineWidth = i === 0 ? RING_WIDTH + 1.5 : Math.max(1, RING_WIDTH * (1 - i * 0.06))
        ctx.stroke()

        if (i === 0 && !this.isFalling) {
          for (var ai = 0; ai < 2; ai++) {
            var a = ai === 0 ? gapStart : gapEnd
            ctx.beginPath(); ctx.arc(this.centerX + Math.cos(a) * radius, this.centerY + Math.sin(a) * radius, 4, 0, Math.PI * 2)
            ctx.fillStyle = colorStr(themeColor, 1); ctx.fill()
          }
          ctx.beginPath(); ctx.arc(this.centerX, this.centerY, radius, gapStart, gapEnd)
          ctx.strokeStyle = colorStr(themeColor, 0.2); ctx.lineWidth = 1
          ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([])
        }
      }

      // 绘制小球
      if (!this.gameWon) {
        var themeColor2 = this.getLevelColor(this.currentLevelIndex)
        var ballDist, ballR

        if (this.isFalling) {
          var fromRadius = this.maxRadius
          var toRadiusAnimated = this.getRingRadius(1) + (this.getRingRadius(0) - this.getRingRadius(1)) * easedT
          ballDist = fromRadius + (toRadiusAnimated - fromRadius) * easedT
          ballR = BALL_RADIUS
        } else {
          ballDist = this.maxRadius + this.ballBounceOffset
          ballR = BALL_RADIUS
        }

        var bx = this.centerX + Math.cos(this.ballAngle) * ballDist
        var by = this.centerY + Math.sin(this.ballAngle) * ballDist

        ctx.beginPath(); ctx.arc(bx, by, ballR * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = colorStr(themeColor2, 0.25); ctx.fill()

        ctx.beginPath(); ctx.arc(bx, by, ballR * 2, 0, Math.PI * 2)
        ctx.fillStyle = colorStr(themeColor2, 0.15); ctx.fill()

        ctx.beginPath(); ctx.arc(bx, by, ballR, 0, Math.PI * 2)
        ctx.fillStyle = hexColor(themeColor2); ctx.fill()

        ctx.beginPath(); ctx.arc(bx - ballR * 0.3, by - ballR * 0.3, ballR * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill()
      }

      // 中心深渊
      var innerR = this.getRingRadius(VISIBLE_RINGS) * 0.8
      if (innerR > 0) {
        var ig = ctx.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, innerR * 2)
        ig.addColorStop(0, 'rgba(0,0,0,0.5)'); ig.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(this.centerX, this.centerY, innerR * 2, 0, Math.PI * 2)
        ctx.fillStyle = ig; ctx.fill()
      }
    },

    getTime: function() {
      var s = Math.floor((Date.now() - this.startTime) / 1000)
      var m = Math.floor(s / 60); s = s % 60
      return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
    },

    onTouchStart: function(e) {
      if (this.gameWon || this.isFalling) return
      var t = e.touches ? e.touches[0] : e
      var dx = t.x - this.centerX, dy = t.y - this.centerY
      this.touchStartAngle = Math.atan2(dy, dx)
      this.touchStartRotation = this.levels[this.currentLevelIndex].rotation
    },

    onTouchMove: function(e) {
      if (this.gameWon || this.isFalling || this.touchStartAngle === null) return
      var t = e.touches ? e.touches[0] : e
      var dx = t.x - this.centerX, dy = t.y - this.centerY
      var cur = Math.atan2(dy, dx)
      this.levels[this.currentLevelIndex].rotation = this.touchStartRotation + (cur - this.touchStartAngle)
    },

    onTouchEnd: function() { this.touchStartAngle = null },

    restart: function() {
      this.destroy()
      this.levels = []
      for (var i = 0; i < TOTAL_LEVELS; i++) {
        this.levels.push({ gapAngle: Math.random() * Math.PI * 2, rotation: 0 })
      }
      this.currentLevelIndex = 0; this.ballAngle = 0; this.ballBounceOffset = 0
      this.bounceDirection = 1; this.isFalling = false; this.fallFrame = 0
      this.startTime = Date.now(); this.gameRunning = true; this.gameWon = false
      this.startLoop()
      if (this.onUpdate) this.onUpdate(1, '00:00')
    }
  }
  return engine
}

module.exports = { create: create }
