// ===== SCROLL TO TOP BUTTON WITH PROGRESS INDICATOR =====

document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    const progressCircle = document.querySelector('.progress-ring__circle');
    
    if (!backToTopBtn || !progressCircle) {
        console.warn('Scroll-to-top button or progress circle not found');
        return;
    }
    
    // Calculate circle circumference (radius is 30)
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    
    // Set up the circle
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;
    
    // Update scroll progress and button visibility
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = scrollTop / docHeight;
        
        // Update circle progress
        const offset = circumference - (scrollPercent * circumference);
        progressCircle.style.strokeDashoffset = offset;
        
        // Show/hide button based on scroll position
        if (scrollTop > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Listen for scroll events (with throttling for performance)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            updateScrollProgress();
        });
    });
    
    // Click to scroll to top with smooth animation
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Keyboard accessibility
    backToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // Optional: ESC key to scroll to top (only if not in a modal/lightbox)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.pageYOffset > 400) {
            const lightbox = document.getElementById('lightbox');
            const mobileMenu = document.querySelector('.nav-container.active');
            
            // Only scroll if no modal/menu is open
            if ((!lightbox || !lightbox.classList.contains('active')) && !mobileMenu) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Initial update
    updateScrollProgress();
    
    console.log('✅ Scroll-to-top button initialized');
});
