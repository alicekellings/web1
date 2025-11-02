# 路径问题修复记录

## 问题
`/open-avi-file-online` 页面在 Vercel 部署后 CSS 和 JS 文件 404 错误，页面无样式。

## 原因
相对路径在 Vercel 上解析错误：
- `styles.css` 被解析为 `/styles.css` 而不是 `/open-avi-file-online/styles.css`
- `app.js` 被解析为 `/app.js` 而不是 `/open-avi-file-online/app.js`

## 修复
将 `open-avi-file-online/index.html` 中的相对路径改为绝对路径：
- `styles.css` → `/open-avi-file-online/styles.css`
- `app.js` → `/open-avi-file-online/app.js`
- `../scripts/ffmpeg-handler.js` → `/scripts/ffmpeg-handler.js`

## 结果
页面正常显示，所有资源加载成功。
