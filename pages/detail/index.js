const { videoData, getComments, getStoryById } = require('../../data/mock')

Page({
  data: {
    video: null,
    videoId: '',
    title: '',
    liked: false,
    activeTab: 'comments',
    commentList: []
  },

  videoContext: null,

  onLoad(options) {
    const videoId = options.videoId || 'v001'
    const storyId = options.storyId || ''
    const title = decodeURIComponent(options.title || '')
    
    // 查找视频数据
    let video = null
    if (storyId) {
      video = getStoryById(storyId)
    }
    if (!video) {
      video = videoData.find(v => v.startVideo && v.startVideo.id === videoId)
    }
    if (!video) {
      video = videoData.find(v => v.id === storyId)
    }

    console.log('Detail page:', { videoId, storyId, found: !!video, src: video ? video.startVideo.src : 'none' })
    
    if (video) {
      const detail = {
        title: video.title,
        desc: video.desc || '',
        author: video.author,
        avatar: video.avatar,
        genre: video.genre,
        cover: video.cover,
        src: video.startVideo.src,
        poster: video.startVideo.poster || video.cover,
        likes: video.likes || 0,
        comments: video.comments || 0,
        shares: video.shares || 0
      }
      
      const comments = getComments(video.id, 8 + Math.floor(Math.random() * 5))
      
      this.setData({
        videoId,
        title: title || detail.title,
        video: detail,
        commentList: comments
      })
    }

    wx.setNavigationBarTitle({
      title: title || (video ? video.title : '视频详情')
    })
  },

  onReady() {
    if (this.data.video) {
      this.videoContext = wx.createVideoContext('detailVideo', this)
    }
  },

  onLikeTap() {
    const liked = !this.data.liked
    let likes = this.data.video.likes
    likes = liked ? likes + 1 : likes - 1
    this.setData({ liked, 'video.likes': likes })
  },

  onShowComments() {
    this.setData({ activeTab: 'comments' })
  },

  onTabIntro() {
    this.setData({ activeTab: 'intro' })
  },

  onTabComments() {
    this.setData({ activeTab: 'comments' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})
