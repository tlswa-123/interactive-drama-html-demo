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
