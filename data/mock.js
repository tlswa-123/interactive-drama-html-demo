// AI互动视频平台 - 模拟数据

// ==================== 云存储视频链接 ====================
var V1 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door1.mp4'
var V2 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door2.mp4'
var V3 = 'https://raw.githubusercontent.com/tlswa-123/video/main/door3.mp4'
var V4 = 'https://raw.githubusercontent.com/tlswa-123/video/main/v4.mp4?v=4'
var V5 = 'https://raw.githubusercontent.com/tlswa-123/video/main/v5.mp4?v=4'
// 红果视频（等用户提供新链接后替换，暂时用占位）
var HG1 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E5%B8%A6%E7%9D%80%E8%B6%85%E7%BA%A7%E5%95%86%E5%9C%BA%E9%80%9B%E5%8F%A4%E4%BB%A3_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG2 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E9%87%91%E7%89%8C%E5%BE%A1%E5%8C%BB_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG3 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E5%BF%B5%E5%BF%B5%E6%9C%89%E8%AF%8D_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG4 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E8%8F%A9%E6%8F%90%E4%B8%B4%E4%B8%96%E7%9C%9F%E4%BA%BAAI%E7%89%88_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG5 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E6%88%91%E6%98%AF%E5%8F%B8%E4%BB%A4%E5%8D%83%E9%87%91_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG6 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E4%B8%80%E5%93%81%E5%B8%83%E8%A1%A3_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG7 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E7%9C%9F%E5%8D%83%E9%87%91%E5%A5%B9%E6%98%AF%E5%AD%A6%E9%9C%B8_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG8 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E6%A0%80%E6%A0%80%E5%B1%BF%E5%A9%9A_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'
var HG9 = 'https://raw.githubusercontent.com/tlswa-123/video/main/%E8%87%AA%E5%BE%8B%E8%AE%A9%E4%BD%A0%E8%87%AA%E7%94%B1%EF%BC%8C%E6%B2%A1%E8%AE%A9%E4%BD%A0%E7%BE%8E%E5%A5%B3%E8%87%AA%E7%94%B1_30%E7%A7%92%E9%A2%84%E8%A7%88.mp4?v=2'

// ==================== 假评论池 ====================
var commentPool = [
  { user: '追剧小达人', avatar: 'https://picsum.photos/seed/u1/100/100', text: '太好看了！求更新', time: '2小时前' },
  { user: '夜猫子', avatar: 'https://picsum.photos/seed/u2/100/100', text: '熬夜看完了，根本停不下来', time: '3小时前' },
  { user: '古风迷妹', avatar: 'https://picsum.photos/seed/u3/100/100', text: '画面好美，bgm绝了', time: '5小时前' },
  { user: '吃瓜群众', avatar: 'https://picsum.photos/seed/u4/100/100', text: '这个反转我没想到啊！！', time: '6小时前' },
  { user: '路人甲', avatar: 'https://picsum.photos/seed/u5/100/100', text: '朋友推荐来的，没失望', time: '8小时前' },
  { user: '剧本杀爱好者', avatar: 'https://picsum.photos/seed/u6/100/100', text: '互动剧本太有意思了', time: '10小时前' },
  { user: '小仙女', avatar: 'https://picsum.photos/seed/u7/100/100', text: '选错了结局好虐', time: '12小时前' },
  { user: '大叔也追剧', avatar: 'https://picsum.photos/seed/u8/100/100', text: '制作精良，支持国产', time: '1天前' },
  { user: '柠檬茶', avatar: 'https://picsum.photos/seed/u9/100/100', text: '已经二刷了，不同选择不同结局好棒', time: '1天前' },
  { user: '暴走萝莉', avatar: 'https://picsum.photos/seed/u10/100/100', text: '为什么这么短！不够看！', time: '1天前' },
  { user: '佛系青年', avatar: 'https://picsum.photos/seed/u11/100/100', text: '随缘选了b，结局意外地好', time: '2天前' },
  { user: '颜值控', avatar: 'https://picsum.photos/seed/u12/100/100', text: '演员好好看啊救命', time: '2天前' },
  { user: '编剧志愿者', avatar: 'https://picsum.photos/seed/u13/100/100', text: '剧情设计得很巧妙', time: '2天前' },
  { user: '深夜食堂', avatar: 'https://picsum.photos/seed/u14/100/100', text: '边吃宵夜边看，完美', time: '3天前' },
  { user: '学生党', avatar: 'https://picsum.photos/seed/u15/100/100', text: '下课偷偷看的哈哈', time: '3天前' },
  { user: '文艺范', avatar: 'https://picsum.photos/seed/u16/100/100', text: '镜头语言很有质感', time: '3天前' },
  { user: '搞笑达人', avatar: 'https://picsum.photos/seed/u17/100/100', text: 'c选项笑死我了哈哈哈', time: '4天前' },
  { user: '甜党', avatar: 'https://picsum.photos/seed/u18/100/100', text: '好甜好甜！磕到了！', time: '4天前' }
]

