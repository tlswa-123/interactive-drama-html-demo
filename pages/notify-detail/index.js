Page({
  data: {
    statusBarHeight: 44,
    type: '',
    title: '',
    list: []
  },

  onLoad(options) {
    var sys = wx.getSystemInfoSync()
    var type = options.type || 'likes'
    var titleMap = {
      replies: '回复',
      likes: '赞与收藏',
      follows: '关注',
      bounty: '悬赏动态'
    }
    var title = titleMap[type] || '通知详情'

    var list = []
    if (type === 'replies') {
      list = [
        { id: 1, user: '吃瓜群众', avatar: 'https://picsum.photos/seed/u4/100/100', action: '评论了你', target: '你选的A结局好刺激啊！怎么想到的', time: '5分钟前' },
        { id: 2, user: '剧本杀爱好者', avatar: 'https://picsum.photos/seed/u6/100/100', action: '回复了你的评论', target: '对对对！我也是选的这个，太上头了', time: '30分钟前' },
        { id: 3, user: '大叔也追剧', avatar: 'https://picsum.photos/seed/u8/100/100', action: '评论了你的剪纸', target: '这个图案好好看，怎么剪的？教教我', time: '2小时前' },
        { id: 4, user: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', action: '回复了你的帖子', target: '停车游戏第5关怎么过啊？', time: '10分钟前' },
        { id: 5, user: '剪纸爱好者', avatar: 'https://picsum.photos/seed/fc3/100/100', action: '评论了你', target: '剪纸工坊隐藏图案解锁方法', time: '30分钟前' },
        { id: 6, user: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', action: '回复了你的评论', target: '宫女逆袭哪个结局最好哭？', time: '2小时前' }
      ]
    } else if (type === 'likes') {
      list = [
        { id: 1, user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', action: '赞了你的互动选择', target: '密室逃脱：选择了第一扇门', time: '2分钟前' },
        { id: 2, user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', action: '赞了你的评论', target: '"这个反转绝了"', time: '15分钟前' },
        { id: 3, user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', action: '赞了你的剪纸作品', target: '六折对称剪纸', time: '1小时前' },
        { id: 4, user: '柠檬茶', avatar: 'https://picsum.photos/seed/u9/100/100', action: '赞了你的游戏成绩', target: '坠落球第89层', time: '3小时前' },
        { id: 5, user: '小仙女', avatar: 'https://picsum.photos/seed/u7/100/100', action: '收藏了你的互动选择', target: '宫女逆袭：帮贵妃线', time: '10分钟前' },
        { id: 6, user: '颜值控', avatar: 'https://picsum.photos/seed/u12/100/100', action: '收藏了你的剪纸作品', target: '六折雪花剪纸', time: '1小时前' }
      ]
    } else if (type === 'follows') {
      list = [
        { id: 1, user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', action: '关注了你', target: '', time: '刚刚' },
        { id: 2, user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', action: '关注了你', target: '', time: '5分钟前' },
        { id: 3, user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', action: '关注了你', target: '', time: '1小时前' }
      ]
    } else if (type === 'bounty') {
      list = [
        { id: 1, user: '美术小能手', avatar: 'https://picsum.photos/seed/bs1/100/100', action: '投稿了你的悬赏', target: '优化停车游戏2.5D视觉效果', time: '20分钟前' },
        { id: 2, user: '算法工程师', avatar: 'https://picsum.photos/seed/bs4/100/100', action: '你的悬赏已被采纳', target: '停车游戏关卡无解bug修复', time: '1小时前' }
      ]
    }

    this.setData({ statusBarHeight: sys.statusBarHeight || 44, type: type, title: title, list: list })
  },

  onGoBack() {
    wx.navigateBack()
  }
})
