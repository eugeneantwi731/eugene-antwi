// ===== CLEAN NAVBAR SCRIPT =====

document.addEventListener('DOMContentLoaded', () => {
    
    const navItems = document.querySelectorAll('.nav-item');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navContainer = document.querySelector('.nav-container');
    const body = document.body;
    
    if (!navItems.length) return;
    
    // Handle navigation click
    const handleClick = (e, clickedItem) => {
        // Add clicked class to turn text to current accent color temporarily
        clickedItem.classList.add('clicked');
        
        // Remove clicked class after a short delay
        setTimeout(() => {
            clickedItem.classList.remove('clicked');
        }, 300);
        
        // Update active state (keeps white background with black text)
        const currentActive = document.querySelector('.nav-item.active');
        if (currentActive !== clickedItem) {
            navItems.forEach(item => item.classList.remove('active'));
            clickedItem.classList.add('active');
        }
        
        // Close mobile menu if open
        if (window.innerWidth <= 768 && navContainer.classList.contains('active')) {
            closeMobileMenu();
        }
    };
    
    // Initialize - Set active page
    const init = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navItems.forEach(item => {
            const link = item.querySelector('a');
            const href = link.getAttribute('href');
            
            // Set active page
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === '/' && href === 'index.html')) {
                item.classList.add('active');
            }
            
            // Click handler
            item.addEventListener('click', (e) => handleClick(e, item));
        });
    };
    
    // Mobile menu functions
    const openMobileMenu = () => {
        navContainer.classList.add('active');
        body.style.overflow = 'hidden';
        
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    };
    
    const closeMobileMenu = () => {
        navContainer.classList.remove('active');
        body.style.overflow = '';
        
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    };
    
    // Mobile menu toggle
    if (mobileToggle && navContainer) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (navContainer.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close on nav click
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768 && navContainer.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        });
        
        // FIXED: Close menu when clicking/tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && navContainer.classList.contains('active')) {
                // Check if click is outside both menu and toggle button
                if (!navContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });
        
        // FIXED: Also handle touch events for better mobile support
        document.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768 && navContainer.classList.contains('active')) {
                // Check if touch is outside both menu and toggle button
                if (!navContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navContainer.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close mobile menu if window is resized to desktop
            if (window.innerWidth > 768 && navContainer.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 100);
    });
    
    init();
    console.log('✅ Clean navbar initialized');
});