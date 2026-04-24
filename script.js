/**
 * 西城四合 - 全局交互脚本 (完整整合版)
 * 包含：轮播图、滚动动画、音频控制、文创弹窗、地图交互
 */

// =========================================
// 1. 页面滚动淡入动画 (所有页面通用)
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
// 2. 顶端轮播图逻辑 (所有页面通用)
// =========================================
let slides = document.querySelectorAll('.slide');
let dots = document.querySelectorAll('.dot');
let currentSlideIndex = 0;
let slideInterval;

function showSlide(index) {
    if (slides.length === 0) return;
    
    slides.forEach(s => s.classList.remove('active'));
    if(dots.length > 0) dots.forEach(d => d.classList.remove('active'));
    
    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add('active');
    if(dots.length > 0 && dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

function nextSlide() { showSlide(currentSlideIndex + 1); resetTimer(); }
function prevSlide() { showSlide(currentSlideIndex - 1); resetTimer(); }
function currentSlide(index) { showSlide(index); resetTimer(); }

function startTimer() {
    if (slides.length > 0) {
        slideInterval = setInterval(() => {
            showSlide(currentSlideIndex + 1);
        }, 5000); 
    }
}

function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}

if (slides.length > 0) {
    startTimer();
}


// =========================================
// 3. 院落留声 - 互动音频墙逻辑 (强制阻断修复)
// =========================================
function toggleAudio(element, src) {
    if (element.isLock) return;

    if (!element.audio) {
        element.audio = new Audio(src);
        element.isPlaying = false;
        
        element.audio.onended = () => {
            element.isPlaying = false;
            element.classList.remove('playing');
            updateAudioUI(element, false);
        };
    }

    element.isLock = true; 

    if (!element.isPlaying) {
        element.isPlaying = true;
        
        element.classList.add('playing');
        updateAudioUI(element, true);

        const playPromise = element.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                element.isLock = false;
                // 【核心修复】：加载完毕后复查状态，如果在这期间用户点了停止，则立刻掐断！
                if (!element.isPlaying) {
                    element.audio.pause();
                    element.audio.currentTime = 0;
                }
            }).catch(err => {
                element.isLock = false;
                setTimeout(() => {
                    if (element.isPlaying) {
                        element.isPlaying = false;
                        element.classList.remove('playing');
                        updateAudioUI(element, false);
                    }
                }, 3000);
            });
        } else {
            element.isLock = false;
        }
    } else {
        element.isPlaying = false;
        element.audio.pause();
        element.audio.currentTime = 0; 
        
        element.classList.remove('playing');
        updateAudioUI(element, false);
        
        setTimeout(() => { element.isLock = false; }, 150);
    }
}

function updateAudioUI(el, isPlaying) {
    const status = el.querySelector('.play-status');
    const btn = el.querySelector('.play-btn');
    if (status) status.innerText = isPlaying ? "正在播放..." : "点击播放";
    if (btn) btn.innerText = isPlaying ? "⏸" : "▶";
}

// 【绝对强制的停止逻辑】
function stopAllSounds() {
    // 强制选中页面上所有的声音载体
    const all = document.querySelectorAll('.audio-item, .sound-tile, .map-pin');
    all.forEach(el => {
        // 无视它现在的状态，一律强行置为不播放
        el.isPlaying = false;
        el.classList.remove('playing');
        updateAudioUI(el, false);
        
        // 如果音频对象已生成，直接调用暂停（包裹在 try-catch 中防止底层报错）
        if (el.audio) { 
            try {
                el.audio.pause(); 
                el.audio.currentTime = 0; 
            } catch (e) {
                console.log("强制停止音频时忽略报错:", e);
            }
        }
    });
}


// =========================================
// 4. 古巷雅创 - 文创多图弹窗逻辑
// =========================================
let currentModalImages = [];
let currentModalImageIndex = 0;