function getComments(storyId, count) {
  var seed = 0
  for (var i = 0; i < storyId.length; i++) seed += storyId.charCodeAt(i)
  var result = []
  for (var j = 0; j < count; j++) {
    var idx = (seed + j * 7) % commentPool.length
    var c = commentPool[idx]
    result.push({ id: storyId + '_c' + j, user: c.user, avatar: c.avatar, text: c.text, time: c.time, likes: Math.floor(Math.random() * 500) + 10 })
  }
  return result
}

// ==================== 封面用 picsum（网络图片，避免本地路径报错） ====================
function cover(seed) {
  var m = {
    's003': '/assets/covers/s003.jpg',
    's003p': '/assets/covers/s003.jpg',
    's002': '/assets/covers/s002.jpg',
    's002p': '/assets/covers/s002.jpg',
    'end2a': '/assets/covers/end2a.jpg',
    'end3a': '/assets/covers/end3a.jpg',
    'end3b': '/assets/covers/end3b.jpg',
    's004': '/assets/covers/带着超级商场逛古代_30秒预览.jpg',
    's004p': '/assets/covers/带着超级商场逛古代_30秒预览.jpg',
    's005': '/assets/covers/金牌御医_mid.jpg',
    's005p': '/assets/covers/金牌御医_mid.jpg',
    's006': '/assets/covers/念念有词_30秒预览.jpg',
    's006p': '/assets/covers/念念有词_30秒预览.jpg',
    's007': '/assets/covers/菩提临世真人AI版_30秒预览.jpg',
    's007p': '/assets/covers/菩提临世真人AI版_30秒预览.jpg',
    's008': '/assets/covers/我是司令千金_30秒预览.jpg',
    's008p': '/assets/covers/我是司令千金_30秒预览.jpg',
    's009': '/assets/covers/一品布衣_mid.jpg',
    's009p': '/assets/covers/一品布衣_mid.jpg',
    's010': '/assets/covers/真千金她是学霸_30秒预览.jpg',
    's010p': '/assets/covers/真千金她是学霸_30秒预览.jpg',
    's011': '/assets/covers/栀栀屿婚_30秒预览.jpg',
    's011p': '/assets/covers/栀栀屿婚_30秒预览.jpg',
    's012': '/assets/covers/自律让你自由，没让你美女自由_30秒预览.jpg',
    's012p': '/assets/covers/自律让你自由，没让你美女自由_30秒预览.jpg',
  }
  return m[seed] || '/assets/covers/s003.jpg'
}

