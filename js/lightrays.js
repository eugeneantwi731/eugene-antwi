// ===== LIGHT RAYS WebGL Effect =====
class LightRaysWebGL {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.container.appendChild(this.canvas);

        this.options = {
            raysOrigin: options.raysOrigin || 'top-center',
            raysColor: options.raysColor || '#f0f0f0',
            raysSpeed: options.raysSpeed || 1.5,
            lightSpread: options.lightSpread || 0.8,
            rayLength: options.rayLength || 1.2,
            followMouse: options.followMouse !== false,
            mouseInfluence: options.mouseInfluence || 0.1,
            noiseAmount: options.noiseAmount || 0.1,
            distortion: options.distortion || 0.05
        };

        this.currentColor = this.hexToRgb(this.options.raysColor);
        this.targetColor = [...this.currentColor];
        this.colorTransitionProgress = 1;

        this.mouse = { x: 0.5, y: 0.5 };
        this.smoothMouse = { x: 0.5, y: 0.5 };
        this.time = 0;
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupGL();
        this.resize();
        this.setupEvents();
        this.animate();
    }

    hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255
        ] : [0.94, 0.94, 0.94];
    }

    setupGL() {
        const gl = this.gl;

        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            uniform float iTime;
            uniform vec2 iResolution;
            uniform vec2 rayPos;
            uniform vec2 rayDir;
            uniform vec3 raysColor;
            uniform float raysSpeed;
            uniform float lightSpread;
            uniform float rayLength;
            uniform vec2 mousePos;
            uniform float mouseInfluence;
            uniform float noiseAmount;
            uniform float distortion;

            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
                vec2 sourceToCoord = coord - raySource;
                vec2 dirNorm = normalize(sourceToCoord);
                float cosAngle = dot(dirNorm, rayRefDirection);
                float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
                float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
                float distance = length(sourceToCoord);
                float maxDistance = iResolution.x * rayLength;
                float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
                float fadeFalloff = clamp((iResolution.x * 1.0 - distance) / (iResolution.x * 1.0), 0.5, 1.0);
                float baseStrength = clamp(
                    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
                    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
                    0.0, 1.0
                );
                return baseStrength * lengthFalloff * fadeFalloff * spreadFactor;
            }

            void main() {
                vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
                vec2 finalRayDir = rayDir;
                
                if (mouseInfluence > 0.0) {
                    vec2 mouseScreenPos = mousePos * iResolution.xy;
                    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
                    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
                }

                vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
                vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
                
                vec4 fragColor = rays1 * 0.5 + rays2 * 0.4;

                if (noiseAmount > 0.0) {
                    float n = noise(coord * 0.01 + iTime * 0.1);
                    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
                }

                float brightness = 1.0 - (coord.y / iResolution.y);
                fragColor.x *= 0.1 + brightness * 0.8;
                fragColor.y *= 0.3 + brightness * 0.6;
                fragColor.z *= 0.5 + brightness * 0.5;

                fragColor.rgb *= raysColor;
                gl_FragColor = fragColor;
            }
        `;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        this.uniforms = {
            iTime: gl.getUniformLocation(this.program, 'iTime'),
            iResolution: gl.getUniformLocation(this.program, 'iResolution'),
            rayPos: gl.getUniformLocation(this.program, 'rayPos'),
            rayDir: gl.getUniformLocation(this.program, 'rayDir'),
            raysColor: gl.getUniformLocation(this.program, 'raysColor'),
            raysSpeed: gl.getUniformLocation(this.program, 'raysSpeed'),
            lightSpread: gl.getUniformLocation(this.program, 'lightSpread'),
            rayLength: gl.getUniformLocation(this.program, 'rayLength'),
            mousePos: gl.getUniformLocation(this.program, 'mousePos'),
            mouseInfluence: gl.getUniformLocation(this.program, 'mouseInfluence'),
            noiseAmount: gl.getUniformLocation(this.program, 'noiseAmount'),
            distortion: gl.getUniformLocation(this.program, 'distortion')
        };

        this.updateUniforms();
    }

    getAnchorAndDir(origin, w, h) {
        const outside = 0.2;
        switch (origin) {
            case 'top-left':
                return { anchor: [0, -outside * h], dir: [0, 1] };
            case 'top-right':
                return { anchor: [w, -outside * h], dir: [0, 1] };
            case 'left':
                return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
            case 'right':
                return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
            case 'bottom-left':
                return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-center':
                return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-right':
                return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
            default:
                return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
        }
    }

    updateUniforms() {
        const gl = this.gl;
        gl.uniform1f(this.uniforms.raysSpeed, this.options.raysSpeed);
        gl.uniform1f(this.uniforms.lightSpread, this.options.lightSpread);
        gl.uniform1f(this.uniforms.rayLength, this.options.rayLength);
        gl.uniform1f(this.uniforms.mouseInfluence, this.options.mouseInfluence);
        gl.uniform1f(this.uniforms.noiseAmount, this.options.noiseAmount);
        gl.uniform1f(this.uniforms.distortion, this.options.distortion);
    }

    changeColor(newColor) {
        this.targetColor = this.hexToRgb(newColor);
        this.colorTransitionProgress = 0;
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);

        const { anchor, dir } = this.getAnchorAndDir(
            this.options.raysOrigin,
            this.canvas.width,
            this.canvas.height
        );
        this.gl.uniform2f(this.uniforms.rayPos, anchor[0], anchor[1]);
        this.gl.uniform2f(this.uniforms.rayDir, dir[0], dir[1]);
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        
        if (this.options.followMouse) {
            window.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;
            });

            window.addEventListener('touchmove', (e) => {
                const rect = this.container.getBoundingClientRect();
                const touch = e.touches[0];
                this.mouse.x = (touch.clientX - rect.left) / rect.width;
                this.mouse.y = (touch.clientY - rect.top) / rect.height;
            }, { passive: true });
        }
    }

    animate() {
        this.time += 0.016;
        
        const gl = this.gl;
        gl.uniform1f(this.uniforms.iTime, this.time);

        if (this.colorTransitionProgress < 1) {
            this.colorTransitionProgress += 0.02;
            this.currentColor = [
                this.currentColor[0] + (this.targetColor[0] - this.currentColor[0]) * 0.05,
                this.currentColor[1] + (this.targetColor[1] - this.currentColor[1]) * 0.05,
                this.currentColor[2] + (this.targetColor[2] - this.currentColor[2]) * 0.05
            ];
        }

        gl.uniform3f(this.uniforms.raysColor, this.currentColor[0], this.currentColor[1], this.currentColor[2]);

        if (this.options.followMouse && this.options.mouseInfluence > 0) {
            const smoothing = 0.92;
            this.smoothMouse.x = this.smoothMouse.x * smoothing + this.mouse.x * (1 - smoothing);
            this.smoothMouse.y = this.smoothMouse.y * smoothing + this.mouse.y * (1 - smoothing);
            gl.uniform2f(this.uniforms.mousePos, this.smoothMouse.x, this.smoothMouse.y);
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize light rays on hero section (HOME PAGE ONLY)
document.addEventListener('DOMContentLoaded', () => {
    const heroContainer = document.getElementById('lightRaysContainer');
    
    if (heroContainer) {
        // HOME PAGE - Check for saved theme first
        let savedTheme = null;
        let startColor = '#f0f0f0'; // Default white
        
        try {
            savedTheme = localStorage.getItem('portfolioTheme');
            if (savedTheme) {
                // Use saved theme color instead of white
                const colorThemes = {
                    'white': '#f0f0f0',
                    'purple': '#8B5CF6',
                    'blue': '#4A9EFF',
                    'cyan': '#00D9FF',
                    'green': '#24FF72',
                };
                startColor = colorThemes[savedTheme] || '#f0f0f0';
                console.log(`✅ Starting with saved theme: ${savedTheme}`);
            }
        } catch (e) {
            console.log('Could not load saved theme, starting with white');
        }
        
        // Initialize light rays with saved color or white
        const lightRays = new LightRaysWebGL(heroContainer, {
            raysOrigin: 'top-center',
            raysColor: startColor,
            raysSpeed: 1.5,
            lightSpread: 0.8,
            rayLength: 1.2,
            followMouse: true,
            mouseInfluence: 0.1,
            noiseAmount: 0.1,
            distortion: 0.05
        });

        // Color themes
        const colorThemes = [
            { 
                name: 'white',
                rays: '#f0f0f0', 
                accent: '#f0f0f0',
                glow: 'rgba(240, 240, 240, 0.2)'
            },
            { 
                name: 'purple',
                rays: '#8B5CF6', 
                accent: '#8B5CF6',
                glow: 'rgba(139, 92, 246, 0.2)'
            },
            { 
                name: 'blue',
                rays: '#4A9EFF', 
                accent: '#4A9EFF',
                glow: 'rgba(74, 158, 255, 0.2)'
            },
            { 
                name: 'cyan',
                rays: '#00D9FF', 
                accent: '#00D9FF',
                glow: 'rgba(0, 217, 255, 0.2)'
            },
            { 
                name: 'green',
                rays: '#24FF72', 
                accent: '#24FF72',
                glow: 'rgba(36, 255, 114, 0.2)'
            },
     
        ];
        
        // Find current color index based on saved theme
        let currentColorIndex = 0;
        if (savedTheme) {
            const savedIndex = colorThemes.findIndex(theme => theme.name === savedTheme);
            if (savedIndex !== -1) {
                currentColorIndex = savedIndex;
            }
        }

        const heroSection = document.getElementById('hero');
        const heroTitle = document.querySelector('#hero h1');

        if (heroSection && heroTitle) {
            // Set initial colors based on saved theme or white
            const initialTheme = colorThemes[currentColorIndex];
            heroTitle.style.textShadow = `0 0 15px ${initialTheme.glow}`;
            document.documentElement.style.setProperty('--green', initialTheme.accent);
            
            const changeTheme = () => {
                // Move to next color
                currentColorIndex = (currentColorIndex + 1) % colorThemes.length;
                const theme = colorThemes[currentColorIndex];
                
                // Change light rays color
                lightRays.changeColor(theme.rays);
                
                // Change title glow to MATCH the new color
                heroTitle.style.textShadow = `0 0 15px ${theme.glow}`;
                
                // Update CSS variable for accent color (this changes EVERYTHING)
                document.documentElement.style.setProperty('--green', theme.accent);
                
                // Save preference to localStorage (for other pages)
                try {
                    localStorage.setItem('portfolioTheme', theme.name);
                    console.log(`✅ Theme changed to: ${theme.name}`);
                } catch (e) {
                    console.log('Could not save theme preference');
                }
            };

            // Track if user is trying to scroll
            let touchStartY = 0;
            let touchMoved = false;

            // FIXED: Touch handling that allows both color change AND scrolling
            heroSection.addEventListener('touchstart', (e) => {
                // Don't trigger if touching the scroll indicator
                if (e.target.closest('.scroll-indicator')) return;
                
                // Record touch start position
                touchStartY = e.touches[0].clientY;
                touchMoved = false;
            }, { passive: true });

            heroSection.addEventListener('touchmove', (e) => {
                // Track if user moved their finger (scrolling)
                const touchCurrentY = e.touches[0].clientY;
                if (Math.abs(touchCurrentY - touchStartY) > 10) {
                    touchMoved = true;
                }
            }, { passive: true });

            heroSection.addEventListener('touchend', (e) => {
                // Don't trigger if touching the scroll indicator
                if (e.target.closest('.scroll-indicator')) return;
                
                // Only change color if user tapped (didn't scroll)
                if (!touchMoved) {
                    changeTheme();
                }
            }, { passive: true });

            // Click to change theme (desktop)
            heroSection.addEventListener('click', (e) => {
                // Don't trigger if clicking the scroll indicator
                if (e.target.closest('.scroll-indicator')) return;
                changeTheme();
            });
        }
    } else {
        // NOT HOME PAGE - Apply saved theme if exists
        try {
            const savedTheme = localStorage.getItem('portfolioTheme');
            if (savedTheme) {
                const colorThemes = {
                    'white': '#f0f0f0',
                    'purple': '#8B5CF6',
                    'blue': '#4A9EFF',
                    'cyan': '#00D9FF',
                    'green': '#24FF72',
                };
                
                const accentColor = colorThemes[savedTheme] || '#f0f0f0';
                document.documentElement.style.setProperty('--green', accentColor);
                console.log(`✅ Applied saved theme on non-home page: ${savedTheme}`);
            }
        } catch (e) {
            console.log('Could not load saved theme');
        }
    }

    // ===== SCROLL DOWN BUTTON =====
    const scrollDownBtn = document.getElementById('scroll-down');

    if (scrollDownBtn) {
        // Click/touch handler to scroll to next section
        scrollDownBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering hero color change
            
            const introSection = document.getElementById('intro');
            if (introSection) {
                const yOffset = -20; // 20px offset from top
                const y = introSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
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
    }
});
