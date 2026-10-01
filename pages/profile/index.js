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
