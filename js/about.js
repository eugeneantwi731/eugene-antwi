// ===== ABOUT PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('About page loaded');
    
    initializeActiveNav();
    initializeSmoothScroll();
    initializeCVPatternRepel();
    initializeContactForm();
});

// ===== SET ACTIVE NAVIGATION =====
function initializeActiveNav() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const linkHref = link.querySelector('a')?.getAttribute('href');
        
        // Remove active class from all
        link.classList.remove('active');
        
        // Only add active to About link
        if (linkHref && linkHref === 'about.html' && currentPage.includes('about')) {
            link.classList.add('active');
        }
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

// ===== CV PATTERN REPEL EFFECT - FIXED FOR MOBILE =====
function initializeCVPatternRepel() {
    const section = document.getElementById('cv-buttons');
    const container = document.getElementById('cvPatternContainer');
    
    if (!section || !container) {
        console.log('CV Pattern repel: section or container not found');
        return;
    }
    
    const icons = container.querySelectorAll('.cv-pattern-icon');
    
    if (!icons.length) {
        console.log('CV Pattern repel: no icons found');
        return;
    }
    
    // Store original positions for each icon
    const originalPositions = [];
    
    // Function to calculate and store positions
    function updateOriginalPositions() {
        originalPositions.length = 0; // Clear array
        const containerRect = container.getBoundingClientRect();
        
        icons.forEach((icon) => {
            const rect = icon.getBoundingClientRect();
            originalPositions.push({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2
            });
        });
    }
    
    // Initial position calculation
    updateOriginalPositions();
    
    // Recalculate on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateOriginalPositions, 100);
    });

    let mouseX = 0;
    let mouseY = 0;
    let isInteracting = false;

    // FIXED: Unified function to get correct coordinates for both mouse and touch
    function getCoordinates(e) {
        const rect = container.getBoundingClientRect();
        let clientX, clientY;
        
        // Handle touch events
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            // Handle mouse events
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Calculate position relative to container
        mouseX = clientX - rect.left;
        mouseY = clientY - rect.top;
        
        isInteracting = true;
    }

    // Mouse events for desktop
    section.addEventListener('mousemove', getCoordinates);
    section.addEventListener('mouseenter', getCoordinates);
    
    section.addEventListener('mouseleave', () => {
        isInteracting = false;
        icons.forEach((icon) => {
            icon.style.transform = '';
            icon.style.opacity = '';
        });
    });

    // Touch events for mobile - FIXED
    section.addEventListener('touchstart', (e) => {
        getCoordinates(e);
    }, { passive: true });
    
    section.addEventListener('touchmove', (e) => {
        getCoordinates(e);
    }, { passive: true });
    
    section.addEventListener('touchend', () => {
        isInteracting = false;
        icons.forEach((icon) => {
            icon.style.transform = '';
            icon.style.opacity = '';
        });
    }, { passive: true });

    // Animation loop for smooth repulsion
    function animate() {
        if (isInteracting) {
            icons.forEach((icon, index) => {
                const origPos = originalPositions[index];
                
                if (!origPos) return;
                
                // Calculate distance from interaction point to icon center
                const dx = origPos.x - mouseX;
                const dy = origPos.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Repulsion settings
                const repelRadius = 200;
                const repelStrength = 50;
                
                if (distance < repelRadius && distance > 0) {
                    // Calculate repulsion force
                    const force = (repelRadius - distance) / repelRadius;
                    const pushX = (dx / distance) * force * repelStrength;
                    const pushY = (dy / distance) * force * repelStrength;
                    
                    // Apply transform
                    icon.style.transform = `translate(${pushX}px, ${pushY}px)`;
                    icon.style.opacity = '0.1';
                } else {
                    // Return to original position
                    icon.style.transform = '';
                    icon.style.opacity = '0.06';
                }
            });
        }
        
        requestAnimationFrame(animate);
    }

    // Start animation
    animate();
    console.log('CV Pattern repel initialized with touch support');
}

// ===== CONTACT FORM HANDLER =====
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = form?.querySelector('.submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    const formMessages = document.getElementById('formMessages');
    
    if (!form) {
        console.log('Contact form not found');
        return;
    }

    // Initialize EmailJS
    emailjs.init("Iy2TmQhMFrZPbnpGe");

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button and show loading
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        formMessages.textContent = '';
        formMessages.className = 'form-messages';

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                "service_63yx83g",
                "template_gk0l0zl",
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.message,
                    to_name: "Eugene Antwi"
                }
            );

            console.log('Email sent successfully:', response);

            // Show success message
            formMessages.textContent = 'Thank you! Your message has been sent successfully.';
            formMessages.className = 'form-messages success';

            // Reset form
            form.reset();

        } catch (error) {
            console.error('Error sending email:', error);

            // Show error message
            formMessages.textContent = 'Oops! Something went wrong. Please try again or email me directly at eugeneantwi731@gmail.com';
            formMessages.className = 'form-messages error';
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });

    console.log('Contact form initialized');
}

// ===== CONSOLE SIGNATURE =====
console.log('%c About Page | Eugene Antwi ', 'background: #24FF72; color: #0a0a0f; font-size: 14px; font-weight: bold; padding: 8px 16px;');
