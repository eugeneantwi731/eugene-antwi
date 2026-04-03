// ===== CV PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('CV page loaded');
    
    // Initialize all CV page functionality
    initializeActiveNav();
    initializeSmoothScroll();
});

// ===== SET ACTIVE NAVIGATION =====
function initializeActiveNav() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const linkHref = link.querySelector('a')?.getAttribute('href');
        
        // Remove active class from all
        link.classList.remove('active');
        
        // CV page doesn't have active state, or you can activate "About"
        // Uncomment the line below to highlight "About" when on CV page
        // if (linkHref && linkHref.includes('about')) {
        //     link.classList.add('active');
        // }
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.site-header')?.offsetHeight || 100;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== CONSOLE SIGNATURE =====
console.log('%c CV Page | Eugene Antwi ', 'background: #24FF72; color: #0a0a0f; font-size: 14px; font-weight: bold; padding: 8px 16px;');