// ==================== 剧情定义 ====================
var stories = [
  {
    id: 's003',
    title: '密室逃脱：你能活几集？', hint: '互动短剧 · 两扇门，一个活一个死', genre: '悬疑',
    cover: cover('s003'),
    author: '剧有好戏', avatar: 'https://picsum.photos/seed/av3/100/100',
    desc: '醒来发现自己被困密室，两扇门背后截然不同的命运...',
    likes: 6453, comments: 423, shares: 156,
    startVideo: { id: 'v003', src: V1, poster: cover('s003p'), duration: 25 },
    choices: [
      { id: 'c3a', text: '打开第一扇门', nextId: 'v003_a', color: '#F97316' },
      { id: 'c3b', text: '打开第二扇门', nextId: 'v003_b', color: '#EC4899' }
    ],
    endings: {
      v003_a: { src: V2, poster: cover('end3a'), text: '你推开了第一扇门...' },
      v003_b: { src: V3, poster: cover('end3b'), text: '你推开了第二扇门...' }
    }
  },
  {
    id: 's002',
    title: '宫女逆袭：一个选择改变命运', hint: '互动短剧 · 进入后宫你如何生存？', genre: '古风',
    cover: cover('s002'),
    author: '古韵坊', avatar: 'https://picsum.photos/seed/av2/100/100',
    desc: '一个小宫女的命运，全在你一念之间',
    likes: 8721, comments: 567, shares: 234,
    startVideo: { id: 'v002', src: V4, poster: cover('s002p'), duration: 30,
      clues: [
        { id: 'clue_1_1', time: 5, text: '找到线索1：龙宫的守门兽左眼闪烁着金光', x: 20, y: 30, icon: '💎' },
        { id: 'clue_1_2', time: 8, text: '找到线索2：深渊入口处刻着古老的封印符文', x: 70, y: 60, icon: '🔮' }
      ]
    },
    choices: [
      { id: 'c2a', text: '用身体挡住水洼，让贵妃踩着自己过去', nextId: 'v002_a', color: '#F97316' },
      { id: 'c2b', text: '什么都不做', nextId: 'v002_b', color: '#8B7355' },
      { id: 'c2c', text: '破口大骂贵妃', nextId: 'v002_c', color: '#DC2626' }
    ],
    endings: {
      v002_a: { src: V5, poster: cover('end2a'), text: '贵妃对你刮目相看，你从此平步青云...' },
      v002_b: { src: '', poster: '', text: '你默默无闻地继续当侍女', blackScreen: true },
      v002_c: { src: '', poster: '', text: '贵妃赐你一丈红', blackScreen: true }
    }
  },
  {
    id: 's004', title: '穿越带着超市逛古代，你会怎么做？', hint: '互动短剧 · 古人第一次见到方便面', genre: '古风',
    cover: cover('s004'), author: '穿越频道', avatar: 'https://picsum.photos/seed/av4/100/100',
    desc: '带着超市穿越古代，古人看到薯片会怎样？',
    likes: 7832, comments: 489, shares: 201,
    startVideo: { id: 'v004', src: HG1, poster: cover('s004p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's005', title: '穿越成金牌御医，你能活到第几集？', hint: '互动短剧 · 皇上驾崩了你怎么办？', genre: '古风',
    cover: cover('s005'), author: '御医当道', avatar: 'https://picsum.photos/seed/av5/100/100',
    desc: '穿越成御医第一天，皇上就生病了...',
    likes: 4567, comments: 234, shares: 98,
    startVideo: { id: 'v005', src: HG2, poster: cover('s005p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's006', title: '念念有词：每句话都是命运转折', hint: '互动短剧 · 说错一句话就万劫不复', genre: '言情',
    cover: cover('s006'), author: '念念剧场', avatar: 'https://picsum.photos/seed/av6/100/100',
    desc: '每一句话都可能改变结局，你敢选吗？',
    likes: 9123, comments: 678, shares: 345,
    startVideo: { id: 'v006', src: HG3, poster: cover('s006p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's007', title: '菩提临世：你的修行从这里开始', hint: '互动短剧 · 菩提问你三个问题', genre: '仙侠',
    cover: cover('s007'), author: '神话新编', avatar: 'https://picsum.photos/seed/av7/100/100',
    desc: '如果菩提祖师活在现代，他会怎么收徒？',
    likes: 12456, comments: 891, shares: 567,
    startVideo: { id: 'v007', src: HG4, poster: cover('s007p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's008', title: '隐藏身份入伍，司令千金的选择', hint: '互动短剧 · 教官发现你身份后...', genre: '都市',
    cover: cover('s008'), author: '军旅甜宠', avatar: 'https://picsum.photos/seed/av8/100/100',
    desc: '千金小姐隐瞒身份参军，被教官发现后...',
    likes: 6789, comments: 345, shares: 123,
    startVideo: { id: 'v008', src: HG5, poster: cover('s008p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's009', title: '布衣逆袭：从乞丐到一品大员', hint: '互动短剧 · 一无所有你如何翻盘？', genre: '古风',
    cover: cover('s009'), author: '权谋天下', avatar: 'https://picsum.photos/seed/av9/100/100',
    desc: '从街头乞丐到一品大员，每一步都是生死抉择',
    likes: 5432, comments: 267, shares: 145,
    startVideo: { id: 'v009', src: HG6, poster: cover('s009p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's010', title: '被顶替的真千金回归，全员跪了', hint: '互动短剧 · 回归豪门第一天你怎么做？', genre: '都市',
    cover: cover('s010'), author: '豪门传奇', avatar: 'https://picsum.photos/seed/av10/100/100',
    desc: '被调包18年的真千金回归，假千金慌了',
    likes: 8901, comments: 543, shares: 278,
    startVideo: { id: 'v010', src: HG7, poster: cover('s010p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's011', title: '契约婚姻：总裁他假戏真做了', hint: '互动短剧 · 签完合同的第一晚...', genre: '言情',
    cover: cover('s011'), author: '甜蜜剧场', avatar: 'https://picsum.photos/seed/av11/100/100',
    desc: '本以为是契约婚姻，没想到总裁动了真心',
    likes: 7654, comments: 456, shares: 189,
    startVideo: { id: 'v011', src: HG8, poster: cover('s011p'), duration: 30 },
    choices: [], endings: {}
  },
  {
    id: 's012', title: '当健身遇上美女，你还能自律吗？', hint: '互动短剧 · 美女向你搭讪你怎么选？', genre: '都市',
    cover: cover('s012'), author: '爆笑日常', avatar: 'https://picsum.photos/seed/av12/100/100',
    desc: '自律博主遇到健身房美女，人设当场崩塌',
    likes: 3456, comments: 198, shares: 87,
    startVideo: { id: 'v012', src: HG9, poster: cover('s012p'), duration: 30 },
    choices: [], endings: {}
  }
]

// ==================== 分类 ====================
var categories = ['推荐', '古风', '言情', '仙侠', '悬疑', '都市']

// ==================== 帖子列表 ====================
function formatLikes(n) { return n > 9999 ? (n / 10000).toFixed(1) + 'w' : String(n) }

// 自荐语映射（部分帖子有）— 必须在 feedData 前定义
var _selfRecMap = {
  's002': '虐到肝疼必看！',
  's004': '笑到停不下来',
  's006': '台词封神了',
  's007': '三问定命运',
  's010': '全程高能反转'
}

var feedData = stories.map(function(s) {
  return {
    id: 'p_' + s.id, type: 'video', title: s.title, cover: s.cover,
    author: s.author, avatar: s.avatar,
    likes: s.likes || 1000, likeText: formatLikes(s.likes || 1000),
    videoId: s.startVideo.id, storyId: s.id, genre: s.genre,
    comments: s.comments || 0, shares: s.shares || 0,
    selfRec: _selfRecMap[s.id] || ''
  }
})

// ==================== 论坛帖子 ====================
var forumCategories = ['游戏讨论', '短剧讨论', '综合交流', '求助问答']

var forumPosts = [
  { id: 'f001', title: '停车游戏第5关怎么过啊？求教大佬', content: '卡在第五关了，那个红车怎么都出不来，有没有通关攻略？', author: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', category: '游戏讨论', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 45, comments: 12, createTime: '2小时前', isHot: false },
  { id: 'f002', title: '剪纸工坊隐藏图案解锁方法', content: '我发现连续剪对10个图案后会解锁一个隐藏的中国龙图案，有人知道吗？', author: '剪纸大师', avatar: 'https://picsum.photos/seed/f2/100/100', category: '游戏讨论', tags: ['g_papercut'], images: [], cover: '/assets/game-covers/papercut.png', likes: 128, comments: 34, createTime: '5小时前', isHot: true },
  { id: 'f003', title: '坠落球最高分记录挑战', content: '目前最高打到8921分，有人比我高吗？来挑战一下！', author: '深渊行者', avatar: 'https://picsum.photos/seed/f3/100/100', category: '游戏讨论', tags: ['g_ball'], images: [], cover: '/assets/game-covers/ball.png', likes: 89, comments: 56, createTime: '8小时前', isHot: true },
  { id: 'f004', title: '宫女逆袭哪个结局最好哭？', content: '我选了B结局，贵妃赐我一丈红那段真的泪目了，你们呢？', author: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', category: '短剧讨论', tags: ['s002'], images: [], cover: '/assets/covers/s002.jpg', likes: 234, comments: 67, createTime: '1小时前', isHot: true },
  { id: 'f005', title: '菩提临世的三个问题怎么选？', content: '第一个问题我选了"不忘初心"，后面两个怎么搭配才能解锁隐藏结局？', author: '修仙党', avatar: 'https://picsum.photos/seed/f5/100/100', category: '短剧讨论', tags: ['s007'], images: [], cover: '/assets/covers/菩提临世真人AI版_30秒预览.jpg', likes: 156, comments: 43, createTime: '3小时前', isHot: false },
  { id: 'f006', title: '穿越带着超市逛古代笑点合集', content: '古人看到方便面的表情太真实了，笑到肚子疼，大家还有什么名场面？', author: '爆笑日常', avatar: 'https://picsum.photos/seed/f6/100/100', category: '短剧讨论', tags: ['s004'], images: [], cover: '/assets/covers/带着超级商场逛古代_30秒预览.jpg', likes: 312, comments: 89, createTime: '6小时前', isHot: true },
  { id: 'f007', title: '这个平台什么时候上AI配音功能？', content: '希望能自己给短剧配音，或者选择不同声优的声音', author: '声优控', avatar: 'https://picsum.photos/seed/f7/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 78, comments: 45, createTime: '12小时前', isHot: false },
  { id: 'f008', title: '新人报到，求推荐好玩的互动短剧', content: '刚下载这个小程序，请问有哪些必玩的短剧和游戏？', author: '萌新一枚', avatar: 'https://picsum.photos/seed/f8/100/100', category: '求助问答', tags: [], images: [], cover: '', likes: 23, comments: 18, createTime: '1天前', isHot: false },
  { id: 'f009', title: '停车游戏的2.5D视觉效果怎么改？', content: '我自己尝试改了一下，但是立体感还是不够，有大神指点一下吗？', author: '停车达人', avatar: 'https://picsum.photos/seed/f9/100/100', category: '求助问答', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 67, comments: 21, createTime: '2天前', isHot: false },
  { id: 'f010', title: '自制了一个停车游戏的关卡，欢迎试玩', content: '用逆向生成算法做了一个新关卡，保证可解，难度中等偏上', author: '关卡设计师', avatar: 'https://picsum.photos/seed/f10/100/100', category: '游戏讨论', tags: ['g_parking'], images: [], cover: '/assets/game-covers/parking.png', likes: 198, comments: 45, createTime: '4小时前', isHot: true },
  { id: 'f011', title: '念念有词的台词太绝了', content: '每句话都是命运转折，编剧是怎么想出来的？', author: '文艺范', avatar: 'https://picsum.photos/seed/f11/100/100', category: '短剧讨论', tags: ['s006'], images: [], cover: '/assets/covers/念念有词_30秒预览.jpg', likes: 145, comments: 32, createTime: '10小时前', isHot: false },
  { id: 'f012', title: '建议增加多人对战模式', content: '比如停车游戏可以两个人同时解题，谁先解开谁赢', author: '竞技玩家', avatar: 'https://picsum.photos/seed/f12/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 256, comments: 78, createTime: '1天前', isHot: true },
  { id: 'f013', title: '真千金她是学霸结局解析', content: '回归豪门后每个选择都影响最终结局，整理了一个攻略图', author: '攻略组', avatar: 'https://picsum.photos/seed/f13/100/100', category: '短剧讨论', tags: ['s010'], images: [], cover: '/assets/covers/真千金她是学霸_30秒预览.jpg', likes: 189, comments: 54, createTime: '2天前', isHot: false },
  { id: 'f014', title: '坠落球的物理引擎讨论', content: '感觉球的速度曲线可以优化一下，现在有点不自然', author: '物理系学生', avatar: 'https://picsum.photos/seed/f14/100/100', category: '游戏讨论', tags: ['g_ball'], images: [], cover: '/assets/game-covers/ball.png', likes: 56, comments: 23, createTime: '3天前', isHot: false },
  { id: 'f015', title: '求推荐古风类的互动短剧', content: '喜欢古风题材的，除了宫女逆袭还有别的推荐吗？', author: '古风党', avatar: 'https://picsum.photos/seed/f15/100/100', category: '求助问答', tags: [], images: [], cover: '', likes: 34, comments: 15, createTime: '4天前', isHot: false },
  { id: 'f016', title: '这个平台的互动形式很有趣', content: '比传统的短视频有意思多了，期待更多类型', author: '资深用户', avatar: 'https://picsum.photos/seed/f16/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 112, comments: 28, createTime: '5天前', isHot: false },
  { id: 'f017', title: '布衣逆袭权谋线怎么走？', content: '从乞丐到一品大员，中间有几个关键选择点，选错就GG', author: '权谋爱好者', avatar: 'https://picsum.photos/seed/f17/100/100', category: '短剧讨论', tags: ['s009'], images: [], cover: '/assets/covers/一品布衣_30秒预览.jpg', likes: 178, comments: 41, createTime: '6小时前', isHot: true },
  { id: 'f018', title: '剪纸工坊的图案库能自定义吗？', content: '想上传自己的图案来剪，目前好像不支持？', author: '创意玩家', avatar: 'https://picsum.photos/seed/f18/100/100', category: '游戏讨论', tags: ['g_papercut'], images: [], cover: '/assets/game-covers/papercut.png', likes: 89, comments: 34, createTime: '2天前', isHot: false },
  { id: 'f019', title: '司令千金的选择题答案汇总', content: '整理了一份所有选项的结局汇总，方便大家二刷', author: '整理狂魔', avatar: 'https://picsum.photos/seed/f19/100/100', category: '短剧讨论', tags: ['s008'], images: [], cover: '/assets/covers/我是司令千金_30秒预览.jpg', likes: 267, comments: 93, createTime: '1天前', isHot: true },
  { id: 'f020', title: '平台未来的更新方向讨论', content: '希望能加入更多类型的互动内容，比如互动漫画、互动音乐', author: '产品经理', avatar: 'https://picsum.photos/seed/f20/100/100', category: '综合交流', tags: [], images: [], cover: '', likes: 345, comments: 112, createTime: '3天前', isHot: true }
]

// ==================== 帖子评论 ====================
var forumComments = [
  { id: 'fc001', postId: 'f001', author: '停车达人', avatar: 'https://picsum.photos/seed/fc1/100/100', content: '红车要先把旁边的蓝车挪开，你试试先动卡车', likes: 12, createTime: '1小时前', parentId: null },
  { id: 'fc002', postId: 'f001', author: '新手村', avatar: 'https://picsum.photos/seed/fc2/100/100', content: '感谢大佬！过了！', likes: 5, createTime: '30分钟前', parentId: 'fc001' },
  { id: 'fc003', postId: 'f002', author: '剪纸爱好者', avatar: 'https://picsum.photos/seed/fc3/100/100', content: '真的假的？我要去试试', likes: 8, createTime: '2小时前', parentId: null },
  { id: 'fc004', postId: 'f003', author: '挑战者', avatar: 'https://picsum.photos/seed/fc4/100/100', content: '9034分报到！', likes: 15, createTime: '3小时前', parentId: null },
  { id: 'fc005', postId: 'f004', author: '泪目党', avatar: 'https://picsum.photos/seed/fc5/100/100', content: 'A结局更虐，贵妃把你毒死了', likes: 23, createTime: '30分钟前', parentId: null },
  { id: 'fc006', postId: 'f004', author: '古风迷妹', avatar: 'https://picsum.photos/seed/f4/100/100', content: '啊？那我回头试试A', likes: 3, createTime: '10分钟前', parentId: 'fc005' },
  { id: 'fc007', postId: 'f010', author: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', content: '试了，确实不错，比官方第5关还难', likes: 7, createTime: '1小时前', parentId: null },
  { id: 'fc008', postId: 'f012', author: '官方账号', avatar: 'https://picsum.photos/seed/fc8/100/100', content: '感谢建议，已记录到需求池', likes: 45, createTime: '2小时前', parentId: null }
]

// ==================== 悬赏任务 ====================
var bounties = [
  { id: 'b001', title: '优化停车游戏2.5D视觉效果', description: '当前停车游戏的视觉缺乏2.5D立体感，希望有人能优化车辆渲染和场景透视，让游戏看起来更有层次。要求保留现有玩法逻辑。', type: '美术优化', relatedGame: 'g_parking', budget: 500, deadline: '7天后', status: 'open', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 3, createTime: '2天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b002', title: '坠落球新增障碍物设计', description: '想给坠落球增加3种新的障碍物类型，需要有创意且不影响现有平衡性。需要提供设计文档和演示效果。', type: '玩法创意', relatedGame: 'g_ball', budget: 300, deadline: '5天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b003', title: '剪纸工坊图案逆向生成算法优化', description: '当前图案生成有时过于简单，希望优化算法让生成的剪纸图案更有挑战性，同时保证可解性。', type: '关卡设计', relatedGame: 'g_papercut', budget: 800, deadline: '10天后', status: 'open', publisher: '剪纸大师', avatar: 'https://picsum.photos/seed/b3/100/100', submissionsCount: 0, createTime: '3天前', cover: '/assets/game-covers/papercut.png' },
  { id: 'b004', title: '停车游戏关卡无解bug修复', description: '有玩家反馈第12关偶尔会出现无解情况，需要排查逆向生成逻辑并修复。', type: 'Bug修复', relatedGame: 'g_parking', budget: 200, deadline: '3天后', status: 'claimed', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 2, createTime: '4天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b005', title: '宫女逆袭分支剧情补充', description: '希望补充两条新的分支剧情线，每条至少包含3个选择节点和2个不同结局。需要符合古风语境。', type: '关卡设计', relatedGame: '', budget: 1000, deadline: '14天后', status: 'open', publisher: '古韵坊', avatar: 'https://picsum.photos/seed/b5/100/100', submissionsCount: 0, createTime: '5天前', cover: '/assets/covers/s002.jpg' },
  { id: 'b006', title: '坠落球UI界面美化', description: '当前UI比较简单，希望重新设计一套更现代、更有科技感的UI界面，包括主界面、游戏界面和结算界面。', type: '美术优化', relatedGame: 'g_ball', budget: 400, deadline: '7天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 2, createTime: '2天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b007', title: '新增互动短剧类型：悬疑推理', description: '希望开发一部悬疑推理类型的互动短剧，要求有多个嫌疑人、线索收集机制和多重结局。', type: '其他', relatedGame: '', budget: 1500, deadline: '30天后', status: 'open', publisher: '剧有好戏', avatar: 'https://picsum.photos/seed/b7/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/covers/s003.jpg' },
  { id: 'b008', title: '菩提临世隐藏结局触发条件优化', description: '目前隐藏结局触发过于隐蔽，玩家很难发现，希望优化提示机制，让玩家有探索感但不至于完全找不到。', type: '玩法创意', relatedGame: '', budget: 350, deadline: '5天后', status: 'submitted', publisher: '神话新编', avatar: 'https://picsum.photos/seed/b8/100/100', submissionsCount: 2, createTime: '6天前', cover: '/assets/covers/菩提临世真人AI版_30秒预览.jpg' },
  { id: 'b009', title: '停车游戏增加多车颜色匹配模式', description: '在现有停车玩法基础上，增加颜色匹配规则：相同颜色的车必须停在同一区域。', type: '玩法创意', relatedGame: 'g_parking', budget: 600, deadline: '10天后', status: 'open', publisher: '停车达人', avatar: 'https://picsum.photos/seed/b1/100/100', submissionsCount: 1, createTime: '3天前', cover: '/assets/game-covers/parking.png' },
  { id: 'b010', title: '穿越带着超市逛古代表情包制作', description: '为这部短剧制作一套微信表情包，包含主要角色的经典表情，至少16个。', type: '美术优化', relatedGame: '', budget: 250, deadline: '7天后', status: 'completed', publisher: '穿越频道', avatar: 'https://picsum.photos/seed/b10/100/100', submissionsCount: 4, createTime: '10天前', cover: '/assets/covers/带着超级商场逛古代_30秒预览.jpg' },
  { id: 'b011', title: '真千金她是学霸学霸系统UI', description: '短剧中需要一个"学霸系统"的UI界面，显示任务进度、能力值、技能树等。', type: '美术优化', relatedGame: '', budget: 450, deadline: '8天后', status: 'open', publisher: '豪门传奇', avatar: 'https://picsum.photos/seed/b11/100/100', submissionsCount: 0, createTime: '2天前', cover: '/assets/covers/真千金她是学霸_30秒预览.jpg' },
  { id: 'b012', title: '坠落球排行榜数据接口bug', description: '排行榜偶尔会出现分数重复或排序错误的情况，需要修复后端接口逻辑。', type: 'Bug修复', relatedGame: 'g_ball', budget: 300, deadline: '4天后', status: 'open', publisher: '深渊工作室', avatar: 'https://picsum.photos/seed/b2/100/100', submissionsCount: 1, createTime: '1天前', cover: '/assets/game-covers/ball.png' },
  { id: 'b013', title: '剪纸工坊增加节日主题图案包', description: '为春节、中秋、端午等传统节日设计专属剪纸图案包，每个节日至少5个图案。', type: '关卡设计', relatedGame: 'g_papercut', budget: 500, deadline: '15天后', status: 'open', publisher: '剪纸大师', avatar: 'https://picsum.photos/seed/b3/100/100', submissionsCount: 0, createTime: '4天前', cover: '/assets/game-covers/papercut.png' },
  { id: 'b014', title: '契约婚姻总裁角色立绘优化', description: '男主的立绘需要优化，要求更帅、更有总裁气场，同时保持原有风格。', type: '美术优化', relatedGame: '', budget: 350, deadline: '6天后', status: 'claimed', publisher: '甜蜜剧场', avatar: 'https://picsum.photos/seed/b14/100/100', submissionsCount: 2, createTime: '3天前', cover: '/assets/covers/栀栀屿婚_30秒预览.jpg' },
  { id: 'b015', title: '平台整体新手引导流程设计', description: '目前新用户进来不知道该怎么玩，需要设计一套完整的新手引导流程，覆盖视频页、发现页、游戏互动。', type: '其他', relatedGame: '', budget: 800, deadline: '12天后', status: 'open', publisher: '产品经理', avatar: 'https://picsum.photos/seed/b15/100/100', submissionsCount: 1, createTime: '2天前', cover: '/assets/game-covers/lockscreen.png' }
]

// ==================== 悬赏投稿 ====================
var bountySubmissions = [
  { id: 'bs001', bountyId: 'b001', submitter: '美术小能手', avatar: 'https://picsum.photos/seed/bs1/100/100', content: '我尝试用斜45度视角重新渲染了车辆，增加了阴影和高光效果，立体感明显提升。附件是效果对比图。', attachments: [], status: 'pending', createTime: '1天前' },
  { id: 'bs002', bountyId: 'b001', submitter: '3D设计师', avatar: 'https://picsum.photos/seed/bs2/100/100', content: '采用伪3D渲染方案，车辆用2.5D精灵图，场景增加透视网格线，效果很自然。', attachments: [], status: 'pending', createTime: '1天前' },
  { id: 'bs003', bountyId: 'b001', submitter: '停车小白', avatar: 'https://picsum.photos/seed/f1/100/100', content: '我加了一个简单的景深效果，远处的车模糊处理，层次感好很多。', attachments: [], status: 'pending', createTime: '12小时前' },
  { id: 'bs004', bountyId: 'b004', submitter: '算法工程师', avatar: 'https://picsum.photos/seed/bs4/100/100', content: '已定位bug：逆向生成时偶尔会出现死锁，我加了死锁检测和重试机制，测试了100次未复现。', attachments: [], status: 'accepted', createTime: '2天前' },
  { id: 'bs005', bountyId: 'b010', submitter: '表情包达人', avatar: 'https://picsum.photos/seed/bs5/100/100', content: '完成了16个表情包，包含女主的"震惊""开心""生气"等经典表情。', attachments: [], status: 'accepted', createTime: '5天前' }
]

// ==================== 工具函数 ====================
function getForumPostById(id) {
  return forumPosts.find(function(p) { return p.id === id })
}

function getForumCommentsByPostId(postId) {
  return forumComments.filter(function(c) { return c.postId === postId })
}

function getBountyById(id) {
  return bounties.find(function(b) { return b.id === id })
}

function getBountySubmissionsByBountyId(bountyId) {
  return bountySubmissions.filter(function(s) { return s.bountyId === bountyId })
}

function getForumPostsByCategory(category) {
  if (category === '全部') return forumPosts
  return forumPosts.filter(function(p) { return p.category === category })
}

function getBountiesByStatus(status) {
  if (status === '全部') return bounties
  return bounties.filter(function(b) { return b.status === status })
}

module.exports = {
  stories: stories,
  videoData: stories,
  feedData: feedData,
  categories: categories,
  commentPool: commentPool,
  getComments: getComments,
  getStoryById: function(id) { return stories.find(function(s) { return s.id === id }) },
  // 论坛
  forumPosts: forumPosts,
  forumComments: forumComments,
  forumCategories: forumCategories,
  getForumPostById: getForumPostById,
  getForumCommentsByPostId: getForumCommentsByPostId,
  getForumPostsByCategory: getForumPostsByCategory,
  // 悬赏
  bounties: bounties,
  bountySubmissions: bountySubmissions,
  getBountyById: getBountyById,
  getBountySubmissionsByBountyId: getBountySubmissionsByBountyId,
  getBountiesByStatus: getBountiesByStatus
}
