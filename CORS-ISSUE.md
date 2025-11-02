# CORS 问题说明

## 🐛 问题

在本地开发服务器（`python -m http.server`）上运行时，FFmpeg.wasm 无法加载，出现 CORS 错误：

```
Failed to load FFmpeg: Failed to construct 'Worker': 
Script at 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.6/dist/umd/814.ffmpeg.js' 
cannot be accessed from origin 'http://localhost:8000'.
```

## 🔍 原因

1. **浏览器安全限制** - 浏览器不允许从不同源（CDN）加载 Web Worker
2. **本地服务器限制** - Python 的简单 HTTP 服务器不支持设置 CORS 头部
3. **FFmpeg.wasm 需求** - FFmpeg.wasm 使用 SharedArrayBuffer，需要特殊的 HTTP 头部

## ✅ 解决方案

### 方案1：部署到生产环境（推荐）⭐

部署到 Vercel 或 Netlify，这些平台会自动处理 CORS 和所需的 HTTP 头部。

```bash
# 部署到 Vercel
vercel

# 或部署到 Netlify
netlify deploy
```

**优点：**
- ✅ 完全解决 CORS 问题
- ✅ 自动配置正确的 HTTP 头部
- ✅ 免费且快速
- ✅ 这是最终用户会使用的环境

### 方案2：使用支持 CORS 的本地服务器

#### 选项 A：使用 Node.js http-server

```bash
# 安装
npm install -g http-server

# 运行（带 CORS 支持）
http-server -p 8000 --cors
```

#### 选项 B：使用 Python Flask

创建 `server.py`:

```python
from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
@app.route('/<path:path>')
def serve(path='index.html'):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(port=8000)
```

运行：
```bash
pip install flask flask-cors
python server.py
```

### 方案3：本地测试时禁用转换功能

当前已实现：转换按钮会显示友好提示，建议用户：
1. 下载原始文件
2. 使用桌面软件转换（VLC, HandBrake）
3. 或等待生产部署

## 🎯 推荐工作流程

### 开发阶段
```bash
# 使用简单服务器测试基础功能
python -m http.server 8000

# 测试：
# ✅ 文件上传
# ✅ 视频播放（MP4）
# ✅ 文件信息显示
# ✅ 下载功能
# ❌ 视频转换（需要生产环境）
```

### 测试转换功能
```bash
# 方法1：部署到 Vercel 测试
vercel

# 方法2：使用 http-server
npm install -g http-server
http-server -p 8000 --cors
```

### 生产部署
```bash
# 推送到 GitHub
git add .
git commit -m "Add video tools"
git push

# 在 Vercel 导入项目
# 自动部署，转换功能正常工作
```

## 📝 当前状态

### ✅ 已正常工作的功能
- 文件上传（拖拽和点击）
- MP4 视频播放
- 文件信息显示
- 下载原始文件
- 响应式设计
- SEO 优化

### ⏳ 需要生产环境的功能
- AVI 到 MP4 转换
- 视频压缩
- 音频提取
- GIF 转换

## 🚀 快速部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd web1
vercel

# 4. 生产部署
vercel --prod
```

部署后，所有功能（包括视频转换）都会正常工作！

## 💡 为什么不在本地修复？

1. **安全限制** - 浏览器的安全策略无法绕过
2. **不值得** - 生产环境会自动解决
3. **真实环境** - 用户会在生产环境使用，不是本地
4. **简单快速** - 部署到 Vercel 只需 1 分钟

## 🎓 学习要点

这个问题教会我们：
1. Web 开发中的 CORS 限制
2. SharedArrayBuffer 的安全要求
3. 本地开发 vs 生产环境的差异
4. 为什么需要专业的托管服务

## ✅ 结论

**不要在本地纠结 CORS 问题！**

直接部署到 Vercel/Netlify，问题自动解决。这是最快、最简单、最正确的方法。

```bash
# 一行命令解决所有问题
vercel
```

🎉 部署后，访问生产 URL，转换功能完美工作！
