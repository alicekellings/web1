/**
 * FFmpeg Handler - 通用视频处理模块
 * 提供视频转换、压缩、提取音频等功能
 */

class FFmpegHandler {
    constructor() {
        this.ffmpeg = null;
        this.loaded = false;
        this.loading = false;
        this.progressCallback = null;
    }

    /**
     * 加载 FFmpeg
     * @param {Function} onProgress - 进度回调函数
     * @returns {Promise<boolean>}
     */
    async load(onProgress) {
        if (this.loaded) return true;
        
        if (this.loading) {
            // 等待加载完成
            while (this.loading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.loaded;
        }

        this.loading = true;
        this.progressCallback = onProgress;

        try {
            // 检查 FFmpeg 是否已加载
            if (typeof FFmpegWASM === 'undefined') {
                throw new Error('FFmpeg library not loaded. Please include the script in your HTML.');
            }

            const { FFmpeg } = FFmpegWASM;
            const { fetchFile } = FFmpegWASM;
            
            this.ffmpeg = new FFmpeg();
            this.fetchFile = fetchFile;

            // 监听日志
            this.ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });

            // 监听进度
            this.ffmpeg.on('progress', ({ progress, time }) => {
                const percent = Math.round(progress * 100);
                if (this.progressCallback) {
                    this.progressCallback(percent, time);
                }
            });

            // 加载 FFmpeg 核心
            await this.ffmpeg.load({
                coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
            });

            this.loaded = true;
            this.loading = false;
            console.log('[FFmpeg] Loaded successfully');
            return true;

        } catch (error) {
            this.loading = false;
            this.loaded = false;
            console.error('[FFmpeg] Load failed:', error);
            throw new Error(`Failed to load FFmpeg: ${error.message}`);
        }
    }

    /**
     * 转换视频格式
     * @param {File} inputFile - 输入文件
     * @param {string} outputFormat - 输出格式 (mp4, avi, webm, mov, mkv)
     * @param {Object} options - 转换选项
     * @returns {Promise<Blob>}
     */
    async convertVideo(inputFile, outputFormat, options = {}) {
        if (!this.loaded) {
            await this.load(options.onProgress);
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;
        const outputName = `output.${outputFormat}`;

        try {
            // 写入输入文件
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            // 构建 FFmpeg 命令
            const args = [
                '-i', inputName,
                '-c:v', options.videoCodec || 'libx264',  // 视频编码器
                '-preset', options.preset || 'medium',     // 编码速度
                '-crf', (options.quality || 23).toString(), // 质量 (18-28)
                '-c:a', options.audioCodec || 'aac',       // 音频编码器
                '-b:a', options.audioBitrate || '128k',    // 音频比特率
            ];

            // 如果指定了分辨率
            if (options.resolution) {
                args.push('-vf', `scale=${options.resolution}`);
            }

            args.push(outputName);

            // 执行转换
            await this.ffmpeg.exec(args);

            // 读取输出文件
            const data = await this.ffmpeg.readFile(outputName);

            // 清理文件
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            // 返回 Blob
            return new Blob([data.buffer], { type: `video/${outputFormat}` });

        } catch (error) {
            console.error('[FFmpeg] Conversion failed:', error);
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    /**
     * 压缩视频
     * @param {File} inputFile - 输入文件
     * @param {string} quality - 质量等级 (high, medium, low)
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Blob>}
     */
    async compressVideo(inputFile, quality = 'medium', onProgress) {
        if (!this.loaded) {
            await this.load(onProgress);
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;
        const outputName = 'output.mp4';

        // 质量映射 (CRF值: 越小质量越好，文件越大)
        const qualityMap = {
            high: 20,    // 高质量
            medium: 26,  // 中等质量
            low: 32      // 低质量
        };

        const crf = qualityMap[quality] || 26;

        try {
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            await this.ffmpeg.exec([
                '-i', inputName,
                '-c:v', 'libx264',
                '-crf', crf.toString(),
                '-preset', 'medium',
                '-c:a', 'aac',
                '-b:a', '96k',  // 降低音频比特率
                outputName
            ]);

            const data = await this.ffmpeg.readFile(outputName);

            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'video/mp4' });

        } catch (error) {
            console.error('[FFmpeg] Compression failed:', error);
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    /**
     * 提取音频
     * @param {File} inputFile - 输入视频文件
     * @param {string} outputFormat - 输出音频格式 (mp3, wav, aac, m4a)
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Blob>}
     */
    async extractAudio(inputFile, outputFormat = 'mp3', onProgress) {
        if (!this.loaded) {
            await this.load(onProgress);
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;
        const outputName = `output.${outputFormat}`;

        try {
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            const args = [
                '-i', inputName,
                '-vn',  // 不要视频
            ];

            // 根据格式选择编码器
            if (outputFormat === 'mp3') {
                args.push('-acodec', 'libmp3lame', '-b:a', '192k');
            } else if (outputFormat === 'wav') {
                args.push('-acodec', 'pcm_s16le');
            } else if (outputFormat === 'aac' || outputFormat === 'm4a') {
                args.push('-acodec', 'aac', '-b:a', '192k');
            }

            args.push(outputName);

            await this.ffmpeg.exec(args);

            const data = await this.ffmpeg.readFile(outputName);

            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: `audio/${outputFormat}` });

        } catch (error) {
            console.error('[FFmpeg] Audio extraction failed:', error);
            throw new Error(`Audio extraction failed: ${error.message}`);
        }
    }

    /**
     * 转换为 GIF
     * @param {File} inputFile - 输入视频文件
     * @param {Object} options - GIF 选项
     * @returns {Promise<Blob>}
     */
    async convertToGIF(inputFile, options = {}) {
        if (!this.loaded) {
            await this.load(options.onProgress);
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;
        const outputName = 'output.gif';

        const {
            startTime = 0,      // 开始时间（秒）
            duration = 5,       // 持续时间（秒）
            fps = 10,           // 帧率
            width = 480,        // 宽度
        } = options;

        try {
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            await this.ffmpeg.exec([
                '-i', inputName,
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`,
                '-loop', '0',
                outputName
            ]);

            const data = await this.ffmpeg.readFile(outputName);

            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'image/gif' });

        } catch (error) {
            console.error('[FFmpeg] GIF conversion failed:', error);
            throw new Error(`GIF conversion failed: ${error.message}`);
        }
    }

    /**
     * 剪切视频
     * @param {File} inputFile - 输入文件
     * @param {number} startTime - 开始时间（秒）
     * @param {number} duration - 持续时间（秒）
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Blob>}
     */
    async trimVideo(inputFile, startTime, duration, onProgress) {
        if (!this.loaded) {
            await this.load(onProgress);
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;
        const outputName = `output.${inputExt}`;

        try {
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            await this.ffmpeg.exec([
                '-i', inputName,
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-c', 'copy',  // 复制编码，快速剪切
                outputName
            ]);

            const data = await this.ffmpeg.readFile(outputName);

            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: `video/${inputExt}` });

        } catch (error) {
            console.error('[FFmpeg] Trim failed:', error);
            throw new Error(`Trim failed: ${error.message}`);
        }
    }

    /**
     * 获取视频信息
     * @param {File} inputFile - 输入文件
     * @returns {Promise<Object>}
     */
    async getVideoInfo(inputFile) {
        if (!this.loaded) {
            await this.load();
        }

        const inputExt = inputFile.name.split('.').pop().toLowerCase();
        const inputName = `input.${inputExt}`;

        try {
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(inputFile));

            // 使用 ffprobe 获取信息（如果可用）
            // 这里简化处理，返回基本信息
            const info = {
                format: inputExt,
                size: inputFile.size,
                name: inputFile.name
            };

            await this.ffmpeg.deleteFile(inputName);

            return info;

        } catch (error) {
            console.error('[FFmpeg] Get info failed:', error);
            throw new Error(`Get info failed: ${error.message}`);
        }
    }

    /**
     * 检查是否已加载
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * 卸载 FFmpeg
     */
    async unload() {
        if (this.ffmpeg && this.loaded) {
            // FFmpeg.wasm 没有明确的卸载方法
            // 只需要重置状态
            this.ffmpeg = null;
            this.loaded = false;
            this.loading = false;
            console.log('[FFmpeg] Unloaded');
        }
    }
}

// 创建全局单例
const ffmpegHandler = new FFmpegHandler();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ffmpegHandler;
}
