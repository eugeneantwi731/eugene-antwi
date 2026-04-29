// ===== CLICK SPARK EFFECT WITH DYNAMIC COLOR =====

class ClickSpark {
    constructor(options = {}) {
        this.config = {
            sparkSize: options.sparkSize || 12,
            sparkRadius: options.sparkRadius || 20,
            sparkCount: options.sparkCount || 8,
            duration: options.duration || 600,
            easing: options.easing || 'ease-out',
            extraScale: options.extraScale || 1.2,
            excludeSelectors: options.excludeSelectors || [], // Elements to exclude
            ...options
        };
        
        this.canvas = null;
        this.ctx = null;
        this.sparks = [];
        this.animationId = null;
        this.resizeTimeout = null;
        this.currentColor = this.getCurrentThemeColor();
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.startAnimation();
        console.log('✅ Click spark effect initialized');
    }
    
    // Get current theme color from CSS variable
    getCurrentThemeColor() {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue('--green').trim();
        return color || '#24FF72'; // Fallback to green
    }
    
    // Convert hex to RGB for canvas
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 36, g: 255, b: 114 }; // Fallback
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'spark-canvas';
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
        
        // Listen for theme color changes
        this.watchColorChanges();
    }
    
    // Watch for CSS variable changes
    watchColorChanges() {
        // Check for color changes periodically
        setInterval(() => {
            const newColor = this.getCurrentThemeColor();
            if (newColor !== this.currentColor) {
                this.currentColor = newColor;
            }
        }, 500);
    }
    
    handleClick(e) {
        // Check if click is on an excluded element
        for (let selector of this.config.excludeSelectors) {
            if (e.target.closest(selector)) {
                return; // Don't create sparks
            }
        }
        
        const x = e.clientX;
        const y = e.clientY;
        const now = performance.now();
        
        // Update current color before creating sparks
        this.currentColor = this.getCurrentThemeColor();
        
        // Create sparks radiating outward
        for (let i = 0; i < this.config.sparkCount; i++) {
            this.sparks.push({
                x: x,
                y: y,
                angle: (2 * Math.PI * i) / this.config.sparkCount,
                startTime: now,
                color: this.currentColor // Store color at creation time
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
                this.ctx.strokeStyle = spark.color; // Use stored color
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
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        // Check if we're on the home page with hero section
        const heroSection = document.getElementById('hero');
        
        let excludeSelectors = [];
        
        // If hero exists (home page), exclude it from sparks
        if (heroSection) {
            excludeSelectors.push('#hero');
            console.log('Hero section detected - sparks disabled in hero');
        }
        
        // Initialize spark effect
        window.clickSpark = new ClickSpark({
            sparkSize: 15,
            sparkRadius: 25,
            sparkCount: 8,
            duration: 700,
            easing: 'ease-out',
            extraScale: 1.3,
            excludeSelectors: excludeSelectors // Pass excluded elements
        });
    }, 500);
});
