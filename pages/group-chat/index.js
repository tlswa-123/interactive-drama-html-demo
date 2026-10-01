// 各游戏的假聊天数据
var GROUP_DATA = {
  'game_papercut': {
    title: '剪纸工坊',
    cover: '/assets/game-covers/papercut.png',
    page: '/pages/game-papercut/index',
    messages: [
      { id:'m1', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'大家好！新图案「龙凤呈祥」已经上线了，大家可以试试看', time:'10:30' },
      { id:'m2', name:'纸艺爱好者', avatar:'https://picsum.photos/seed/pa1/100/100', text:'哇，刚剪了一个！太漂亮了吧 😍', time:'10:32', isSelf:true },
      { id:'m3', name:'小萌新', avatar:'https://picsum.photos/seed/pa2/100/100', text:'请问这个图案怎么剪的？我试了好几次都不对', time:'10:35' },
      { id:'m4', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'龙凤那个是六折剪法，先折成三角形，然后从底边1/3处开始剪弧线', time:'10:36' },
      { id:'m5', name:'手残党', avatar:'https://picsum.photos/seed/pa3/100/100', text:'哈哈哈我剪成了四不像', time:'10:40' },
      { id:'m6', name:'纸艺达人', avatar:'https://picsum.photos/seed/pa4/100/100', text:'分享我的作品！用了三层叠加剪法', time:'10:45' },
      { id:'m7', name:'剪纸大师', avatar:'https://picsum.photos/seed/gp1/100/100', text:'👏 厉害！这个可以收录到精选作品集里', time:'10:46' },
      { id:'m8', name:'新手小明', avatar:'https://picsum.photos/seed/pa5/100/100', text:'有人组队一起做关卡吗？我想设计一个圣诞主题的', time:'11:02' }
    ]
  },
  'game_ball': {
    title: '坠落球',
    cover: '/assets/game-covers/ball.png',
    page: '/pages/game-ball/index',
    messages: [
      { id:'m1', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'各位，300层通关完整攻略整理好了，看置顶消息', time:'09:00' },
      { id:'m2', name:'暴走萝莉', avatar:'https://picsum.photos/seed/ba1/100/100', text:'我到200层了！！终于突破瓶颈了', time:'09:15' },
      { id:'m3', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'🎉 太强了！200层以后圆环转速会加快30%', time:'09:16' },
      { id:'m4', name:'旋转大师', avatar:'https://picsum.photos/seed/ba2/100/100', text:'150-200层的秘诀就是不要急，等缺口对准再转', time:'09:20' },
      { id:'m5', name:'新人小白', avatar:'https://picsum.photos/seed/ba3/100/100', text:'我才30层...有没有入门技巧？', time:'09:35' },
      { id:'m6', name:'暴走萝莉', avatar:'https://picsum.photos/seed/ba1/100/100', text:'前50层慢慢熟悉手感就好，别急着冲', time:'09:36', isSelf:true },
      { id:'m7', name:'深渊行者', avatar:'https://picsum.photos/seed/ba4/100/100', text:'有人打到300层了吗？求教最后50层的配色规律', time:'10:00' },
      { id:'m8', name:'深渊工作室', avatar:'https://picsum.photos/seed/gp2/100/100', text:'250+每层颜色随机度更高，注意看边缘提示', time:'10:05' }
    ]
  },
  'game_parking': {
    title: '停车大挑战',
    cover: '/assets/game-covers/parking.png',
    page: '/pages/game-parking/index?level=1',
    messages: [
      { id:'m1', name:'停车达人', avatar:'https://picsum.photos/seed/gp3/100/100', text:'第20关新关卡已发布，难度⭐⭐⭐⭐，欢迎挑战', time:'14:00' },
      { id:'m2', name:'关卡设计师A', avatar:'https://picsum.photos/seed/pk1/100/100', text:'刚提交了一个新关卡给作者审核，双层停车的', time:'14:20' },
      { id:'m3', name:'停车小白', avatar:'https://picsum.photos/seed/pk2/100/100', text:'第15关怎么过啊救命，红车完全出不来', time:'14:35' },
      { id:'m4', name:'停车达人', avatar:'https://picsum.photos/seed/gp3/100/100', text:'15关先移蓝车→绿车出来→红车就通了', time:'14:36' },
      { id:'m5', name:'策略王', avatar:'https://picsum.photos/seed/pk3/100/100', text:'其实15关最优解只要7步', time:'14:40' },
      { id:'m6', name:'停车小白', avatar:'https://picsum.photos/seed/pk2/100/100', text:'天哪我走了23步才过...', time:'14:42', isSelf:true },
      { id:'m7', name:'关卡设计师B', avatar:'https://picsum.photos/seed/pk4/100/100', text:'彩虹迷阵关卡大家觉得难度怎么样？', time:'15:00' },
      { id:'m8', name:'车神附体', avatar:'https://picsum.photos/seed/pk5/100/100', text:'彩虹迷阵已通关！五星攻略稍后发', time:'15:10' }
    ]
  },
  'game_lockscreen': {
    title: '密码锁挑战',
    cover: '/assets/game-covers/lockscreen.png',
    page: '/pages/game-lockscreen/index',
    messages: [
      { id:'m1', name:'锁屏大师', avatar:'https://picsum.photos/seed/lock/100/100', text:'🔐 新彩蛋发现！在锁屏界面输入密码1337有惊喜', time:'16:00' },
      { id:'m2', name:'解谜爱好者', avatar:'https://picsum.photos/seed/lk1/100/100', text:'真的假的？！我去试试', time:'16:05' },
      { id:'m3', name:'黑客少年', avatar:'https://picsum.photos/seed/lk2/100/100', text:'试过了！打开了个隐藏小游戏哈哈', time:'16:12' },
      { id:'m4', name:'锁屏大师', avatar:'https://picsum.photos/seed/lock/100/100', text:'😏 还有更多隐藏彩蛋等着你们发现', time:'16:13' },
      { id:'m5', name:'密码猜谜王', avatar:'https://picsum.photos/seed/lk3/100/100', text:'有人知道第3个密码的提示是什么吗？', time:'16:30' },
      { id:'m6', name:'侦探模式', avatar:'https://picsum.photos/seed/lk4/100/100', text:'看锁屏壁纸上的数字，就是线索', time:'16:35' },
      { id:'m7', name:'新人玩家', avatar:'https://picsum.photos/seed/lk5/100/100', text:'这游戏细节也太多了吧', time:'17:00', isSelf:true }
    ]
  }
}

