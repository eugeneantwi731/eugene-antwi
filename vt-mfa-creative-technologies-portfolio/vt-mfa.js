// ===== VT MFA CREATIVE TECHNOLOGIES PORTFOLIO SCRIPT =====
// FILENAME: vt-mfa.js

// ===== INITIALIZE ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('VT MFA Portfolio loaded successfully');
    
    // ===== PORTRAIT HOVER ANIMATION =====
    const portraitContainer = document.querySelector('.portrait-container');
    const portraitGif = document.querySelector('.portrait-gif');

    if (portraitContainer && portraitGif) {
        // Preload the GIF
        const preloadGif = new Image();
        preloadGif.src = portraitGif.src;
        
        // Reset GIF on mouse leave to restart animation
        portraitContainer.addEventListener('mouseleave', () => {
            setTimeout(() => {
                const currentSrc = portraitGif.src;
                portraitGif.src = '';
                portraitGif.src = currentSrc; // Forces GIF restart
            }, 400); // After fade transition completes
        });
    }

    // ===== STICKY PROJECT NAVIGATION =====
    const projectNav = document.getElementById('project-nav');
    
    if (projectNav) {
        const navDots = document.querySelectorAll('.nav-dot');
        const projects = document.querySelectorAll('.project-card');
        const intro = document.getElementById('intro');

        // Show/hide navigation based on scroll
        function updateNavigation() {
            const introBottom = intro.offsetHeight;
            
            // Show nav after intro
            if (window.pageYOffset > introBottom) {
                projectNav.classList.add('visible');
            } else {
                projectNav.classList.remove('visible');
            }

            // Update active state based on scroll position
            let currentProject = null;
            
            projects.forEach(project => {
                const projectTop = project.offsetTop - 200;
                const projectBottom = projectTop + project.offsetHeight;
                
                if (window.pageYOffset >= projectTop && window.pageYOffset < projectBottom) {
                    currentProject = project.getAttribute('id');
                }
            });

            // Update active class
            navDots.forEach(dot => {
                dot.classList.remove('active');
                const href = dot.getAttribute('href').substring(1); // Remove #
                if (href === currentProject) {
                    dot.classList.add('active');
                }
            });
        }

        // Run on scroll
        window.addEventListener('scroll', updateNavigation);
        
        // Run once on load
        updateNavigation();
    }

    // ===== BACK TO TOP BUTTON =====
    const backToTopBtn = document.getElementById('back-to-top');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const circumference = 2 * Math.PI * 30; // radius is 30

    // Set up the circle
    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = scrollTop / docHeight;
        
        if (progressCircle) {
            // Update circle progress
            const offset = circumference - (scrollPercent * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Show/hide button
        if (scrollTop > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', updateScrollProgress);

    // Click to scroll to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== SCROLL DOWN INDICATOR =====
    const scrollDownBtn = document.getElementById('scroll-down');

    if (scrollDownBtn) {
    // Click/touch handler with offset
    scrollDownBtn.addEventListener('click', (e) => {
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            const yOffset = -20; // 20px offset from top
            const y = portfolioSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
        
        // Force remove hover state on mobile
        scrollDownBtn.blur();
        
        // Add a temporary class to reset colors immediately
        scrollDownBtn.classList.add('clicked');
        setTimeout(() => {
            scrollDownBtn.classList.remove('clicked');
        }, 100);
    });

        // Keyboard accessibility
        scrollDownBtn.setAttribute('tabindex', '0');
        scrollDownBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollDownBtn.click();
            }
        });

        // Connect scroll indicator to gradient line
        const gradientLine = document.querySelector('.gradient-line');
        if (gradientLine) {
            scrollDownBtn.addEventListener('mouseenter', () => {
                gradientLine.style.animationDuration = '1.5s';
            });
            
            scrollDownBtn.addEventListener('mouseleave', () => {
                gradientLine.style.animationDuration = '3s';
            });
        }
    }

    // ===== IMAGE LOADING HANDLER =====
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

    // ===== FADE-IN ANIMATION ON SCROLL =====
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        fadeInObserver.observe(card);
    });
    
    // Smooth reveal for intro section
    const introContent = document.querySelector('.intro-content');
    if (introContent) {
        setTimeout(() => {
            introContent.style.opacity = '1';
            introContent.style.transform = 'translateY(0)';
        }, 200);
    }

    // ===== LAZY LOADING FOR VIDEOS =====
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video in view, user can play if they want
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { threshold: 0.5 });

    // Observe all video elements
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        videoObserver.observe(video);
    });
});



