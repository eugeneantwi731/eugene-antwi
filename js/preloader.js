        (function() {
            'use strict';
            
            // ===== CONFIGURATION =====
            const CONFIG = {
                sessionKey: 'portfolioPreloaderShown',
                ledAnimationDelay: 400,      // Delay between LED activations (ms)
                minPreloaderDuration: 2000,  // Minimum time preloader shows (ms)
                fadeOutDuration: 800         // Preloader fade out duration (ms)
            };
            
            // ===== CHECK IF PRELOADER SHOULD SHOW =====
            function shouldShowPreloader() {
                try {
                    const hasShown = sessionStorage.getItem(CONFIG.sessionKey);
                    return !hasShown;
                } catch (e) {
                    console.warn('SessionStorage not available, showing preloader');
                    return true;
                }
            }
            
            // ===== MARK PRELOADER AS SHOWN =====
            function markPreloaderShown() {
                try {
                    sessionStorage.setItem(CONFIG.sessionKey, 'true');
                } catch (e) {
                    console.warn('Could not save preloader state to sessionStorage');
                }
            }
            
            // ===== LED ANIMATION SEQUENCE =====
            function animateLEDs() {
                const leds = document.querySelectorAll('.led-indicator');
                let currentLED = 0;
                
                return new Promise((resolve) => {
                    // Small delay before first LED to prevent lag appearance
                    setTimeout(() => {
                        function activateNextLED() {
                            if (currentLED > 0) {
                                leds[currentLED - 1].classList.remove('active');
                            }
                            
                            if (currentLED < leds.length) {
                                leds[currentLED].classList.add('active');
                                currentLED++;
                                setTimeout(activateNextLED, CONFIG.ledAnimationDelay);
                            } else {
                                setTimeout(() => {
                                    leds[leds.length - 1].classList.remove('active');
                                    resolve();
                                }, CONFIG.ledAnimationDelay);
                            }
                        }
                        
                        activateNextLED();
                    }, 100); // 100ms delay before first LED
                });
            }
            
            // ===== HIDE PRELOADER =====
            function hidePreloader() {
                const preloader = document.getElementById('sitePreloader');
                const pageContent = document.getElementById('pageContent');
                const body = document.body;
                
                // Start fade out
                preloader.classList.add('hidden');
                
                // Re-enable scrolling IMMEDIATELY
                body.classList.remove('preloader-active');
                body.style.overflow = '';
                body.style.height = '';
                
                // Show page content with slight delay
                setTimeout(() => {
                    pageContent.classList.add('visible');
                }, 200);
                
                // Clean up preloader element after fade completes
                setTimeout(() => {
                    if (preloader && preloader.parentNode) {
                        preloader.style.display = 'none';
                    }
                }, CONFIG.fadeOutDuration + 200);
            }
            
            // ===== SKIP PRELOADER =====
            function skipPreloader() {
                const preloader = document.getElementById('sitePreloader');
                const pageContent = document.getElementById('pageContent');
                const body = document.body;
                
                // Immediately remove all preloader classes and show content
                if (preloader) {
                    preloader.style.display = 'none';
                }
                
                body.classList.remove('preloader-active');
                body.style.overflow = '';
                body.style.height = '';
                
                if (pageContent) {
                    pageContent.classList.add('visible');
                    pageContent.style.opacity = '1';
                    pageContent.style.visibility = 'visible';
                }
            }
            
            // ===== INITIALIZE PRELOADER =====
            function initPreloader() {
                // Check if preloader should show
                if (!shouldShowPreloader()) {
                    console.log('✅ Preloader already shown this session, skipping');
                    skipPreloader();
                    return;
                }
                
                console.log('🎬 Running preloader animation');
                
                const startTime = Date.now();
                
                // Start LED animation
                animateLEDs().then(() => {
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, CONFIG.minPreloaderDuration - elapsedTime);
                    
                    // Wait for minimum duration, then hide preloader
                    setTimeout(() => {
                        hidePreloader();
                        markPreloaderShown();
                        console.log('✅ Preloader complete - page animations can now start');
                    }, remainingTime);
                });
            }
            
            // ===== START ON DOM READY =====
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initPreloader);
            } else {
                initPreloader();
            }
            
            // ===== CONSOLE SIGNATURE =====
            console.log('%c Preloader System | Eugene Antwi ', 
                'background: #24FF72; color: #0a0a0f; font-size: 14px; font-weight: bold; padding: 8px 16px;');
            
        })();
