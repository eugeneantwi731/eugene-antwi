(function () {
    'use strict';

    /* ============================================================
       FEATURED CARD FLIP SLIDESHOW
       Transition triggered by: auto timer OR dot buttons only.
       Clicking the card itself navigates to the project page.
    ============================================================ */
    function initFeaturedFlip() {
        const grid   = document.getElementById('projFeatGrid');
        const dotsEl = document.getElementById('projFeatDots');
        const cardEl = document.querySelector('.proj-featured-card');

        if (!grid) return;

        const COLS        = 10;
        const ROWS        = 5;
        const INTERVAL    = 3400;
        const FLIP_DUR    = 400;
        const WAVE_SPREAD = 620;
        const JITTER_ROW  = 10;
        const JITTER_RAND = 45;

        const fallback = [
            'linear-gradient(135deg, #1a0a05 0%, #3a1a0a 100%)',
            'linear-gradient(135deg, #0a1240 0%, #1A3EBF 100%)',
            'linear-gradient(135deg, #051a10 0%, #0d3320 100%)',
        ];
        const slides = (window.PROJ_FEATURED_SLIDES && window.PROJ_FEATURED_SLIDES.length >= 2)
            ? window.PROJ_FEATURED_SLIDES
            : fallback;

        let current     = 0;
        let isAnimating = false;
        const dimCache  = {};

        grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        grid.style.gridTemplateRows    = `repeat(${ROWS}, 1fr)`;

        function getImgDims() {
            const img = grid.parentElement;
            return { W: img ? img.offsetWidth : 800, H: img ? img.offsetHeight : 360 };
        }

        function coverDims(natW, natH, W, H) {
            const scale = Math.max(W / natW, H / natH);
            const sw = natW * scale, sh = natH * scale;
            return { sw, sh, ox: (W - sw) / 2, oy: (H - sh) / 2 };
        }

        function applySlide(el, val, col, row) {
            const isImage = val.startsWith('http') || val.startsWith('/') || val.startsWith('./');
            if (!isImage) {
                el.style.background = val;
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

        const tiles = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile  = document.createElement('div');
                tile.className = 'proj-feat-tile';
                const front = document.createElement('div');
                front.className = 'proj-feat-tile-front';
                applySlide(front, slides[0], c, r);
                const back = document.createElement('div');
                back.className = 'proj-feat-tile-back';
                applySlide(back, slides[1 % slides.length], c, r);
                tile.appendChild(front);
                tile.appendChild(back);
                grid.appendChild(tile);
                tiles.push({ el: tile, front, back, col: c, row: r });
            }
        }

        window.addEventListener('resize', () => {
            Object.keys(dimCache).forEach(k => delete dimCache[k]);
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                applySlide(t.front, slides[current],  t.col, t.row);
                applySlide(t.back,  slides[afterIdx], t.col, t.row);
            });
        });

        /* Build dots — clicking a dot triggers transition, stops propagation so card link is NOT followed */
        slides.forEach((_, i) => {
            const d = document.createElement('button');
            d.className = 'proj-feat-dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', 'Slide ' + (i + 1));
            d.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                goTo(i);
            });
            dotsEl.appendChild(d);
        });

        function updateDots(idx) {
            dotsEl.querySelectorAll('.proj-feat-dot').forEach((d, i) =>
                d.classList.toggle('active', i === idx)
            );
        }

        function goTo(target) {
            if (isAnimating || target === current) return;
            isAnimating = true;

            const nextIdx  = target;
            const afterIdx = (nextIdx + 1) % slides.length;

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
                applySlide(t.back, slides[nextIdx], t.col, t.row);
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
            }, maxDelay + FLIP_DUR + 140);
        }

        function advance() { goTo((current + 1) % slides.length); }

        /* Auto timer — pauses on hover */
        let timer = setInterval(advance, INTERVAL);
        if (cardEl) {
            cardEl.addEventListener('mouseenter', () => clearInterval(timer));
            cardEl.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = setInterval(advance, INTERVAL);
            });
        }

        /* Tab visibility fix */
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            clearInterval(timer);
            isAnimating = false;
            const afterIdx = (current + 1) % slides.length;
            tiles.forEach(t => {
                t.el.style.transition = 'none';
                t.el.classList.remove('flipped', 'flip-blur');
                applySlide(t.front, slides[current],  t.col, t.row);
                applySlide(t.back,  slides[afterIdx], t.col, t.row);
            });
            timer = setInterval(advance, INTERVAL);
        });
    }


    /* ============================================================
       FILTER TABS
    ============================================================ */
    function initFilters() {
        const tabs      = document.querySelectorAll('.proj-filter-btn');
        const featCard  = document.querySelector('.proj-featured-card');
        const divider   = document.getElementById('projSectionDivide');
        const cards     = document.querySelectorAll('.proj-card');
        const noResults = document.getElementById('projNoResults');

        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;

                if (featCard) {
                    const featFilters = (featCard.dataset.filter || '').split(' ');
                    const featVisible = filter === 'all' || featFilters.includes(filter);
                    featCard.style.display = featVisible ? 'block' : 'none';
                    if (divider) divider.style.display = featVisible ? 'flex' : 'none';
                }

                let visibleCount = 0;
                cards.forEach(card => {
                    const cardFilters = (card.dataset.filter || '').split(' ');
                    const match = filter === 'all' || cardFilters.includes(filter);
                    card.style.display = match ? 'block' : 'none';
                    if (match) visibleCount++;
                });

                if (noResults) {
                    const featVisible = featCard ? featCard.style.display !== 'none' : false;
                    noResults.classList.toggle('visible', visibleCount === 0 && !featVisible);
                }
            });
        });
    }


    document.addEventListener('DOMContentLoaded', () => {
        initFeaturedFlip();
        initFilters();
        initScrollIn();
    });

})();


    /* ============================================================
       SCROLL-IN ANIMATION
       Cards and featured card animate in as they enter the viewport.
       Uses IntersectionObserver — no layout shift, no jank.
    ============================================================ */
    function initScrollIn() {
        const targets = document.querySelectorAll('.proj-featured-card, .proj-card, .proj-section-divide');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('proj-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        targets.forEach(el => observer.observe(el));
    }