// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const playerSection = document.getElementById('playerSection');
const infoPanel = document.getElementById('infoPanel');
const actionsSection = document.getElementById('actionsSection');
const videoPlayer = document.getElementById('videoPlayer');
const statusMessage = document.getElementById('statusMessage');

// Info elements
const infoFileName = document.getElementById('infoFileName');
const infoFileSize = document.getElementById('infoFileSize');
const infoDuration = document.getElementById('infoDuration');
const infoResolution = document.getElementById('infoResolution');

// Action buttons
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// State
let currentFile = null;
let videoURL = null;

// Initialize
function init() {
    // Choose file button
    chooseFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Action buttons
    convertBtn.addEventListener('click', handleConvert);
    downloadBtn.addEventListener('click', handleDownload);
    clearBtn.addEventListener('click', handleClear);
    fullscreenBtn.addEventListener('click', handleFullscreen);

    // Video player events
    videoPlayer.addEventListener('loadedmetadata', handleVideoLoaded);

    // Back to top
    setupBackToTop();
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

// Process file
function processFile(file) {
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
        showStatus('File size exceeds 500MB limit', 'error');
        return;
    }

    // 接受所有视频文件，不限制格式
    currentFile = file;

    // Create video URL
    if (videoURL) {
        URL.revokeObjectURL(videoURL);
    }
    videoURL = URL.createObjectURL(file);
    console.log('Video URL created:', videoURL);

    // Update UI
    showUploadSuccess(file.name);
    loadVideo();
    updateFileInfo(file);
    showSections();

    showStatus('File loaded successfully!', 'success');
}

// Show upload success
function showUploadSuccess(fileName) {
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.innerHTML = `
        <span class="upload-icon success">✓</span>
        <h2>File Uploaded Successfully!</h2>
        <p class="file-name">"${fileName}"</p>
        <p>Your video is ready to play</p>
    `;
    uploadArea.classList.add('upload-success');
}

// Load video
function loadVideo() {
    videoPlayer.src = videoURL;
    videoPlayer.load();
}

// Handle video loaded
function handleVideoLoaded() {
    const duration = videoPlayer.duration;
    const width = videoPlayer.videoWidth;
    const height = videoPlayer.videoHeight;

    // Update info
    infoDuration.textContent = formatDuration(duration);
    infoResolution.textContent = `${width} × ${height}`;
}

// Update file info
function updateFileInfo(file) {
    infoFileName.textContent = file.name;
    infoFileSize.textContent = formatFileSize(file.size);
}

// Show sections
function showSections() {
    playerSection.style.display = 'block';
    infoPanel.style.display = 'block';
    actionsSection.style.display = 'flex';

    // Smooth scroll to player
    setTimeout(() => {
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Handle convert
async function handleConvert() {
    if (!currentFile) return;

    // 显示提示信息
    showStatus('Video conversion requires FFmpeg.wasm. Due to CORS restrictions on local server, this feature works best when deployed to a production server (Vercel, Netlify, etc.). For now, you can download the original file and use desktop software to convert.', 'info');
    
    // 提供替代方案
    const message = `
Video Conversion Feature

Due to browser security restrictions (CORS), FFmpeg.wasm cannot load from a local development server.

✅ Solutions:
1. Deploy to Vercel/Netlify (recommended)
2. Use a CORS-enabled local server
3. Download the file and use desktop software

For now, you can:
• Download the original AVI file
• Use VLC Media Player or HandBrake to convert
• Or wait for production deployment

Would you like to download the original file?
    `;
    
    if (confirm(message.trim())) {
        handleDownload();
    }
}

// 下载 Blob
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle download
function handleDownload() {
    if (!currentFile) return;

    const a = document.createElement('a');
    a.href = videoURL;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showStatus('Download started!', 'success');
}

// Handle clear
function handleClear() {
    // Reset state
    currentFile = null;
    if (videoURL) {
        URL.revokeObjectURL(videoURL);
        videoURL = null;
    }

    // Reset video player
    videoPlayer.src = '';
    videoPlayer.load();

    // Hide sections
    playerSection.style.display = 'none';
    infoPanel.style.display = 'none';
    actionsSection.style.display = 'none';

    // Reset upload area
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.innerHTML = `
        <span class="upload-icon">📂</span>
        <h2>Drop Your AVI File Here</h2>
        <p>or click to browse from your computer</p>
        <button class="btn btn-primary" id="chooseFileBtn">
            <span class="btn-icon">📁</span>
            <span class="btn-text">Choose AVI File</span>
        </button>
        <p class="file-limit">Maximum file size: 500MB</p>
    `;
    uploadArea.classList.remove('upload-success');

    // Re-attach event listener
    document.getElementById('chooseFileBtn').addEventListener('click', () => {
        fileInput.click();
    });

    // Reset file input
    fileInput.value = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showStatus('Cleared! Upload a new file.', 'info');
}

// Handle fullscreen
function handleFullscreen() {
    if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
    } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
    }
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;

    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format duration
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Setup back to top button
function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to play/pause
    if (e.code === 'Space' && document.activeElement === document.body && currentFile) {
        e.preventDefault();
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    }

    // F for fullscreen
    if (e.code === 'KeyF' && currentFile) {
        e.preventDefault();
        handleFullscreen();
    }

    // Escape to clear
    if (e.code === 'Escape' && currentFile) {
        handleClear();
    }
});

// Initialize on page load
init();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (videoURL) {
        URL.revokeObjectURL(videoURL);
    }
});
