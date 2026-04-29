// ===== MORPHING PILL NAV EFFECT =====
// Replaces the filter-based gooey approach.
// Works on glass/transparent navbars — no black rectangle issue.
// Desktop only. Mobile uses standard dropdown untouched.

(function () {
    'use strict';

    // ===== CONFIG =====
    const PARTICLE_COUNT     = 10;
    const PARTICLE_DISTANCES = [90, 10];
    const PARTICLE_R         = 200;
    const ANIMATION_TIME     = 600;
    const TIME_VARIANCE      = 300;
    const PARTICLE_COLORS    = ['#24FF72', '#8B5CF6', '#4A9EFF', '#00D9FF'];

    // ===== HELPERS =====
    const noise = (n = 1) => n / 2 - Math.random() * n;

    const getXY = (distance, pointIndex, totalPoints) => {
        const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
        return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };

    // ===== PARTICLE BURST =====
    function makeParticles(containerEl, targetEl) {
        const navRect    = document.querySelector('.nav-links').getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        containerEl.style.left = `${targetRect.left - navRect.left + targetRect.width / 2}px`;
        containerEl.style.top  = `${targetRect.top  - navRect.top  + targetRect.height / 2}px`;

        containerEl.querySelectorAll('.gnav-particle').forEach(p => p.remove());

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const t      = ANIMATION_TIME * 2 + noise(TIME_VARIANCE * 2);
            const rotate = noise(PARTICLE_R / 10);
            const p = {
                start:  getXY(PARTICLE_DISTANCES[0], PARTICLE_COUNT - i, PARTICLE_COUNT),
                end:    getXY(PARTICLE_DISTANCES[1] + noise(7), PARTICLE_COUNT - i, PARTICLE_COUNT),
                time:   t,
                scale:  1 + noise(0.2),
                color:  PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                rotate: rotate > 0 ? (rotate + PARTICLE_R / 20) * 10 : (rotate - PARTICLE_R / 20) * 10,
            };

            setTimeout(() => {
                const particle = document.createElement('span');
                const point    = document.createElement('span');

                particle.classList.add('gnav-particle');
                particle.style.cssText = `
                    --start-x: ${p.start[0]}px; --start-y: ${p.start[1]}px;
                    --end-x: ${p.end[0]}px;     --end-y: ${p.end[1]}px;
                    --time: ${p.time}ms;         --scale: ${p.scale};
                    --color: ${p.color};         --rotate: ${p.rotate}deg;
                `;
                point.classList.add('gnav-point');
                particle.appendChild(point);
                containerEl.appendChild(particle);

                setTimeout(() => {
                    try { containerEl.removeChild(particle); } catch {}
                }, p.time);
            }, 30);
        }
    }

    // ===== MOVE PILL =====
    function movePill(pill, targetEl, navEl, instant = false) {
        const navRect    = navEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        if (instant) {
            pill.style.transition = 'none';
        } else {
            pill.style.transition = [
                'left   0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'top    0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'width  0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'height 0.3s ease'
            ].join(', ');
        }

        pill.style.left    = `${targetRect.left   - navRect.left}px`;
        pill.style.top     = `${targetRect.top    - navRect.top}px`;
        pill.style.width   = `${targetRect.width}px`;
        pill.style.height  = `${targetRect.height}px`;
        pill.style.opacity = '1';
    }

    // ===== INIT =====
    function init() {
        if (window.innerWidth <= 768) return;

        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        navLinks.style.position = 'relative';

        // White pill
        const pill = document.createElement('span');
        pill.classList.add('gnav-pill');
        navLinks.appendChild(pill);

        // Particle container
        const particleContainer = document.createElement('span');
        particleContainer.classList.add('gnav-particles');
        navLinks.appendChild(particleContainer);

        const items = navLinks.querySelectorAll('.nav-item');

        // Suppress static active background — pill handles it now
        const style = document.createElement('style');
        style.textContent = `
            .nav-item.active { background: transparent !important; }
            .nav-item.active .nav-link { color: var(--bg-dark) !important; z-index: 4; position: relative; }
        `;
        document.head.appendChild(style);

        // Snap pill to active item on load
        const activeItem = navLinks.querySelector('.nav-item.active');
        if (activeItem) {
            requestAnimationFrame(() => {
                movePill(pill, activeItem, navLinks, true);
                requestAnimationFrame(() => { pill.style.transition = ''; });
            });
        }

        // Click handlers
        items.forEach((li) => {
            li.addEventListener('click', () => {
                if (window.innerWidth <= 768) return;
                if (li.classList.contains('active')) return;
                movePill(pill, li, navLinks);
                makeParticles(particleContainer, li);
            });
        });

        // Reposition on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth <= 768) { pill.style.opacity = '0'; return; }
                const current = navLinks.querySelector('.nav-item.active');
                if (current) movePill(pill, current, navLinks, true);
            }, 100);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
