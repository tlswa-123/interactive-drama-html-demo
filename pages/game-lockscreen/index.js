// pages/index/index.js
const CORRECT_CODE = '8010';

Page({
  data: {
    screen: 'lock', // lock | passcode | home
    lockTime: '',
    lockDate: '',
    statusTime: '',
    battery: 86,
    inputLen: 0,
    shaking: false,
    apps: [
      { name: '信息', icon: '💬', color: '#34C759' },
      { name: '相机', icon: '📷', color: '#555555' },
      { name: '照片', icon: '🌈', color: '#FFFFFF' },
      { name: '天气', icon: '🌤️', color: '#4AC4F7' },
      { name: '时钟', icon: '🕐', color: '#000000' },
      { name: '地图', icon: '🗺️', color: '#68D96B' },
      { name: '备忘录', icon: '📝', color: '#FFCC02' },
      { name: '计算器', icon: '🔢', color: '#333333' },
      { name: '设置', icon: '⚙️', color: '#8E8E93' },
      { name: 'App Store', icon: '🅰️', color: '#0A84FF' },
      { name: '音乐', icon: '🎵', color: '#FC3C44' },
      { name: '日历', icon: '📅', color: '#FF3B30' },
      { name: '钱包', icon: '💳', color: '#1C1C1E' },
      { name: '健康', icon: '❤️', color: '#FF2D55' },
      { name: '文件', icon: '📁', color: '#007AFF' },
      { name: '视频', icon: '▶️', color: '#FF5733' }
    ],
    dockApps: [
      { name: '电话', icon: '📞', color: '#34C759' },
      { name: 'Safari', icon: '🧭', color: '#007AFF' },
      { name: '邮件', icon: '✉️', color: '#007AFF' },
      { name: '微信', icon: '💚', color: '#07C160' }
    ]
  },

  inputCode: '',

  onReady() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDay = weekDays[now.getDay()];

    this.setData({
      lockTime: `${h}:${m}`,
      lockDate: `${month}月${day}日 ${weekDay}`,
      statusTime: `${h}:${m}`
    });
  },

  // ========== 锁屏点击 → 跳转密码页 ==========
  onLockTap() {
    this.inputCode = '';
    this.setData({ screen: 'passcode', inputLen: 0, shaking: false });
  },

  // ========== 密码输入 ==========
  pressKey(e) {
    if (this.data.shaking) return; // 晃动期间不接受输入

    const num = e.currentTarget.dataset.num;
    this.inputCode += num;

    const len = this.inputCode.length;
    this.setData({ inputLen: len });

    // 按键触感
    wx.vibrateShort({ type: 'light' }).catch(() => {});

    if (len === 4) {
      // 延迟一小段判断，让最后一个圆点先显示
      setTimeout(() => this.checkCode(), 200);
    }
  },

  deleteKey() {
    if (this.inputCode.length > 0) {
      this.inputCode = this.inputCode.slice(0, -1);
      this.setData({ inputLen: this.inputCode.length });
    }
  },

  checkCode() {
    if (this.inputCode === CORRECT_CODE) {
      // 正确！解锁
      wx.vibrateShort({ type: 'medium' }).catch(() => {});
      this.setData({ screen: 'home' });
    } else {
      // 错误！晃动
      wx.vibrateLong().catch(() => {});
      this.setData({ shaking: true });
      setTimeout(() => {
        this.inputCode = '';
        this.setData({ shaking: false, inputLen: 0 });
      }, 600);
    }
  },

  cancelPasscode() {
    this.inputCode = '';
    this.setData({ screen: 'lock', inputLen: 0, shaking: false });
  }
});
