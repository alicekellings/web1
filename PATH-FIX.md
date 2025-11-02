# 问题修复记录

## 问题 1: 页面资源 404
`/open-avi-file-online` 页面在 Vercel 部署后 CSS 和 JS 文件 404 错误，页面无样式。

**原因**: 相对路径在 Vercel 上解析错误
**修复**: 将所有相对路径改为绝对路径
**结果**: 页面正常显示

## 问题 2: AVI 上传提示不支持
上传 AVI 文件后显示红色提示"AVI format not supported by browser"。

**原因**: 浏览器原生 `<video>` 标签不支持大多数 AVI 编码格式
**说明**: 这是正常行为，用户需要转换为 MP4 才能播放
**修复**: 
- 添加视频错误处理，友好提示用户
- 提供"Convert to MP4"按钮

## 问题 3: FFmpeg 转换失败 (CORS 错误)
点击"Convert to MP4"时出现错误："Failed to construct 'Worker': Script cannot be accessed from origin"。

**原因**: FFmpeg.wasm 从 CDN 加载 Worker 脚本时遇到跨域限制
**修复**: 
- 添加 SharedArrayBuffer 检测
- 提供更友好的错误提示
- 建议用户下载文件后使用桌面软件（VLC、HandBrake）转换
**注意**: 视频转换功能受浏览器安全策略限制，在某些环境下可能无法使用
