# FFmpeg Handler 使用说明

## 快速开始

### 1. 引入脚本

```html
<!-- 先引入 FFmpeg.wasm -->
<script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js"></script>

<!-- 再引入我们的处理模块 -->
<script src="../scripts/ffmpeg-handler.js"></script>
```

### 2. 基本使用

```javascript
// 全局单例已自动创建：ffmpegHandler

// 转换视频
const outputBlob = await ffmpegHandler.convertVideo(
    inputFile,      // File 对象
    'mp4',          // 输出格式
    {
        onProgress: (percent) => console.log(`${percent}%`),
        quality: 23,
        preset: 'medium'
    }
);

// 下载结果
const url = URL.createObjectURL(outputBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'output.mp4';
a.click();
```

## 核心功能

### 1. 转换视频格式

```javascript
// AVI → MP4
const mp4Blob = await ffmpegHandler.convertVideo(aviFile, 'mp4', {
    quality: 23,        // 18-28，越小质量越好
    preset: 'medium',   // ultrafast, fast, medium, slow
    videoCodec: 'libx264',
    audioCodec: 'aac',
    onProgress: (percent) => updateProgress(percent)
});

// 支持的格式：mp4, avi, webm, mov, mkv
```

### 2. 压缩视频

```javascript
// 压缩视频，减小文件大小
const compressedBlob = await ffmpegHandler.compressVideo(
    videoFile,
    'medium',  // 'high', 'medium', 'low'
    (percent) => console.log(`${percent}%`)
);

// 压缩率：
// high: ~30% 减小
// medium: ~50% 减小
// low: ~70% 减小
```

### 3. 提取音频

```javascript
// 从视频中提取音频
const audioBlob = await ffmpegHandler.extractAudio(
    videoFile,
    'mp3',  // 'mp3', 'wav', 'aac', 'm4a'
    (percent) => console.log(`${percent}%`)
);
```

### 4. 转换为 GIF

```javascript
// 视频转 GIF
const gifBlob = await ffmpegHandler.convertToGIF(videoFile, {
    startTime: 0,    // 开始时间（秒）
    duration: 5,     // 持续时间（秒）
    fps: 10,         // 帧率
    width: 480,      // 宽度
    onProgress: (percent) => console.log(`${percent}%`)
});
```

### 5. 剪切视频

```javascript
// 剪切视频片段
const trimmedBlob = await ffmpegHandler.trimVideo(
    videoFile,
    10,    // 开始时间（秒）
    30,    // 持续时间（秒）
    (percent) => console.log(`${percent}%`)
);
```

## 完整示例

### 示例1：AVI to MP4 转换器

```javascript
// HTML
<input type="file" id="fileInput" accept=".avi">
<button id="convertBtn">Convert to MP4</button>
<div id="progress"></div>

// JavaScript
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const progress = document.getElementById('progress');

convertBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    try {
        convertBtn.disabled = true;
        progress.textContent = 'Loading FFmpeg...';

        const outputBlob = await ffmpegHandler.convertVideo(
            file,
            'mp4',
            {
                onProgress: (percent) => {
                    progress.textContent = `Converting: ${percent}%`;
                },
                quality: 23,
                preset: 'medium'
            }
        );

        // 下载
        const url = URL.createObjectURL(outputBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.avi', '.mp4');
        a.click();
        URL.revokeObjectURL(url);

        progress.textContent = 'Done!';
        convertBtn.disabled = false;

    } catch (error) {
        progress.textContent = `Error: ${error.message}`;
        convertBtn.disabled = false;
    }
});
```

### 示例2：视频压缩器

```javascript
const compressBtn = document.getElementById('compressBtn');
const qualitySelect = document.getElementById('qualitySelect');

compressBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const quality = qualitySelect.value; // 'high', 'medium', 'low'

    const compressedBlob = await ffmpegHandler.compressVideo(
        file,
        quality,
        (percent) => {
            progress.textContent = `Compressing: ${percent}%`;
        }
    );

    // 显示文件大小对比
    const originalSize = (file.size / 1024 / 1024).toFixed(2);
    const compressedSize = (compressedBlob.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - compressedBlob.size / file.size) * 100).toFixed(1);

    console.log(`Original: ${originalSize}MB`);
    console.log(`Compressed: ${compressedSize}MB`);
    console.log(`Reduction: ${reduction}%`);

    // 下载
    downloadBlob(compressedBlob, 'compressed_' + file.name);
});
```

## 注意事项

### 1. 文件大小限制
- 建议最大 500MB
- 大文件会消耗大量内存
- 转换时间与文件大小成正比

### 2. 浏览器兼容性
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

### 3. 性能优化
```javascript
// 使用更快的预设
preset: 'ultrafast'  // 速度快，质量稍低

// 降低分辨率
resolution: '1280:720'  // 从 1080p 降到 720p

// 使用更高的 CRF 值
quality: 28  // 文件更小，质量稍低
```

### 4. 错误处理
```javascript
try {
    const output = await ffmpegHandler.convertVideo(file, 'mp4');
} catch (error) {
    if (error.message.includes('not loaded')) {
        console.error('FFmpeg 未加载');
    } else if (error.message.includes('failed')) {
        console.error('转换失败');
    }
}
```

## API 参考

### convertVideo(inputFile, outputFormat, options)
- **inputFile**: File 对象
- **outputFormat**: 'mp4' | 'avi' | 'webm' | 'mov' | 'mkv'
- **options**:
  - `quality`: 18-28 (默认 23)
  - `preset`: 'ultrafast' | 'fast' | 'medium' | 'slow'
  - `videoCodec`: 'libx264' | 'libx265'
  - `audioCodec`: 'aac' | 'mp3'
  - `resolution`: '1920:1080' | '1280:720' | '640:480'
  - `onProgress`: (percent) => void

### compressVideo(inputFile, quality, onProgress)
- **quality**: 'high' | 'medium' | 'low'
- **返回**: Promise<Blob>

### extractAudio(inputFile, outputFormat, onProgress)
- **outputFormat**: 'mp3' | 'wav' | 'aac' | 'm4a'
- **返回**: Promise<Blob>

### convertToGIF(inputFile, options)
- **options**:
  - `startTime`: 开始时间（秒）
  - `duration`: 持续时间（秒）
  - `fps`: 帧率 (默认 10)
  - `width`: 宽度 (默认 480)

### trimVideo(inputFile, startTime, duration, onProgress)
- **startTime**: 开始时间（秒）
- **duration**: 持续时间（秒）

## 常见问题

**Q: 转换很慢怎么办？**
A: 使用 `preset: 'ultrafast'` 或降低分辨率

**Q: 内存不足？**
A: 减小文件大小或分段处理

**Q: 支持批量转换吗？**
A: 需要自己实现循环，一次处理一个文件

**Q: 可以在 Node.js 中使用吗？**
A: 不可以，这是浏览器专用的 WASM 版本
