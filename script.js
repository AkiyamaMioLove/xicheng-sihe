/**
 * 西城四合 - 全局交互脚本 (终极完整无删减版)
 */

// =========================================
// 1. 页面滚动淡入动画
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    const animElements = document.querySelectorAll('.timeline-item, .figure-card, .audio-item, .sound-tile, .product-card, .hutong-card, .video-container');
    animElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.8s ease-out";
        observer.observe(el);
    });
});

// =========================================
// 2. 顶端轮播图逻辑
// =========================================
let currentSlideIndex = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add('active');
    if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.add('active');
}

function nextSlide() { showSlide(currentSlideIndex + 1); resetTimer(); }
function prevSlide() { showSlide(currentSlideIndex - 1); resetTimer(); }
function currentSlide(i) { showSlide(i); resetTimer(); }

function startTimer() {
    if (slides.length > 0) {
        slideInterval = setInterval(nextSlide, 5000);
    }
}
function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}
if (slides.length > 0) startTimer();

// =========================================
// 3. 院落留声 - 音频播放逻辑 (防连击 + 强制停止)
// =========================================
function toggleAudio(el, src) {
    if (el.isLock) return;
    if (!el.audio) {
        el.audio = new Audio(src);
        el.audio.onended = () => { el.classList.remove('playing'); updateAudioUI(el, false); };
    }
    el.isLock = true;
    if (el.audio.paused) {
        el.audio.play().then(() => {
            el.classList.add('playing');
            updateAudioUI(el, true);
            el.isLock = false;
            // 复查状态，防止加载期间被强制停止
            if (!el.classList.contains('playing')) {
                el.audio.pause();
                el.audio.currentTime = 0;
            }
        }).catch(() => {
            // 如果没有音频文件，走演示模式
            el.isLock = false;
            el.classList.add('playing');
            updateAudioUI(el, true);
            setTimeout(() => {
                el.classList.remove('playing');
                updateAudioUI(el, false);
            }, 3000);
        });
    } else {
        el.audio.pause(); 
        el.audio.currentTime = 0;
        el.classList.remove('playing');
        updateAudioUI(el, false);
        el.isLock = false;
    }
}

function updateAudioUI(el, isP) {
    const s = el.querySelector('.play-status');
    const b = el.querySelector('.play-btn');
    if (s) s.innerText = isP ? "正在播放..." : "点击播放";
    if (b) b.innerText = isP ? "⏸" : "▶";
}

function stopAllSounds() {
    const all = document.querySelectorAll('.audio-item, .sound-tile, .map-pin');
    all.forEach(el => {
        if (el.audio) { 
            try {
                el.audio.pause(); 
                el.audio.currentTime = 0; 
            } catch(e) {}
        }
        el.classList.remove('playing'); 
        updateAudioUI(el, false);
        
        // 如果是地图点位，恢复提示文字
        const hint = document.getElementById('ttAudioHint');
        if (el.classList.contains('map-pin') && hint && el.hasAttribute('data-audio')) {
            hint.innerText = '🎵 包含讲解，点击播放';
        }
    });
}

// =========================================
// 4. 古巷雅创 - 文创多图弹窗逻辑
// =========================================
let currentImages = [];
let imgIdx = 0;

