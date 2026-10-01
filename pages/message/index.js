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