// ===== LIGHTBOX FOR IMAGES AND VIDEOS =====
document.addEventListener('DOMContentLoaded', () => {
    // Create lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <div class="lightbox-content">
            <img class="lightbox-image" src="" alt="">
            <video class="lightbox-video" controls>
                <source src="" type="video/mp4">
            </video>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // Add click handlers to all images in media containers
    document.querySelectorAll('.media-container img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxImg.style.display = 'block';
            lightboxVideo.style.display = 'none';
            lightbox.classList.add('active');
        });
    });

    // Add click handlers to all videos in media containers
    document.querySelectorAll('.media-container video').forEach(video => {
        video.style.cursor = 'pointer';
        video.addEventListener('click', () => {
            const source = video.querySelector('source');
            lightboxVideo.querySelector('source').src = source.src;
            lightboxVideo.load();
            lightboxVideo.style.display = 'block';
            lightboxImg.style.display = 'none';
            lightbox.classList.add('active');
        });
    });

    // Close lightbox when clicking close button
    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        lightboxVideo.pause();
    });

    // Close lightbox when clicking outside content
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            lightboxVideo.pause();
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            lightboxVideo.pause();
        }
    });
});



// ===== VARIABLE PROXIMITY EFFECT =====
// Add this to your vt-mfa.js file

