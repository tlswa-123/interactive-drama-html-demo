# 互动剧本 HTML Demo

这是从 HTML 还原版独立复制的微调版本；之前的两个版本均未修改。保留了小程序的 18 个页面、78 个本地图片素材、模拟数据、互动剧本和四款小游戏逻辑。新版仅将底部导航上移 12px、将全部 52 个界面图标统一为线性风格，并去除搜索框与创作输入框不属于小程序原版的浏览器默认边框。

## 预览

直接打开[线上演示](https://tlswa-123.github.io/interactive-drama-html-demo/)即可体验。要在本机预览，在仓库根目录运行 `node preview.cjs`，然后打开 [http://127.0.0.1:8767/](http://127.0.0.1:8767/)。浏览器端入口是 `index.html`。`preview.cjs` 仅用于本机预览，无需安装依赖。

## 部署

整个仓库已经是可部署的静态站点，无需安装依赖或构建。把仓库根目录设为静态站点根目录即可；GitHub Pages 选择 `main` 分支的 `/ (root)`。请保持 `index.html`、`runtime.js`、`templates.js`、`page-bundle.js`、`vue.global.prod.js`、CSS 文件、`pages/` 与 `assets/` 的相对路径不变。页面使用 URL `#` 路由，适合放在仓库子路径。

## 目录

- `index.html`：浏览器入口；`runtime.js`、`templates.js`、`page-bundle.js`：小程序页面与交互的 HTML 适配。
- `pages/`、`games/`、`data/`：原版页面、四款小游戏与模拟数据；`assets/`：本地图片和优化图标。
- `preview.cjs`：本地预览服务器；`app.json` 和原版 WXML/WXSS 保留供对照。

## 资源

- 本地图片位于 `assets/`，所有原版静态素材引用均可在此目录找到。
- 微调后的图标位于 `assets/ui-icons/`，基于 Lucide Icons（许可见该目录的 `LICENSE`）；原始 PNG 保留在 `assets/icons/` 供对照。部署时应一并上传 SVG 目录，并确保服务器以 `image/svg+xml` 返回 SVG。
- 原版视频链接仍指向公开的 `tlswa-123/video` GitHub 仓库；14 个视频链接已检查可访问，播放需要联网。
- 原版模拟头像使用 `picsum.photos`，显示也需要联网。

页面模板由原版 WXML 转换，样式由原版 WXSS 转换，页面交互和 Canvas 游戏使用原版 JavaScript，经 `runtime.js` 适配浏览器。数据仍是原版模拟数据，不连接微信服务或实际 AI 生成服务。
