(() => {
const modules = {"pages/video/index.js": function(module, exports, require) {
const { stories, getStoryById, getComments } = require('../../data/mock')
var BallEngine = require('../../games/ball')
var PapercutEngine = require('../../games/papercut')
var ParkingEngine = require('../../games/parking')

Page({
  data: {
    storyList: [],
    currentIndex: 0,
    showChoices: false,
    currentChoices: [],
    liked: {},
    collected: {},
    unlocked: {},
    foundClues: {},
    clueToast: '',
    showCommentPanel: false,
    currentComments: [],
    progressPercent: 0,
    _duration: 0,
    gameUIHidden: false,
    papercutPhase: 'show',
    statusBarHeight: 44,
    showFeedbackPanel: false,
    feedbackType: 'bug',
    feedbackText: '',
    lockScreenState: 'lock',
    lockTime: '',
    lockDate: '',
    lockScreenTime: '',
    lockBattery: 86,
    lockInputLen: 0,
    lockShaking: false,
    lockApps: [
      { name: '信息', icon: '💬', color: '#34C759' },
      { name: '相机', icon: '📷', color: '#555555' },
      { name: '照片', icon: '🌈', color: '#FFFFFF' },
      { name: '天气', icon: '🌤️', color: '#4AC4F7' },
      { name: '时钟', icon: '🕐', color: '#000000' },
      { name: '地图', icon: '🗺️', color: '#68D96B' },
      { name: '备忘录', icon: '📝', color: '#FFCC02' },
      { name: '计算器', icon: '🔢', color: '#333333' },
      { name: '设置', icon: '⚙️', color: '#8E8E93' },
      { name: 'App Store', icon: '🅰️', color: '#0A84FF' },
      { name: '音乐', icon: '🎵', color: '#FC3C44' },
      { name: '日历', icon: '📅', color: '#FF3B30' },
      { name: '钱包', icon: '💳', color: '#1C1C1E' },
      { name: '健康', icon: '❤️', color: '#FF2D55' },
      { name: '文件', icon: '📁', color: '#007AFF' },
      { name: '视频', icon: '▶️', color: '#FF5733' }
    ],
    lockDockApps: [
      { name: '电话', icon: '📞', color: '#34C759' },
      { name: 'Safari', icon: '🧭', color: '#007AFF' },
      { name: '邮件', icon: '✉️', color: '#007AFF' },
      { name: '微信', icon: '💚', color: '#07C160' }
    ],
    // 排行榜/成就弹窗
    showRankPanel: false,
    showAchievePanel: false,
    currentRankList: [],
    currentAchieveList: [],
    panelGameTitle: '',
    achieveUnlockedCount: 0,
    achieveTotalCount: 0
  },

  onLoad() {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })
    try {
      var saved = wx.getStorageSync('story_unlocked')
      if (saved) this.setData({ unlocked: saved })
    } catch(e) {}
    try {
      var c = wx.getStorageSync('story_clues')
      if (c) this.setData({ foundClues: c })
    } catch(e) {}
    try {
      var l = wx.getStorageSync('story_liked')
      if (l) this.setData({ liked: l })
    } catch(e) {}
    try {
      var col = wx.getStorageSync('story_collected')
      if (col) this.setData({ collected: col })
    } catch(e) {}
    this.initStories()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  initStories() {
    var u = this.data.unlocked || {}
    var fc = this.data.foundClues || {}
    var list = []
    for (var i = 0; i < stories.length; i++) {
      var s = stories[i]
      var choices = s.choices || []
      var unlocks = {}, shorts = {}, cnt = 0
      for (var j = 0; j < choices.length; j++) {
        var c = choices[j]
        var k = s.id + '_' + c.nextId
        var ok = !!u[k]
        unlocks[c.nextId] = ok
        if (ok) {
          cnt++
          var t = (s.endings && s.endings[c.nextId] && s.endings[c.nextId].text) || ''
          shorts[c.nextId] = t.length > 18 ? t.slice(0,18)+'...' : t || '已解锁'
        }
      }
      list.push({
        id: s.id, title: s.title, genre: s.genre, author: s.author, hint: s.hint || '互动短剧',
        avatar: s.avatar, type: 'video',
        likes: s.likes || Math.floor(Math.random()*8000)+1000,
        comments: s.comments || Math.floor(Math.random()*500),
        shares: s.shares || Math.floor(Math.random()*200),
        _vid: 'video_'+s.id,
        src: s.startVideo.src, poster: s.startVideo.poster,
        state: 'start', showChoice: false, endText: '', blackScreen: false,
        actChoices: choices.slice().map(function(c,i){ c.letter = 'ABCDEF'[i] || '?'; return c }), showTree: false,
        endings: s.endings||{}, choices: choices.slice(),
        _unlocks: unlocks, _shorts: shorts, _cnt: cnt,
        clues: (s.startVideo&&s.startVideo.clues)||[],
        foundIds: fc[s.id]||[]
      })
    }

    // 插入游戏卡片到第2、4、5、6位
    var games = [
      { id: 'game_papercut', type: 'game', gameType: 'papercut', title: '剪纸工坊', hint: '互动游戏 · 手指剪纸六折对称', genre: '创意',
        author: '剪纸大师', avatar: 'https://picsum.photos/seed/gp1/100/100',
        gamePage: '/pages/game-papercut/index', gameIcon: '✂️', gameDesc: '折叠红纸，自由剪裁，展开惊喜图案',
        likes: 5234, comments: 312, shares: 189 },
      { id: 'game_lockscreen', type: 'game', gameType: 'lockscreen', title: '密码锁挑战', hint: '互动游戏 · 破解密码解锁手机', genre: '解谜',
        author: '锁屏大师', avatar: 'https://picsum.photos/seed/lock/100/100',
        gamePage: '/pages/game-lockscreen/index', gameIcon: '🔐', gameDesc: '输入正确密码解锁手机，探索隐藏内容',
        likes: 7654, comments: 432, shares: 321 },
      { id: 'game_ball', type: 'game', gameType: 'ball', title: '坠落球', hint: '互动游戏 · 300层深渊挑战', genre: '技巧',
        author: '深渊工作室', avatar: 'https://picsum.photos/seed/gp2/100/100',
        gamePage: '/pages/game-ball/index', gameIcon: '🔵', gameDesc: '旋转圆环缺口，让小球坠入深渊',
        likes: 8912, comments: 567, shares: 234 },
      { id: 'game_parking', type: 'game', gameType: 'parking', title: '停车大挑战', hint: '互动游戏 · 同色匹配消除', genre: '策略',
        author: '停车达人', avatar: 'https://picsum.photos/seed/gp3/100/100',
        gamePage: '/pages/game-parking/index?level=1', gameIcon: '🚗', gameDesc: '点击车辆驶出，同色乘客配对上车',
        likes: 6789, comments: 423, shares: 201 }
    ]
    // 插入到位置1（第2个）、3（第4个）、5（第6个）、6（第7个）
    list.splice(1, 0, games[0])
    list.splice(3, 0, games[1])
    list.splice(5, 0, games[2])
    list.splice(6, 0, games[3])

    this.setData({ storyList:list, currentIndex:0 })
  },

  vctx(id){ return wx.createVideoContext(id,this) },

  onPlay(){
    var idx = this.data.currentIndex
    this.setData({['storyList['+idx+']._playing']: true, ['storyList['+idx+']._paused']: false})
  },

  onVideoTap(){
    var idx = this.data.currentIndex, it = this.data.storyList[idx]
    if(!it) return
    var ctx = this.vctx(it._vid)
    if(it._paused){
      ctx.play()
      this.setData({['storyList['+idx+']._paused']: false})
    } else {
      ctx.pause()
      this.setData({['storyList['+idx+']._paused']: true})
    }
  },

  onSwiperChange(e){
    var n=e.detail.current,p=this.data.currentIndex
    // 停止上一个视频
    if(p!==n&&p>=0){
      var prev=this.data.storyList[p]
      if(prev&&prev.type!=='game') try{this.vctx(prev._vid).pause()}catch(x){}
    }
    // 销毁上一个游戏
    if(this._gameEngine){this._gameEngine.destroy();this._gameEngine=null}
    // 清理锁屏timer
    if(this._lockTimer){clearInterval(this._lockTimer);this._lockTimer=null}
    this.setData({currentIndex:n,showChoices:false,gameUIHidden:false,['storyList['+n+']._playing']:false})
    for(var i=0;i<this.data.storyList.length;i++){
      this.setData({['storyList['+i+'].showTree']:false})
    }
    var self=this
    var it=self.data.storyList[n]
    if(it && it.type==='game'){
      if(it.gameType==='lockscreen'){
        self._lockInputCode = ''
        self.setData({lockScreenState:'lock',lockInputLen:0,lockShaking:false})
        self.updateLockTime()
        self._lockTimer = setInterval(function(){self.updateLockTime()},1000)
        return
      }
      // 初始化游戏canvas
      setTimeout(function(){ self.initGameCanvas(it) }, 300)
      return
    }
    setTimeout(function(){
      if(it)try{self.vctx(it._vid).play()}catch(x){}
    },200)
  },

  // ===== 游戏Canvas初始化 =====
  initGameCanvas(item){
    var self=this
    var query=wx.createSelectorQuery().in(this)
    query.select('#canvas_'+item.id).fields({node:true,size:true}).exec(function(res){
      if(!res||!res[0]||!res[0].node) return
      var canvas=res[0].node, w=res[0].width, h=res[0].height
      var dpr=wx.getWindowInfo().pixelRatio
      canvas.width=w*dpr; canvas.height=h*dpr
      var ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr)

      var engine=null
      if(item.gameType==='ball') engine=BallEngine.create()
      else if(item.gameType==='papercut') engine=PapercutEngine.create()
      else if(item.gameType==='parking') engine=ParkingEngine.create()
      if(!engine) return

      self._gameEngine=engine
      if(item.gameType==='papercut'){
        engine.onPhaseChange=function(phase){ self.setData({papercutPhase:phase}) }
      }
      engine.init(canvas, w, h)
    })
  },

  // ===== 游戏触控转发 =====
  onGameTS(e){ if(this._gameEngine) this._gameEngine.onTouchStart(e) },
  onGameTM(e){ if(this._gameEngine) this._gameEngine.onTouchMove(e) },
  onGameTE(e){ if(this._gameEngine) this._gameEngine.onTouchEnd(e) },

  // ===== 剪纸按钮 =====
  onPapercutAction(e){
    var action=e.currentTarget.dataset.action
    if(this._gameEngine&&this._gameEngine.action) this._gameEngine.action(action)
  },

  // ===== 收起/展开 =====
  onToggleGameUI(){ this.setData({gameUIHidden:!this.data.gameUIHidden}) },

  // ===== 排行榜弹窗 =====
  onGameRank(){
    var idx = this.data.currentIndex, item = this.data.storyList[idx]
    if(!item || item.type !== 'game') return
    var gt = item.gameType || ''
    var list = this._getRankData(gt)
    this.setData({
      showRankPanel: true,
      currentRankList: list,
      panelGameTitle: (item.title || '') + ' · 排行榜'
    })
  },

  _getRankData(gameType){
    // 按游戏类型返回不同的假数据
    var base = {
      parking: [
        { rank:1, name:'停车大神', avatar:'https://picsum.photos/seed/rk1/80/80', score:12890, tag:'👑' },
        { rank:2, name:'挪车高手', avatar:'https://picsum.photos/seed/rk2/80/80', score:11520, tag:'🥈' },
        { rank:3, name:'车位猎人', avatar:'https://picsum.photos/seed/rk3/80/80', score:10340, tag:'🥉' },
        { rank:4, name:'倒车入库王', avatar:'https://picsum.photos/seed/rk4/80/80', score:9680, tag:'' },
        { rank:5, name:'侧方停车帝', avatar:'https://picsum.photos/seed/rk5/80/80', score:8920, tag:'' },
        { rank:6, name:'红车克星', avatar:'https://picsum.photos/seed/rk6/80/80', score:8150, tag:'' },
        { rank:7, name:'泊车小能手', avatar:'https://picsum.photos/seed/rk7/80/80', score:7430, tag:'' },
        { rank:8, name:'挪车达人', avatar:'https://picsum.photos/seed/rk8/80/80', score:6890, tag:'' },
        { rank:9, name:'倒车练习生', avatar:'https://picsum.photos/seed/rk9/80/80', score:6210, tag:'' },
        { rank:10, name:'新手司机', avatar:'https://picsum.photos/seed/rk10/80/80', score:5540, tag:'' }
      ],
      ball: [
        { rank:1, name:'深渊行者', avatar:'https://picsum.photos/seed/bl1/80/80', score:8921, tag:'👑' },
        { rank:2, name:'旋转大师', avatar:'https://picsum.photos/seed/bl2/80/80', score:8340, tag:'🥈' },
        { rank:3, name:'圆环掌控者', avatar:'https://picsum.photos/seed/bl3/80/80', score:7650, tag:'🥉' },
        { rank:4, name:'坠落专家', avatar:'https://picsum.photos/seed/bl4/80/80', score:7020, tag:'' },
        { rank:5, name:'300层挑战者', avatar:'https://picsum.photos/seed/bl5/80/80', score:6480, tag:'' },
        { rank:6, name:'重力感应', avatar:'https://picsum.photos/seed/bl6/80/80', score:5930, tag:'' },
        { rank:7, name:'球球达人', avatar:'https://picsum.photos/seed/bl7/80/80', score:5410, tag:'' },
        { rank:8, name:'缺口猎手', avatar:'https://picsum.photos/seed/bl8/80/80', score:4870, tag:'' },
        { rank:9, name:'深渊新人', avatar:'https://picsum.photos/seed/bl9/80/80', score:4320, tag:'' },
        { rank:10, name:'初入深渊', avatar:'https://picsum.photos/seed/bl10/80/80', score:3760, tag:'' }
      ],
      papercut: [
        { rank:1, name:'剪纸大师', avatar:'https://picsum.photos/seed/pp1/80/80', score:2560, tag:'👑' },
        { rank:2, name:'折纸巧手', avatar:'https://picsum.photos/seed/pp2/80/80', score:2280, tag:'🥈' },
        { rank:3, name:'对称之美', avatar:'https://picsum.photos/seed/pp3/80/80', score:2010, tag:'🥉' },
        { rank:4, name:'六折达人', avatar:'https://picsum.photos/seed/pp4/80/80', score:1750, tag:'' },
        { rank:5, name:'图案收集者', avatar:'https://picsum.photos/seed/pp5/80/80', score:1520, tag:'' },
        { rank:6, name:'剪刀手爱德华', avatar:'https://picsum.photos/seed/pp6/80/80', score:1310, tag:'' },
        { rank:7, name:'红纸艺术家', avatar:'https://picsum.photos/seed/pp7/80/80', score:1100, tag:'' },
        { rank:8, name:'展开惊喜', avatar:'https://picsum.photos/seed/pp8/80/80', score:920, tag:'' },
        { rank:9, name:'初学剪纸', avatar:'https://picsum.photos/seed/pp9/80/80', score:750, tag:'' },
        { rank:10, name:'手残党', avatar:'https://picsum.photos/seed/pp10/80/80', score:580, tag:'' }
      ],
      lockscreen: [
        { rank:1, name:'密码破解者', avatar:'https://picsum.photos/seed/lk1/80/80', score:99, tag:'👑' },
        { rank:2, name:'锁屏速通', avatar:'https://picsum.photos/seed/lk2/80/80', score:87, tag:'🥈' },
        { rank:3, name:'数字记忆王', avatar:'https://picsum.photos/seed/lk3/80/80', score:76, tag:'🥉' },
        { rank:4, name:'手机解锁员', avatar:'https://picsum.photos/seed/lk4/80/80', score:65, tag:'' },
        { rank:5, name:'猜码高手', avatar:'https://picsum.photos/seed/lk5/80/80', score:54, tag:'' },
        { rank:6, name:'安全研究员', avatar:'https://picsum.photos/seed/lk6/80/80', score:45, tag:'' },
        { rank:7, name:'密码爱好者', avatar:'https://picsum.photos/seed/lk7/80/80', score:38, tag:'' },
        { rank:8, name:'尝试中...', avatar:'https://picsum.photos/seed/lk8/80/80', score:29, tag:'' },
        { rank:9, name:'忘记密码', avatar:'https://picsum.photos/seed/lk9/80/80', score:21, tag:'' },
        { rank:10, name:'新手上路', avatar:'https://picsum.photos/seed/lk10/80/80', score:12, tag:'' }
      ]
    }
    return base[gameType] || base.parking
  },

  onCloseRank(){
    this.setData({ showRankPanel: false })
  },

  // ===== 成就弹窗 =====
  onGameTrophy(){
    var idx = this.data.currentIndex, item = this.data.storyList[idx]
    if(!item || item.type !== 'game') return
    var gt = item.gameType || ''
    var list = this._getAchieveData(gt)
    var unlocked = 0
    for(var i=0;i<list.length;i++){ if(list[i].unlocked) unlocked++ }
    this.setData({
      showAchievePanel: true,
      currentAchieveList: list,
      panelGameTitle: (item.title || '') + ' · 成就',
      achieveUnlockedCount: unlocked,
      achieveTotalCount: list.length
    })
  },

  _getAchieveData(gameType){
    var base = {
      parking: [
        { icon:'🚗', name:'初次上路', desc:'完成第1关', unlocked:true },
        { icon:'🅿️', name:'完美停车', desc:'连续3关无错误', unlocked:true },
        { icon:'🏎️', name:'赛车手', desc:'单关用时<30秒', unlocked:false },
        { icon:'🔴', name:'红色风暴', desc:'移出所有红色车辆', unlocked:true },
        { icon:'🎯', name:'精准操作', desc:'总点击数<100完成一关', unlocked:false },
        { icon:'⭐', name:'五星通关', desc:'获得5星评价', unlocked:false },
        { icon:'🔄', name:'再来一次', desc:'同一关卡重试5次后通过', unlocked:true },
        { icon:'💎', name:'钻石玩家', desc:'累计通关50关', unlocked:false },
        { icon:'🌟', name:'全色消除', desc:'一局内消除所有颜色车辆', unlocked:false },
        { icon:'👑', name:'停车之王', desc:'登上排行榜第1名', unlocked:false }
      ],
      ball: [
        { icon:'🔵', name:'初次坠落', desc:'通过第1层', unlocked:true },
        { icon:'⚡', name:'闪电反应', desc:'0.5秒内穿过圆环', unlocked:true },
        { icon:'🌀', name:'旋转大师', desc:'连续穿过20个圆环', unlocked:false },
        { icon:'🕳️', name:'深渊探索', desc:'到达第150层', unlocked:false },
        { icon:'💫', name:'零失误', desc:'连续50层未撞壁', unlocked:false },
        { icon:'🎪', name:'杂技演员', desc:'单局穿过200个环', unlocked:false },
        { icon:'🔥', name:'连击狂魔', desc:'10秒内穿过15个环', unlocked:true },
        { icon:'🌊', name:'深潜者', desc:'到达第250层', unlocked:false },
        { icon:'💎', name:'钻石坠落', desc:'单局得分>8000', unlocked:false },
        { icon:'👑', name:'深渊之王', desc:'登上排行榜第1名', unlocked:false }
      ],
      papercut: [
        { icon:'✂️', name:'第一剪', desc:'完成首次剪纸', unlocked:true },
        { icon:'🐉', name:'龙图腾', desc:'剪出中国龙图案', unlocked:false },
        { icon:'🦋', name:'蝴蝶效应', desc:'剪出蝴蝶图案', unlocked:true },
        { icon:'❄️', name:'雪花纷飞', desc:'剪出雪花图案', unlocked:false },
        { icon:'🏮', name:'新春快乐', desc:'剪出灯笼图案', unlocked:true },
        { icon:'🌸', name:'樱花季', desc:'剪出樱花图案', unlocked:false },
        { icon:'📐', name:'几何大师', desc:'收集10种不同图案', unlocked:true },
        { icon:'🎨', name:'艺术天赋', desc:'保存5幅作品', unlocked:false },
        { icon:'♻️', name:'百折不挠', desc:'撤销后重新剪裁成功', unlocked:true },
        { icon:'👑', name:'剪纸宗师', desc:'收集全部图案', unlocked:false }
      ],
      lockscreen: [
        { icon:'🔐', name:'初次解锁', desc:'成功输入正确密码', unlocked:true },
        { icon:'⌨️', name:'盲打高手', desc:'不看键盘输入正确密码', unlocked:false },
        { icon:'🧠', name:'过目不忘', desc:'记住并输入提示数字', unlocked:false },
        { icon:'⏱️', name:'极速破解', desc:'10秒内解锁成功', unlocked:true },
        { icon:'🔓', name:'万能钥匙', desc:'尝试所有组合后成功', unlocked:false },
        { icon:'🛡️', name:'安全卫士', desc:'连续3次拒绝错误密码', unlocked:false },
        { icon:'📱', name:'手机主人', desc:'进入主屏幕', unlocked:true },
        { icon:'🕵️', name:'侦探模式', desc:'查看锁屏提示信息', unlocked:false },
        { icon:'😈', name:'恶作剧', desc:'故意输错5次密码', unlocked:false },
        { icon:'👑', name:'黑客帝国', desc:'最快速度解锁', unlocked:false }
      ]
    }
    return base[gameType] || base.parking
  },

  onCloseAchieve(){
    this.setData({ showAchievePanel: false })
  },
  onGameRoute(){
    var idx = this.data.currentIndex
    var item = this.data.storyList[idx]
    if(item && item.type === 'game') {
      // 跳转到创作页并传递游戏ID
      wx.switchTab({ url: '/pages/create/index' })
      // switchTab 不支持传参，用 globalData 中转
      var app = getApp()
      app.globalData = app.globalData || {}
      app.globalData.fromGame = {
        id: item.id,
        gameType: item.gameType,
        title: item.title,
        author: item.author,
        avatar: item.avatar,
        genre: item.genre,
        gameIcon: item.gameIcon,
        gameDesc: item.gameDesc,
        likes: item.likes,
        comments: item.comments
      }
    }
  },
  onGoGamePage(e){ var page=e.currentTarget.dataset.page; if(page) wx.navigateTo({url:page}) },

  // ===== 锁屏游戏内嵌逻辑 =====
  updateLockTime(){
    var now=new Date()
    var h=String(now.getHours()).padStart(2,'0')
    var m=String(now.getMinutes()).padStart(2,'0')
    var weekDays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    this.setData({
      lockTime:h+':'+m,
      lockDate:(now.getMonth()+1)+'月'+now.getDate()+'日 '+weekDays[now.getDay()],
      lockScreenTime:h+':'+m
    })
  },
  onLockTap(){
    this._lockInputCode=''
    this.setData({lockScreenState:'passcode',lockInputLen:0,lockShaking:false})
  },
  pressKey(e){
    if(this.data.lockShaking) return
    var num=e.currentTarget.dataset.num
    this._lockInputCode=(this._lockInputCode||'')+num
    var len=this._lockInputCode.length
    this.setData({lockInputLen:len})
    wx.vibrateShort({type:'light'}).catch(function(){})
    if(len===4){
      var self=this
      setTimeout(function(){self.checkLockCode()},200)
    }
  },
  deleteKey(){
    if(!this._lockInputCode) return
    this._lockInputCode=this._lockInputCode.slice(0,-1)
    this.setData({lockInputLen:this._lockInputCode.length})
  },
  checkLockCode(){
    if(this._lockInputCode==='8010'){
      wx.vibrateShort({type:'medium'}).catch(function(){})
      this.setData({lockScreenState:'home'})
    } else {
      wx.vibrateLong().catch(function(){})
      this.setData({lockShaking:true})
      var self=this
      setTimeout(function(){
        self._lockInputCode=''
        self.setData({lockShaking:false,lockInputLen:0})
      },600)
    }
  },
  cancelPasscode(){
    this._lockInputCode=''
    this.setData({lockScreenState:'lock',lockInputLen:0,lockShaking:false})
  },

  onUnload(){
    if(this._lockTimer){clearInterval(this._lockTimer);this._lockTimer=null}
  },

  onEnded(e){
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    if(!it||it.state!=='start'||!it.actChoices||!it.actChoices.length)return
    this.setData({['storyList['+idx+'].showChoice']:true,showChoices:true,currentChoices:it.actChoices})
  },

  onChoiceTap(e){
    var cid=e.currentTarget.dataset.choiceid
    if(!cid)return
    if(cid==='restart'){this.restart();return}
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    if(!it)return
    var choice=null
    for(var i=0;i<it.actChoices.length;i++){
      if(it.actChoices[i].id===cid){choice=it.actChoices[i];break}
    }
    if(!choice)return
    var story=getStoryById(it.id)
    if(!story||!story.endings)return
    var ed=story.endings[choice.nextId]
    if(!ed)return
    var uk=it.id+'_'+choice.nextId
    var ul={}
    var old=this.data.unlocked
    for(var k in old)ul[k]=old[k]
    ul[uk]=true
    try{wx.setStorageSync('story_unlocked',ul)}catch(x){}
    this.setData({showChoices:false})
    var u={}
    u['storyList['+idx+'].showChoice']=false
    u['storyList['+idx+'].state']='ending'
    u['storyList['+idx+'].endText']=ed.text
    u['storyList['+idx+'].src']=ed.src
    u['storyList['+idx+'].poster']=ed.poster
    u['storyList['+idx+'].blackScreen']=!!ed.blackScreen
    u.unlocked=ul
    this.setData(u)
    if(ed.blackScreen){
      // 黑屏结局，暂停视频
      try{this.vctx(it._vid).pause()}catch(x){}
      return
    }
    var self=this,it2=it
    setTimeout(function(){var ctx=self.vctx(it2._vid);if(ctx){ctx.seek(0);setTimeout(function(){ctx.play()},100)}},300)
  },

  restart(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    if(!it)return
    var s=getStoryById(it.id);if(!s)return
    var u={}
    u['storyList['+idx+'].state']='start'
    u['storyList['+idx+'].showChoice']=false
    u['storyList['+idx+'].showTree']=false
    u['storyList['+idx+'].endText']=''
    u['storyList['+idx+'].blackScreen']=false
    u['storyList['+idx+'].src']=s.startVideo.src
    u['storyList['+idx+'].poster']=s.startVideo.poster
    u['storyList['+idx+'].actChoices']=(s.choices||[]).map(function(c,i){ c.letter = 'ABCDEF'[i] || '?'; return c })
    this.setData(u);this.setData({showChoices:false})
    var self=this,it2=it
    setTimeout(function(){var ctx=self.vctx(it2._vid);if(ctx){ctx.seek(0);ctx.play()}},200)
  },

  onToggleTree(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx];if(!it)return
    var ns=!it.showTree
    // 调试：清空线索缓存
    if(ns){try{wx.removeStorageSync('story_clues')}catch(e){}}
    this.setData({['storyList['+idx+'].showTree']:ns})
    if(ns)try{this.vctx(it._vid).pause()}catch(x){}
  },

  onBranchTap(e){
    var nid=e.currentTarget.dataset.nextid;if(!nid)return
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    var s=getStoryById(it.id);if(!s||!s.endings)return
    var ed=s.endings[nid];if(!ed)return
    if(!(this.data.unlocked&&this.data.unlocked[it.id+'_'+nid])){
      wx.showToast({title:'请先完成该选项的剧情',icon:'none',duration:1500});return
    }
    var u={}
    u['storyList['+idx+'].showTree']=false
    u['storyList['+idx+'].showChoice']=false
    u['storyList['+idx+'].state']='ending'
    u['storyList['+idx+'].endText']=ed.text
    u['storyList['+idx+'].src']=ed.src
    u['storyList['+idx+'].poster']=ed.poster
    this.setData(u)
    var self=this,it2=it
    setTimeout(function(){var ctx=self.vctx(it2._vid);if(ctx){ctx.seek(0);setTimeout(function(){ctx.play()},100)}},200)
  },

  onCloseTree(){
    var idx=this.data.currentIndex
    this.setData({['storyList['+idx+'].showTree']:false})
    var it=this.data.storyList[idx]
    if(it){var self=this;setTimeout(function(){try{self.vctx(it._vid).play()}catch(x){}},100)}
  },

  // ===== 线索：用bindtimeupdate驱动 =====
  onTimeUpdate(e){
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    if(!it)return
    var ct=e.detail.currentTime
    var dur=e.detail.duration
    // 更新进度条
    if(dur>0){
      this._duration=dur
      var pct=Math.min(100, (ct/dur)*100)
      this.setData({progressPercent: pct})
    }
    // 线索逻辑
    if(it.state!=='start')return
    var clues=it.clues
    if(!clues||!clues.length)return
    var active=[]
    for(var i=0;i<clues.length;i++){
      var cl=clues[i]
      if(Math.abs(ct-cl.time)<=2.5){
        var fid=it.foundIds||[],has=false
        for(var f=0;f<fid.length;f++){if(fid[f]===cl.id){has=true;break}}
        if(!has)active.push(cl.id)
      }
    }
    this.setClueData(active)
  },

  setClueData(ids){
    this._activeClueIds=ids
    var updates={}
    // 映射线索ID到简单的cover-view显示字段
    updates['_clueShow_c1']=false
    updates['_clueShow_c2']=false
    for(var i=0;i<ids.length;i++){
      if(ids[i]==='clue_1_1')updates['_clueShow_c1']=true
      if(ids[i]==='clue_1_2')updates['_clueShow_c2']=true
    }
    this.setData(updates)
  },

  onClueTap(e){
    var cid=e.currentTarget.dataset.clueid
    // DEBUG：测试按钮
    if(cid==='c1'){
      wx.showToast({title:'✨ 找到线索1：龙宫守门兽左眼闪烁金光',icon:'none',duration:2500})
      // 记录已找到
      var idx=this.data.currentIndex,it=this.data.storyList[idx]
      if(it){var fc={},old=this.data.foundClues;for(var k in old)fc[k]=old[k]
      if(!fc[it.id])fc[it.id]=[];fc[it.id].push('clue_1_1')
      try{wx.setStorageSync('story_clues',fc)}catch(x){}
      this.setData({['storyList['+idx+'].foundIds']:fc[it.id]||[],foundClues:fc,_clueShow_c1:false});}
      return
    }
    if(cid==='c2'){
      wx.showToast({title:'✨ 找到线索2：深渊入口刻着古老封印符文',icon:'none',duration:2500})
      var idx=this.data.currentIndex,it=this.data.storyList[idx]
      if(it){var fc={},old=this.data.foundClues;for(var k in old)fc[k]=old[k]
      if(!fc[it.id])fc[it.id]=[];fc[it.id].push('clue_1_2')
      try{wx.setStorageSync('story_clues',fc)}catch(x){}
      this.setData({['storyList['+idx+'].foundIds']:fc[it.id]||[],foundClues:fc,_clueShow_c2:false});}
      return
    }
    if(!it||!it.clues)return
    var cd=null
    for(var i=0;i<it.clues.length;i++){if(it.clues[i].id===cid){cd=it.clues[i];break}}
    if(!cd)return

    // 存储已找到
    var fc={}
    var old=this.data.foundClues
    for(var k in old)fc[k]=old[k]
    if(!fc[it.id])fc[it.id]=[]
    var has=false
    for(var j=0;j<fc[it.id].length;j++){if(fc[it.id][j]===cid){has=true;break}}
    if(!has)fc[it.id].push(cid)
    try{wx.setStorageSync('story_clues',fc)}catch(ex){}

    // 更新UI
    var u={}
    u['storyList['+idx+'].foundIds']=fc[it.id]||[]
    u.foundClues=fc
    u['_clueShow_'+cid]=false
    u.clueToast=cd.text
    this.setData(u)

    wx.showToast({title:cd.text,icon:'none',duration:2500})
    var self=this
    setTimeout(function(){self.setData({clueToast:''})},2600)
  },

  onLikeTap(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx];if(!it)return
    var l={},old=this.data.liked
    for(var k in old)l[k]=old[k]
    l[it.id]=!l[it.id];this.setData({liked:l})
    try{wx.setStorageSync('story_liked',l)}catch(x){}
  },

  onCollectTap(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx];if(!it)return
    var c={},old=this.data.collected
    for(var k in old)c[k]=old[k]
    c[it.id]=!c[it.id];this.setData({collected:c})
    try{wx.setStorageSync('story_collected',c)}catch(x){}
    wx.showToast({title:c[it.id]?'已收藏':'取消收藏',icon:'none',duration:1000})
  },

  onShareTap(){
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    wx.showToast({title:'点击右上角分享',icon:'none',duration:1500})
  },

  onShareAppMessage(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    return {
      title: it ? it.title + ' - ' + it.author : '来玩互动游戏',
      path: '/pages/video/index'
    }
  },

  onFeedbackTap(){
    this.setData({ showFeedbackPanel: true, feedbackType: 'bug', feedbackText: '' })
  },

  onCloseFeedback(){
    this.setData({ showFeedbackPanel: false })
  },

  onFeedbackTypeTap(e){
    this.setData({ feedbackType: e.currentTarget.dataset.type })
  },

  onFeedbackInput(e){
    this.setData({ feedbackText: e.detail.value })
  },

  onSubmitFeedback(){
    if(!this.data.feedbackText.trim()){
      wx.showToast({title:'请输入内容',icon:'none'})
      return
    }
    // 模拟提交
    wx.showToast({title:'感谢反馈！',icon:'success',duration:1500})
    this.setData({ showFeedbackPanel: false, feedbackText: '' })
  },

  onCommentTap(){
    var idx=this.data.currentIndex,it=this.data.storyList[idx];if(!it)return
    var comments = getComments(it.id, 10)
    this.setData({ showCommentPanel: true, currentComments: comments })
    try{this.vctx(it._vid).pause()}catch(x){}
  },

  onCloseComments(){
    this.setData({ showCommentPanel: false })
    var idx=this.data.currentIndex,it=this.data.storyList[idx]
    if(it){var self=this;setTimeout(function(){try{self.vctx(it._vid).play()}catch(x){}},100)}
  },

  onProgressTouchStart(e){
    this._dragging = true
  },

  onProgressDrag(e){
    if(!this._dragging) return
    var touch = e.touches[0]
    var info = wx.getSystemInfoSync()
    var pct = Math.max(0, Math.min(100, (touch.clientX / info.windowWidth) * 100))
    this.setData({ progressPercent: pct })
  },

  onProgressTouchEnd(e){
    this._dragging = false
    var touch = e.changedTouches[0]
    var info = wx.getSystemInfoSync()
    var pct = Math.max(0, Math.min(100, (touch.clientX / info.windowWidth) * 100))
    var dur = this._duration || 0
    if(dur > 0){
      var seekTo = (pct / 100) * dur
      var idx = this.data.currentIndex, it = this.data.storyList[idx]
      if(it){
        try{ this.vctx(it._vid).seek(seekTo) }catch(x){}
      }
      this.setData({ progressPercent: pct })
    }
  }
})

},
"data/mock.js": function(module, exports, require) {
// AI互动视频平台 - 模拟数据

// ==================== 云存储视频链接 ====================
var V1 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door1.mp4'
var V2 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door2.mp4'
var V3 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door3.mp4'
var V4 = 'https://raw.githubusercontent.com/tlswa-123/video/main/v4.mp4?v=4'
var V5 = 'https://raw.githubusercontent.com/tlswa-123/video/main/v5.mp4?v=4'
// 红果视频（等用户提供新链接后替换，暂时用占位）
var HG1 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E5%B8%A6%E7%9D%80%E8%B6%85%E7%BA%A7%E5%95%86%E5%9C%BA%E9%80%9B%E5%8F%A4%E4%BB%A3_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG2 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E9%87%91%E7%89%8C%E5%BE%A1%E5%8C%BB_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG3 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E5%BF%B5%E5%BF%B5%E6%9C%89%E8%AF%8D_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG4 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E8%8F%A9%E6%8F%90%E4%B8%B4%E4%B8%96%E7%9C%9F%E4%BA%BAAI%E7%89%88_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG5 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E6%88%91%E6%98%AF%E5%8F%B8%E4%BB%A4%E5%8D%83%E9%87%91_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG6 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E4%B8%80%E5%93%81%E5%B8%83%E8%A1%A3_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG7 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E7%9C%9F%E5%8D%83%E9%87%91%E5%A5%B9%E6%98%AF%E5%AD%A6%E9%9C%B8_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG8 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E6%A0%80%E6%A0%80%E5%B1%BF%E5%A9%9A_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG9 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E8%87%AA%E5%BE%8B%E8%AE%A9%E4%BD%A0%E8%87%AA%E7%94%B1%EF%BC%8C%E6%B2%A1%E8%AE%A9%E4%BD%A0%E7%BE%8E%E5%A5%B3%E8%87%AA%E7%94%B1_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'

// ==================== 假评论池 ====================
var commentPool = [
  { user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', text: '太好看了！求更新', time: '2小时前' },
  { user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', text: '熬夜看完了，根本停不下来', time: '3小时前' },
  { user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', text: '画面好美，bgm绝了', time: '5小时前' },
  { user: '吃瓜群众', avatar: 'https://picsum.photos/seed/u4/100/100', text: '这个反转我没想到啊！！', time: '6小时前' },
  { user: '路人甲', avatar: 'https://picsum.photos/seed/u5/100/100', text: '朋友推荐来的，没失望', time: '8小时前' },
  { user: '剧本杀爱好者', avatar: 'https://picsum.photos/seed/u6/100/100', text: '互动剧本太有意思了', time: '10小时前' },
  { user: '小仙女', avatar: 'https://picsum.photos/seed/u7/100/100', text: '选错了结局好虐', time: '12小时前' },
  { user: '大叔也追剧', avatar: 'https://picsum.photos/seed/u8/100/100', text: '制作精良，支持国产', time: '1天前' },
  { user: '柠檬茶', avatar: 'https://picsum.photos/seed/u9/100/100', text: '已经二刷了，不同选择不同结局好棒', time: '1天前' },
  { user: '暴走萝莉', avatar: 'https://picsum.photos/seed/u10/100/100', text: '为什么这么短！不够看！', time: '1天前' },
  { user: '佛系青年', avatar: 'https://picsum.photos/seed/u11/100/100', text: '随缘选了b，结局意外地好', time: '2天前' },
  { user: '颜值控', avatar: 'https://picsum.photos/seed/u12/100/100', text: '演员好好看啊救命', time: '2天前' },
  { user: '编剧志愿者', avatar: 'https://picsum.photos/seed/u13/100/100', text: '剧情设计得很巧妙', time: '2天前' },
  { user: '深夜食堂', avatar: 'https://picsum.photos/seed/u14/100/100', text: '边吃宵夜边看，完美', time: '3天前' },
  { user: '学生党', avatar: 'https://picsum.photos/seed/u15/100/100', text: '下课偷偷看的哈哈', time: '3天前' },
  { user: '文艺范', avatar: 'https://picsum.photos/seed/u16/100/100', text: '镜头语言很有质感', time: '3天前' },
  { user: '搞笑达人', avatar: 'https://picsum.photos/seed/u17/100/100', text: 'c选项笑死我了哈哈哈', time: '4天前' },
  { user: '甜党', avatar: 'https://picsum.photos/seed/u18/100/100', text: '好甜好甜！磕到了！', time: '4天前' }
]

function getComments(storyId, count) {
  var seed = 0
  for (var i = 0; i < storyId.length; i++) seed += storyId.charCodeAt(i)
  var result = []
  for (var j = 0; j < count; j++) {
    var idx = (seed + j * 7) % commentPool.length
    var c = commentPool[idx]
    result.push({ id: storyId + '_c' + j, user: c.user, avatar: c.avatar, text: c.text, time: c.time, likes: Math.floor(Math.random() * 500) + 10 })
  }
  return result
}

// ==================== 封面用 picsum（网络图片，避免本地路径报错） ====================
function cover(seed) {
  var m = {
    's003': '/assets/covers/s003.jpg',
    's003p': '/assets/covers/s003.jpg',
    's002': '/assets/covers/s002.jpg',
    's002p': '/assets/covers/s002.jpg',
    'end2a': '/assets/covers/end2a.jpg',
    'end3a': '/assets/covers/end3a.jpg',
    'end3b': '/assets/covers/end3b.jpg',
    's004': '/assets/covers/带着超级商场逛古代_30秒预览.jpg',
    's004p': '/assets/covers/带着超级商场逛古代_30秒预览.jpg',
    's005': '/assets/covers/金牌御医_mid.jpg',
    's005p': '/assets/covers/金牌御医_mid.jpg',
    's006': '/assets/covers/念念有词_30秒预览.jpg',
    's006p': '/assets/covers/念念有词_30秒预览.jpg',
    's007': '/assets/covers/菩提临世真人AI版_30秒预览.jpg',
    's007p': '/assets/covers/菩提临世真人AI版_30秒预览.jpg',
    's008': '/assets/covers/我是司令千金_30秒预览.jpg',
    's008p': '/assets/covers/我是司令千金_30秒预览.jpg',
    's009': '/assets/covers/一品布衣_mid.jpg',
    's009p': '/assets/covers/一品布衣_mid.jpg',
    's010': '/assets/covers/真千金她是学霸_30秒预览.jpg',
    's010p': '/assets/covers/真千金她是学霸_30秒预览.jpg',
    's011': '/assets/covers/栀栀屿婚_30秒预览.jpg',
    's011p': '/assets/covers/栀栀屿婚_30秒预览.jpg',
    's012': '/assets/covers/自律让你自由，没让你美女自由_30秒预览.jpg',
    's012p': '/assets/covers/自律让你自由，没让你美女自由_30秒预览.jpg',
  }
  return m[seed] || '/assets/covers/s003.jpg'
}

// ==================== 剧情定义 ====================
var stories = [
  {
    id: 's003',
    title: '密室逃脱：你能活几集？', hint: '互动短剧 · 两扇门，一个活一个死', genre: '悬疑',
    cover: cover('s003'),
    author: '剧有好戏', avatar: 'https://picsum.photos/seed/av3/100/100',
    desc: '醒来发现自己被困密室，两扇门背后截然不同的命运...',
    likes: 6453, comments: 423, shares: 156,
    startVideo: { id: 'v003', src: V1, poster: cover('s003p'), duration: 25 },
    choices: [
      { id: 'c3a', text: '打开第一扇门', nextId: 'v003_a', color: '#F97316' },
      { id: 'c3b', text: '打开第二扇门', nextId: 'v003_b', color: '#EC4899' }
    ],
    endings: {
      v003_a: { src: V2, poster: cover('end3a'), text: '你推开了第一扇门...' },
      v003_b: { src: V3, poster: cover('end3b'), text: '你推开了第二扇门...' }
    }
  },
  {
    id: 's002',
    title: '宫女逆袭：一个选择改变命运', hint: '互动短剧 · 进入后宫你如何生存？', genre: '古风',
    cover: cover('s002'),
    author: '古韵坊', avatar: 'https://picsum.photos/seed/av2/100/100',
    desc: '一个小宫女的命运，全在你一念之间',
    likes: 8721, comments: 567, shares: 234,
    startVideo: { id: 'v002', src: V4, poster: cover('s002p'), duration: 30,
      clues: [
        { id: 'clue_1_1', time: 5, text: '找到线索1：龙宫的守门兽左眼闪烁着金光', x: 20, y: 30, icon: '💎' },
        { id: 'clue_1_2', time: 8, text: '找到线索2：深渊入口处刻着古老的封印符文', x: 70, y: 60, icon: '🔮' }
      ]
    },
    choices: [
      { id: 'c2a', text: '用身体挡住水洼，让贵妃踩着自己过去', nextId: 'v002_a', color: '#F97316' },
      { id: 'c2b', text: '什么都不做', nextId: 'v002_b', color: '#8B7355' },
      { id: 'c2c', text: '破口大骂贵妃', nextId: 'v002_c', color: '#DC2626' }
    ],
    endings: {
      v002_a: { src: V5, poster: cover('end2a'), text: '贵妃对你刮目相看，你从此平步青云...' },
      v002_b: { src: '', poster: '', text: '你默默无闻地继续当侍女', blackScreen: true },
      v002_c: { src: '', poster: '', text: '贵妃赐你一丈红', blackScreen: true }
    }
  },
  {
    id: 's004', title: '穿越带着超市逛古代，你会怎么做？', hint: '互动短剧 · 古人第一次见到方便面', genre: '古风',
    cover: cover('s004'), author: '穿越频道', avatar: 'https://picsum.photos/seed/av4/100/100',
    desc: '带着超市穿越古代，古人看到薯片会怎样？',
    likes: 7832, comments: 489, shares: 201,
    startVideo: { id: 'v004', src: HG1, poster: cover('s004p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's005', title: '穿越成金牌御医，你能活到第几集？', hint: '互动短剧 · 皇上驾崩了你怎么办？', genre: '古风',
    cover: cover('s005'), author: '御医当道', avatar: 'https://picsum.photos/seed/av5/100/100',
    desc: '穿越成御医第一天，皇上就生病了...',
    likes: 4567, comments: 234, shares: 98,
    startVideo: { id: 'v005', src: HG2, poster: cover('s005p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's006', title: '念念有词：每句话都是命运转折', hint: '互动短剧 · 说错一句话就万劫不复', genre: '言情',
    cover: cover('s006'), author: '念念剧场', avatar: 'https://picsum.photos/seed/av6/100/100',
    desc: '每一句话都可能改变结局，你敢选吗？',
    likes: 9123, comments: 678, shares: 345,
    startVideo: { id: 'v006', src: HG3, poster: cover('s006p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's007', title: '菩提临世：你的修行从这里开始', hint: '互动短剧 · 菩提问你三个问题', genre: '仙侠',
    cover: cover('s007'), author: '神话新编', avatar: 'https://picsum.photos/seed/av7/100/100',
    desc: '如果菩提祖师活在现代，他会怎么收徒？',
    likes: 12456, comments: 891, shares: 567,
    startVideo: { id: 'v007', src: HG4, poster: cover('s007p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's008', title: '隐藏身份入伍，司令千金的选择', hint: '互动短剧 · 教官发现你身份后...', genre: '都市',
    cover: cover('s008'), author: '军旅甜宠', avatar: 'https://picsum.photos/seed/av8/100/100',
    desc: '千金小姐隐瞒身份参军，被教官发现后...',
    likes: 6789, comments: 345, shares: 123,
    startVideo: { id: 'v008', src: HG5, poster: cover('s008p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's009', title: '布衣逆袭：从乞丐到一品大员', hint: '互动短剧 · 一无所有你如何翻盘？', genre: '古风',
    cover: cover('s009'), author: '权谋天下', avatar: 'https://picsum.photos/seed/av9/100/100',
    desc: '从街头乞丐到一品大员，每一步都是生死抉择',
    likes: 5432, comments: 267, shares: 145,
    startVideo: { id: 'v009', src: HG6, poster: cover('s009p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's010', title: '被顶替的真千金回归，全员跪了', hint: '互动短剧 · 回归豪门第一天你怎么做？', genre: '都市',
    cover: cover('s010'), author: '豪门传奇', avatar: 'https://picsum.photos/seed/av10/100/100',
    desc: '被调包18年的真千金回归，假千金慌了',
    likes: 8901, comments: 543, shares: 278,
    startVideo: { id: 'v010', src: HG7, poster: cover('s010p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's011', title: '契约婚姻：总裁他假戏真做了', hint: '互动短剧 · 签完合同的第一晚...', genre: '言情',
    cover: cover('s011'), author: '甜蜜剧场', avatar: 'https://picsum.photos/seed/av11/100/100',
    desc: '本以为是契约婚姻，没想到总裁动了真心',
    likes: 7654, comments: 456, shares: 189,
    startVideo: { id: 'v011', src: HG8, poster: cover('s011p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's012', title: '当健身遇上美女，你还能自律吗？', hint: '互动短剧 · 美女向你搭讪你怎么选？', genre: '都市',
    cover: cover('s012'), author: '爆笑日常', avatar: 'https://picsum.photos/seed/av12/100/100',
    desc: '自律博主遇到健身房美女，人设当场崩塌',
    likes: 3456, comments: 198, shares: 87,
    startVideo: { id: 'v012', src: HG9, poster: cover('s012p'), duration: 30 },
    choices: [], endings: {}
  }
]

// ==================== 分类 ====================
var categories = ['推荐', '古风', '言情', '仙侠', '悬疑', '都市']

// ==================== 帖子列表 ====================
function formatLikes(n) { return n > 9999 ? (n / 10000).toFixed(1) + 'w' : String(n) }

// 自荐语映射（部分帖子有）— 必须在 feedData 前定义
var _selfRecMap = {
  's002': '虐到肝疼必看！',
  's004': '笑到停不下来',
  's006': '台词封神了',
  's007': '三问定命运',
  's010': '全程高能反转'
}

var feedData = stories.map(function(s) {
  return {
    id: 'p_' + s.id, type: 'video', title: s.title, cover: s.cover,
    author: s.author, avatar: s.avatar,
    likes: s.likes || 1000, likeText: formatLikes(s.likes || 1000),
    videoId: s.startVideo.id, storyId: s.id, genre: s.genre,
    comments: s.comments || 0, shares: s.shares || 0,
    selfRec: _selfRecMap[s.id] || ''
  }
})

// ==================== 论坛帖子 ====================
var forumCategories = ['游戏讨论', '短剧讨论', '综合交流', '求助问答']

var forumPosts = [
  { id: 'f001', title: '停车游戏第5关怎么过啊？求教大佬', content: '卡在第五关了，那个红车怎么都出不来，有没有通关攻略？', author: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', category: '游戏讨论', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 45, comments: 12, createTime: '2小时前', isHot: false },
  { id: 'f002', title: '剪纸工坊隐藏图案解锁方法', content: '我发现连续剪对10个图案后会解锁一个隐藏的中国龙图案，有人知道吗？', author: '剪纸大师', avatar: 'https://picsum.photos/seed/f2/100/100', category: '游戏讨论', tags: ['g_papercut'], images: [], cover: '/assets/game-covers/papercut.png', likes: 128, comments: 34, createTime: '5小时前', isHot: true },
  { id: 'f003', title: '坠落球最高分记录挑战', content: '目前最高打到8921分，有人比我高吗？来挑战一下！', author: '深渊行者', avatar: 'https://picsum.photos/seed/f3/100/100', category: '游戏讨论', tags: ['g_ball'], images: [], cover: '/assets/game-covers/ball.png', likes: 89, comments: 56, createTime: '8小时前', isHot: true },
  { id: 'f004', title: '宫女逆袭哪个结局最好哭？', content: '我选了B结局，贵妃赐我一丈红那段真的泪目了，你们呢？', author: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', category: '短剧讨论', tags: ['s002'], images: [], cover: '/assets/covers/s002.jpg', likes: 234, comments: 67, createTime: '1小时前', isHot: true },
  { id: 'f005', title: '菩提临世的三个问题怎么选？', content: '第一个问题我选了"不忘初心"，后面两个怎么搭配才能解锁隐藏结局？', author: '修仙党', avatar: 'https://picsum.photos/seed/f5/100/100', category: '短剧讨论', tags: ['s007'], images: [], cover: '/assets/covers/菩提临世真人AI版_30秒预览.jpg', likes: 156, comments: 43, createTime: '3小时前', isHot: false },
  { id: 'f006', title: '穿越带着超市逛古代笑点合集', content: '古人看到方便面的表情太真实了，笑到肚子疼，大家还有什么名场面？', author: '爆笑日常', avatar: 'https://picsum.photos/seed/f6/100/100', category: '短剧讨论', tags: ['s004'], images: [], cover: '/assets/covers/带着超级商场逛古代_30秒预览.jpg', likes: 312, comments: 89, createTime: '6小时前', isHot: true },
  { id: 'f007', title: '这个平台什么时候上AI配音功能？', content: '希望能自己给短剧配音，或者选择不同声优的声音', author: '声优控', avatar: 'https://picsum.photos/seed/f7/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 78, comments: 45, createTime: '12小时前', isHot: false },
  { id: 'f008', title: '新人报到，求推荐好玩的互动短剧', content: '刚下载这个小程序，请问有哪些必玩的短剧和游戏？', author: '萌新一枚', avatar: 'https://picsum.photos/seed/f8/100/100', category: '求助问答', tags: [], images: [], cover: '', likes: 23, comments: 18, createTime: '1天前', isHot: false },
  { id: 'f009', title: '停车游戏的2.5D视觉效果怎么改？', content: '我自己尝试改了一下，但是立体感还是不够，有大神指点一下吗？', author: '停车达人', avatar: 'https://picsum.photos/seed/f9/100/100', category: '求助问答', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 67, comments: 21, createTime: '2天前', isHot: false },
  { id: 'f010', title: '自制了一个停车游戏的关卡，欢迎试玩', content: '用逆向生成算法做了一个新关卡，保证可解，难度中等偏上', author: '关卡设计师', avatar: 'https://picsum.photos/seed/f10/100/100', category: '游戏讨论', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 198, comments: 45, createTime: '4小时前', isHot: true },
  { id: 'f011', title: '念念有词的台词太绝了', content: '每句话都是命运转折，编剧是怎么想出来的？', author: '文艺范', avatar: 'https://picsum.photos/seed/f11/100/100', category: '短剧讨论', tags: ['s006'], images: [], cover: '/assets/covers/念念有词_30秒预览.jpg', likes: 145, comments: 32, createTime: '10小时前', isHot: false },
  { id: 'f012', title: '建议增加多人对战模式', content: '比如停车游戏可以两个人同时解题，谁先解开谁赢', author: '竞技玩家', avatar: 'https://picsum.photos/seed/f12/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 256, comments: 78, createTime: '1天前', isHot: true },
  { id: 'f013', title: '真千金她是学霸结局解析', content: '回归豪门后每个选择都影响最终结局，整理了一个攻略图', author: '攻略组', avatar: 'https://picsum.photos/seed/f13/100/100', category: '短剧讨论', tags: ['s010'], images: [], cover: '/assets/covers/真千金她是学霸_30秒预览.jpg', likes: 189, comments: 54, createTime: '2天前', isHot: false },
  { id: 'f014', title: '坠落球的物理引擎讨论', content: '感觉球的速度曲线可以优化一下，现在有点不自然', author: '物理系学生', avatar: 'https://picsum.photos/seed/f14/100/100', category: '游戏讨论', tags: ['g_ball'], images: [], cover: '/assets/game-covers/ball.png', likes: 56, comments: 23, createTime: '3天前', isHot: false },
  { id: 'f015', title: '求推荐古风类的互动短剧', content: '喜欢古风题材的，除了宫女逆袭还有别的推荐吗？', author: '古风党', avatar: 'https://picsum.photos/seed/f15/100/100', category: '求助问答', tags: [], images: [], cover: '', likes: 34, comments: 15, createTime: '4天前', isHot: false },
  { id: 'f016', title: '这个平台的互动形式很有趣', content: '比传统的短视频有意思多了，期待更多类型', author: '资深用户', avatar: 'https://picsum.photos/seed/f16/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 112, comments: 28, createTime: '5天前', isHot: false },
  { id: 'f017', title: '布衣逆袭权谋线怎么走？', content: '从乞丐到一品大员，中间有几个关键选择点，选错就GG', author: '权谋爱好者', avatar: 'https://picsum.photos/seed/f17/100/100', category: '短剧讨论', tags: ['s009'], images: [], cover: '/assets/covers/一品布衣_30秒预览.jpg', likes: 178, comments: 41, createTime: '6小时前', isHot: true },
  { id: 'f018', title: '剪纸工坊的图案库能自定义吗？', content: '想上传自己的图案来剪，目前好像不支持？', author: '创意玩家', avatar: 'https://picsum.photos/seed/f18/100/100', category: '游戏讨论', tags: ['g_papercut'], images: [], cover: '/assets/game-covers/papercut.png', likes: 89, comments: 34, createTime: '2天前', isHot: false },
  { id: 'f019', title: '司令千金的选择题答案汇总', content: '整理了一份所有选项的结局汇总，方便大家二刷', author: '整理狂魔', avatar: 'https://picsum.photos/seed/f19/100/100', category: '短剧讨论', tags: ['s008'], images: [], cover: '/assets/covers/我是司令千金_30秒预览.jpg', likes: 267, comments: 93, createTime: '1天前', isHot: true },
  { id: 'f020', title: '平台未来的更新方向讨论', content: '希望能加入更多类型的互动内容，比如互动漫画、互动音乐', author: '产品经理', avatar: 'https://picsum.photos/seed/f20/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 345, comments: 112, createTime: '3天前', isHot: true }
]

// ==================== 帖子评论 ====================
var forumComments = [
  { id: 'fc001', postId: 'f001', author: '停车达人', avatar: 'https://picsum.photos/seed/fc1/100/100', content: '红车要先把旁边的蓝车挪开，你试试先动卡车', likes: 12, createTime: '1小时前', parentId: null },
  { id: 'fc002', postId: 'f001', author: '新手村', avatar: 'https://picsum.photos/seed/fc2/100/100', content: '感谢大佬！过了！', likes: 5, createTime: '30分钟前', parentId: 'fc001' },
  { id: 'fc003', postId: 'f002', author: '剪纸爱好者', avatar: 'https://picsum.photos/seed/fc3/100/100', content: '真的假的？我要去试试', likes: 8, createTime: '2小时前', parentId: null },
  { id: 'fc004', postId: 'f003', author: '挑战者', avatar: 'https://picsum.photos/seed/fc4/100/100', content: '9034分报到！', likes: 15, createTime: '3小时前', parentId: null },
  { id: 'fc005', postId: 'f004', author: '泪目党', avatar: 'https://picsum.photos/seed/fc5/100/100', content: 'A结局更虐，贵妃把你毒死了', likes: 23, createTime: '30分钟前', parentId: null },
  { id: 'fc006', postId: 'f004', author: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', content: '啊？那我回头试试A', likes: 3, createTime: '10分钟前', parentId: 'fc005' },
  { id: 'fc007', postId: 'f010', author: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', content: '试了，确实不错，比官方第5关还难', likes: 7, createTime: '1小时前', parentId: null },
  { id: 'fc008', postId: 'f012', author: '官方账号', avatar: 'https://picsum.photos/seed/fc8/100/100', content: '感谢建议，已记录到需求池', likes: 45, createTime: '2小时前', parentId: null }
]

// ==================== 悬赏任务 ====================
var bounties = [
  { id: 'b001', title: '优化停车游戏2.5D视觉效果', description: '当前停车游戏的视觉缺乏2.5D立体感，希望有人能优化车辆渲染和场景透视，让游戏看起来更有层次。要求保留现有玩法逻辑。', type: '美术优化', relatedGame: 'g_parking', budget: 500, deadline: '7天后', status: 'open', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 3, createTime: '2天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b002', title: '坠落球新增障碍物设计', description: '想给坠落球增加3种新的障碍物类型，需要有创意且不影响现有平衡性。需要提供设计文档和演示效果。', type: '玩法创意', relatedGame: 'g_ball', budget: 300, deadline: '5天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b003', title: '剪纸工坊图案逆向生成算法优化', description: '当前图案生成有时过于简单，希望优化算法让生成的剪纸图案更有挑战性，同时保证可解性。', type: '关卡设计', relatedGame: 'g_papercut', budget: 800, deadline: '10天后', status: 'open', publisher: '剪纸大师', avatar: 'https://picsum.photos/seed/b3/100/100', submissionsCount: 0, createTime: '3天前', cover: '/assets/game-covers/papercut.png' },
  { id: 'b004', title: '停车游戏关卡无解bug修复', description: '有玩家反馈第12关偶尔会出现无解情况，需要排查逆向生成逻辑并修复。', type: 'Bug修复', relatedGame: 'g_parking', budget: 200, deadline: '3天后', status: 'claimed', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 2, createTime: '4天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b005', title: '宫女逆袭分支剧情补充', description: '希望补充两条新的分支剧情线，每条至少包含3个选择节点和2个不同结局。需要符合古风语境。', type: '关卡设计', relatedGame: '', budget: 1000, deadline: '14天后', status: 'open', publisher: '古韵坊', avatar: 'https://picsum.photos/seed/b5/100/100', submissionsCount: 0, createTime: '5天前', cover: '/assets/covers/s002.jpg' },
  { id: 'b006', title: '坠落球UI界面美化', description: '当前UI比较简单，希望重新设计一套更现代、更有科技感的UI界面，包括主界面、游戏界面和结算界面。', type: '美术优化', relatedGame: 'g_ball', budget: 400, deadline: '7天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 2, createTime: '2天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b007', title: '新增互动短剧类型：悬疑推理', description: '希望开发一部悬疑推理类型的互动短剧，要求有多个嫌疑人、线索收集机制和多重结局。', type: '其他', relatedGame: '', budget: 1500, deadline: '30天后', status: 'open', publisher: '剧有好戏', avatar: 'https://picsum.photos/seed/b7/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/covers/s003.jpg' },
  { id: 'b008', title: '菩提临世隐藏结局触发条件优化', description: '目前隐藏结局触发过于隐蔽，玩家很难发现，希望优化提示机制，让玩家有探索感但不至于完全找不到。', type: '玩法创意', relatedGame: '', budget: 350, deadline: '5天后', status: 'submitted', publisher: '神话新编', avatar: 'https://picsum.photos/seed/b8/100/100', submissionsCount: 2, createTime: '6天前', cover: '/assets/covers/菩提临世真人AI版_30秒预览.jpg' },
  { id: 'b009', title: '停车游戏增加多车颜色匹配模式', description: '在现有停车玩法基础上，增加颜色匹配规则：相同颜色的车必须停在同一区域。', type: '玩法创意', relatedGame: 'g_parking', budget: 600, deadline: '10天后', status: 'open', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 1, createTime: '3天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b010', title: '穿越带着超市逛古代表情包制作', description: '为这部短剧制作一套微信表情包，包含主要角色的经典表情，至少16个。', type: '美术优化', relatedGame: '', budget: 250, deadline: '7天后', status: 'completed', publisher: '穿越频道', avatar: 'https://picsum.photos/seed/b10/100/100', submissionsCount: 4, createTime: '10天前', cover: '/assets/covers/带着超级商场逛古代_30秒预览.jpg' },
  { id: 'b011', title: '真千金她是学霸学霸系统UI', description: '短剧中需要一个"学霸系统"的UI界面，显示任务进度、能力值、技能树等。', type: '美术优化', relatedGame: '', budget: 450, deadline: '8天后', status: 'open', publisher: '豪门传奇', avatar: 'https://picsum.photos/seed/b11/100/100', submissionsCount: 0, createTime: '2天前', cover: '/assets/covers/真千金她是学霸_30秒预览.jpg' },
  { id: 'b012', title: '坠落球排行榜数据接口bug', description: '排行榜偶尔会出现分数重复或排序错误的情况，需要修复后端接口逻辑。', type: 'Bug修复', relatedGame: 'g_ball', budget: 300, deadline: '4天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b013', title: '剪纸工坊增加节日主题图案包', description: '为春节、中秋、端午等传统节日设计专属剪纸图案包，每个节日至少5个图案。', type: '关卡设计', relatedGame: 'g_papercut', budget: 500, deadline: '15天后', status: 'open', publisher: '剪纸大师', avatar: 'https://picsum.photos/seed/b3/100/100', submissionsCount: 0, createTime: '4天前', cover: '/assets/game-covers/papercut.png' },
  { id: 'b014', title: '契约婚姻总裁角色立绘优化', description: '男主的立绘需要优化，要求更帅、更有总裁气场，同时保持原有风格。', type: '美术优化', relatedGame: '', budget: 350, deadline: '6天后', status: 'claimed', publisher: '甜蜜剧场', avatar: 'https://picsum.photos/seed/b14/100/100', submissionsCount: 2, createTime: '3天前', cover: '/assets/covers/栀栀屿婚_30秒预览.jpg' },
  { id: 'b015', title: '平台整体新手引导流程设计', description: '目前新用户进来不知道该怎么玩，需要设计一套完整的新手引导流程，覆盖视频页、发现页、游戏互动。', type: '其他', relatedGame: '', budget: 800, deadline: '12天后', status: 'open', publisher: '产品经理', avatar: 'https://picsum.photos/seed/b15/100/100', submissionsCount: 1, createTime: '2天前', cover: '/assets/game-covers/lockscreen.png' }
]

// ==================== 悬赏投稿 ====================
var bountySubmissions = [
  { id: 'bs001', bountyId: 'b001', submitter: '美术小能手', avatar: 'https://picsum.photos/seed/bs1/100/100', content: '我尝试用斜45度视角重新渲染了车辆，增加了阴影和高光效果，立体感明显提升。附件是效果对比图。', attachments: [], status: 'pending', createTime: '1天前' },
  { id: 'bs002', bountyId: 'b001', submitter: '3D设计师', avatar: 'https://picsum.photos/seed/bs2/100/100', content: '采用伪3D渲染方案，车辆用2.5D精灵图，场景增加透视网格线，效果很自然。', attachments: [], status: 'pending', createTime: '1天前' },
  { id: 'bs003', bountyId: 'b001', submitter: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', content: '我加了一个简单的景深效果，远处的车模糊处理，层次感好很多。', attachments: [], status: 'pending', createTime: '12小时前' },
  { id: 'bs004', bountyId: 'b004', submitter: '算法工程师', avatar: 'https://picsum.photos/seed/bs4/100/100', content: '已定位bug：逆向生成时偶尔会出现死锁，我加了死锁检测和重试机制，测试了100次未复现。', attachments: [], status: 'accepted', createTime: '2天前' },
  { id: 'bs005', bountyId: 'b010', submitter: '表情包达人', avatar: 'https://picsum.photos/seed/bs5/100/100', content: '完成了16个表情包，包含女主的"震惊""开心""生气"等经典表情。', attachments: [], status: 'accepted', createTime: '5天前' }
]

// ==================== 工具函数 ====================
function getForumPostById(id) {
  return forumPosts.find(function(p) { return p.id === id })
}

function getForumCommentsByPostId(postId) {
  return forumComments.filter(function(c) { return c.postId === postId })
}

function getBountyById(id) {
  return bounties.find(function(b) { return b.id === id })
}

function getBountySubmissionsByBountyId(bountyId) {
  return bountySubmissions.filter(function(s) { return s.bountyId === bountyId })
}

function getForumPostsByCategory(category) {
  if (category === '全部') return forumPosts
  return forumPosts.filter(function(p) { return p.category === category })
}

function getBountiesByStatus(status) {
  if (status === '全部') return bounties
  return bounties.filter(function(b) { return b.status === status })
}

module.exports = {
  stories: stories,
  videoData: stories,
  feedData: feedData,
  categories: categories,
  commentPool: commentPool,
  getComments: getComments,
  getStoryById: function(id) { return stories.find(function(s) { return s.id === id }) },
  // 论坛
  forumPosts: forumPosts,
  forumComments: forumComments,
  forumCategories: forumCategories,
  getForumPostById: getForumPostById,
  getForumCommentsByPostId: getForumCommentsByPostId,
  getForumPostsByCategory: getForumPostsByCategory,
  // 悬赏
  bounties: bounties,
  bountySubmissions: bountySubmissions,
  getBountyById: getBountyById,
  getBountySubmissionsByBountyId: getBountySubmissionsByBountyId,
  getBountiesByStatus: getBountiesByStatus
}

},
"games/ball.js": function(module, exports, require) {
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

},
"games/papercut.js": function(module, exports, require) {
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

},
"games/parking.js": function(module, exports, require) {
// 停车游戏引擎 wrapper - 直接复用独立页面逻辑
// 由于停车游戏代码量大(652行)，这里直接把核心变量和函数提取为模块

var COLORS = {
  red:{f:'#E53935',d:'#B71C1C',l:'#EF5350'}, blue:{f:'#1E88E5',d:'#0D47A1',l:'#42A5F5'},
  yellow:{f:'#FDD835',d:'#F9A825',l:'#FFEE58'}, green:{f:'#43A047',d:'#1B5E20',l:'#66BB6A'},
  pink:{f:'#EC407A',d:'#AD1457',l:'#F06292'}, purple:{f:'#7E57C2',d:'#4527A0',l:'#9575CD'}
}
var CK=['red','blue','yellow','green','pink','purple']
var DIR={up:{dx:0,dy:-1,a:0},down:{dx:0,dy:1,a:Math.PI},left:{dx:-1,dy:0,a:-Math.PI/2},right:{dx:1,dy:0,a:Math.PI/2}}
var DK=['up','down','left','right']

function shuffle(a){for(var i=a.length-1;i>0;i--){var j=(Math.random()*(i+1))|0;var t=a[i];a[i]=a[j];a[j]=t}return a}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function lerp(a,b,t){return a+(b-a)*t}
function easeOut(t){return 1-Math.pow(1-t,3)}
function canExit(g,cols,rows,col,row,dk){var d=DIR[dk];var c=col+d.dx,r=row+d.dy;while(c>=0&&c<cols&&r>=0&&r<rows){if(g[r][c]!==-1)return false;c+=d.dx;r+=d.dy}return true}

function getLvlCfg(lv){
  if(lv<=1)return{cols:4,rows:5,cc:2,cn:6,pp:2,sl:4};if(lv<=2)return{cols:4,rows:5,cc:2,cn:8,pp:2,sl:4}
  if(lv<=4)return{cols:5,rows:6,cc:3,cn:12,pp:2,sl:4};if(lv<=6)return{cols:5,rows:7,cc:3,cn:15,pp:3,sl:4}
  if(lv<=8)return{cols:6,rows:7,cc:4,cn:20,pp:3,sl:4};if(lv<=10)return{cols:6,rows:8,cc:4,cn:25,pp:3,sl:4}
  return{cols:7,rows:8,cc:Math.min(5,4+((lv-10)/5|0)),cn:Math.min(30,25+lv-10),pp:3,sl:4}
}

function genLevel(cfg){
  var cols=cfg.cols,rows=cfg.rows,cc=cfg.cc,cn=cfg.cn,pp=cfg.pp
  var uc=CK.slice(0,cc),ca=[];for(var i=0;i<cn;i++)ca.push(uc[i%cc]);shuffle(ca)
  var g=[];for(var r=0;r<rows;r++)g.push(new Array(cols).fill(-1))
  var cars=[],sol=[]
  for(var i=cn-1;i>=0;i--){
    var placed=null
    for(var a=0;a<300;a++){var col=(Math.random()*cols)|0;var row=(Math.random()*rows)|0;if(g[row][col]!==-1)continue
      var ds=shuffle(DK.slice());for(var di=0;di<ds.length;di++){if(canExit(g,cols,rows,col,row,ds[di])){g[row][col]=i;placed={id:i,color:ca[i],dir:ds[di],col:col,row:row,active:true};break}}if(placed)break}
    if(!placed){outer:for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){if(g[r][c]!==-1)continue;for(var di=0;di<DK.length;di++){if(canExit(g,cols,rows,c,r,DK[di])){g[r][c]=i;placed={id:i,color:ca[i],dir:DK[di],col:c,row:r,active:true};break outer}}}}
    if(placed){cars.push(placed);sol.unshift(placed.id)}
  }
  var pass=[];for(var i=0;i<sol.length;i++){var car=cars.find(function(c){return c.id===sol[i]});if(car)for(var p=0;p<pp;p++)pass.push(car.color)}
  return{cars:cars.filter(Boolean),passengers:pass,sol:sol}
}

function create(){
  var E={
    canvas:null,ctx:null,W:0,H:0,dpr:1,level:1,
    cars:[],waitSlots:[],passengers:[],passPerCar:2,totalPass:0,boarded:0,
    gameState:'playing',animating:false,shakeCar:-1,shakeT:0,movingCar:null,cfg:null,
    cellW:0,cellH:0,lotX:0,lotY:0,lotW:0,lotH:0,slotH:0,slotStartX:0,slotW:0,slotY:0,
    items:{refresh:3,remove:1,reorder:3,flip:3},
    _tapX:0,_tapY:0,

    init:function(canvas,w,h){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.W=w;this.H=h
      this.level=1;this.items={refresh:3,remove:1,reorder:3,flip:3}
      this.startLevel(1)
    },
    destroy:function(){this.gameState='stopped'},

    startLevel:function(lv){
      this.level=lv;this.cfg=getLvlCfg(lv);var data=genLevel(this.cfg)
      this.cars=data.cars;this.passengers=data.passengers;this.passPerCar=this.cfg.pp
      this.waitSlots=new Array(this.cfg.sl).fill(null);this.totalPass=this.passengers.length
      this.boarded=0;this.gameState='playing';this.animating=false;this.shakeCar=-1;this.movingCar=null
      var W=this.W,H=this.H,padX=W*0.04,lotW=W-padX*2,cellW=lotW/this.cfg.cols
      var lotY=H*0.26,lotBottom=H*0.84,lotH=lotBottom-lotY,cellH=lotH/this.cfg.rows
      var cs=Math.min(cellW,cellH);cellW=cs;cellH=cs;lotW=cellW*this.cfg.cols;lotH=cellH*this.cfg.rows
      var lotX=(W-lotW)/2
      if(lotY+lotH>H*0.84){var sc=(H*0.84-lotY)/lotH;cellW*=sc;cellH*=sc;lotW=cellW*this.cfg.cols;lotH=cellH*this.cfg.rows;lotX=(W-lotW)/2}
      this.cellW=cellW;this.cellH=cellH;this.lotX=lotX;this.lotY=lotY;this.lotW=lotW;this.lotH=lotH
      this.slotH=H*0.07;this.slotStartX=W*0.06;this.slotW=(W*0.88)/this.cfg.sl;this.slotY=H*0.08
      this.render()
    },

    buildGrid:function(){var g=[];for(var r=0;r<this.cfg.rows;r++)g.push(new Array(this.cfg.cols).fill(-1));var self=this;this.cars.forEach(function(c,i){if(c&&c.active)g[c.row][c.col]=i});return g},

    onTouchStart:function(e){var t=e.touches?e.touches[0]:e;this._tapX=t.x;this._tapY=t.y},
    onTouchMove:function(){},
    onTouchEnd:function(e){
      var t=e.changedTouches?e.changedTouches[0]:e;if(Math.abs(t.x-this._tapX)>10||Math.abs(t.y-this._tapY)>10)return
      this.handleTap(this._tapX,this._tapY)
    },

    handleTap:function(px,py){
      var W=this.W,H=this.H
      if(this.gameState==='won'||this.gameState==='lost'){
        var pw=W*0.72,ph=H*0.26,panelX=(W-pw)/2,panelY=(H-ph)/2,bw=pw*0.45,bh=36,bx=W/2-bw/2,by=panelY+ph*0.77
        if(px>=bx&&px<=bx+bw&&py>=by&&py<=by+bh){if(this.gameState==='won')this.startLevel(this.level+1);else this.startLevel(this.level)}
        return
      }
      if(this.animating)return
      // 道具栏
      var tbY=H*0.885,tbH=H*0.075
      if(py>=tbY-8&&py<=tbY+tbH+8){var gap=10,bw2=(W-gap*5)/4;var idx=Math.floor((px-gap)/(bw2+gap));if(idx>=0&&idx<4)this.handleItem(idx);return}
      // 停车场
      for(var i=0;i<this.cars.length;i++){var car=this.cars[i];if(!car||!car.active)continue
        var cx=this.lotX+car.col*this.cellW,cy=this.lotY+car.row*this.cellH
        if(px>=cx&&px<=cx+this.cellW&&py>=cy&&py<=cy+this.cellH){this.tryMove(i);return}}
    },

    tryMove:function(idx){
      var car=this.cars[idx];if(!car||!car.active)return;var d=DIR[car.dir],g=this.buildGrid()
      var c=car.col+d.dx,r=car.row+d.dy
      while(c>=0&&c<this.cfg.cols&&r>=0&&r<this.cfg.rows){if(g[r][c]!==-1){this.doShake(idx);return};c+=d.dx;r+=d.dy}
      var si=this.waitSlots.indexOf(null);if(si===-1){this.doShake(idx);return}
      this.animating=true;car.active=false;this.waitSlots[si]={color:car.color,boarded:0,id:car.id}
      var fx=this.lotX+car.col*this.cellW+this.cellW/2,fy=this.lotY+car.row*this.cellH+this.cellH/2
      var tx=this.slotStartX+si*this.slotW+this.slotW/2,ty=this.slotY+this.slotH/2
      this.movingCar={car:car,fx:fx,fy:fy,tx:tx,ty:ty,p:0};this.animLoop()
    },

    doShake:function(idx){var self=this;this.shakeCar=idx;this.shakeT=0;var tick=function(){self.shakeT++;if(self.shakeT>8){self.shakeCar=-1;self.render();return};self.render();self.canvas.requestAnimationFrame(tick)};self.canvas.requestAnimationFrame(tick)},

    animLoop:function(){var self=this;if(this.movingCar){this.movingCar.p+=0.06;if(this.movingCar.p>=1){this.movingCar=null;this.doMatch();return};this.render();this.canvas.requestAnimationFrame(function(){self.animLoop()});return};this.animating=false;this.render();this.checkEnd()},

    doMatch:function(){
      var changed=false;while(this.passengers.length>0){var nc=this.passengers[0];var found=-1
        for(var s=0;s<this.waitSlots.length;s++){if(this.waitSlots[s]&&this.waitSlots[s].color===nc){found=s;break}}
        if(found===-1)break;this.passengers.shift();this.boarded++;this.waitSlots[found].boarded++;changed=true
        if(this.waitSlots[found].boarded>=this.passPerCar)this.waitSlots[found]=null}
      this.render();var self=this
      if(changed)setTimeout(function(){self.animating=false;self.render();self.checkEnd()},200)
      else{this.animating=false;this.checkEnd()}
    },

    checkEnd:function(){
      if(this.cars.every(function(c){return!c||!c.active})&&this.passengers.length===0){this.gameState='won';this.render();return}
      if(this.waitSlots.every(function(s){return s!==null})&&this.passengers.length>0){
        var nc=this.passengers[0];var cm=this.waitSlots.some(function(s){return s&&s.color===nc})
        if(!cm){var self=this;var hm=this.cars.some(function(c){if(!c||!c.active)return false;var d=DIR[c.dir],g=self.buildGrid()
          var cc=c.col+d.dx,rr2=c.row+d.dy;while(cc>=0&&cc<self.cfg.cols&&rr2>=0&&rr2<self.cfg.rows){if(g[rr2][cc]!==-1)return false;cc+=d.dx;rr2+=d.dy}return true})
          if(!hm){this.gameState='lost';this.render()}}}
    },

    handleItem:function(idx){var keys=['refresh','remove','reorder','flip'];var k=keys[idx];if(!this.items[k]||this.items[k]<=0)return;this.items[k]--
      if(k==='refresh'){var ac=this.cars.filter(function(c){return c&&c.active}).map(function(c){return c.color});shuffle(ac);var i=0;this.cars.forEach(function(c){if(c&&c.active)c.color=ac[i++]})}
      else if(k==='reorder')shuffle(this.passengers)
      else if(k==='flip'){for(var ci=0;ci<this.cars.length;ci++){var c=this.cars[ci];if(!c||!c.active)continue;var g=this.buildGrid()
        if(!canExit(g,this.cfg.cols,this.cfg.rows,c.col,c.row,c.dir)){var ds=shuffle(DK.slice());for(var di=0;di<ds.length;di++){if(canExit(g,this.cfg.cols,this.cfg.rows,c.col,c.row,ds[di])){c.dir=ds[di];break}}break}}}
      else if(k==='remove'){for(var i=this.cars.length-1;i>=0;i--){if(this.cars[i]&&this.cars[i].active){this.cars[i].active=false;break}}}
      this.render()
    },

    render:function(){
      if(!this.ctx)return;var ctx=this.ctx,W=this.W,H=this.H;ctx.clearRect(0,0,W,H)
      var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#e8eaf6');bg.addColorStop(1,'#c5cae9');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
      this.drawRoad(ctx,W,H);this.drawWaitSlots(ctx);this.drawPassQ(ctx,W,H);this.drawLot(ctx);this.drawCars(ctx);this.drawMoving(ctx);this.drawHUD(ctx,W,H);this.drawToolbar(ctx,W,H)
      if(this.gameState==='won'||this.gameState==='lost')this.drawResult(ctx,W,H)
    },

    drawRoad:function(ctx,W,H){var rh=H*0.05;ctx.fillStyle='#546e7a';ctx.fillRect(0,0,W,rh);ctx.strokeStyle='#ffeb3b';ctx.lineWidth=2;ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(0,rh/2);ctx.lineTo(W,rh/2);ctx.stroke();ctx.setLineDash([])},
    drawWaitSlots:function(ctx){for(var i=0;i<(this.cfg?this.cfg.sl:4);i++){var sx=this.slotStartX+i*this.slotW;ctx.fillStyle='#90a4ae';rr(ctx,sx+4,this.slotY+3,this.slotW-8,this.slotH,8);ctx.fill();ctx.fillStyle='#eceff1';rr(ctx,sx+4,this.slotY,this.slotW-8,this.slotH,8);ctx.fill();ctx.strokeStyle='#b0bec5';ctx.lineWidth=1.5;rr(ctx,sx+4,this.slotY,this.slotW-8,this.slotH,8);ctx.stroke();var sl=this.waitSlots[i];if(sl){this.drawSlotCar(ctx,sx+this.slotW/2,this.slotY+this.slotH/2,this.slotW*0.65,this.slotH*0.75,sl.color,sl.boarded)}else{ctx.fillStyle='#b0bec5';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('P',sx+this.slotW/2,this.slotY+this.slotH/2)}}},
    drawSlotCar:function(ctx,cx,cy,w,h,ck,bd){var co=COLORS[ck];ctx.fillStyle=co.d;rr(ctx,cx-w/2,cy-h/2+3,w,h,5);ctx.fill();ctx.fillStyle=co.f;rr(ctx,cx-w/2,cy-h/2,w,h,5);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(bd+'/'+this.passPerCar,cx,cy+1)},
    drawPassQ:function(ctx,W,H){var qy=H*0.205,mx=20;var max=Math.min(this.passengers.length,Math.floor((W-40)/16));var gap=Math.min(16,(W-40)/(max||1));ctx.fillStyle='rgba(255,255,255,0.5)';rr(ctx,mx-4,qy-12,(max||1)*gap+12,24,6);ctx.fill();ctx.fillStyle='#37474f';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('排队 '+this.passengers.length+'人',mx,qy-20);for(var i=0;i<max;i++){var co=COLORS[this.passengers[i]];if(!co)continue;var px=mx+i*gap+gap/2;ctx.beginPath();ctx.arc(px,qy,6.5,0,Math.PI*2);ctx.fillStyle=co.f;ctx.fill();ctx.strokeStyle=co.d;ctx.lineWidth=1.5;ctx.stroke()}},
    drawLot:function(ctx){ctx.fillStyle='rgba(0,0,0,0.08)';rr(ctx,this.lotX+5,this.lotY+5,this.lotW,this.lotH,10);ctx.fill();ctx.fillStyle='#78909c';rr(ctx,this.lotX,this.lotY,this.lotW,this.lotH,10);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([5,4]);for(var r=0;r<=this.cfg.rows;r++){var y=this.lotY+r*this.cellH;ctx.beginPath();ctx.moveTo(this.lotX,y);ctx.lineTo(this.lotX+this.lotW,y);ctx.stroke()};for(var c=0;c<=this.cfg.cols;c++){var x=this.lotX+c*this.cellW;ctx.beginPath();ctx.moveTo(x,this.lotY);ctx.lineTo(x,this.lotY+this.lotH);ctx.stroke()};ctx.setLineDash([])},
    drawCars:function(ctx){var self=this;this.cars.forEach(function(car,i){if(!car||!car.active)return;var cx=self.lotX+car.col*self.cellW+self.cellW/2;var cy=self.lotY+car.row*self.cellH+self.cellH/2;if(self.shakeCar===i&&self.shakeT>0)cx+=(self.shakeT%2?3:-3);self.draw25D(ctx,cx,cy,self.cellW*0.85,self.cellH*0.85,car.color,car.dir)})},
    draw25D:function(ctx,cx,cy,w,h,ck,dk){var co=COLORS[ck];var cw=w*0.82,ch=h*0.58,dep=4;ctx.fillStyle=co.d;rr(ctx,cx-cw/2,cy-ch/2+dep,cw,ch,5);ctx.fill();var g=ctx.createLinearGradient(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2);g.addColorStop(0,co.l);g.addColorStop(0.5,co.f);g.addColorStop(1,co.d);ctx.fillStyle=g;rr(ctx,cx-cw/2,cy-ch/2,cw,ch,5);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.3)';rr(ctx,cx-cw*0.3,cy-ch/2+2,cw*0.6,ch*0.25,3);ctx.fill();this.drawArrow(ctx,cx,cy,cw*0.35,dk)},
    drawArrow:function(ctx,cx,cy,sz,dk){ctx.save();ctx.translate(cx,cy);ctx.rotate(DIR[dk].a);var s=sz*0.38;ctx.fillStyle='rgba(255,255,255,0.85)';ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*0.65,s*0.15);ctx.lineTo(s*0.2,s*0.15);ctx.lineTo(s*0.2,s);ctx.lineTo(-s*0.2,s);ctx.lineTo(-s*0.2,s*0.15);ctx.lineTo(-s*0.65,s*0.15);ctx.closePath();ctx.fill();ctx.restore()},
    drawMoving:function(ctx){if(!this.movingCar)return;var m=this.movingCar;var t=easeOut(Math.min(m.p,1));var x=lerp(m.fx,m.tx,t),y=lerp(m.fy,m.ty,t);this.draw25D(ctx,x,y,this.cellW*0.85,this.cellH*0.85,m.car.color,m.car.dir)},
    drawHUD:function(ctx,W,H){ctx.fillStyle='rgba(0,0,0,0.55)';rr(ctx,W/2-45,H*0.052,90,24,12);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('第 '+this.level+' 关',W/2,H*0.052+12)},
    drawToolbar:function(ctx,W,H){var ty=H*0.885,th=H*0.075;ctx.fillStyle='rgba(38,50,56,0.88)';rr(ctx,0,ty-10,W,th+24,14);ctx.fill();var its=[{icon:'刷新',cnt:this.items.refresh},{icon:'消除',cnt:this.items.remove},{icon:'排序',cnt:this.items.reorder},{icon:'翻转',cnt:this.items.flip}];var gap=10,bw=(W-gap*5)/4;var self=this;its.forEach(function(it,i){var bx=gap+i*(bw+gap);ctx.fillStyle=it.cnt>0?'rgba(255,255,255,0.13)':'rgba(255,255,255,0.04)';rr(ctx,bx,ty,bw,th,8);ctx.fill();ctx.fillStyle=it.cnt>0?'#fff':'#666';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(it.icon,bx+bw/2,ty+th*0.5)})},
    drawResult:function(ctx,W,H){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);var pw=W*0.72,ph=H*0.26,px=(W-pw)/2,py=(H-ph)/2;ctx.fillStyle='#fff';rr(ctx,px,py,pw,ph,18);ctx.fill();var win=this.gameState==='won';ctx.fillStyle=win?'#43A047':'#E53935';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(win?'通关成功!':'挑战失败',W/2,py+ph*0.35);var bw2=pw*0.45,bh2=36,bx2=W/2-bw2/2,by2=py+ph*0.77;ctx.fillStyle=win?'#43A047':'#FF7043';rr(ctx,bx2,by2,bw2,bh2,18);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.fillText(win?'下一关':'重新挑战',W/2,by2+bh2/2)}
  }
  return E
}

module.exports = { create: create }

},
"pages/feed/index.js": function(module, exports, require) {
const { feedData, categories, forumPosts, forumCategories, bounties, getForumPostsByCategory, getBountiesByStatus } = require('../../data/mock')

// 游戏数据
var gameList = [
  { id: 'g_papercut', type: 'game', title: '剪纸工坊', cover: '/assets/game-covers/papercut.png', author: '剪纸大师',
    avatar: 'https://picsum.photos/seed/gp1/100/100', genre: '创意', gameIcon: '✂️',
    gameColor: '#D42A20', gamePage: '/pages/game-papercut/index',
    likes: 5234, likeText: '5234', comments: 312, shares: 189,
    selfRec: '一剪成画超治愈' },
  { id: 'g_lockscreen', type: 'game', title: '密码锁挑战', cover: '/assets/game-covers/lockscreen.png', author: '锁屏大师',
    avatar: 'https://picsum.photos/seed/lock/100/100', genre: '解谜', gameIcon: '🔐',
    gameColor: '#8B7355', gamePage: '/pages/game-lockscreen/index',
    likes: 7654, likeText: '7654', comments: 432, shares: 321 },
  { id: 'g_ball', type: 'game', title: '坠落球', cover: '/assets/game-covers/ball.png', author: '深渊工作室',
    avatar: 'https://picsum.photos/seed/gp2/100/100', genre: '技巧', gameIcon: '🔵',
    gameColor: '#00ffc8', gamePage: '/pages/game-ball/index',
    likes: 8912, likeText: '8912', comments: 567, shares: 234,
    selfRec: '300层深渊等你' },
  { id: 'g_parking', type: 'game', title: '停车大挑战', cover: '/assets/game-covers/parking.png', author: '停车达人',
    avatar: 'https://picsum.photos/seed/gp3/100/100', genre: '策略', gameIcon: '🚗',
    gameColor: '#4FC3F7', gamePage: '/pages/game-parking/index?level=1',
    likes: 6789, likeText: '6789', comments: 423, shares: 201 }
]

// 分区颜色映射
var categoryColorMap = {
  '游戏讨论': '#F97316',
  '短剧讨论': '#EC4899',
  '综合交流': '#8B5CF6',
  '求助问答': '#3B82F6'
}

// 悬赏状态映射
var bountyStatusMap = {
  'open': '进行中',
  'claimed': '已接单',
  'submitted': '已投稿',
  'completed': '已完成',
  'expired': '已过期'
}

var bountyStatusColorMap = {
  'open': '#8B7355',
  'claimed': '#C9957A',
  'submitted': '#8B7355',
  'completed': '#8B7355',
  'expired': '#C9957A'
}

Page({
  data: {
    searchKeyword: '',
    
    // 一级分类索引：0短剧 1游戏 2论坛 3悬赏
    topTabIndex: 0,

    // 短剧子分类
    categories: categories,
    currentCategory: '推荐',
    categoryList: [],
    
    posts: [],
    leftPosts: [],
    rightPosts: [],

    // 游戏列表
    games: gameList,
    leftGames: [],
    rightGames: [],

    // 论坛
    forumCategoryList: [],
    currentForumCategory: '全部',
    forumPosts: [],
    leftForumPosts: [],
    rightForumPosts: [],

    // 悬赏（只展示进行中）
    bounties: [],
    leftBounties: [],
    rightBounties: [],

    loading: false,
    hasMore: true,
    page: 1,
    swiperHeight: 0,
  },

  onLoad() {
    this.buildCategoryList()
    this.buildForumCategoryList()
    this.loadPosts()
    this.distributeGames()
    this.loadForumPosts()
    this.loadBounties()
  },

  onReady() {
    this.calcSwiperHeight()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  calcSwiperHeight() {
    const query = wx.createSelectorQuery().in(this)
    query.select('.feed-page').boundingClientRect()
    query.select('.search-bar').boundingClientRect()
    query.select('.top-tabs').boundingClientRect()
    query.exec((res) => {
      const pageH = res[0] ? res[0].height : wx.getSystemInfoSync().windowHeight
      const searchH = res[1] ? res[1].height : 0
      const tabsH = res[2] ? res[2].height : 0
      const tabBarH = 100 // 悬浮TabBar预留高度（96rpx + 安全区 ≈ 100px）
      const h = pageH - searchH - tabsH - tabBarH
      this.setData({ swiperHeight: h > 0 ? h : 300 })
    })
  },

  // 一级 Tab 切换
  onTopTabTap(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    this.setData({ topTabIndex: index })
  },

  onSwiperChange(e) {
    var index = e.detail.current
    this.setData({ topTabIndex: index })
  },

  buildCategoryList() {
    const list = categories.map(name => ({
      name: name,
      isActive: name === '推荐'
    }))
    this.setData({ categoryList: list })
  },

  formatLikes(likes) {
    if (likes > 9999) {
      return (likes / 10000).toFixed(1) + 'w'
    }
    return String(likes)
  },

  loadPosts() {
    if (this.data.loading) return
    this.setData({ loading: true })

    setTimeout(() => {
      let newPosts = feedData.map(p => ({
        ...p,
        likeText: this.formatLikes(p.likes)
      }))

      if (this.data.currentCategory !== '推荐') {
        newPosts = newPosts.filter(p => p.genre === this.data.currentCategory)
      }

      if (this.data.searchKeyword) {
        const kw = this.data.searchKeyword.toLowerCase()
        newPosts = newPosts.filter(p => p.title.toLowerCase().includes(kw))
      }

      if (this.data.page === 1) {
        this.setData({ posts: newPosts, loading: false, hasMore: false })
      } else {
        this.setData({ posts: [...this.data.posts, ...newPosts], loading: false, hasMore: false })
      }

      this.distributePosts(this.data.posts)
      this.setData({ loading: false })
    }, 300)
  },

  distributePosts(posts) {
    const leftPosts = []
    const rightPosts = []
    posts.forEach((post, index) => {
      if (index % 2 === 0) leftPosts.push(post)
      else rightPosts.push(post)
    })
    this.setData({ leftPosts, rightPosts })
  },

  distributeGames() {
    const left = [], right = []
    gameList.forEach((g, i) => {
      if (i % 2 === 0) left.push(g)
      else right.push(g)
    })
    this.setData({ leftGames: left, rightGames: right })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearchConfirm() {
    this.setData({ page: 1, hasMore: true })
    this.loadPosts()
  },

  onClearSearch() {
    this.setData({ searchKeyword: '', page: 1 })
    this.loadPosts()
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    const categoryList = this.data.categoryList.map(item => ({
      ...item,
      isActive: item.name === category
    }))
    this.setData({ currentCategory: category, categoryList: categoryList, page: 1, hasMore: true })
    this.loadPosts()
  },

  onPostTap(e) {
    const postId = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p.id === postId)
    if (!post) return
    wx.navigateTo({
      url: '/pages/detail/index?videoId=' + post.videoId + '&storyId=' + post.storyId + '&title=' + encodeURIComponent(post.title)
    })
  },

  onGameTap(e) {
    // 游戏内嵌在视频流，跳转视频页
    wx.switchTab({ url: '/pages/video/index' })
  },

  // ===== 论坛相关方法 =====
  buildForumCategoryList() {
    var list = ['全部'].concat(forumCategories).map(function(name) {
      return { name: name, isActive: name === '全部' }
    })
    this.setData({ forumCategoryList: list })
  },

  loadForumPosts() {
    var posts = getForumPostsByCategory(this.data.currentForumCategory)
    var formatted = posts.map(function(p) {
      return {
        id: p.id,
        title: p.title,
        contentPreview: p.content.length > 40 ? p.content.slice(0, 40) + '...' : p.content,
        author: p.author,
        avatar: p.avatar,
        category: p.category,
        categoryColor: categoryColorMap[p.category] || '#F97316',
        comments: p.comments,
        createTime: p.createTime,
        isHot: p.isHot,
        cover: p.cover || '',
        hasImage: !!p.cover
      }
    })
    this.setData({ forumPosts: formatted })
    this.distributeForumPosts(formatted)
  },

  distributeForumPosts(posts) {
    var left = [], right = []
    posts.forEach(function(p, i) {
      if (i % 2 === 0) left.push(p)
      else right.push(p)
    })
    this.setData({ leftForumPosts: left, rightForumPosts: right })
  },

  onForumCategoryTap(e) {
    var category = e.currentTarget.dataset.category
    var list = this.data.forumCategoryList.map(function(item) {
      return { name: item.name, isActive: item.name === category }
    })
    this.setData({ currentForumCategory: category, forumCategoryList: list })
    this.loadForumPosts()
  },

  onForumTap(e) {
    var postId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/forum/detail?id=' + postId })
  },

  // ===== 悬赏相关方法 =====
  loadBounties() {
    var list = getBountiesByStatus('open')
    var formatted = list.map(function(b) {
      return {
        id: b.id,
        title: b.title,
        type: b.type,
        budget: b.budget,
        deadline: b.deadline,
        status: b.status,
        statusText: bountyStatusMap[b.status] || b.status,
        statusColor: bountyStatusColorMap[b.status] || '#8B7355',
        publisher: b.publisher,
        avatar: b.avatar,
        submissionsCount: b.submissionsCount,
        cover: b.cover || ''
      }
    })
    this.setData({ bounties: formatted })
    this.distributeBounties(formatted)
  },

  distributeBounties(list) {
    var left = [], right = []
    list.forEach(function(b, i) {
      if (i % 2 === 0) left.push(b)
      else right.push(b)
    })
    this.setData({ leftBounties: left, rightBounties: right })
  },

  onBountyTap(e) {
    var bountyId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/bounty/detail?id=' + bountyId })
  }
})

},
"pages/create/index.js": function(module, exports, require) {
// 游戏资源数据
var GAME_ASSETS = {
  'game_papercut': {
    id: 'game_papercut', title: '剪纸工坊', genre: '创意', author: '剪纸大师',
    avatar: 'https://picsum.photos/seed/gp1/100/100',
    cover: '/assets/game-covers/papercut.png',
    desc: '中国传统剪纸艺术互动游戏。折叠红纸→手指画线剪纸→六折对称展开，生成精美剪纸图案。',
    gameplay: '红纸四次折叠成三角形→手指从纸边切入画线剪纸→最多10刀→展开呈现六折对称图案→保存到相册',
    artAssets: [
      { name: '红纸底色', preview: '/assets/game-covers/papercut.png' },
      { name: '宣纸纹理', preview: '/assets/game-covers/papercut.png' }
    ],
    codeFiles: [
      { name: 'papercut.js', desc: '游戏引擎（折叠动画+剪切+展开算法）', path: 'games/papercut.js', lines: 269 },
      { name: 'index.js', desc: '独立页面逻辑', path: 'pages/game-papercut/index.js', lines: 700 },
      { name: 'index.wxml', desc: '页面模板', path: 'pages/game-papercut/index.wxml', lines: 84 },
      { name: 'index.wxss', desc: '页面样式', path: 'pages/game-papercut/index.wxss', lines: 34 }
    ],
    levels: [
      { id: 'pc_1', index: 1, name: '入门剪纸', difficulty: '⭐', creator: '剪纸大师', creatorAvatar: 'https://picsum.photos/seed/gp1/100/100' },
      { id: 'pc_2', index: 2, name: '雪花图案', difficulty: '⭐⭐', creator: '小友', creatorAvatar: 'https://picsum.photos/seed/user1/100/100' },
      { id: 'pc_3', index: 3, name: '窗花挑战', difficulty: '⭐⭐⭐', creator: '纸艺达人', creatorAvatar: 'https://picsum.photos/seed/user2/100/100' }
    ]
  },
  'game_ball': {
    id: 'game_ball', title: '坠落球', genre: '技巧', author: '深渊工作室',
    avatar: 'https://picsum.photos/seed/gp2/100/100',
    cover: '/assets/game-covers/ball.png',
    desc: '300层深渊挑战！旋转圆环对准缺口，让小球不断下坠。颜色随深度渐变，越深越难。',
    gameplay: '小球在最外圈弹跳→手指旋转当前圆环→对准缺口让小球穿过→逐层下坠→通关300层',
    artAssets: [
      { name: '彩虹圆环', preview: '/assets/game-covers/ball.png' },
      { name: '发光小球', preview: '/assets/game-covers/ball.png' }
    ],
    codeFiles: [
      { name: 'ball.js', desc: '游戏引擎（弹跳+下坠+颜色渐变）', path: 'games/ball.js', lines: 200 },
      { name: 'index.js', desc: '独立页面逻辑', path: 'pages/game-ball/index.js', lines: 394 },
      { name: 'index.wxml', desc: '页面模板', path: 'pages/game-ball/index.wxml', lines: 60 },
      { name: 'index.wxss', desc: '页面样式', path: 'pages/game-ball/index.wxss', lines: 74 }
    ],
    levels: [
      { id: 'bl_1', index: 1, name: '浅蓝深渊 (1-50层)', difficulty: '⭐', creator: '深渊工作室', creatorAvatar: 'https://picsum.photos/seed/gp2/100/100' },
      { id: 'bl_2', index: 2, name: '翠绿迷宫 (51-150层)', difficulty: '⭐⭐', creator: '旋转大师', creatorAvatar: 'https://picsum.photos/seed/user3/100/100' },
      { id: 'bl_3', index: 3, name: '烈焰地狱 (151-300层)', difficulty: '⭐⭐⭐', creator: '深渊工作室', creatorAvatar: 'https://picsum.photos/seed/gp2/100/100' }
    ]
  },
  'game_parking': {
    id: 'game_parking', title: '停车大挑战', genre: '策略', author: '停车达人',
    avatar: 'https://picsum.photos/seed/gp3/100/100',
    cover: '/assets/game-covers/parking.png',
    desc: '同色乘客配对上车！点击车辆驶出停车场，合理规划顺序通关。逆向生成保证每关有解。',
    gameplay: '停车场内有多辆彩色车→点击车辆驶出→同色乘客配对消除→规划顺序避免死锁→逆向生成保证有解',
    artAssets: [
      { name: '2.5D车辆', preview: '/assets/game-covers/parking.png' },
      { name: '停车场地面', preview: '/assets/game-covers/parking.png' }
    ],
    codeFiles: [
      { name: 'parking.js', desc: '游戏引擎（关卡生成+匹配消除）', path: 'games/parking.js', lines: 250 },
      { name: 'index.js', desc: '独立页面逻辑', path: 'pages/game-parking/index.js', lines: 300 },
      { name: 'index.wxml', desc: '页面模板', path: 'pages/game-parking/index.wxml', lines: 50 },
      { name: 'index.wxss', desc: '页面样式', path: 'pages/game-parking/index.wxss', lines: 60 }
    ],
    levels: [
      { id: 'pk_1', index: 1, name: '新手停车场', difficulty: '⭐', creator: '停车达人', creatorAvatar: 'https://picsum.photos/seed/gp3/100/100' },
      { id: 'pk_2', index: 2, name: '城市拥堵', difficulty: '⭐⭐', creator: '关卡设计师A', creatorAvatar: 'https://picsum.photos/seed/user4/100/100' },
      { id: 'pk_3', index: 3, name: '极限空间', difficulty: '⭐⭐⭐', creator: '停车达人', creatorAvatar: 'https://picsum.photos/seed/gp3/100/100' },
      { id: 'pk_4', index: 4, name: '双层停车', difficulty: '⭐⭐⭐', creator: '小友', creatorAvatar: 'https://picsum.photos/seed/user1/100/100' },
      { id: 'pk_5', index: 5, name: '彩虹迷阵', difficulty: '⭐⭐⭐⭐', creator: '关卡设计师B', creatorAvatar: 'https://picsum.photos/seed/user5/100/100' }
    ]
  },
  'game_lockscreen': {
    id: 'game_lockscreen', title: '密码锁挑战', genre: '解谜', author: '锁屏大师',
    avatar: 'https://picsum.photos/seed/lock/100/100',
    cover: '/assets/game-covers/lockscreen.png',
    desc: '仿真手机锁屏！输入正确密码解锁进入主屏幕，探索隐藏App和彩蛋。',
    gameplay: '仿真手机锁屏→点击进入密码界面→输入4位数字密码→正确则解锁进入主屏幕→探索隐藏内容',
    artAssets: [
      { name: '锁屏壁纸', preview: '/assets/game-covers/lockscreen.png' },
      { name: '数字键盘', preview: '/assets/game-covers/lockscreen.png' }
    ],
    codeFiles: [
      { name: 'video/index.js', desc: '内嵌交互逻辑（三态切换）', path: 'pages/video/index.js', lines: 500 },
      { name: 'video/index.wxml', desc: '锁屏/密码/主屏模板', path: 'pages/video/index.wxml', lines: 300 },
      { name: 'video/index.wxss', desc: '锁屏样式', path: 'pages/video/index.wxss', lines: 200 }
    ],
    levels: [
      { id: 'ls_1', index: 1, name: '简单密码 (4位)', difficulty: '⭐', creator: '锁屏大师', creatorAvatar: 'https://picsum.photos/seed/lock/100/100' },
      { id: 'ls_2', index: 2, name: '隐藏彩蛋', difficulty: '⭐⭐', creator: '解谜爱好者', creatorAvatar: 'https://picsum.photos/seed/user6/100/100' }
    ]
  }
}

Page({
  data: {
    promptText: '',
    attachments: [],
    createTab: 'inspire',
    statusBarHeight: 20,

    // 灵感数据
    inspireList: [
      { id: 'i1', cover: '/assets/inspire/shooter.jpg', prompt: '做一个射击游戏，肉鸽，有多种道具选择', tag: '射击' },
      { id: 'i2', cover: '/assets/inspire/puzzle.jpg', prompt: '解谜游戏，古风场景，水墨画风', tag: '解谜' },
      { id: 'i3', cover: '/assets/inspire/rpg.jpg', prompt: '回合制RPG，像素风，宠物养成', tag: 'RPG' },
      { id: 'i4', cover: '/assets/inspire/farm.jpg', prompt: '模拟经营农场，治愈画风，四季变化', tag: '模拟' },
      { id: 'i5', cover: '/assets/inspire/music.jpg', prompt: '音乐节奏游戏，霓虹灯风格', tag: '音游' },
      { id: 'i6', cover: '/assets/inspire/parkour.jpg', prompt: '跑酷游戏，赛博朋克城市背景', tag: '跑酷' },
    ],

    // 共创游戏数据
    collabGames: [
      { id: 'g_papercut', title: '剪纸工坊', desc: '创意剪纸艺术游戏，发挥你的想象力', cover: '/assets/game-covers/papercut.png', author: '剪纸大师', avatar: 'https://picsum.photos/seed/gp1/100/100', gamePage: '/pages/game-papercut/index' },
      { id: 'g_ball', title: '坠落球', desc: '控制小球穿越障碍，考验反应力', cover: '/assets/game-covers/ball.png', author: '深渊工作室', avatar: 'https://picsum.photos/seed/gp2/100/100', gamePage: '/pages/game-ball/index' },
      { id: 'g_parking', title: '停车大挑战', desc: '策略停车消除，解锁更多关卡', cover: '/assets/game-covers/parking.png', author: '停车达人', avatar: 'https://picsum.photos/seed/gp3/100/100', gamePage: '/pages/game-parking/index?level=1' },
    ],

    // 游戏详情模式
    gameDetail: null,
    draftCount: 0,
    coins: 128,

    // 共创群聊
    groupChatPreview: '',
    groupChatUnread: 0
  },

  onLoad() {
    var sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
    this.loadDraftCount()
    this.loadCoins()
  },

  onShow() {
    this.loadDraftCount()
    this.loadCoins()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    // 检查是否从视频页共创跳转过来
    var app = getApp()
    if (app.globalData && app.globalData.fromGame) {
      var game = app.globalData.fromGame
      app.globalData.fromGame = null
      var detail = GAME_ASSETS[game.id] || null
      if (detail) {
        this.setData({ gameDetail: detail, createTab: 'detail' })
        this._updateGroupChat(detail)
        return
      }
    } else {
      // 直接从TabBar进入，回到默认灵感/共创模式
      if (this.data.gameDetail) {
        this.setData({ gameDetail: null, createTab: 'inspire' })
      }
    }
    // 检查是否加载草稿
    if (app.globalData && app.globalData.loadDraft) {
      var draft = app.globalData.loadDraft
      app.globalData.loadDraft = null
      this.setData({ promptText: draft.prompt || '', attachments: draft.attachments || [] })
    }
  },

  loadDraftCount() {
    try {
      var drafts = wx.getStorageSync('create_drafts') || []
      this.setData({ draftCount: drafts.length })
    } catch(e) {}
  },

  onGoDrafts() {
    wx.navigateTo({ url: '/pages/drafts/index' })
  },

  loadCoins() {
    try {
      var coins = wx.getStorageSync('user_coins')
      if (coins) this.setData({ coins: coins })
    } catch(e) {}
  },

  onCoinTap() {
    wx.showModal({
      title: '🪙 金币 = Token',
      content: '当前余额 ' + this.data.coins + ' 金币\n可兑换 ' + this.data.coins + ' Token 用于AI创作',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // Fork共创
  onForkCreate() {
    if (!this.data.promptText.trim()) {
      wx.showToast({ title: '请输入你的创作描述', icon: 'none' })
      return
    }
    wx.showToast({ title: 'Fork 共创中...', icon: 'none', duration: 2000 })
  },

  // 输入框
  onPromptInput(e) {
    this.setData({ promptText: e.detail.value })
  },

  // 选择图片
  onChooseImage() {
    wx.chooseMedia({
      count: 3,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newAttachments = res.tempFiles.map(f => ({
          type: 'image',
          path: f.tempFilePath,
          name: '图片'
        }))
        this.setData({
          attachments: [...this.data.attachments, ...newAttachments].slice(0, 5)
        })
      }
    })
  },

  // 选择音频
  onChooseAudio() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a'],
      success: (res) => {
        const file = res.tempFiles[0]
        this.setData({
          attachments: [...this.data.attachments, {
            type: 'audio',
            path: file.path,
            name: file.name
          }].slice(0, 5)
        })
      },
      fail: () => {
        wx.showToast({ title: '请选择音频文件', icon: 'none' })
      }
    })
  },

  // 移除附件
  onRemoveAttachment(e) {
    const index = e.currentTarget.dataset.index
    const attachments = this.data.attachments.filter((_, i) => i !== index)
    this.setData({ attachments })
  },

  // 生成
  onGenerate() {
    if (!this.data.promptText.trim()) {
      wx.showToast({ title: '请输入创作描述', icon: 'none' })
      return
    }
    // 保存为草稿
    var now = new Date()
    var timeText = (now.getMonth()+1) + '月' + now.getDate() + '日 ' + 
      String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0')
    var draft = {
      id: 'draft_' + Date.now(),
      prompt: this.data.promptText,
      attachments: this.data.attachments,
      attachCount: this.data.attachments.length,
      cover: this.data.attachments.length > 0 && this.data.attachments[0].type === 'image' ? this.data.attachments[0].path : '',
      timeText: timeText,
      createTime: Date.now()
    }
    try {
      var drafts = wx.getStorageSync('create_drafts') || []
      drafts.unshift(draft)
      wx.setStorageSync('create_drafts', drafts)
      this.setData({ draftCount: drafts.length })
    } catch(e) {}

    wx.showToast({ title: '已保存草稿，创作中...', icon: 'none', duration: 2000 })
  },

  // Tab 切换
  onCreateTabTap(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ createTab: tab })
  },

  // 点击灵感卡片
  onInspireTap(e) {
    const prompt = e.currentTarget.dataset.prompt
    this.setData({ promptText: prompt })
    wx.showToast({ title: '已填入提示词', icon: 'none' })
  },

  // 返回创作页默认模式（从共创详情退出）
  onBackFromDetail() {
    this.setData({ gameDetail: null, createTab: 'inspire' })
  },

  // 点击共创游戏卡片
  onCollabTap(e) {
    const page = e.currentTarget.dataset.page
    if (page) wx.navigateTo({ url: page })
  },

  // 点击共创按钮
  onCoCreate(e) {
    const gameId = e.currentTarget.dataset.game
    wx.showToast({ title: '进入共创模式', icon: 'none' })
  },

  // 共创群聊入口点击
  onGroupChatTap() {
    var gd = this.data.gameDetail
    if (!gd) return
    // 跳转到消息页的群聊（带参数）
    wx.switchTab({ url: '/pages/message/index' })
    // 延迟跳转群聊详情（等消息页加载完）
    setTimeout(function() {
      var app = getApp()
      app.globalData.openGroupId = 'group_' + gd.id
      app.globalData.openGroupName = gd.title + ' 共创群'
      app.globalData.openGameInfo = { id: gd.id, title: gd.title, cover: gd.cover, page: gd.id === 'game_papercut' ? '/pages/game-papercut/index' : gd.id === 'game_ball' ? '/pages/game-ball/index' : gd.id === 'game_parking' ? '/pages/game-parking/index?level=1' : '/pages/game-lockscreen/index' }
    }, 300)
  },

  // 更新群聊预览
  _updateGroupChat(gd) {
    var previews = {
      'game_papercut': '剪纸大师：新图案龙凤呈祥上线了',
      'game_ball': '深渊工作室：300层通关攻略分享',
      'game_parking': '停车达人：第20关新关卡已发布',
      'game_lockscreen': '锁屏大师：新彩蛋密码是1337'
    }
    var unreads = { 'game_papercut': 5, 'game_ball': 12, 'game_parking': 3, 'game_lockscreen': 1 }
    this.setData({
      groupChatPreview: previews[gd.id] || '快来一起讨论吧',
      groupChatUnread: unreads[gd.id] || 0
    })
  }
})

},
"pages/message/index.js": function(module, exports, require) {
Page({
  data: {
    statusBarHeight: 44,
    // 通知分类（合并后：回复/赞与收藏/关注/悬赏动态）
    notifyTabs: [
      { key: 'replies', label: '回复', count: 7, icon: '/assets/icons/comment-orange.png' },
      { key: 'likes', label: '赞与收藏', count: 7, icon: '/assets/icons/heart-outline-orange.png' },
      { key: 'follows', label: '关注', count: 3, icon: '/assets/icons/bookmark-orange.png' },
      { key: 'bounty', label: '悬赏动态', count: 1, icon: '/assets/icons/share-orange.png' }
    ],
    // 聊天列表
    chatList: [
      { id: 'c1', name: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', lastMsg: '那个密室逃脱太好玩了！', time: '刚刚', unread: 2, isGroup: false },
      { id: 'group_papercut', name: '剪纸工坊 · 共创群', avatar: '/assets/game-covers/papercut.png', lastMsg: '剪纸大师：新图案龙凤呈祥上线了', time: '5分钟前', unread: 5, isGroup: true, gameId: 'game_papercut', gameTitle: '剪纸工坊' },
      { id: 'c3', name: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', lastMsg: '宫女那个结局也太虐了吧', time: '1小时前', unread: 0, isGroup: false },
      { id: 'group_ball', name: '坠落球 · 共创群', avatar: '/assets/game-covers/ball.png', lastMsg: '深渊工作室：300层通关攻略分享', time: '2小时前', unread: 12, isGroup: true, gameId: 'game_ball', gameTitle: '坠落球' },
      { id: 'c5', name: '停车达人', avatar: 'https://picsum.photos/seed/u5/100/100', lastMsg: '第15关怎么过啊救命', time: '昨天', unread: 0, isGroup: false },
      { id: 'group_parking', name: '停车大挑战 · 共创群', avatar: '/assets/game-covers/parking.png', lastMsg: '关卡设计师A：新关卡已提交审核', time: '昨天', unread: 3, isGroup: true, gameId: 'game_parking', gameTitle: '停车大挑战' },
      { id: 'group_lockscreen', name: '密码锁挑战 · 共创群', avatar: '/assets/game-covers/lockscreen.png', lastMsg: '锁屏大师：发现新彩蛋了！密码1337', time: '昨天', unread: 1, isGroup: true, gameId: 'game_lockscreen', gameTitle: '密码锁挑战' }
    ]
  },

  onLoad() {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  onNotifyTap(e) {
    var key = e.currentTarget.dataset.key
    wx.navigateTo({ url: '/pages/notify-detail/index?type=' + key })
  },

  onChatTap(e) {
    var id = e.currentTarget.dataset.id
    var chat = this.data.chatList.find(function(c) { return c.id === id })
    if (!chat) return

    if (chat.isGroup) {
      wx.navigateTo({
        url: '/pages/group-chat/index?groupId=' + id + '&gameId=' + (chat.gameId || '') + '&gameTitle=' + encodeURIComponent(chat.gameTitle || '')
      })
    } else {
      wx.showToast({ title: '私信功能开发中', icon: 'none' })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    // 检查是否从共创页跳过来要打开群聊
    var app = getApp()
    if (app.globalData && app.globalData.openGroupId) {
      var gid = app.globalData.openGroupId
      var gname = app.globalData.openGroupName
      var gi = app.globalData.openGameInfo
      app.globalData.openGroupId = null
      app.globalData.openGameInfo = null
      if (gi) {
        setTimeout(function() {
          wx.navigateTo({
            url: '/pages/group-chat/index?groupId=' + gid + '&gameId=' + gi.id + '&gameTitle=' + encodeURIComponent(gi.title || gname || '')
          })
        }, 200)
      }
    }
  }
})

},
"pages/profile/index.js": function(module, exports, require) {
const { stories, getStoryById, forumPosts, bounties } = require('../../data/mock')

var categoryColorMap = {
  '游戏讨论': '#F97316',
  '短剧讨论': '#EC4899',
  '综合交流': '#8B5CF6',
  '求助问答': '#3B82F6'
}

var bountyStatusMap = {
  'open': '进行中',
  'claimed': '已接单',
  'submitted': '已投稿',
  'completed': '已完成',
  'expired': '已过期'
}

var bountyStatusColorMap = {
  'open': '#22C55E',
  'claimed': '#F97316',
  'submitted': '#3B82F6',
  'completed': '#8B7355',
  'expired': '#9CA3AF'
}

Page({
  data: {
    userInfo: {
      avatar: '',
      nickName: '互动剧迷',
      userId: 'ID: drama_fan_001',
      following: 12,
      followers: 36
    },

    stats: {
      published: 0,
      liked: 0,
      collected: 0,
      history: 0
    },

    activeTab: 'liked',
    publishedFilter: 'all',

    // 当前 Tab 对应的列表
    currentList: [],
    leftList: [],
    rightList: [],
    statusBarHeight: 20,
    draftCount: 0,
    userLevel: 3,
    coins: 128,
    hasNewTask: true
  },

  onLoad() {
    var sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
    this.loadUserInfo()
  },

  onShow() {
    this.computeRealStats()
    this.switchTab(this.data.activeTab)
    this.loadDraftCount()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
  },

  loadDraftCount() {
    try {
      var drafts = wx.getStorageSync('create_drafts') || []
      this.setData({ draftCount: drafts.length })
    } catch(e) {}
  },

  onGoDrafts() {
    wx.navigateTo({ url: '/pages/drafts/index' })
  },

  onCoinTap() {
    wx.showModal({
      title: '🪙 金币说明',
      content: '1 金币 = 1 Token\n\n金币可用于创作页生成内容，完成任务可获得金币奖励。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onTaskTap() {
    wx.navigateTo({ url: '/pages/tasks/index' })
  },

  loadUserInfo() {
    try {
      var info = wx.getStorageSync('userInfo')
      if (info && info.nickName) {
        this.setData({
          'userInfo.avatar': info.avatarUrl || '',
          'userInfo.nickName': info.nickName
        })
      }
    } catch (e) {}
  },

  computeRealStats() {
    // 点赞
    var likedMap = {}
    try { likedMap = wx.getStorageSync('story_liked') || {} } catch (e) {}
    var likedCount = 0
    for (var k in likedMap) { if (likedMap[k]) likedCount++ }

    // 收藏
    var collectedMap = {}
    try { collectedMap = wx.getStorageSync('story_collected') || {} } catch (e) {}
    var collectedCount = 0
    for (var k in collectedMap) { if (collectedMap[k]) collectedCount++ }

    // 历史（从已解锁结局推算）
    var unlocked = {}
    try { unlocked = wx.getStorageSync('story_unlocked') || {} } catch (e) {}
    var historySet = {}
    for (var uk in unlocked) {
      if (unlocked[uk]) {
        var sid = uk.split('_')[0]
        historySet[sid] = true
      }
    }
    var historyCount = Object.keys(historySet).length

    // 发布内容计数（mock）
    var publishedCount = this.getPublishedMockData().length

    this.setData({
      'stats.liked': likedCount,
      'stats.collected': collectedCount,
      'stats.history': historyCount,
      'stats.published': publishedCount
    })
  },

  // ===== 发布内容的 Mock 数据 =====
  getPublishedMockData() {
    var list = []

    // 短剧（取前3个）
    stories.slice(0, 3).forEach(function(s) {
      list.push({
        id: s.id, type: 'drama', title: s.title,
        cover: s.cover, author: s.author, genre: s.genre
      })
    })

    // 游戏
    list.push({
      id: 'g_papercut', type: 'game', title: '剪纸工坊',
      page: '/pages/game-papercut/index',
      gameIcon: '✂️', gameColor: '#D42A20'
    })

    // 帖子（取前2个）
    forumPosts.slice(0, 2).forEach(function(p) {
      list.push({
        id: p.id, type: 'post', title: p.title,
        contentPreview: p.content.length > 30 ? p.content.slice(0, 30) + '...' : p.content,
        category: p.category,
        categoryColor: categoryColorMap[p.category] || '#F97316'
      })
    })

    // 悬赏（取前2个）
    bounties.slice(0, 2).forEach(function(b) {
      list.push({
        id: b.id, type: 'bounty', title: b.title,
        budget: b.budget,
        bountyType: b.type,
        statusText: bountyStatusMap[b.status] || b.status,
        statusColor: bountyStatusColorMap[b.status] || '#8B7355'
      })
    })

    return list
  },

  getFilteredPublishedData(filter) {
    var all = this.getPublishedMockData()
    if (filter === 'all') return all
    return all.filter(function(item) { return item.type === filter })
  },

  // ===== Tab 切换 =====
  onTabTap(e) {
    var tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    this.switchTab(tab)
  },

  switchTab(tab) {
    var ids = []
    var list = []

    if (tab === 'liked') {
      var map = {}
      try { map = wx.getStorageSync('story_liked') || {} } catch (e) {}
      for (var k in map) { if (map[k]) ids.push(k) }
      list = this.buildStoryList(ids)
    } else if (tab === 'collected') {
      var map = {}
      try { map = wx.getStorageSync('story_collected') || {} } catch (e) {}
      for (var k in map) { if (map[k]) ids.push(k) }
      list = this.buildStoryList(ids)
    } else if (tab === 'history') {
      var unlocked = {}
      try { unlocked = wx.getStorageSync('story_unlocked') || {} } catch (e) {}
      var historySet = {}
      for (var uk in unlocked) {
        if (unlocked[uk]) {
          var sid = uk.split('_')[0]
          historySet[sid] = true
        }
      }
      ids = Object.keys(historySet)
      list = this.buildStoryList(ids)
    } else if (tab === 'published') {
      list = this.getFilteredPublishedData(this.data.publishedFilter)
    }

    var leftList = []
    var rightList = []
    for (var i = 0; i < list.length; i++) {
      if (i % 2 === 0) {
        leftList.push(list[i])
      } else {
        rightList.push(list[i])
      }
    }

    this.setData({
      currentList: list,
      leftList: leftList,
      rightList: rightList
    })
  },

  // ===== 发布 Tab 分类筛选 =====
  onPublishedFilterTap(e) {
    var filter = e.currentTarget.dataset.filter
    if (filter === this.data.publishedFilter) return
    this.setData({ publishedFilter: filter })
    this.switchTab('published')
  },

  // ===== 混合内容点击 =====
  onMixedGameTap(e) {
    var page = e.currentTarget.dataset.page
    if (page) wx.navigateTo({ url: page })
  },

  onMixedPostTap(e) {
    var postId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/forum/detail?id=' + postId })
  },

  onMixedBountyTap(e) {
    var bountyId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/bounty/detail?id=' + bountyId })
  },

  buildStoryList(ids) {
    var list = []
    for (var i = 0; i < ids.length; i++) {
      var s = getStoryById(ids[i])
      if (s) {
        list.push({
          id: s.id,
          title: s.title,
          cover: s.cover,
          author: s.author,
          genre: s.genre
        })
      }
    }
    return list
  },

  // ===== 点击卡片跳转 =====
  onStoryTap(e) {
    var sid = e.currentTarget.dataset.storyid
    if (!sid) return
    var s = getStoryById(sid)
    if (!s) return
    wx.navigateTo({
      url: '/pages/detail/index?videoId=' + s.startVideo.id + '&storyId=' + s.id + '&title=' + encodeURIComponent(s.title)
    })
  },

  // ===== 设置 =====
  onSettingsTap() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  // ===== 获取微信头像昵称 =====
  onGetUserInfo() {
    var self = this
    wx.getUserProfile({
      desc: '用于展示个人主页',
      success: function (res) {
        var info = res.userInfo
        try { wx.setStorageSync('userInfo', info) } catch (e) {}
        self.setData({
          'userInfo.avatar': info.avatarUrl,
          'userInfo.nickName': info.nickName
        })
      },
      fail: function () {
        wx.showToast({ title: '授权后可显示头像', icon: 'none' })
      }
    })
  }
})

},
"pages/detail/index.js": function(module, exports, require) {
const { videoData, getComments, getStoryById } = require('../../data/mock')

Page({
  data: {
    video: null,
    videoId: '',
    title: '',
    liked: false,
    activeTab: 'comments',
    commentList: []
  },

  videoContext: null,

  onLoad(options) {
    const videoId = options.videoId || 'v001'
    const storyId = options.storyId || ''
    const title = decodeURIComponent(options.title || '')
    
    // 查找视频数据
    let video = null
    if (storyId) {
      video = getStoryById(storyId)
    }
    if (!video) {
      video = videoData.find(v => v.startVideo && v.startVideo.id === videoId)
    }
    if (!video) {
      video = videoData.find(v => v.id === storyId)
    }

    console.log('Detail page:', { videoId, storyId, found: !!video, src: video ? video.startVideo.src : 'none' })
    
    if (video) {
      const detail = {
        title: video.title,
        desc: video.desc || '',
        author: video.author,
        avatar: video.avatar,
        genre: video.genre,
        cover: video.cover,
        src: video.startVideo.src,
        poster: video.startVideo.poster || video.cover,
        likes: video.likes || 0,
        comments: video.comments || 0,
        shares: video.shares || 0
      }
      
      const comments = getComments(video.id, 8 + Math.floor(Math.random() * 5))
      
      this.setData({
        videoId,
        title: title || detail.title,
        video: detail,
        commentList: comments
      })
    }

    wx.setNavigationBarTitle({
      title: title || (video ? video.title : '视频详情')
    })
  },

  onReady() {
    if (this.data.video) {
      this.videoContext = wx.createVideoContext('detailVideo', this)
    }
  },

  onLikeTap() {
    const liked = !this.data.liked
    let likes = this.data.video.likes
    likes = liked ? likes + 1 : likes - 1
    this.setData({ liked, 'video.likes': likes })
  },

  onShowComments() {
    this.setData({ activeTab: 'comments' })
  },

  onTabIntro() {
    this.setData({ activeTab: 'intro' })
  },

  onTabComments() {
    this.setData({ activeTab: 'comments' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})

},
"pages/notify-detail/index.js": function(module, exports, require) {
Page({
  data: {
    statusBarHeight: 44,
    type: '',
    title: '',
    list: []
  },

  onLoad(options) {
    var sys = wx.getSystemInfoSync()
    var type = options.type || 'likes'
    var titleMap = {
      replies: '回复',
      likes: '赞与收藏',
      follows: '关注',
      bounty: '悬赏动态'
    }
    var title = titleMap[type] || '通知详情'

    var list = []
    if (type === 'replies') {
      list = [
        { id: 1, user: '吃瓜群众', avatar: 'https://picsum.photos/seed/u4/100/100', action: '评论了你', target: '你选的A结局好刺激啊！怎么想到的', time: '5分钟前' },
        { id: 2, user: '剧本杀爱好者', avatar: 'https://picsum.photos/seed/u6/100/100', action: '回复了你的评论', target: '对对对！我也是选的这个，太上头了', time: '30分钟前' },
        { id: 3, user: '大叔也追剧', avatar: 'https://picsum.photos/seed/u8/100/100', action: '评论了你的剪纸', target: '这个图案好好看，怎么剪的？教教我', time: '2小时前' },
        { id: 4, user: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', action: '回复了你的帖子', target: '停车游戏第5关怎么过啊？', time: '10分钟前' },
        { id: 5, user: '剪纸爱好者', avatar: 'https://picsum.photos/seed/fc3/100/100', action: '评论了你', target: '剪纸工坊隐藏图案解锁方法', time: '30分钟前' },
        { id: 6, user: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', action: '回复了你的评论', target: '宫女逆袭哪个结局最好哭？', time: '2小时前' }
      ]
    } else if (type === 'likes') {
      list = [
        { id: 1, user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', action: '赞了你的互动选择', target: '密室逃脱：选择了第一扇门', time: '2分钟前' },
        { id: 2, user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', action: '赞了你的评论', target: '"这个反转绝了"', time: '15分钟前' },
        { id: 3, user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', action: '赞了你的剪纸作品', target: '六折对称剪纸', time: '1小时前' },
        { id: 4, user: '柠檬茶', avatar: 'https://picsum.photos/seed/u9/100/100', action: '赞了你的游戏成绩', target: '坠落球第89层', time: '3小时前' },
        { id: 5, user: '小仙女', avatar: 'https://picsum.photos/seed/u7/100/100', action: '收藏了你的互动选择', target: '宫女逆袭：帮贵妃线', time: '10分钟前' },
        { id: 6, user: '颜值控', avatar: 'https://picsum.photos/seed/u12/100/100', action: '收藏了你的剪纸作品', target: '六折雪花剪纸', time: '1小时前' }
      ]
    } else if (type === 'follows') {
      list = [
        { id: 1, user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', action: '关注了你', target: '', time: '刚刚' },
        { id: 2, user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', action: '关注了你', target: '', time: '5分钟前' },
        { id: 3, user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', action: '关注了你', target: '', time: '1小时前' }
      ]
    } else if (type === 'bounty') {
      list = [
        { id: 1, user: '美术小能手', avatar: 'https://picsum.photos/seed/bs1/100/100', action: '投稿了你的悬赏', target: '优化停车游戏2.5D视觉效果', time: '20分钟前' },
        { id: 2, user: '算法工程师', avatar: 'https://picsum.photos/seed/bs4/100/100', action: '你的悬赏已被采纳', target: '停车游戏关卡无解bug修复', time: '1小时前' }
      ]
    }

    this.setData({ statusBarHeight: sys.statusBarHeight || 44, type: type, title: title, list: list })
  },

  onGoBack() {
    wx.navigateBack()
  }
})

},
"pages/group-chat/index.js": function(module, exports, require) {
// 各游戏的假聊天数据
var GROUP_DATA = {
  'game_papercut': {
    title: '剪纸工坊',
    cover: '/assets/game-covers/papercut.png',
    page: '/pages/game-papercut/index',
    messages: [
      { id:'m1', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'大家好！新图案「龙凤呈祥」已经上线了，大家可以试试看', time:'10:30' },
      { id:'m2', name:'纸艺爱好者', avatar:'https://picsum.photos/seed/pa1/100/100', text:'哇，刚剪了一个！太漂亮了吧 😍', time:'10:32', isSelf:true },
      { id:'m3', name:'小萌新', avatar:'https://picsum.photos/seed/pa2/100/100', text:'请问这个图案怎么剪的？我试了好几次都不对', time:'10:35' },
      { id:'m4', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'龙凤那个是六折剪法，先折成三角形，然后从底边1/3处开始剪弧线', time:'10:36' },
      { id:'m5', name:'手残党', avatar:'https://picsum.photos/seed/pa3/100/100', text:'哈哈哈我剪成了四不像', time:'10:40' },
      { id:'m6', name:'纸艺达人', avatar:'https://picsum.photos/seed/pa4/100/100', text:'分享我的作品！用了三层叠加剪法', time:'10:45' },
      { id:'m7', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'👏 厉害！这个可以收录到精选作品集里', time:'10:46' },
      { id:'m8', name:'新手小明', avatar:'https://picsum.photos/seed/pa5/100/100', text:'有人组队一起做关卡吗？我想设计一个圣诞主题的', time:'11:02' }
    ]
  },
  'game_ball': {
    title: '坠落球',
    cover: '/assets/game-covers/ball.png',
    page: '/pages/game-ball/index',
    messages: [
      { id:'m1', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'各位，300层通关完整攻略整理好了，看置顶消息', time:'09:00' },
      { id:'m2', name:'暴走萝莉', avatar:'https://picsum.photos/seed/ba1/100/100', text:'我到200层了！！终于突破瓶颈了', time:'09:15' },
      { id:'m3', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'🎉 太强了！200层以后圆环转速会加快30%', time:'09:16' },
      { id:'m4', name:'旋转大师', avatar:'https://picsum.photos/seed/ba2/100/100', text:'150-200层的秘诀就是不要急，等缺口对准再转', time:'09:20' },
      { id:'m5', name:'新人小白', avatar:'https://picsum.photos/seed/ba3/100/100', text:'我才30层...有没有入门技巧？', time:'09:35' },
      { id:'m6', name:'暴走萝莉', avatar:'https://picsum.photos/seed/ba1/100/100', text:'前50层慢慢熟悉手感就好，别急着冲', time:'09:36', isSelf:true },
      { id:'m7', name:'深渊行者', avatar:'https://picsum.photos/seed/ba4/100/100', text:'有人打到300层了吗？求教最后50层的配色规律', time:'10:00' },
      { id:'m8', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'250+每层颜色随机度更高，注意看边缘提示', time:'10:05' }
    ]
  },
  'game_parking': {
    title: '停车大挑战',
    cover: '/assets/game-covers/parking.png',
    page: '/pages/game-parking/index?level=1',
    messages: [
      { id:'m1', name:'停车达人', avatar:'https://picsum.photos/seed/gp3/100/100', text:'第20关新关卡已发布，难度⭐⭐⭐⭐，欢迎挑战', time:'14:00' },
      { id:'m2', name:'关卡设计师A', avatar:'https://picsum.photos/seed/pk1/100/100', text:'刚提交了一个新关卡给作者审核，双层停车的', time:'14:20' },
      { id:'m3', name:'停车小白', avatar:'https://picsum.photos/seed/pk2/100/100', text:'第15关怎么过啊救命，红车完全出不来', time:'14:35' },
      { id:'m4', name:'停车达人', avatar:'https://picsum.photos/seed/gp3/100/100', text:'15关先移蓝车→绿车出来→红车就通了', time:'14:36' },
      { id:'m5', name:'策略王', avatar:'https://picsum.photos/seed/pk3/100/100', text:'其实15关最优解只要7步', time:'14:40' },
      { id:'m6', name:'停车小白', avatar:'https://picsum.photos/seed/pk2/100/100', text:'天哪我走了23步才过...', time:'14:42', isSelf:true },
      { id:'m7', name:'关卡设计师B', avatar:'https://picsum.photos/seed/pk4/100/100', text:'彩虹迷阵关卡大家觉得难度怎么样？', time:'15:00' },
      { id:'m8', name:'车神附体', avatar:'https://picsum.photos/seed/pk5/100/100', text:'彩虹迷阵已通关！五星攻略稍后发', time:'15:10' }
    ]
  },
  'game_lockscreen': {
    title: '密码锁挑战',
    cover: '/assets/game-covers/lockscreen.png',
    page: '/pages/game-lockscreen/index',
    messages: [
      { id:'m1', name:'锁屏大师', avatar:'https://picsum.photos/seed/lock/100/100', text:'🔐 新彩蛋发现！在锁屏界面输入密码1337有惊喜', time:'16:00' },
      { id:'m2', name:'解谜爱好者', avatar:'https://picsum.photos/seed/lk1/100/100', text:'真的假的？！我去试试', time:'16:05' },
      { id:'m3', name:'黑客少年', avatar:'https://picsum.photos/seed/lk2/100/100', text:'试过了！打开了个隐藏小游戏哈哈', time:'16:12' },
      { id:'m4', name:'锁屏大师', avatar:'https://picsum.photos/seed/lock/100/100', text:'😏 还有更多隐藏彩蛋等着你们发现', time:'16:13' },
      { id:'m5', name:'密码猜谜王', avatar:'https://picsum.photos/seed/lk3/100/100', text:'有人知道第3个密码的提示是什么吗？', time:'16:30' },
      { id:'m6', name:'侦探模式', avatar:'https://picsum.photos/seed/lk4/100/100', text:'看锁屏壁纸上的数字，就是线索', time:'16:35' },
      { id:'m7', name:'新人玩家', avatar:'https://picsum.photos/seed/lk5/100/100', text:'这游戏细节也太多了吧', time:'17:00', isSelf:true }
    ]
  }
}

Page({
  data: {
    statusBarHeight: 44,
    groupId: '',
    gameId: '',
    groupName: '',
    gameInfo: null,
    messages: [],
    inputText: '',
    scrollToMsg: ''
  },

  onLoad(options) {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })

    var gid = options.groupId || ''
    var gameId = options.gameId || ''
    var gameTitle = decodeURIComponent(options.gameTitle || '')

    var groupData = GROUP_DATA[gameId] || GROUP_DATA['game_papercut']
    this.setData({
      groupId: gid,
      gameId: gameId,
      groupName: gameTitle || (groupData.title + ' · 共创群'),
      gameInfo: {
        id: gameId,
        title: groupData.title,
        cover: groupData.cover,
        page: groupData.page
      },
      messages: groupData.messages
    })

    // 滚动到底部
    setTimeout(function() {
      this.scrollToBottom()
    }.bind(this), 300)
  },

  onBack() {
    wx.navigateBack()
  },

  // 点击游戏条 → 跳转到对应游戏
  onGameTap() {
    var info = this.data.gameInfo
    if (!info || !info.page) return
    wx.navigateTo({ url: info.page })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  onSend() {
    var text = this.data.inputText.trim()
    if (!text) return

    var now = new Date()
    var h = String(now.getHours()).padStart(2, '0')
    var m = String(now.getMinutes()).padStart(2, '0')

    var myMsg = {
      id: 'my_' + Date.now(),
      name: '我',
      avatar: 'https://picsum.photos/seed/me/100/100',
      text: text,
      time: h + ':' + m,
      isSelf: true
    }

    this.setData({
      inputText: '',
      messages: this.data.messages.concat([myMsg])
    })

    this.scrollToBottom()

    // 模拟回复
    setTimeout(function() {
      var replies = [
        '说得对！👍',
        '同意楼上',
        '这个想法不错诶',
        '哈哈哈哈',
        '+1',
        '我也这么觉得'
      ]
      var replyNames = ['热心网友', '活跃分子', '路人甲', '吃瓜群众']
      var botMsg = {
        id: 'bot_' + Date.now(),
        name: replyNames[Math.floor(Math.random() * replyNames.length)],
        avatar: 'https://picsum.photos/seed/bot' + Math.floor(Math.random()*9) + '/100/100',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: h + ':' + m,
        isSelf: false
      }
      this.setData({
        messages: this.data.messages.concat([botMsg])
      })
      this.scrollToBottom()
    }.bind(this), 800 + Math.random() * 1200)
  },

  scrollToBottom() {
    var msgs = this.data.messages
    if (msgs.length > 0) {
      this.setData({ scrollToMsg: 'msg-' + (msgs.length - 1) })
    }
  }
})

},
"pages/game-papercut/index.js": function(module, exports, require) {
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

},
"pages/game-ball/index.js": function(module, exports, require) {
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

},
"pages/game-parking/index.js": function(module, exports, require) {
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

},
"pages/game-lockscreen/index.js": function(module, exports, require) {
// pages/index/index.js
const CORRECT_CODE = '8010';

Page({
  data: {
    screen: 'lock', // lock | passcode | home
    lockTime: '',
    lockDate: '',
    statusTime: '',
    battery: 86,
    inputLen: 0,
    shaking: false,
    apps: [
      { name: '信息', icon: '💬', color: '#34C759' },
      { name: '相机', icon: '📷', color: '#555555' },
      { name: '照片', icon: '🌈', color: '#FFFFFF' },
      { name: '天气', icon: '🌤️', color: '#4AC4F7' },
      { name: '时钟', icon: '🕐', color: '#000000' },
      { name: '地图', icon: '🗺️', color: '#68D96B' },
      { name: '备忘录', icon: '📝', color: '#FFCC02' },
      { name: '计算器', icon: '🔢', color: '#333333' },
      { name: '设置', icon: '⚙️', color: '#8E8E93' },
      { name: 'App Store', icon: '🅰️', color: '#0A84FF' },
      { name: '音乐', icon: '🎵', color: '#FC3C44' },
      { name: '日历', icon: '📅', color: '#FF3B30' },
      { name: '钱包', icon: '💳', color: '#1C1C1E' },
      { name: '健康', icon: '❤️', color: '#FF2D55' },
      { name: '文件', icon: '📁', color: '#007AFF' },
      { name: '视频', icon: '▶️', color: '#FF5733' }
    ],
    dockApps: [
      { name: '电话', icon: '📞', color: '#34C759' },
      { name: 'Safari', icon: '🧭', color: '#007AFF' },
      { name: '邮件', icon: '✉️', color: '#007AFF' },
      { name: '微信', icon: '💚', color: '#07C160' }
    ]
  },

  inputCode: '',

  onReady() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDay = weekDays[now.getDay()];

    this.setData({
      lockTime: `${h}:${m}`,
      lockDate: `${month}月${day}日 ${weekDay}`,
      statusTime: `${h}:${m}`
    });
  },

  // ========== 锁屏点击 → 跳转密码页 ==========
  onLockTap() {
    this.inputCode = '';
    this.setData({ screen: 'passcode', inputLen: 0, shaking: false });
  },

  // ========== 密码输入 ==========
  pressKey(e) {
    if (this.data.shaking) return; // 晃动期间不接受输入

    const num = e.currentTarget.dataset.num;
    this.inputCode += num;

    const len = this.inputCode.length;
    this.setData({ inputLen: len });

    // 按键触感
    wx.vibrateShort({ type: 'light' }).catch(() => {});

    if (len === 4) {
      // 延迟一小段判断，让最后一个圆点先显示
      setTimeout(() => this.checkCode(), 200);
    }
  },

  deleteKey() {
    if (this.inputCode.length > 0) {
      this.inputCode = this.inputCode.slice(0, -1);
      this.setData({ inputLen: this.inputCode.length });
    }
  },

  checkCode() {
    if (this.inputCode === CORRECT_CODE) {
      // 正确！解锁
      wx.vibrateShort({ type: 'medium' }).catch(() => {});
      this.setData({ screen: 'home' });
    } else {
      // 错误！晃动
      wx.vibrateLong().catch(() => {});
      this.setData({ shaking: true });
      setTimeout(() => {
        this.inputCode = '';
        this.setData({ shaking: false, inputLen: 0 });
      }, 600);
    }
  },

  cancelPasscode() {
    this.inputCode = '';
    this.setData({ screen: 'lock', inputLen: 0, shaking: false });
  }
});

},
"pages/forum/detail.js": function(module, exports, require) {
const { getForumPostById, getForumCommentsByPostId } = require('../../data/mock')

Page({
  data: {
    post: null,
    comments: [],
    commentInput: '',
    isLiked: false
  },

  onLoad(options) {
    var postId = options.id
    if (postId) {
      this.loadPost(postId)
      this.loadComments(postId)
    }
  },

  loadPost(postId) {
    var post = getForumPostById(postId)
    if (!post) return
    var categoryColorMap = {
      '游戏讨论': '#F97316',
      '短剧讨论': '#EC4899',
      '综合交流': '#8B5CF6',
      '求助问答': '#3B82F6'
    }
    this.setData({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        avatar: post.avatar,
        category: post.category,
        categoryColor: categoryColorMap[post.category] || '#F97316',
        likes: post.likes,
        comments: post.comments,
        createTime: post.createTime
      }
    })
  },

  loadComments(postId) {
    var list = getForumCommentsByPostId(postId)
    this.setData({ comments: list })
  },

  onLikeTap() {
    var isLiked = !this.data.isLiked
    var likes = this.data.post.likes + (isLiked ? 1 : -1)
    this.setData({
      isLiked: isLiked,
      'post.likes': likes
    })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  onSendComment() {
    var text = this.data.commentInput.trim()
    if (!text) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    var newComment = {
      id: 'new_' + Date.now(),
      postId: this.data.post.id,
      author: '我',
      avatar: 'https://picsum.photos/seed/me/100/100',
      content: text,
      likes: 0,
      createTime: '刚刚',
      parentId: null
    }
    this.setData({
      comments: [newComment].concat(this.data.comments),
      commentInput: '',
      'post.comments': this.data.post.comments + 1
    })
    wx.showToast({ title: '评论成功', icon: 'success' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})
},
"pages/forum/post.js": function(module, exports, require) {
const { forumCategories } = require('../../data/mock')

Page({
  data: {
    statusBarHeight: 44,
    categoryIndex: 0,
    categories: forumCategories,
    title: '',
    content: ''
  },

  onLoad() {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })
  },

  onCategoryChange(e) {
    this.setData({ categoryIndex: parseInt(e.detail.value) })
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onPublish() {
    var title = this.data.title.trim()
    var content = this.data.content.trim()
    if (!title) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!content) {
      wx.showToast({ title: '请输入正文', icon: 'none' })
      return
    }
    wx.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(function() {
      wx.navigateBack()
    }, 800)
  },

  onGoBack() {
    wx.navigateBack()
  }
})
},
"pages/bounty/detail.js": function(module, exports, require) {
const { getBountyById, getBountySubmissionsByBountyId } = require('../../data/mock')

var bountyStatusMap = {
  'open': '进行中',
  'claimed': '已接单',
  'submitted': '已投稿',
  'completed': '已完成',
  'expired': '已过期'
}

var bountyStatusColorMap = {
  'open': '#8B7355',
  'claimed': '#C9957A',
  'submitted': '#8B7355',
  'completed': '#8B7355',
  'expired': '#C9957A'
}

Page({
  data: {
    bounty: null,
    submissions: [],
    showSubmissions: true
  },

  onLoad(options) {
    var bountyId = options.id
    if (bountyId) {
      this.loadBounty(bountyId)
      this.loadSubmissions(bountyId)
    }
  },

  loadBounty(bountyId) {
    var b = getBountyById(bountyId)
    if (!b) return
    this.setData({
      bounty: {
        id: b.id,
        title: b.title,
        description: b.description,
        type: b.type,
        relatedGame: b.relatedGame,
        budget: b.budget,
        deadline: b.deadline,
        status: b.status,
        statusText: bountyStatusMap[b.status] || b.status,
        statusColor: bountyStatusColorMap[b.status] || '#8B7355',
        publisher: b.publisher,
        avatar: b.avatar,
        submissionsCount: b.submissionsCount,
        createTime: b.createTime
      }
    })
  },

  loadSubmissions(bountyId) {
    var list = getBountySubmissionsByBountyId(bountyId)
    this.setData({ submissions: list })
  },

  onToggleSubmissions() {
    this.setData({ showSubmissions: !this.data.showSubmissions })
  },

  onSubmitWork() {
    wx.showToast({ title: '投稿功能开发中', icon: 'none' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})
},
"pages/bounty/post.js": function(module, exports, require) {
Page({
  data: {
    statusBarHeight: 44,
    typeIndex: 0,
    types: ['关卡设计', '美术优化', 'Bug修复', '玩法创意', '其他'],
    gameIndex: 0,
    games: ['不关联游戏', '停车大挑战', '坠落球', '剪纸工坊'],
    title: '',
    description: '',
    budget: ''
  },

  onLoad() {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })
  },

  onTypeChange(e) {
    this.setData({ typeIndex: parseInt(e.detail.value) })
  },

  onGameChange(e) {
    this.setData({ gameIndex: parseInt(e.detail.value) })
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value })
  },

  onBudgetInput(e) {
    this.setData({ budget: e.detail.value })
  },

  onPublish() {
    var title = this.data.title.trim()
    var desc = this.data.description.trim()
    var budget = this.data.budget.trim()
    if (!title) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!desc) {
      wx.showToast({ title: '请输入需求描述', icon: 'none' })
      return
    }
    if (!budget || isNaN(Number(budget))) {
      wx.showToast({ title: '请输入有效预算', icon: 'none' })
      return
    }
    wx.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(function() {
      wx.navigateBack()
    }, 800)
  },

  onGoBack() {
    wx.navigateBack()
  }
})
},
"pages/drafts/index.js": function(module, exports, require) {
// 草稿页
Page({
  data: {
    drafts: []
  },

  onLoad() {
    this.loadDrafts()
  },

  onShow() {
    this.loadDrafts()
  },

  loadDrafts() {
    try {
      var drafts = wx.getStorageSync('create_drafts') || []
      this.setData({ drafts: drafts })
    } catch(e) {
      this.setData({ drafts: [] })
    }
  },

  onDraftTap(e) {
    var index = e.currentTarget.dataset.index
    var draft = this.data.drafts[index]
    if (!draft) return
    // 跳转到创作页并填入草稿内容
    var app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.loadDraft = draft
    wx.switchTab({ url: '/pages/create/index' })
  },

  onDeleteDraft(e) {
    var index = e.currentTarget.dataset.index
    var self = this
    wx.showModal({
      title: '删除草稿',
      content: '确定删除这条草稿吗？',
      success: function(res) {
        if (res.confirm) {
          var drafts = self.data.drafts.slice()
          drafts.splice(index, 1)
          self.setData({ drafts: drafts })
          try { wx.setStorageSync('create_drafts', drafts) } catch(x) {}
        }
      }
    })
  }
})

},
"pages/tasks/index.js": function(module, exports, require) {
Page({
  data: {
    coins: 128,
    tasks: [
      { id: 't1', title: '玩 5 个游戏', desc: '体验不同游戏玩法', reward: 50, progress: 3, total: 5, done: false },
      { id: 't2', title: '完成 1 次共创', desc: '参与游戏共创贡献关卡', reward: 100, progress: 0, total: 1, done: false },
      { id: 't3', title: '发布 1 条帖子', desc: '在论坛分享你的想法', reward: 20, progress: 1, total: 1, done: true },
      { id: 't4', title: '接取 1 个悬赏', desc: '完成悬赏任务获得金币', reward: 80, progress: 0, total: 1, done: false },
      { id: 't5', title: '收藏 3 个作品', desc: '发现喜欢的内容收藏起来', reward: 15, progress: 2, total: 3, done: false },
      { id: 't6', title: '每日签到', desc: '连续签到奖励翻倍', reward: 10, progress: 1, total: 1, done: true },
      { id: 't7', title: '邀请 1 位好友', desc: '邀请好友一起玩', reward: 200, progress: 0, total: 1, done: false }
    ]
  },

  onLoad() {
    try {
      var coins = wx.getStorageSync('user_coins')
      if (coins) this.setData({ coins: coins })
    } catch(e) {}
  },

  onClaimTask(e) {
    var id = e.currentTarget.dataset.id
    var tasks = this.data.tasks.map(function(t) {
      if (t.id === id && t.done) return t
      return t
    })
    wx.showToast({ title: '任务进行中', icon: 'none' })
  }
})

}};
const cache = {};
function load(name) {
  if (cache[name]) return cache[name].exports;
  const module = { exports: {} };
  cache[name] = module;
  if (!modules[name]) throw new Error('Missing original module: ' + name);
  const dirname = name.split('/').slice(0, -1);
  const localRequire = request => {
    const parts = [...dirname];
    for (const part of request.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    let target = parts.join('/');
    if (!target.endsWith('.js')) target += '.js';
    return load(target);
  };
  modules[name](module, module.exports, localRequire);
  return module.exports;
}
globalThis.__capturePage = "pages/video/index"; load("pages/video/index.js");
globalThis.__capturePage = "pages/feed/index"; load("pages/feed/index.js");
globalThis.__capturePage = "pages/create/index"; load("pages/create/index.js");
globalThis.__capturePage = "pages/message/index"; load("pages/message/index.js");
globalThis.__capturePage = "pages/profile/index"; load("pages/profile/index.js");
globalThis.__capturePage = "pages/detail/index"; load("pages/detail/index.js");
globalThis.__capturePage = "pages/notify-detail/index"; load("pages/notify-detail/index.js");
globalThis.__capturePage = "pages/group-chat/index"; load("pages/group-chat/index.js");
globalThis.__capturePage = "pages/game-papercut/index"; load("pages/game-papercut/index.js");
globalThis.__capturePage = "pages/game-ball/index"; load("pages/game-ball/index.js");
globalThis.__capturePage = "pages/game-parking/index"; load("pages/game-parking/index.js");
globalThis.__capturePage = "pages/game-lockscreen/index"; load("pages/game-lockscreen/index.js");
globalThis.__capturePage = "pages/forum/detail"; load("pages/forum/detail.js");
globalThis.__capturePage = "pages/forum/post"; load("pages/forum/post.js");
globalThis.__capturePage = "pages/bounty/detail"; load("pages/bounty/detail.js");
globalThis.__capturePage = "pages/bounty/post"; load("pages/bounty/post.js");
globalThis.__capturePage = "pages/drafts/index"; load("pages/drafts/index.js");
globalThis.__capturePage = "pages/tasks/index"; load("pages/tasks/index.js");
globalThis.__capturePage = null;
})();
