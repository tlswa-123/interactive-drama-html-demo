const { getForumPostById, getForumCommentsByPostId } = require('../../data/mock')

Page({
  data: {
    post: null,
    comments: [],
    commentInput: '',
    isLiked: false
  },

  onLoad(options) {
    var postId = options.id
    if (postId) {
      this.loadPost(postId)
      this.loadComments(postId)
    }
  },

  loadPost(postId) {
    var post = getForumPostById(postId)
    if (!post) return
    var categoryColorMap = {
      '游戏讨论': '#F97316',
      '短剧讨论': '#EC4899',
      '综合交流': '#8B5CF6',
      '求助问答': '#3B82F6'
    }
    this.setData({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        avatar: post.avatar,
        category: post.category,
        categoryColor: categoryColorMap[post.category] || '#F97316',
        likes: post.likes,
        comments: post.comments,
        createTime: post.createTime
      }
    })
  },

  loadComments(postId) {
    var list = getForumCommentsByPostId(postId)
    this.setData({ comments: list })
  },

  onLikeTap() {
    var isLiked = !this.data.isLiked
    var likes = this.data.post.likes + (isLiked ? 1 : -1)
    this.setData({
      isLiked: isLiked,
      'post.likes': likes
    })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  onSendComment() {
    var text = this.data.commentInput.trim()
    if (!text) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    var newComment = {
      id: 'new_' + Date.now(),
      postId: this.data.post.id,
      author: '我',
      avatar: 'https://picsum.photos/seed/me/100/100',
      content: text,
      likes: 0,
      createTime: '刚刚',
      parentId: null
    }
    this.setData({
      comments: [newComment].concat(this.data.comments),
      commentInput: '',
      'post.comments': this.data.post.comments + 1
    })
    wx.showToast({ title: '评论成功', icon: 'success' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})