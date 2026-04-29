// ===== EUGENE ANTWI PORTFOLIO SCRIPT =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio loaded successfully');
    
    // Mobile menu is now handled in navbar.js
    
    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.site-header');
    let lastScroll = 0;
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add subtle effect on scroll (optional)
            if (currentScroll > 50) {
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ===== SCROLL INDICATOR FUNCTIONALITY =====
    const scrollIndicator = document.getElementById('scroll-down');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const introSection = document.getElementById('intro');
            if (introSection) {
                const targetPosition = introSection.getBoundingClientRect().top + window.pageYOffset - 100;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add clicked class for mobile reset
                scrollIndicator.classList.add('clicked');
                setTimeout(() => {
                    scrollIndicator.classList.remove('clicked');
                }, 300);
            }
        });
    }
    
    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 100;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== CURRENT PAGE HIGHLIGHT =====
    // This is now handled in navbar.js
    
    // ===== IMAGE LAZY LOADING =====
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
    
    // ===== CONSOLE SIGNATURE =====
    console.log('%c Eugene Antwi Portfolio ', 'background: #24FF72; color: #0a0a0f; font-size: 16px; font-weight: bold; padding: 10px 20px;');
    console.log('%c Designer • Animator • Educator ', 'color: #8B5CF6; font-size: 12px; font-weight: normal;');
});

// ===== UTILITY: DEBOUNCE FUNCTION =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== UTILITY: THROTTLE FUNCTION =====
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== INTRO SECTION CAROUSEL =====

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initializeIntroCarousel();
        initializePatternRepel();
    }

    // Intro Carousel Functionality
    function initializeIntroCarousel() {
        const slides = document.querySelectorAll('.intro-slide');
        const dots = document.querySelectorAll('.intro-dot');

        if (!slides.length || !dots.length) {
            console.error('Intro carousel: slides or dots not found');
            return;
        }

        console.log('Intro carousel initialized with', slides.length, 'slides');

        let currentSlide = 0;
        let autoPlayInterval = null;
        const AUTO_PLAY_MS = 6000;

        function showSlide(index) {
            // Clamp index to valid range
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            console.log('Showing slide:', index);

            // Remove active from all
            slides.forEach(function(slide) {
                slide.classList.remove('active');
            });
            dots.forEach(function(dot) {
                dot.classList.remove('active');
            });

            // Add active to current
            slides[index].classList.add('active');
            dots[index].classList.add('active');

            currentSlide = index;
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_MS);
            console.log('Autoplay started');
        }

        function stopAutoPlay() {
            if (autoPlayInterval !== null) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                console.log('Autoplay stopped');
            }
        }

        // Manual dot navigation
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Dot clicked:', index);
                showSlide(index);
                stopAutoPlay();
                setTimeout(startAutoPlay, 1000);
            });
        });

        // Initialize carousel
        showSlide(0);
        startAutoPlay();

        // Pause when page is hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });
    }

    // ===== MOUSE REPEL EFFECT FOR PATTERN ICONS =====
    function initializePatternRepel() {
        const section = document.getElementById('work-cta');
        const container = document.getElementById('patternContainer');
        
        if (!section || !container) {
            console.log('Pattern repel: section or container not found');
            return;
        }
        
        const icons = container.querySelectorAll('.pattern-icon');
        
        if (!icons.length) {
            console.log('Pattern repel: no icons found');
            return;
        }
        
        // Store original positions for each icon
        const originalPositions = [];
        icons.forEach((icon) => {
            const rect = icon.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            originalPositions.push({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2
            });
        });

        let mouseX = 0;
        let mouseY = 0;
        let isMouseInSection = false;

        // Mouse move handler
        section.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseInSection = true;
        });

        // Mouse leave handler
        section.addEventListener('mouseleave', () => {
            isMouseInSection = false;
            // Reset all icons to original positions
            icons.forEach((icon) => {
                icon.style.transform = '';
            });
        });

        // Animation loop for smooth repulsion
        function animate() {
            if (isMouseInSection) {
                icons.forEach((icon, index) => {
                    const origPos = originalPositions[index];
                    
                    // Calculate distance from mouse to icon center
                    const dx = origPos.x - mouseX;
                    const dy = origPos.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Repulsion radius and strength
                    const repelRadius = 200; // Distance at which repulsion starts
                    const repelStrength = 50; // How far to push away
                    
                    if (distance < repelRadius) {
                        // Calculate repulsion force
                        const force = (repelRadius - distance) / repelRadius;
                        const pushX = (dx / distance) * force * repelStrength;
                        const pushY = (dy / distance) * force * repelStrength;
                        
                        // Apply transform
                        icon.style.transform = `translate(${pushX}px, ${pushY}px)`;
                        icon.style.opacity = 0.1; // Slightly more visible when interacting
                    } else {
                        // Return to original position
                        icon.style.transform = '';
                        icon.style.opacity = 0.06;
                    }
                });
            }
            
            requestAnimationFrame(animate);
        }

        // Start animation
        animate();
        console.log('Pattern repel initialized');
    }
    
})();