class VariableProximity {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            fromWeight: options.fromWeight || 500,
            toWeight: options.toWeight || 900,
            radius: options.radius || 80,
            ...options
        };
        
        this.letterElements = [];
        this.mousePosition = { x: -999, y: -999 }; // Start way outside the element
        this.hasMouseEntered = false; // Track if mouse has entered the element
        this.animationId = null;
        
        console.log('VariableProximity initialized for:', element.textContent);
        this.init();
    }
    
    init() {
        // Wait for font to load
        document.fonts.ready.then(() => {
            this.splitTextIntoLetters();
            this.bindEvents();
            this.startAnimation();
        });
    }
    
    splitTextIntoLetters() {
        const originalText = this.element.textContent;
        console.log('Splitting text:', originalText);
        
        this.element.innerHTML = '';
        this.letterElements = [];
        
        originalText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.cssText = `
                display: inline-block;
                font-weight: ${this.options.fromWeight};
                transition: font-weight 0.15s ease;
            `;
            
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            }
            
            this.element.appendChild(span);
            this.letterElements.push(span);
        });
        
        console.log('Created', this.letterElements.length, 'letter elements');
    }
    
    bindEvents() {
        this.handleMouseMove = (e) => {
            const rect = this.element.getBoundingClientRect();
            this.mousePosition = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // Mark that mouse has entered the element
            if (!this.hasMouseEntered) {
                this.hasMouseEntered = true;
            }
        };
        
        this.handleMouseLeave = () => {
            // Reset all letters to default weight when mouse leaves
            this.letterElements.forEach(letterElement => {
                letterElement.style.fontWeight = this.options.fromWeight;
                letterElement.style.color = ''; // Reset color to default
            });
            
            // Move mouse position far away to prevent effects
            this.mousePosition = { x: -999, y: -999 };
        };
        
        document.addEventListener('mousemove', this.handleMouseMove);
        this.element.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    startAnimation() {
        const animate = () => {
            const containerRect = this.element.getBoundingClientRect();
            
            this.letterElements.forEach(letterElement => {
                // Only apply effects if mouse has entered the element
                if (!this.hasMouseEntered) {
                    letterElement.style.fontWeight = this.options.fromWeight;
                    letterElement.style.color = '';
                    return;
                }
                
                const letterRect = letterElement.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2 - containerRect.left;
                const letterCenterY = letterRect.top + letterRect.height / 2 - containerRect.top;
                
                const distance = this.calculateDistance(
                    this.mousePosition.x,
                    this.mousePosition.y,
                    letterCenterX,
                    letterCenterY
                );
                
                if (distance >= this.options.radius) {
                    letterElement.style.fontWeight = this.options.fromWeight;
                    letterElement.style.color = ''; // Reset to default color
                } else {
                    const intensity = 1 - (distance / this.options.radius);
                    const weight = this.options.fromWeight + 
                        (this.options.toWeight - this.options.fromWeight) * intensity;
                    
                    letterElement.style.fontWeight = Math.round(weight);
                    
                    // Add color transition from green to blue based on proximity
                    const alpha = intensity * 0.7; // Max 70% intensity
                    letterElement.style.color = `color-mix(in srgb, var(--green) ${(1-alpha)*100}%, var(--blue) ${alpha*100}%)`;
                }
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
        console.log('Animation started');
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('mousemove', this.handleMouseMove);
    }
}

// Initialize variable proximity effect
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, looking for variable proximity elements...');
    
    // Wait a bit longer to ensure everything is loaded
    setTimeout(() => {
        const proximityElements = document.querySelectorAll('.variable-proximity');
        console.log('Found', proximityElements.length, 'proximity elements');
        
        proximityElements.forEach((element, index) => {
            console.log(`Initializing element ${index}:`, element.textContent);
            new VariableProximity(element, {
                fromWeight: 500,
                toWeight: 900,
                radius: 100
            });
        });
    }, 1000); // Increased delay
});

// ===== CLICK SPARK EFFECT =====
// Add this to your vt-mfa.js file

class ClickSpark {
    constructor(options = {}) {
        this.config = {
            sparkColor: options.sparkColor || '#24FF72',  // Using your green color
            sparkSize: options.sparkSize || 12,
            sparkRadius: options.sparkRadius || 20,
            sparkCount: options.sparkCount || 8,
            duration: options.duration || 600,
            easing: options.easing || 'ease-out',
            extraScale: options.extraScale || 1.2,
            ...options
        };
        
        this.canvas = null;
        this.ctx = null;
        this.sparks = [];
        this.animationId = null;
        this.resizeTimeout = null;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.startAnimation();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            user-select: none;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width * devicePixelRatio;
        this.canvas.height = height * devicePixelRatio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    
    bindEvents() {
        // Handle clicks anywhere on the page
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Handle window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
        });
    }
    
    handleClick(e) {
        const x = e.clientX;
        const y = e.clientY;
        const now = performance.now();
        
        // Create sparks radiating outward
        for (let i = 0; i < this.config.sparkCount; i++) {
            this.sparks.push({
                x: x,
                y: y,
                angle: (2 * Math.PI * i) / this.config.sparkCount,
                startTime: now
            });
        }
    }
    
    easeFunction(t, easing) {
        switch (easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'ease-out':
            default:
                return t * (2 - t);
        }
    }
    
    startAnimation() {
        const animate = (timestamp) => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Filter out completed sparks and draw active ones
            this.sparks = this.sparks.filter(spark => {
                const elapsed = timestamp - spark.startTime;
                
                if (elapsed >= this.config.duration) {
                    return false; // Remove completed spark
                }
                
                const progress = elapsed / this.config.duration;
                const eased = this.easeFunction(progress, this.config.easing);
                
                const distance = eased * this.config.sparkRadius * this.config.extraScale;
                const lineLength = this.config.sparkSize * (1 - eased);
                const opacity = 1 - eased;
                
                // Calculate spark line positions
                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
                
                // Draw spark line
                this.ctx.save();
                this.ctx.globalAlpha = opacity;
                this.ctx.strokeStyle = this.config.sparkColor;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                this.ctx.restore();
                
                return true; // Keep spark active
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        document.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

// Initialize the spark effect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the page to settle
    setTimeout(() => {
        window.clickSpark = new ClickSpark({
            sparkColor: '#24FF72',  // Your green color
            sparkSize: 15,
            sparkRadius: 25,
            sparkCount: 8,
            duration: 700,
            easing: 'ease-out',
            extraScale: 1.3
        });
    }, 500);
});

// ===== KEYBOARD SHORTCUTS (Global - outside DOM) =====
document.addEventListener('keydown', (e) => {
    // ESC key to scroll to top
    if (e.key === 'Escape' && window.pageYOffset > 400) {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
});

