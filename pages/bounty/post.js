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