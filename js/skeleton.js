// ===== UNIVERSAL SKELETON LOADING SYSTEM =====
// Add this file to your js folder and link it in all pages

(function() {
    'use strict';
    
    console.log('%c Skeleton Loader Active ', 'background: #8B5CF6; color: #fff; padding: 4px 8px; border-radius: 3px;');
    
    // Configuration
    const config = {
        fadeInDuration: 400,
        minimumLoadTime: 200, // Minimum time to show skeleton (prevents flash)
        debug: false
    };
    
    // Track processed elements to avoid duplicates
    const processedElements = new WeakSet();
    
    // Initialize skeleton system
    function initSkeletonLoader() {
        // Process existing images
        processExistingMedia();
        
        // Watch for dynamically added media (for masonry grid, etc.)
        observeNewMedia();
        
        // Handle page visibility changes
        handleVisibilityChange();
    }
    
    // Process all existing images, videos, and iframes
    function processExistingMedia() {
        // Process images
        const images = document.querySelectorAll('img');
        images.forEach(img => applySkeletonToImage(img));
        
        // Process videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => applySkeletonToVideo(video));
        
        // Process iframes (YouTube, Vimeo, etc.)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => applySkeletonToIframe(iframe));
    }
    
    // Apply skeleton to image
    function applySkeletonToImage(img) {
        // Skip if already processed or if it's the preloader logo
        if (processedElements.has(img) || 
            img.closest('.preloader-logo') || 
            img.closest('.logo-container') ||
            img.classList.contains('footer-logo-icon')) {
            return;
        }
        
        processedElements.add(img);
        
        const startTime = Date.now();
        
        // Don't apply skeleton if image is already loaded
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('skeleton-loaded');
            return;
        }
        
        // Create skeleton wrapper
        const wrapper = createSkeletonWrapper('image', img);
        img.classList.add('skeleton-loading');
        
        // Handle load event
        const handleLoad = () => {
            const loadTime = Date.now() - startTime;
            const delay = Math.max(0, config.minimumLoadTime - loadTime);
            
            setTimeout(() => {
                removeSkeleton(img, wrapper);
            }, delay);
        };
        
        // Handle error event
        const handleError = () => {
            if (config.debug) {
                console.warn('Image failed to load:', img.src);
            }
            removeSkeleton(img, wrapper);
        };
        
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });
        
        // Check if image is already cached (load event might not fire)
        if (img.complete) {
            handleLoad();
        }
    }
    
    // Apply skeleton to video
    function applySkeletonToVideo(video) {
        if (processedElements.has(video)) return;
        processedElements.add(video);
        
        const startTime = Date.now();
        
        // Create skeleton wrapper
        const wrapper = createSkeletonWrapper('video', video);
        video.classList.add('skeleton-loading');
        
        // Handle canplay event (video ready to play)
        const handleCanPlay = () => {
            const loadTime = Date.now() - startTime;
            const delay = Math.max(0, config.minimumLoadTime - loadTime);
            
            setTimeout(() => {
                removeSkeleton(video, wrapper);
            }, delay);
        };
        
        video.addEventListener('canplay', handleCanPlay, { once: true });
        video.addEventListener('loadeddata', handleCanPlay, { once: true });
    }
    
    // Apply skeleton to iframe (YouTube, Vimeo, etc.)
    function applySkeletonToIframe(iframe) {
        if (processedElements.has(iframe)) return;
        processedElements.add(iframe);
        
        const startTime = Date.now();
        
        // Create skeleton wrapper
        const wrapper = createSkeletonWrapper('iframe', iframe);
        iframe.classList.add('skeleton-loading');
        
        // Handle load event
        const handleLoad = () => {
            const loadTime = Date.now() - startTime;
            const delay = Math.max(0, config.minimumLoadTime - loadTime);
            
            setTimeout(() => {
                removeSkeleton(iframe, wrapper);
            }, delay);
        };
        
        iframe.addEventListener('load', handleLoad, { once: true });
        
        // Fallback timeout for iframes (sometimes load event is unreliable)
        setTimeout(() => {
            if (iframe.classList.contains('skeleton-loading')) {
                removeSkeleton(iframe, wrapper);
            }
        }, 3000);
    }
    
    // Create skeleton wrapper element
    function createSkeletonWrapper(type, element) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('skeleton-wrapper');
        
        // Add type-specific skeleton
        const skeleton = document.createElement('div');
        skeleton.classList.add(`skeleton-${type}`);
        wrapper.appendChild(skeleton);
        
        // Get element dimensions for aspect ratio
        const parent = element.parentNode;
        const computedStyle = window.getComputedStyle(element);
        
        // Copy element's border-radius to skeleton
        wrapper.style.borderRadius = computedStyle.borderRadius;
        
        // Insert skeleton before the element
        parent.insertBefore(wrapper, element);
        
        // Match skeleton dimensions to element
        matchDimensions(wrapper, element);
        
        return wrapper;
    }
    
    // Match skeleton dimensions to element
    function matchDimensions(wrapper, element) {
        // For images in masonry grid
        if (element.closest('.masonry-item')) {
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            return;
        }
        
        // For project banners
        if (element.closest('.project-banner')) {
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            return;
        }
        
        // For showreel
        if (element.closest('.showreel-thumbnail')) {
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            return;
        }
        
        // Default: match element dimensions
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            wrapper.style.width = rect.width + 'px';
            wrapper.style.height = rect.height + 'px';
        } else {
            // Fallback: use parent dimensions
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
        }
    }
    
    // Remove skeleton and show element
    function removeSkeleton(element, wrapper) {
        element.classList.remove('skeleton-loading');
        element.classList.add('skeleton-loaded');
        
        // Fade out skeleton
        if (wrapper && wrapper.parentNode) {
            wrapper.style.transition = `opacity ${config.fadeInDuration}ms ease-out`;
            wrapper.style.opacity = '0';
            
            setTimeout(() => {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }, config.fadeInDuration);
        }
    }
    
    // Watch for dynamically added media (MutationObserver)
    function observeNewMedia() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is media
                        if (node.tagName === 'IMG') {
                            applySkeletonToImage(node);
                        } else if (node.tagName === 'VIDEO') {
                            applySkeletonToVideo(node);
                        } else if (node.tagName === 'IFRAME') {
                            applySkeletonToIframe(node);
                        }
                        
                        // Check for media inside the added node
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                        const iframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
                        
                        images.forEach(img => applySkeletonToImage(img));
                        videos.forEach(video => applySkeletonToVideo(video));
                        iframes.forEach(iframe => applySkeletonToIframe(iframe));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Handle page visibility changes (pause/resume animations)
    function handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            const skeletons = document.querySelectorAll('.skeleton-wrapper');
            
            if (document.hidden) {
                // Pause animations when page is hidden (performance)
                skeletons.forEach(skeleton => {
                    skeleton.style.animationPlayState = 'paused';
                });
            } else {
                // Resume animations when page is visible
                skeletons.forEach(skeleton => {
                    skeleton.style.animationPlayState = 'running';
                });
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSkeletonLoader);
    } else {
        initSkeletonLoader();
    }
    
    // Re-process media after preloader finishes (if you have one)
    window.addEventListener('load', () => {
        setTimeout(() => {
            processExistingMedia();
        }, 100);
    });
    
    // Expose API for manual control (optional)
    window.SkeletonLoader = {
        process: processExistingMedia,
        processImage: applySkeletonToImage,
        processVideo: applySkeletonToVideo,
        processIframe: applySkeletonToIframe,
        config: config
    };
    
})();