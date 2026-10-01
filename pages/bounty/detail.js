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