Page({
  data: {
    statusBarHeight: 44,
    groupId: '',
    gameId: '',
    groupName: '',
    gameInfo: null,
    messages: [],
    inputText: '',
    scrollToMsg: ''
  },

  onLoad(options) {
    var sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 44 })

    var gid = options.groupId || ''
    var gameId = options.gameId || ''
    var gameTitle = decodeURIComponent(options.gameTitle || '')

    var groupData = GROUP_DATA[gameId] || GROUP_DATA['game_papercut']
    this.setData({
      groupId: gid,
      gameId: gameId,
      groupName: gameTitle || (groupData.title + ' · 共创群'),
      gameInfo: {
        id: gameId,
        title: groupData.title,
        cover: groupData.cover,
        page: groupData.page
      },
      messages: groupData.messages
    })

    // 滚动到底部
    setTimeout(function() {
      this.scrollToBottom()
    }.bind(this), 300)
  },

  onBack() {
    wx.navigateBack()
  },

  // 点击游戏条 → 跳转到对应游戏
  onGameTap() {
    var info = this.data.gameInfo
    if (!info || !info.page) return
    wx.navigateTo({ url: info.page })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  onSend() {
    var text = this.data.inputText.trim()
    if (!text) return

    var now = new Date()
    var h = String(now.getHours()).padStart(2, '0')
    var m = String(now.getMinutes()).padStart(2, '0')

    var myMsg = {
      id: 'my_' + Date.now(),
      name: '我',
      avatar: 'https://picsum.photos/seed/me/100/100',
      text: text,
      time: h + ':' + m,
      isSelf: true
    }

    this.setData({
      inputText: '',
      messages: this.data.messages.concat([myMsg])
    })

    this.scrollToBottom()

    // 模拟回复
    setTimeout(function() {
      var replies = [
        '说得对！👍',
        '同意楼上',
        '这个想法不错诶',
        '哈哈哈哈',
        '+1',
        '我也这么觉得'
      ]
      var replyNames = ['热心网友', '活跃分子', '路人甲', '吃瓜群众']
      var botMsg = {
        id: 'bot_' + Date.now(),
        name: replyNames[Math.floor(Math.random() * replyNames.length)],
        avatar: 'https://picsum.photos/seed/bot' + Math.floor(Math.random()*9) + '/100/100',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: h + ':' + m,
        isSelf: false
      }
      this.setData({
        messages: this.data.messages.concat([botMsg])
      })
      this.scrollToBottom()
    }.bind(this), 800 + Math.random() * 1200)
  },

  scrollToBottom() {
    var msgs = this.data.messages
    if (msgs.length > 0) {
      this.setData({ scrollToMsg: 'msg-' + (msgs.length - 1) })
    }
  }
})
