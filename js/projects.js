(function () {
    'use strict';

    /* ============================================================
       FEATURED FLIP SLIDESHOW
       PROJ_FEATURED_SLIDES is now an array of objects — each object
       is one complete project entry: image, href, accent, title,
       desc, tags, tools, status, date, index.

       Content transition order:
         1. goTo() called            — fade content OUT (content-out class)
         2. At maxDelay / 2          — swap all text, href, accent to new slide
         3. After flip completes     — fade content IN (remove content-out)
    ============================================================ */
    function initFeaturedFlip() {
        const grid       = document.getElementById('projFeatGrid');
        const dotsEl     = document.getElementById('projFeatDots');
        const cardEl     = document.getElementById('featCard');
        const contentEl  = document.getElementById('featContent');
        const titleEl    = document.getElementById('featTitle');
        const descEl     = document.getElementById('featDesc');
        const tagsEl     = document.getElementById('featTags');
        const toolsEl    = document.getElementById('featTools');
        const statusLed  = document.getElementById('featStatusLed');
        const statusText = document.getElementById('featStatusText');
        const dateEl     = document.getElementById('featDate');
        const indexEl    = document.getElementById('featIndex');

        if (!grid || !cardEl) return;

        const COLS        = 10;
        const ROWS        = 5;
        const INTERVAL    = 4000;
        const FLIP_DUR    = 400;
        const WAVE_SPREAD = 620;
        const JITTER_ROW  = 10;
        const JITTER_RAND = 45;

        /* Fallback if PROJ_FEATURED_SLIDES is missing or malformed */
        const fallback = [
            { image: 'linear-gradient(135deg,#1a0a05,#3a1a0a)', href: '#', accent: '#E8A87C', status: 'active',    date: '2024', index: '01', title: 'Project One',   desc: '',  tags: [], tools: [] },
            { image: 'linear-gradient(135deg,#0a1240,#1A3EBF)', href: '#', accent: '#7EC8E3', status: 'completed', date: '2023', index: '02', title: 'Project Two',   desc: '',  tags: [], tools: [] },
            { image: 'linear-gradient(135deg,#051a10,#0d3320)', href: '#', accent: '#A8E6CF', status: 'completed', date: '2023', index: '03', title: 'Project Three', desc: '',  tags: [], tools: [] },
        ];

        const slides = (window.PROJ_FEATURED_SLIDES && window.PROJ_FEATURED_SLIDES.length >= 2)
            ? window.PROJ_FEATURED_SLIDES
            : fallback;

        let current     = 0;
        let isAnimating = false;
        const dimCache  = {};

        grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        grid.style.gridTemplateRows    = `repeat(${ROWS}, 1fr)`;

        /* ── Helpers ─────────────────────────────────────────── */
        function getImgDims() {
            const wrap = grid.parentElement;
            return { W: wrap ? wrap.offsetWidth : 800, H: wrap ? wrap.offsetHeight : 500 };
        }

        function coverDims(natW, natH, W, H) {
            const scale = Math.max(W / natW, H / natH);
            const sw = natW * scale, sh = natH * scale;
            return { sw, sh, ox: (W - sw) / 2, oy: (H - sh) / 2 };
        }

        function applySlide(el, val, col, row) {
            const isImage = val && (val.startsWith('http') || val.startsWith('/') || val.startsWith('./'));
            if (!isImage) {
                el.style.background = val || '#070709';
                el.style.backgroundImage = 'none';
                return;
            }
            const { W, H } = getImgDims();
            const tW = W / COLS, tH = H / ROWS;

            function paint(nW, nH) {
                const { sw, sh, ox, oy } = coverDims(nW, nH, W, H);
                el.style.background         = 'none';
                el.style.backgroundImage    = `url(${val})`;
                el.style.backgroundSize     = `${sw}px ${sh}px`;
                el.style.backgroundPosition = `${ox - col * tW}px ${oy - row * tH}px`;
                el.style.backgroundRepeat   = 'no-repeat';
            }

            if (dimCache[val]) { paint(dimCache[val].w, dimCache[val].h); return; }
            paint(W, H);
            const img = new window.Image();
            img.onload = () => {
                dimCache[val] = { w: img.naturalWidth, h: img.naturalHeight };
                paint(img.naturalWidth, img.naturalHeight);
            };
            img.src = val;
        }

        /* ── Update all text + meta to a given slide ──────────── */
        function updateContent(slide) {
            if (cardEl)     cardEl.href = slide.href || '#';
            if (titleEl)    titleEl.textContent = slide.title || '';
            if (descEl)     descEl.textContent  = slide.desc  || '';
            if (dateEl)     dateEl.textContent  = slide.date  || '';
            if (indexEl)    indexEl.textContent = slide.index || '';

            if (statusLed) {
                statusLed.className = 'proj-status-led ' + (slide.status || 'active');
            }
            if (statusText) {
                const s = slide.status || 'active';
                statusText.textContent = s.charAt(0).toUpperCase() + s.slice(1);
            }

            if (tagsEl) {
                tagsEl.innerHTML = (slide.tags || [])
                    .map(t => `<span class="proj-feat-tag">${t}</span>`)
                    .join('');
            }
            if (toolsEl) {
                toolsEl.innerHTML = (slide.tools || [])
                    .map(t => `<span class="proj-feat-tool">${t}</span>`)
                    .join('');
            }

            /* Update accent on the card element */
            if (cardEl) {
                cardEl.style.setProperty('--feat-accent', slide.accent || 'var(--green)');
            }
        }

        /* ── Build tiles ──────────────────────────────────────── */
        const tiles = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile  = document.createElement('div');
                tile.className = 'proj-feat-tile';
                const front = document.createElement('div');
                front.className = 'proj-feat-tile-front';
                applySlide(front, slides[0].image, c, r);
                const back = document.createElement('div');
                back.className = 'proj-feat-tile-back';
                applySlide(back, slides[1 % slides.length].image, c, r);
                tile.appendChild(front);
                tile.appendChild(back);
                grid.appendChild(tile);
                tiles.push({ el: tile, front, back, col: c, row: r });
            }
        }

        /* Set initial content from slide 0 */
        updateContent(slides[0]);

        /* ── Resize: repaint tiles ────────────────────────────── */
        window.addEventListener('resize', () => {
            Object.keys(dimCache).forEach(k => delete dimCache[k]);
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                applySlide(t.front, slides[current].image,   t.col, t.row);
                applySlide(t.back,  slides[afterIdx].image,  t.col, t.row);
            });
        });

        /* ── Build dots ───────────────────────────────────────── */
        slides.forEach((_, i) => {
            const d = document.createElement('button');
            d.className = 'proj-feat-dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', 'Slide ' + (i + 1));
            d.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                clearInterval(timer);
                goTo(i);
                timer = setInterval(advance, INTERVAL);
            });
            dotsEl.appendChild(d);
        });

        function updateDots(idx) {
            dotsEl.querySelectorAll('.proj-feat-dot').forEach((d, i) =>
                d.classList.toggle('active', i === idx)
            );
        }

        /* ── Core transition ──────────────────────────────────── */
        function goTo(target) {
            if (isAnimating || target === current) return;
            isAnimating = true;

            const nextIdx  = target;
            const afterIdx = (nextIdx + 1) % slides.length;

            /* STEP 1 — fade content out immediately */
            if (contentEl) contentEl.classList.add('content-out');

            const delays = tiles.map(t => {
                const base  = (t.col / (COLS - 1)) * WAVE_SPREAD;
                const rowN  = t.row * JITTER_ROW;
                const randN = (Math.random() * JITTER_RAND * 2) - JITTER_RAND;
                return Math.max(0, base + rowN + randN);
            });

            const maxDelay = Math.max(...delays);

            tiles.forEach(t => {
                t.el.style.transition = 'none';
                t.el.classList.remove('flipped', 'flip-blur');
                applySlide(t.back, slides[nextIdx].image, t.col, t.row);
                t.el.getBoundingClientRect();
            });

            tiles.forEach((t, i) => {
                const delay = delays[i];
                const dur   = FLIP_DUR + Math.random() * 60;
                t.el.style.transition = `transform ${dur}ms cubic-bezier(0.42,0,0.22,1) ${delay}ms`;
                t.el.style.setProperty('--flip-dur', dur + 'ms');
                setTimeout(() => t.el.classList.add('flipped', 'flip-blur'), delay + 2);
                setTimeout(() => t.el.classList.remove('flip-blur'), delay + dur + 20);
            });

            /* STEP 2 — swap content at the midpoint of the wave */
            setTimeout(() => {
                updateContent(slides[nextIdx]);
            }, maxDelay / 2);

            /* STEP 3 — flip complete: reset tiles, fade content back in */
            setTimeout(() => {
                tiles.forEach(t => {
                    t.el.style.transition = 'none';
                    t.el.classList.remove('flipped', 'flip-blur');
                    applySlide(t.front, slides[nextIdx].image,  t.col, t.row);
                    applySlide(t.back,  slides[afterIdx].image, t.col, t.row);
                });
                current = nextIdx;
                updateDots(current);
                isAnimating = false;

                /* Fade content back in */
                if (contentEl) contentEl.classList.remove('content-out');
            }, maxDelay + FLIP_DUR + 140);
        }

        function advance() { goTo((current + 1) % slides.length); }
        function retreat() { goTo((current - 1 + slides.length) % slides.length); }

        /* ── Wire up prev / next arrows ───────────────────────── */
        const prevBtn = document.querySelector('.proj-feat-prev');
        const nextBtn = document.querySelector('.proj-feat-next');
        if (prevBtn) {
            prevBtn.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                clearInterval(timer);
                retreat();
                timer = setInterval(advance, INTERVAL);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                clearInterval(timer);
                advance();
                timer = setInterval(advance, INTERVAL);
            });
        }

        /* ── Auto timer — pauses on hover ─────────────────────── */
        let timer = setInterval(advance, INTERVAL);
        const heroWrap = document.querySelector('.proj-hero-wrap');
        if (heroWrap) {
            heroWrap.addEventListener('mouseenter', () => clearInterval(timer));
            heroWrap.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = setInterval(advance, INTERVAL);
            });
        }

        /* ── Tab visibility fix ───────────────────────────────── */
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            clearInterval(timer);
            isAnimating = false;
            if (contentEl) contentEl.classList.remove('content-out');
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                t.el.style.transition = 'none';
                t.el.classList.remove('flipped', 'flip-blur');
                applySlide(t.front, slides[current].image,   t.col, t.row);
                applySlide(t.back,  slides[afterIdx].image,  t.col, t.row);
            });
            timer = setInterval(advance, INTERVAL);
        });
    }


    /* ============================================================
       FILTER TABS
       Only affects the card grid below — hero always shows all slides.
    ============================================================ */
    function initFilters() {
        const tabs      = document.querySelectorAll('.proj-filter-btn');
        const cards     = document.querySelectorAll('.proj-card');
        const noResults = document.getElementById('projNoResults');
        const divider   = document.getElementById('projSectionDivide');

        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;
                let visibleCount = 0;

                cards.forEach(card => {
                    const cardFilters = (card.dataset.filter || '').split(' ');
                    const match = filter === 'all' || cardFilters.includes(filter);
                    card.style.display = match ? 'block' : 'none';
                    if (match) visibleCount++;
                });

                if (noResults) {
                    noResults.classList.toggle('visible', visibleCount === 0);
                }
            });
        });
    }


    /* ============================================================
       SCROLL-IN ANIMATION
       Featured card already has proj-visible in HTML (visible on load).
       Grid cards animate in as they enter the viewport.
    ============================================================ */
    function initScrollIn() {
        const targets = document.querySelectorAll('.proj-card, .proj-section-divide');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('proj-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.06,
            rootMargin: '0px 0px -30px 0px'
        });

        targets.forEach(el => observer.observe(el));
    }


    document.addEventListener('DOMContentLoaded', () => {
        initFeaturedFlip();
        initFilters();
        initScrollIn();
    });

})();
