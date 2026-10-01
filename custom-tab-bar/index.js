Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/video/index", text: "视频", iconPath: "/assets/icons/video.png", selectedIconPath: "/assets/icons/video-active.png" },
      { pagePath: "/pages/feed/index", text: "发现", iconPath: "/assets/icons/feed.png", selectedIconPath: "/assets/icons/feed-active.png" },
      { pagePath: "/pages/create/index", text: "", iconPath: "/assets/icons/create.png", selectedIconPath: "/assets/icons/create-active.png" },
      { pagePath: "/pages/message/index", text: "消息", iconPath: "/assets/icons/message.png", selectedIconPath: "/assets/icons/message-active.png" },
      { pagePath: "/pages/profile/index", text: "我的", iconPath: "/assets/icons/profile.png", selectedIconPath: "/assets/icons/profile-active.png" }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    }
  }
})