function openModal(imgStr, title, desc) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    currentModalImages = imgStr.split(',');
    currentModalImageIndex = 0;

    const modalImg = document.getElementById('modalImg');
    const hint = document.getElementById('modalImgHint');
    
    modalImg.src = currentModalImages[0];
    
    if (currentModalImages.length > 1) {
        if(hint) hint.style.display = 'block';
        modalImg.style.cursor = 'pointer';
    } else {
        if(hint) hint.style.display = 'none';
        modalImg.style.cursor = 'default';
    }

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function nextModalImage() {
    if (currentModalImages.length <= 1) return;
    currentModalImageIndex = (currentModalImageIndex + 1) % currentModalImages.length;
    document.getElementById('modalImg').src = currentModalImages[currentModalImageIndex];
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    if (event.target === productModal) {
        closeModal();
    }
}


// =========================================
// 5. 路线导览 - 互动地图切换与悬停逻辑
// =========================================

function switchMap(mapId) {
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');

    document.querySelectorAll('.map-layer').forEach(layer => layer.classList.remove('active'));
    const targetMap = document.getElementById('map-' + mapId);
    if(targetMap) targetMap.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const mapTooltip = document.getElementById('mapTooltip');
    const ttTitle = document.getElementById('ttTitle');
    const ttDesc = document.getElementById('ttDesc');
    const ttAudioHint = document.getElementById('ttAudioHint');

    if(mapTooltip) {
        document.querySelectorAll('.map-pin').forEach(pin => {
            pin.addEventListener('mouseenter', (e) => {
                ttTitle.innerText = pin.getAttribute('data-title');
                ttDesc.innerText = pin.getAttribute('data-desc');
                
                if (pin.getAttribute('data-audio')) {
                    ttAudioHint.style.display = 'inline-block';
                    ttAudioHint.innerText = pin.isPlaying ? '⏸ 正在播放 (点击暂停)' : '🎵 包含讲解，点击播放';
                } else {
                    ttAudioHint.style.display = 'none';
                }

                mapTooltip.style.display = 'block';
            });

            pin.addEventListener('mousemove', (e) => {
                mapTooltip.style.left = e.clientX + 'px';
                mapTooltip.style.top = (e.clientY - 15) + 'px';
            });

            pin.addEventListener('mouseleave', () => {
                mapTooltip.style.display = 'none';
            });
        });
    }
});

function playMapAudio(element) {
    const src = element.getAttribute('data-audio');
    const ttAudioHint = document.getElementById('ttAudioHint');
    
    if (!src) return;

    if (element.isLock) return;

    if (!element.audio) {
        element.audio = new Audio(src);
        element.isPlaying = false;
        element.audio.onended = () => {
            element.isPlaying = false;
            element.classList.remove('playing');
            if(ttAudioHint) ttAudioHint.innerText = '🎵 包含讲解，点击播放';
        };
    }

    element.isLock = true;

    if (!element.isPlaying) {
        element.isPlaying = true;
        element.classList.add('playing');
        
        if(ttAudioHint) ttAudioHint.innerText = '⏸ 正在播放 (点击暂停)';

        const playPromise = element.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                element.isLock = false;
                // 【核心修复】：地图音频同理，加载完复查是否被切断
                if (!element.isPlaying) {
                    element.audio.pause();
                    element.audio.currentTime = 0;
                }
            }).catch(err => {
                element.isLock = false;
                setTimeout(() => {
                    if (element.isPlaying) {
                        element.isPlaying = false;
                        element.classList.remove('playing');
                        if(ttAudioHint) ttAudioHint.innerText = '🎵 包含讲解，点击播放';
                    }
                }, 3000);
            });
        }
    } else {
        element.isPlaying = false;
        element.classList.remove('playing');
        element.audio.pause();
        element.audio.currentTime = 0;
        if(ttAudioHint) ttAudioHint.innerText = '🎵 包含讲解，点击播放';
        setTimeout(() => { element.isLock = false; }, 150);
    }
}