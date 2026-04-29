// ===== UNDER CONSTRUCTION - GLITCH + NOISE =====
// Initialises automatically on any page that has .uc-frame

(function () {
    'use strict';

    // ===== ACCENT COLOR =====
    function getAccent() {
        return getComputedStyle(document.documentElement)
            .getPropertyValue('--green').trim() || '#24FF72';
    }

    function applyAccent() {
        const a = getAccent();

        // Status dot
        const dot = document.querySelector('.uc-status-dot');
        if (dot) dot.style.background = a;

        // Glitch shadow - green layer follows accent, white stays white
        document.querySelectorAll('.uc-glitch').forEach(el => {
            el.style.setProperty('--uc-after-shadow', `-6px 0 ${a}`);
            el.style.setProperty('--uc-before-shadow', `6px 0 rgba(255,255,255,0.9)`);
        });
    }

    // Poll for accent changes from the lightrays color system
    let _lastAccent = '';
    setInterval(() => {
        const a = getAccent();
        if (a !== _lastAccent) {
            _lastAccent = a;
            applyAccent();
        }
    }, 300);

    // ===== GLITCH TRIGGER =====
    function triggerGlitch() {
        const els = document.querySelectorAll('.uc-glitch');
        if (!els.length) return;

        const duration = 250 + Math.random() * 700;
        els.forEach(el => el.classList.add('glitching'));

        setTimeout(() => {
            els.forEach(el => el.classList.remove('glitching'));
        }, duration);
    }

    function scheduleNextGlitch() {
        const gap = 1800 + Math.random() * 5000;
        setTimeout(() => {
            const isDouble = Math.random() < 0.25;
            triggerGlitch();
            if (isDouble) {
                setTimeout(() => {
                    triggerGlitch();
                    scheduleNextGlitch();
                }, 150 + Math.random() * 250);
            } else {
                scheduleNextGlitch();
            }
        }, gap);
    }

    // ===== VHS NOISE =====
    const GRAIN_SIZE = 1024;
    const ALPHA      = 15;
    const REFRESH    = 2;
    let   noiseFrame = 0;
    let   noiseCtx   = null;
    let   noiseCanvas = null;

    function initNoise() {
        noiseCanvas = document.getElementById('ucNoiseCanvas');
        if (!noiseCanvas) return;

        noiseCtx = noiseCanvas.getContext('2d', { alpha: true });
        resizeNoise();
        noiseLoop();
    }

    function resizeNoise() {
        if (!noiseCanvas) return;
        const frame = document.querySelector('.uc-frame');
        if (!frame) return;
        noiseCanvas.width  = GRAIN_SIZE;
        noiseCanvas.height = GRAIN_SIZE;
        noiseCanvas.style.width  = frame.offsetWidth  + 'px';
        noiseCanvas.style.height = frame.offsetHeight + 'px';
    }

    function drawNoise() {
        if (!noiseCtx) return;
        const img  = noiseCtx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
        const data = img.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = data[i + 1] = data[i + 2] = v;
            data[i + 3] = ALPHA;
        }
        noiseCtx.putImageData(img, 0, 0);
    }

    function noiseLoop() {
        if (noiseFrame % REFRESH === 0) drawNoise();
        noiseFrame++;
        requestAnimationFrame(noiseLoop);
    }

    // ===== INIT =====
    function init() {
        // Only run if uc-frame exists on this page
        if (!document.querySelector('.uc-frame')) return;

        applyAccent();
        initNoise();
        window.addEventListener('resize', resizeNoise);

        // Start glitch cycle
        setTimeout(scheduleNextGlitch, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