function openModal(imgStr, title, desc) {
    const modal = document.getElementById('productModal');
    if(!modal) return;
    currentImages = imgStr.split(',');
    imgIdx = 0;
    document.getElementById('modalImg').src = currentImages[0];
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    
    // 显示切换提示
    const hint = document.getElementById('modalImgHint');
    if(hint) hint.style.display = currentImages.length > 1 ? 'block' : 'none';
    
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function nextModalImage() {
    if (currentImages.length <= 1) return;
    imgIdx = (imgIdx + 1) % currentImages.length;
    document.getElementById('modalImg').src = currentImages[imgIdx];
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if(modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// 核心逻辑：点击黑色遮罩区关闭弹窗
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
}

// =========================================
// 5. 模块切换逻辑 (路线 / 声音 / 文创 通用)
// =========================================
function switchMap(id) {
    document.querySelectorAll('.map-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');
    document.querySelectorAll('.map-layer').forEach(l => l.classList.remove('active'));
    const target = document.getElementById('map-' + id);
    if(target) target.classList.add('active');
}

function switchCreationModule(id) {
    document.querySelectorAll('.creation-tabs-section .toggle-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');
    document.querySelectorAll('.creation-module').forEach(m => m.classList.remove('active'));
    const target = document.getElementById('module-' + id);
    if(target) target.classList.add('active');
    window.scrollTo({ top: document.querySelector('.creation-tabs-section').offsetTop - 100, behavior: 'smooth' });
}

function switchSoundModule(moduleId) {
    document.querySelectorAll('.sound-section .toggle-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    document.querySelectorAll('.sound-module').forEach(m => m.classList.remove('active'));
    const target = document.getElementById('sound-' + moduleId);
    if(target) target.classList.add('active');
    stopAllSounds();
}

// =========================================
// 6. 路线导览 - 地图红点与提示框逻辑
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const mapTooltip = document.getElementById('mapTooltip');
    const ttTitle = document.getElementById('ttTitle');
    const ttDesc = document.getElementById('ttDesc');
    const ttAudioHint = document.getElementById('ttAudioHint');

    if(mapTooltip) {
        document.querySelectorAll('.map-pin').forEach(pin => {
            // 鼠标移入显示提示
            pin.addEventListener('mouseenter', (e) => {
                ttTitle.innerText = pin.getAttribute('data-title');
                ttDesc.innerText = pin.getAttribute('data-desc');
                
                if (pin.getAttribute('data-audio')) {
                    ttAudioHint.style.display = 'inline-block';
                    ttAudioHint.innerText = pin.classList.contains('playing') ? '⏸ 正在播放 (点击暂停)' : '🎵 包含讲解，点击播放';
                } else {
                    ttAudioHint.style.display = 'none';
                }
                mapTooltip.style.display = 'block';
            });

            // 鼠标跟随
            pin.addEventListener('mousemove', (e) => {
                mapTooltip.style.left = e.clientX + 'px';
                mapTooltip.style.top = (e.clientY - 15) + 'px';
            });

            // 鼠标移出隐藏提示
            pin.addEventListener('mouseleave', () => {
                mapTooltip.style.display = 'none';
            });
        });
    }
});

// 地图专用的音频点击播放逻辑
function playMapAudio(element) {
    const src = element.getAttribute('data-audio');
    const ttAudioHint = document.getElementById('ttAudioHint');
    
    if (!src) return; // 无音频则不响应

    if (element.isLock) return;

    if (!element.audio) {
        element.audio = new Audio(src);
        element.audio.onended = () => {
            element.classList.remove('playing');
            if(ttAudioHint && mapTooltip.style.display === 'block') ttAudioHint.innerText = '🎵 包含讲解，点击播放';
        };
    }

    element.isLock = true;

    if (!element.classList.contains('playing')) {
        element.classList.add('playing');
        if(ttAudioHint) ttAudioHint.innerText = '⏸ 正在播放 (点击暂停)';

        const playPromise = element.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                element.isLock = false;
                if (!element.classList.contains('playing')) {
                    element.audio.pause();
                    element.audio.currentTime = 0;
                }
            }).catch(err => {
                // 无音频文件时的假演示模式
                element.isLock = false;
                setTimeout(() => {
                    element.classList.remove('playing');
                    if(ttAudioHint && mapTooltip.style.display === 'block') ttAudioHint.innerText = '🎵 包含讲解，点击播放';
                }, 3000);
            });
        } else {
            element.isLock = false;
        }
    } else {
        // 暂停
        element.classList.remove('playing');
        element.audio.pause();
        element.audio.currentTime = 0;
        if(ttAudioHint) ttAudioHint.innerText = '🎵 包含讲解，点击播放';
        setTimeout(() => { element.isLock = false; }, 150);
    }
}