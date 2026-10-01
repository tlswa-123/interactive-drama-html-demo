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
