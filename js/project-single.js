/* ============================================================
   PROJECT SINGLE — SHARED SYSTEM SCRIPT
============================================================ */

(function () {
    'use strict';

    /* ============================================================
       1. HERO — GRID FLIP SLIDESHOW

       IMAGE COVER FIX:
       Each tile shows its correct slice of the image as if the full
       image were CSS background-size:cover applied to the hero area.
       "Cover" = scale the image up proportionally until both axes
       fill the target rectangle, cropping the overflow. Never distort.

       The natural dimensions are read once per URL via a hidden Image
       object and cached. On resize the cache is cleared so cover scale
       is recalculated for the new viewport size.

       TAB-SWITCH FIX:
       document.visibilitychange forces a clean reset when the tab
       becomes visible again, preventing the frozen-slideshow bug
       caused by setTimeout callbacks being throttled while hidden.

       CLICK-TO-ADVANCE:
       Clicking anywhere on .ps-hero advances the slide. Dots stop
       propagation so they don't double-fire.
    ============================================================ */
    function initHero() {
        const grid = document.getElementById('psHeroGrid');
        if (!grid) return;

        const COLS        = 12;
        const ROWS        = 7;
        const INTERVAL    = 3200;
        const FLIP_DUR    = 400;
        const WAVE_SPREAD = 700;
        const JITTER_ROW  = 12;
        const JITTER_RAND = 50;

        const defaultSlides = [
            'linear-gradient(135deg,#0f3460,#16213e)',
            'linear-gradient(135deg,#1a2a1a,#0d5c3a)',
            'linear-gradient(135deg,#2a1a0f,#5c3a0d)',
        ];
        const slides = (window.PS_SLIDES && window.PS_SLIDES.length >= 2)
            ? window.PS_SLIDES
            : defaultSlides;

        let current     = 0;
        let isAnimating = false;

        grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        grid.style.gridTemplateRows    = `repeat(${ROWS}, 1fr)`;

        const heroSection = document.querySelector('.ps-hero');

        function getHeroDims() {
            return {
                W: (heroSection ? heroSection.offsetWidth  : 0) || window.innerWidth,
                H: (heroSection ? heroSection.offsetHeight : 0) || window.innerHeight
            };
        }

        /* ---- cover-scale helpers ---- */
        const dimCache = {};   // url -> { w, h }

        // Given an image's natural size and the target viewport, return
        // the scaled dimensions and top-left offset for cover behaviour.
        function coverDims(natW, natH, W, H) {
            const scale = Math.max(W / natW, H / natH);
            const sw = natW * scale;
            const sh = natH * scale;
            // Centre the scaled image within the viewport
            const ox = (W - sw) / 2;
            const oy = (H - sh) / 2;
            return { sw, sh, ox, oy };
        }

        function applySlide(el, slideVal, col, row) {
            const isImage = slideVal.startsWith('http')
                         || slideVal.startsWith('/')
                         || slideVal.startsWith('./');

            if (!isImage) {
                el.style.background         = slideVal;
                el.style.backgroundImage    = 'none';
                el.style.backgroundSize     = '';
                el.style.backgroundPosition = '';
                return;
            }

            const { W, H } = getHeroDims();
            const tileW = W / COLS;
            const tileH = H / ROWS;

            function paint(natW, natH) {
                const { sw, sh, ox, oy } = coverDims(natW, natH, W, H);
                // Each tile's bg-position is the offset of the viewport
                // minus where this tile starts in the grid.
                const posX = ox - col * tileW;
                const posY = oy - row * tileH;
                el.style.background         = 'none';
                el.style.backgroundImage    = `url(${slideVal})`;
                el.style.backgroundSize     = `${sw}px ${sh}px`;
                el.style.backgroundPosition = `${posX}px ${posY}px`;
                el.style.backgroundRepeat   = 'no-repeat';
            }

            if (dimCache[slideVal]) {
                paint(dimCache[slideVal].w, dimCache[slideVal].h);
            } else {
                // Temporarily paint using a 16:9 assumption so tile isn't blank
                paint(W, H * (9 / 16) < H ? H * (16 / 9) : W);
                // Then load true dimensions and repaint
                const img = new window.Image();
                img.onload = () => {
                    dimCache[slideVal] = { w: img.naturalWidth, h: img.naturalHeight };
                    paint(img.naturalWidth, img.naturalHeight);
                };
                img.src = slideVal;
            }
        }

        // Build tiles
        const tiles = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile  = document.createElement('div');
                tile.className = 'ps-tile';
                const front = document.createElement('div');
                front.className = 'ps-tile-front';
                applySlide(front, slides[0], c, r);
                const back = document.createElement('div');
                back.className = 'ps-tile-back';
                applySlide(back, slides[1 % slides.length], c, r);
                tile.appendChild(front);
                tile.appendChild(back);
                grid.appendChild(tile);
                tiles.push({ el: tile, front, back, col: c, row: r });
            }
        }

        // On resize, clear cache so cover is recalculated for new viewport
        window.addEventListener('resize', () => {
            Object.keys(dimCache).forEach(k => delete dimCache[k]);
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                applySlide(t.front, slides[current],  t.col, t.row);
                applySlide(t.back,  slides[afterIdx], t.col, t.row);
            });
        });

        // Dots
        const dotsEl = document.getElementById('psHeroDots');
        if (dotsEl) {
            slides.forEach((_, i) => {
                const d = document.createElement('button');
                d.className = 'ps-dot' + (i === 0 ? ' active' : '');
                d.setAttribute('aria-label', 'Slide ' + (i + 1));
                d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
                dotsEl.appendChild(d);
            });
        }

        function updateDots(idx) {
            if (!dotsEl) return;
            dotsEl.querySelectorAll('.ps-dot').forEach((d, i) =>
                d.classList.toggle('active', i === idx)
            );
        }

        function goTo(target) {
            if (isAnimating || target === current) return;
            isAnimating = true;

            const nextIdx  = target;
            const afterIdx = (nextIdx + 1) % slides.length;

            const tileDelays = tiles.map(t => {
                const colFrac   = t.col / (COLS - 1);
                const baseDelay = colFrac * WAVE_SPREAD;
                const rowNoise  = t.row * JITTER_ROW;
                const randNoise = (Math.random() * JITTER_RAND * 2) - JITTER_RAND;
                return Math.max(0, baseDelay + rowNoise + randNoise);
            });

            const maxDelay = Math.max(...tileDelays);

            tiles.forEach(t => {
                t.el.style.transition = 'none';
                t.el.classList.remove('flipped', 'flip-blur');
                applySlide(t.back, slides[nextIdx], t.col, t.row);
                t.el.getBoundingClientRect();
            });

            tiles.forEach((t, i) => {
                const delay = tileDelays[i];
                const dur   = FLIP_DUR + Math.random() * 60;
                t.el.style.transition = `transform ${dur}ms cubic-bezier(0.42,0,0.22,1) ${delay}ms`;
                t.el.style.setProperty('--flip-dur', dur + 'ms');
                // Trigger flip + blur at the same time
                setTimeout(() => {
                    t.el.classList.add('flipped', 'flip-blur');
                }, delay + 2);
                // Remove blur class after animation completes
                setTimeout(() => {
                    t.el.classList.remove('flip-blur');
                }, delay + dur + 20);
            });

            const settletime = maxDelay + FLIP_DUR + 140;
            setTimeout(() => {
                tiles.forEach(t => {
                    t.el.style.transition = 'none';
                    t.el.classList.remove('flipped', 'flip-blur');
                    applySlide(t.front, slides[nextIdx],  t.col, t.row);
                    applySlide(t.back,  slides[afterIdx], t.col, t.row);
                });
                current = nextIdx;
                updateDots(current);
                isAnimating = false;
            }, settletime);
        }

        function advance() { goTo((current + 1) % slides.length); }

        let timer = setInterval(advance, INTERVAL);

        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => clearInterval(timer));
            heroSection.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = setInterval(advance, INTERVAL);
            });

            // Insert a transparent click-layer above the grid/overlay (z-index 3)
            // but below the hero content (z-index 5). This catches clicks on any
            // empty hero area — text, tags, tool pills etc. sit above it and block
            // propagation naturally via their own pointer-events, so they won't
            // trigger a slide change even though they're inside .ps-hero.
            const clickLayer = document.createElement('div');
            clickLayer.className = 'ps-hero-click-layer';
            heroSection.appendChild(clickLayer);
            clickLayer.addEventListener('click', () => advance());

            // Dots still stop propagation so they don't double-fire via the layer
        }

        // Tab-switch fix: throttled setTimeouts fire late or not at all
        // while the tab is hidden. On return, force a clean state reset.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            clearInterval(timer);
            isAnimating = false;
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                t.el.style.transition = 'none';
                t.el.classList.remove('flipped');
                applySlide(t.front, slides[current],  t.col, t.row);
                applySlide(t.back,  slides[afterIdx], t.col, t.row);
            });
            updateDots(current);
            timer = setInterval(advance, INTERVAL);
        });
    }


    /* ============================================================
       2. SCROLL REVEAL
    ============================================================ */
    function initReveal() {
        const items = document.querySelectorAll('.ps-reveal');
        if (!items.length) return;
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.06 });
        items.forEach(el => obs.observe(el));
    }


    /* ============================================================
       3. LIGHTBOX
    ============================================================ */
    function initLightbox() {
        const lb      = document.getElementById('psLightbox');
        const lbClose = document.getElementById('psLightboxClose');
        const lbImg   = document.getElementById('psLightboxImg');
        const lbCap   = document.getElementById('psLightboxCaption');
        const lbPrev  = document.getElementById('psLightboxPrev');
        const lbNext  = document.getElementById('psLightboxNext');
        if (!lb) return;

        const cards = Array.from(document.querySelectorAll('[data-lightbox-src]'));
        let activeIdx = 0;

        function openAt(idx) {
            if (!cards[idx]) return;
            activeIdx = idx;
            const src = cards[idx].getAttribute('data-lightbox-src');
            const cap = cards[idx].getAttribute('data-lightbox-caption') || '';
            if (lbImg) { lbImg.src = src; lbImg.alt = cap; }
            if (lbCap) lbCap.textContent = cap;
            lb.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (lbPrev) lbPrev.style.display = cards.length > 1 ? '' : 'none';
            if (lbNext) lbNext.style.display = cards.length > 1 ? '' : 'none';
        }

        function close() {
            lb.classList.remove('active');
            document.body.style.overflow = '';
        }

        cards.forEach((card, i) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openAt(i));
        });

        if (lbClose) lbClose.addEventListener('click', close);
        if (lbPrev)  lbPrev.addEventListener('click',  () => openAt((activeIdx - 1 + cards.length) % cards.length));
        if (lbNext)  lbNext.addEventListener('click',  () => openAt((activeIdx + 1) % cards.length));
        lb.addEventListener('click', e => { if (e.target === lb) close(); });
        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('active')) return;
            if (e.key === 'Escape')     close();
            if (e.key === 'ArrowLeft')  openAt((activeIdx - 1 + cards.length) % cards.length);
            if (e.key === 'ArrowRight') openAt((activeIdx + 1) % cards.length);
        });
    }


    /* ============================================================
       4. BEFORE / AFTER SLIDER

       CONVENTION:
         Before (Reference Photo) = always underneath, full size.
         After  (Mesh)            = faded in from the right using
                                    mask-image with a gradient seam.
         p = slider position as percentage (0–100):
           p=0   → After fully visible  (slider at left edge)
           p=50  → 50/50 fade split     (slider at centre)
           p=100 → Before fully visible (slider at right edge)

       BLEND:
         mask-image gradient: transparent left of (p-FADE), black right of (p+FADE).
         This creates a real cross-fade between the two images at the seam.
         FADE_PX = half-width of the blend zone in pixels, converted to % at runtime.

       BADGE VISIBILITY:
         "Reference Photo" badge (in before panel) is hidden via opacity when
         the slider is pushed fully right (p >= 98) since the before panel is
         always rendered — it doesn't clip away on its own.
         "Mesh" badge (in after panel) is naturally hidden when slider is left
         because the mask makes that panel fully transparent there.

       EDGES:
         No artificial clamp — slider can reach 0% and 100% so user can see
         either image in full with no bleed from the other.
    ============================================================ */
    function initBeforeAfter() {
        const wrap        = document.querySelector('.ps-ba-wrap');
        const sizer       = wrap ? wrap.querySelector('.ps-ba-sizer') : null;
        const inner       = document.getElementById('psBaInner');
        const after       = document.getElementById('psBaAfter');
        const divider     = document.getElementById('psBaDivider');
        const handle      = document.getElementById('psBaHandle');
        const beforeBadge = wrap ? wrap.querySelector('.ps-ba-before .ps-ba-badge') : null;
        if (!wrap || !inner || !after) return;

        const FADE_PX = 40; // half-width of the blend zone in pixels

        /* ---- aspect-ratio detection ---- */
        function setAspect(w, h) {
            if (!w || !h) return;
            const pct = ((h / w) * 100).toFixed(3) + '%';
            if (sizer) sizer.style.paddingTop = pct;
        }

        const beforeImg = wrap.querySelector('.ps-ba-before img');
        const afterImg  = wrap.querySelector('.ps-ba-after img');

        function tryLoad(imgEl) {
            if (!imgEl || !imgEl.src || imgEl.src === window.location.href) return;
            if (imgEl.complete && imgEl.naturalWidth > 0) {
                setAspect(imgEl.naturalWidth, imgEl.naturalHeight);
            } else {
                imgEl.addEventListener('load', () => {
                    if (imgEl.naturalWidth > 0) setAspect(imgEl.naturalWidth, imgEl.naturalHeight);
                }, { once: true });
            }
        }
        tryLoad(beforeImg);
        tryLoad(afterImg);

        /* ---- position setter ---- */
        function set(pct) {
            // Full 0–100 range — no artificial clamp
            const p = Math.max(0, Math.min(100, pct));

            // Convert FADE_PX to a percentage of the container width
            const containerW = inner.getBoundingClientRect().width || wrap.offsetWidth || 1;
            const fadePct    = (FADE_PX / containerW) * 100;

            // When slider touches an edge, collapse the fade to a hard cut —
            // no bleed from the opposite image at the boundary.
            const atLeftEdge  = p <= fadePct;
            const atRightEdge = p >= 100 - fadePct;

            let mask;
            if (atLeftEdge) {
                // After fully visible: solid black mask (After fully shown)
                mask = 'linear-gradient(to right, black 0%, black 100%)';
            } else if (atRightEdge) {
                // Before fully visible: fully transparent mask (After fully hidden)
                mask = 'linear-gradient(to right, transparent 0%, transparent 100%)';
            } else {
                // Mid-range: smooth fade zone centred on p
                const fadeStart = p - fadePct;
                const fadeEnd   = p + fadePct;
                mask = `linear-gradient(to right, transparent 0%, transparent ${fadeStart.toFixed(2)}%, black ${fadeEnd.toFixed(2)}%, black 100%)`;
            }
            after.style.webkitMaskImage = mask;
            after.style.maskImage       = mask;

            // Divider and handle track the slider centre (p%)
            if (divider) divider.style.left = p + '%';
            if (handle)  handle.style.left  = p + '%';

            // Hide "Reference Photo" badge when After is fully revealed
            if (beforeBadge) {
                beforeBadge.style.opacity    = p <= 8 ? '0' : '1';
                beforeBadge.style.transition = 'opacity 0.25s ease';
            }
        }

        // Initialise at 50%
        set(50);

        /* ---- drag logic ---- */
        let startX     = 0;
        let isDragging = false;
        const DRAG_THRESHOLD = 4;

        function onMove(cx) {
            if (!isDragging && Math.abs(cx - startX) < DRAG_THRESHOLD) return;
            isDragging = true;
            const rect = inner.getBoundingClientRect();
            set(((cx - rect.left) / rect.width) * 100);
        }

        function onUp() {
            isDragging = false;
            window.removeEventListener('mousemove', mouseMoveH);
            window.removeEventListener('mouseup',   mouseUpH);
            window.removeEventListener('touchmove', touchMoveH);
            window.removeEventListener('touchend',  touchEndH);
        }

        function onDown(cx) {
            isDragging = false;
            startX = cx;
            window.addEventListener('mousemove', mouseMoveH);
            window.addEventListener('mouseup',   mouseUpH);
            window.addEventListener('touchmove', touchMoveH, { passive: true });
            window.addEventListener('touchend',  touchEndH);
        }

        function mouseMoveH(e)  { onMove(e.clientX); }
        function mouseUpH()     { onUp(); }
        function touchMoveH(e)  { onMove(e.touches[0].clientX); }
        function touchEndH()    { onUp(); }

        inner.addEventListener('mousedown',  e => onDown(e.clientX));
        inner.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
    }


    /* ============================================================
       5. VIDEO EMBEDS
       Local .mp4/.webm/.ogg files → open in a dedicated video lightbox.
       The <video> src is set only when the lightbox opens and cleared
       (+ paused) when it closes, so the video never plays outside it.
       YouTube/Vimeo URLs → inject an autoplay iframe as before.
    ============================================================ */
    function initVideos() {
        const vlb       = document.getElementById('psVideoLightbox');
        const vlbPlayer = document.getElementById('psVideoLightboxPlayer');
        const vlbClose  = document.getElementById('psVideoLightboxClose');

        function openVideo(url) {
            if (!vlb || !vlbPlayer) return;
            vlbPlayer.src = url;
            vlb.classList.add('active');
            document.body.style.overflow = 'hidden';
            vlbPlayer.play().catch(() => {});   // autoplay, ignore policy errors
        }

        function closeVideo() {
            if (!vlb || !vlbPlayer) return;
            vlbPlayer.pause();
            vlbPlayer.src = '';                 // stop buffering entirely
            vlb.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (vlbClose) vlbClose.addEventListener('click', closeVideo);
        if (vlb)      vlb.addEventListener('click', e => { if (e.target === vlb) closeVideo(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && vlb && vlb.classList.contains('active')) closeVideo();
        });

        document.querySelectorAll('.ps-video-wrap[data-video-url]').forEach(wrap => {
            const url = wrap.getAttribute('data-video-url');
            if (!url) return;

            const isLocal = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
                         || url.startsWith('./videos/')
                         || url.startsWith('../videos/')
                         || url.startsWith('/videos/');

            wrap.addEventListener('click', function () {
                if (isLocal) {
                    openVideo(url);
                } else {
                    // Hosted embed: inject autoplay iframe inline as before
                    const ratio = this.querySelector('.ps-video-ratio');
                    if (!ratio) return;
                    const src    = url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1';
                    const iframe = document.createElement('iframe');
                    iframe.src   = src;
                    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                    iframe.setAttribute('allowfullscreen', '');
                    ratio.innerHTML = '';
                    ratio.appendChild(iframe);
                    this.style.cursor = 'default';
                }
            });
        });
    }


    /* ============================================================
       6. IFRAME EMBEDS
    ============================================================ */
    function initIframes() {
        document.querySelectorAll('.ps-iframe-wrap[data-iframe-url]').forEach(wrap => {
            const url   = wrap.getAttribute('data-iframe-url');
            const label = wrap.getAttribute('data-iframe-label') || 'Live Preview';
            const ratio = wrap.querySelector('.ps-iframe-ratio');
            if (!ratio) return;
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:var(--card-bg);cursor:pointer;';
            placeholder.innerHTML = `
                <span style="font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim);">Click to load</span>
                <span style="font-family:'Sugar Snow',cursive;font-size:1.1rem;color:var(--text-light);">${label}</span>
                <span style="font-size:1.8rem;color:var(--project-accent);">+</span>
            `;
            ratio.appendChild(placeholder);
            placeholder.addEventListener('click', () => {
                ratio.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.src   = url;
                iframe.allow = 'fullscreen';
                ratio.appendChild(iframe);
            });
        });
    }


    document.addEventListener('DOMContentLoaded', () => {
        initHero();
        initReveal();
        initLightbox();
        initBeforeAfter();
        initVideos();
        initIframes();
    });

})();


/* ============================================================
   BLUR-IN SCROLL ANIMATION
============================================================ */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const items = document.querySelectorAll('.ps-blur-in');
        if (!items.length) return;
        const useGsap = typeof gsap !== 'undefined';
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el    = entry.target;
                const delay = parseFloat(el.dataset.blurDelay || 0);
                if (useGsap) {
                    gsap.to(el, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, ease: 'power3.out', delay });
                } else {
                    el.style.transition = `opacity 0.65s ease ${delay}s, filter 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`;
                    el.classList.add('ps-blur-visible');
                }
                obs.unobserve(el);
            });
        }, { threshold: 0.08 });
        items.forEach(el => obs.observe(el));
    });
})();