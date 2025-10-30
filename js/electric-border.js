class ElectricBorder {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            color: '#5227FF',
            speed: 1,
            chaos: 1,
            thickness: 2,
            borderRadius: '16px',
            ...options
        };
        
        this.filterId = `turbulent-displace-${Math.random().toString(36).substr(2, 9)}`;
        this.init();
    }
    
    init() {
        this.createStructure();
        this.createSVGFilter();
        this.setupStyles();
        this.setupResizeObserver();
        this.updateAnimation();
    }
    
    createStructure() {
        // Wrap the element content
        const originalContent = this.element.innerHTML;
        this.element.innerHTML = `
            <svg class="eb-svg" aria-hidden="true" focusable="false">
                <defs></defs>
            </svg>
            <div class="eb-layers">
                <div class="eb-stroke"></div>
                <div class="eb-glow-1"></div>
                <div class="eb-glow-2"></div>
                <div class="eb-background-glow"></div>
            </div>
            <div class="eb-content">${originalContent}</div>
        `;
        
        this.svg = this.element.querySelector('.eb-svg');
        this.strokeElement = this.element.querySelector('.eb-stroke');
    }
    
    createSVGFilter() {
        const defs = this.svg.querySelector('defs');
        defs.innerHTML = `
            <filter id="${this.filterId}" color-interpolation-filters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
                <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                    <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                </feOffset>

                <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
                <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                    <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
                </feOffset>

                <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise3" seed="2" />
                <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                    <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                </feOffset>

                <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise4" seed="2" />
                <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                    <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
                </feOffset>

                <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
                <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
                <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
                <feDisplacementMap
                    in="SourceGraphic"
                    in2="combinedNoise"
                    scale="30"
                    xChannelSelector="R"
                    yChannelSelector="B"
                />
            </filter>
        `;
    }
    
    setupStyles() {
        // Apply CSS variables and classes
        this.element.style.setProperty('--electric-border-color', this.options.color);
        this.element.style.setProperty('--eb-border-width', `${this.options.thickness}px`);
        this.element.style.borderRadius = this.options.borderRadius;
        this.element.classList.add('electric-border');
    }
    
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateAnimation();
        });
        this.resizeObserver.observe(this.element);
    }
    
    updateAnimation() {
        const width = Math.max(1, Math.round(this.element.clientWidth || this.element.getBoundingClientRect().width || 0));
        const height = Math.max(1, Math.round(this.element.clientHeight || this.element.getBoundingClientRect().height || 0));
        
        // Update dy animations
        const dyAnims = this.svg.querySelectorAll('feOffset > animate[attributeName="dy"]');
        if (dyAnims.length >= 2) {
            dyAnims[0].setAttribute('values', `${height}; 0`);
            dyAnims[1].setAttribute('values', `0; -${height}`);
        }
        
        // Update dx animations
        const dxAnims = this.svg.querySelectorAll('feOffset > animate[attributeName="dx"]');
        if (dxAnims.length >= 2) {
            dxAnims[0].setAttribute('values', `${width}; 0`);
            dxAnims[1].setAttribute('values', `0; -${width}`);
        }
        
        // Update duration based on speed
        const baseDur = 6;
        const dur = Math.max(0.001, baseDur / (this.options.speed || 1));
        [...dyAnims, ...dxAnims].forEach(anim => {
            anim.setAttribute('dur', `${dur}s`);
        });
        
        // Update displacement scale based on chaos
        const disp = this.svg.querySelector('feDisplacementMap');
        if (disp) {
            disp.setAttribute('scale', String(30 * (this.options.chaos || 1)));
        }
        
        // Apply filter to stroke element
        if (this.strokeElement) {
            this.strokeElement.style.filter = `url(#${this.filterId})`;
        }
        
        // Restart animations
        requestAnimationFrame(() => {
            [...dyAnims, ...dxAnims].forEach(anim => {
                if (typeof anim.beginElement === 'function') {
                    try {
                        anim.beginElement();
                    } catch (e) {
                        console.warn('ElectricBorder: beginElement failed');
                    }
                }
            });
        });
    }
    
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
    
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.setupStyles();
        this.updateAnimation();
    }
}

// Usage function
function initElectricBorder(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    
    elements.forEach(element => {
        const instance = new ElectricBorder(element, options);
        instances.push(instance);
    });
    
    return instances.length === 1 ? instances[0] : instances;
}