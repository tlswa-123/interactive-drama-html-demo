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