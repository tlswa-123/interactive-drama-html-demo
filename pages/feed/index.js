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
