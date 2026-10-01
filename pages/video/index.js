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
