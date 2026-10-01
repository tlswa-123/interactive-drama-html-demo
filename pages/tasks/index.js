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
