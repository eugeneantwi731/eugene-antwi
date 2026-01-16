// ===== WORK PAGE SCRIPT - ENHANCED MASONRY GRID =====

// ===== ACTUAL WORK ITEMS (20 pieces) =====
const workItems = [
    // DESIGN CATEGORY
    {
        id: 1,
        title: "Akofena Poster Compositing Breakdown",
        img: "./images/akofena-poster-compositing-breakdown-cover.png",
        category: "design",
        type: "video",
        videoUrl: "./videos/akofena-poster-compositing-breakdown.mp4",
        height: 500
    },
    {
        id: 2,
        title: "Apple Cider Product Design",
        img: "./images/apple-cider-product.png",
        category: "design",
        type: "image",
        height: 450
    },
    {
        id: 3,
        title: "International Pharm Design",
        img: "./images/international-pharm.png",
        category: "design",
        type: "image",
        height: 350
    },
    {
        id: 4,
        title: "JBLHA Design",
        img: "./images/jblha.png",
        category: "design",
        type: "image",
        height: 500
    },
    {
        id: 5,
        title: "Pixel Babe T-Shirt",
        img: "./images/pixel-babe-tshirt.png",
        category: "design",
        type: "image",
        height: 600
    },
    {
        id: 6,
        title: "Portfolio UI Design",
        img: "./images/portfolio-ui-design.png",
        category: "design",
        type: "image",
        height: 400
    },
    
    // ANIMATION CATEGORY
    {
        id: 7,
        title: "Antwic Probiotic Ad",
        img: "./images/antwic-probiotic-ad-cover.png",
        category: "animation",
        type: "video",
        videoUrl: "./videos/antwic-probiotic-ad.mp4",
        height: 450
    },
    {
        id: 8,
        title: "Electragene Ignition X Commercial",
        img: "./images/electragene-ignition-x-commercial-cover.png",
        category: "animation",
        type: "video",
        videoUrl: "./videos/electragene-ignition-x-commercial.mp4",
        height: 500
    },
    {
        id: 9,
        title: "The Last Shepherd",
        img: "./images/last-shepherd-cover.png",
        category: "animation",
        type: "video",
        videoUrl: "https://vimeo.com/775281800",
        isExternal: true,
        height: 550
    },
    {
        id: 10,
        title: "ProNews HUD Mograph",
        img: "./images/pronews-hud-mograph-cover.png",
        category: "animation",
        type: "video",
        videoUrl: "./videos/pronews-hud-mograph.mp4",
        height: 400
    },
    
    // CG CATEGORY
    {
        id: 11,
        title: "Akwaaba",
        img: "./images/akwaaba.png",
        category: "cg",
        type: "image",
        height: 500
    },
    {
        id: 12,
        title: "BTHA Portrait",
        img: "./images/btha-portrait.png",
        category: "cg",
        type: "image",
        height: 600
    },
    {
        id: 13,
        title: "Digital Avatar Breakdown",
        img: "./images/digital-avatar-cover.png",
        category: "cg",
        type: "video",
        videoUrl: "./videos/digital-avatar-breakdown.mp4",
        height: 450
    },
    {
        id: 14,
        title: "Warrior Breakdown",
        img: "./images/warrior-breakdown-cover.png",
        category: "cg",
        type: "video",
        videoUrl: "https://youtu.be/MnJRjzsJRKM",
        isExternal: true,
        height: 500
    },
    
    // ILLUSTRATION CATEGORY
    {
        id: 15,
        title: "Abstract Illustration",
        img: "./images/abstract-1.png",
        category: "illustration",
        type: "image",
        height: 400
    },
    {
        id: 16,
        title: "Akan Princess",
        img: "./images/akan-princess.png",
        category: "illustration",
        type: "image",
        height: 550
    },
    {
        id: 17,
        title: "Maabena",
        img: "./images/maabena.png",
        category: "illustration",
        type: "image",
        height: 600
    },
    {
        id: 18,
        title: "Three Maidens",
        img: "./images/three-maidens.png",
        category: "illustration",
        type: "image",
        height: 500
    }
];

// ===== FEATURED PROJECTS DATA =====
const projects = [
    {
        id: 1,
        title: "Glide Lubricant",
        subtitle: "Product Design & Branding",
        banner: "https://via.placeholder.com/900x400/1a1a24/24FF72?text=Glide+Banner",
        shortDescription: "Complete package design, labels, and marketing materials for a pharmaceutical lubricant brand.",
        fullDescription: "This comprehensive branding project involved creating a complete visual identity for Glide, a pharmaceutical lubricant product. The design communicates trust and professionalism in the medical space while maintaining approachability for consumers. The project included package design, label systems, marketing collateral, and brand guidelines that ensure consistency across all touchpoints.",
        images: [
            "https://via.placeholder.com/400x300/1a1a24/24FF72?text=Image+1",
            "https://via.placeholder.com/400x300/1a1a24/24FF72?text=Image+2",
            "https://via.placeholder.com/400x300/1a1a24/24FF72?text=Image+3",
            "https://via.placeholder.com/400x300/1a1a24/24FF72?text=Image+4"
        ],
        tools: ["Photoshop", "Illustrator", "InDesign"]
    },
    {
        id: 2,
        title: "Antwic Pharmaceutical",
        subtitle: "Label Design & Product Animation",
        banner: "https://via.placeholder.com/900x400/1a1a24/8B5CF6?text=Antwic+Banner",
        shortDescription: "Fictional pharmaceutical brand featuring label design and 3D product animation.",
        fullDescription: "Antwic is a fictional pharmaceutical brand showcasing the complete lifecycle of product visualization from concept to marketing. This project demonstrates advanced skills in both static design and motion graphics, creating realistic product visualizations that could be used across digital and print media. The 3D animation brings the product to life, showing its features and benefits in an engaging, professional manner suitable for pharmaceutical marketing.",
        images: [
            "https://via.placeholder.com/400x300/1a1a24/8B5CF6?text=Image+1",
            "https://via.placeholder.com/400x300/1a1a24/8B5CF6?text=Image+2",
            "https://via.placeholder.com/400x300/1a1a24/8B5CF6?text=Image+3"
        ],
        tools: ["Cinema 4D", "After Effects", "Photoshop"],
        hasVideo: true,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
        id: 3,
        title: "Digital Fashion Collection",
        subtitle: "Marvelous Designer Garments",
        banner: "https://via.placeholder.com/900x400/1a1a24/4A9EFF?text=Fashion+Banner",
        shortDescription: "Collection of digital fashion designs created in Marvelous Designer.",
        fullDescription: "This digital fashion project explores the intersection of traditional garment design and cutting-edge 3D technology. Using Marvelous Designer, each piece was meticulously crafted from pattern to final render, demonstrating technical proficiency in 3D fashion creation. The collection features custom fabric designs, realistic draping, and professional presentation renders that showcase the garments in a portfolio-ready format. This work represents the future of fashion visualization and virtual clothing design.",
        images: [
            "https://via.placeholder.com/400x300/1a1a24/4A9EFF?text=Image+1",
            "https://via.placeholder.com/400x300/1a1a24/4A9EFF?text=Image+2",
            "https://via.placeholder.com/400x300/1a1a24/4A9EFF?text=Image+3",
            "https://via.placeholder.com/400x300/1a1a24/4A9EFF?text=Image+4",
            "https://via.placeholder.com/400x300/1a1a24/4A9EFF?text=Image+5"
        ],
        tools: ["Marvelous Designer", "Blender", "Substance Painter"]
    },
    {
        id: 4,
        title: "Digital Character Creation",
        subtitle: "Character Work & Before/After Comparison",
        banner: "https://via.placeholder.com/900x400/1a1a24/00D9FF?text=Character+Banner",
        shortDescription: "Character creation project based on real people using advanced 3D techniques.",
        fullDescription: "This character development project showcases the complete pipeline of digital human creation, from reference gathering to final render. Using industry-standard techniques and software, realistic characters were created that capture the essence and likeness of real people. The before/after comparison demonstrates the transformation from raw 3D model to fully realized character, highlighting skills in modeling, texturing, lighting, and rendering that are essential for film, games, and virtual production.",
        images: [
            "https://via.placeholder.com/400x300/1a1a24/00D9FF?text=Image+1",
            "https://via.placeholder.com/400x300/1a1a24/00D9FF?text=Image+2"
        ],
        tools: ["Blender", "ZBrush", "Substance Painter"],
        hasBeforeAfter: true,
        beforeImage: "https://via.placeholder.com/600x400/1a1a24/00D9FF?text=Before",
        afterImage: "https://via.placeholder.com/600x400/1a1a24/24FF72?text=After"
    },
    {
        id: 5,
        title: "Project 5 Placeholder",
        subtitle: "Category & Type",
        banner: "https://via.placeholder.com/900x400/1a1a24/FF6B6B?text=Project+5+Banner",
        shortDescription: "Description of your fifth project goes here.",
        fullDescription: "This is a placeholder for your fifth featured project. Replace this text with a detailed description of your work, explaining the creative process, technical challenges, and final outcomes. Include information about your role, the project timeline, and any notable achievements or results. Make sure to update the images, tools, and all other relevant information to reflect your actual project.",
        images: [
            "https://via.placeholder.com/400x300/1a1a24/FF6B6B?text=Image+1",
            "https://via.placeholder.com/400x300/1a1a24/FF6B6B?text=Image+2",
            "https://via.placeholder.com/400x300/1a1a24/FF6B6B?text=Image+3"
        ],
        tools: ["Tool 1", "Tool 2", "Tool 3"]
    }
];

// ===== MASONRY GRID CONFIGURATION =====
let masonryConfig = {
    ease: 'power3.out',
    duration: 0.6,
    stagger: 0.05,
    animateFrom: 'bottom',
    scaleOnHover: true,
    hoverScale: 0.95,
    blurToFocus: true,
    colorShiftOnHover: false
};

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c Work Page Loaded ', 'background: #24FF72; color: #0a0a0f; font-size: 14px; font-weight: bold; padding: 8px 16px;');
    
    applySavedTheme();
    
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded. Please include GSAP library.');
        renderMasonryGalleryFallback();
    } else {
        renderMasonryGallery();
    }
    
    renderProjects();
    setupFilters();
    setupLightbox();
    setupShowreel();
});

// ===== APPLY SAVED THEME FROM HOME PAGE =====
function applySavedTheme() {
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
            console.log(`✅ Applied saved theme: ${savedTheme} (${accentColor})`);
        }
    } catch (e) {
        console.log('Could not load saved theme');
    }
}

// ===== RENDER MASONRY GALLERY WITH GSAP =====
function renderMasonryGallery() {
    const grid = document.getElementById('masonryGrid');
    grid.innerHTML = '';
    
    workItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'masonry-item';
        itemEl.dataset.category = item.category;
        itemEl.dataset.id = item.id;
        itemEl.style.opacity = '0';
        
        const videoIndicator = item.type === 'video' ? `
            <div class="video-indicator">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </div>
        ` : '';
        
        itemEl.innerHTML = `
            <div class="masonry-item-inner">
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                ${videoIndicator}
                <div class="masonry-overlay">
                    <span class="masonry-title">${item.title}</span>
                    <span class="masonry-category">${item.category}</span>
                </div>
            </div>
        `;
        
        itemEl.addEventListener('click', () => {
            openLightbox(item);
        });
        
        if (masonryConfig.scaleOnHover) {
            itemEl.addEventListener('mouseenter', () => {
                gsap.to(itemEl, {
                    scale: masonryConfig.hoverScale,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            itemEl.addEventListener('mouseleave', () => {
                gsap.to(itemEl, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }
        
        grid.appendChild(itemEl);
        animateItemIn(itemEl, index);
    });
}

// ===== ANIMATE ITEM IN WITH GSAP =====
function animateItemIn(element, index) {
    const { ease, duration, stagger, animateFrom, blurToFocus } = masonryConfig;
    
    let initialProps = { opacity: 0 };
    
    const directions = ['top', 'bottom', 'left', 'right', 'center'];
    let direction = animateFrom === 'random' 
        ? directions[Math.floor(Math.random() * directions.length)]
        : animateFrom;
    
    switch (direction) {
        case 'top':
            initialProps.y = -100;
            break;
        case 'bottom':
            initialProps.y = 100;
            break;
        case 'left':
            initialProps.x = -100;
            break;
        case 'right':
            initialProps.x = 100;
            break;
        case 'center':
            initialProps.scale = 0;
            break;
    }
    
    if (blurToFocus) {
        initialProps.filter = 'blur(10px)';
    }
    
    gsap.set(element, initialProps);
    
    const finalProps = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: duration,
        ease: ease,
        delay: index * stagger
    };
    
    if (blurToFocus) {
        finalProps.filter = 'blur(0px)';
    }
    
    gsap.to(element, finalProps);
}

// ===== FALLBACK IF GSAP NOT LOADED =====
function renderMasonryGalleryFallback() {
    const grid = document.getElementById('masonryGrid');
    grid.innerHTML = '';
    
    workItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'masonry-item';
        itemEl.dataset.category = item.category;
        itemEl.dataset.id = item.id;
        itemEl.style.animationDelay = `${index * 0.05}s`;
        
        const videoIndicator = item.type === 'video' ? `
            <div class="video-indicator">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </div>
        ` : '';
        
        itemEl.innerHTML = `
            <div class="masonry-item-inner">
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                ${videoIndicator}
                <div class="masonry-overlay">
                    <span class="masonry-title">${item.title}</span>
                    <span class="masonry-category">${item.category}</span>
                </div>
            </div>
        `;
        
        itemEl.addEventListener('click', () => {
            openLightbox(item);
        });
        
        grid.appendChild(itemEl);
    });
}

// ===== RENDER PROJECTS - NEW VERTICAL LAYOUT =====
function renderProjects() {
    const projectsContainer = document.getElementById('projectsGrid');
    if (!projectsContainer) return;
    
    // Clear existing content
    projectsContainer.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = project.id;
        
        // Build images grid HTML
        let imagesHTML = project.images.map(img => 
            `<img src="${img}" alt="${project.title}">`
        ).join('');
        
        // Build tools HTML
        let toolsHTML = project.tools.map(tool => 
            `<span class="project-tool-tag">${tool}</span>`
        ).join('');
        
        // Before/After slider HTML
        let beforeAfterHTML = '';
        if (project.hasBeforeAfter) {
            beforeAfterHTML = `
                <div class="before-after-container">
                    <h4>Before & After Comparison</h4>
                    <div class="before-after-slider">
                        <img class="before-image" src="${project.beforeImage}" alt="Before">
                        <img class="after-image" src="${project.afterImage}" alt="After">
                        <div class="slider-handle"></div>
                        <input type="range" min="0" max="100" value="50" class="slider-input">
                    </div>
                </div>
            `;
        }
        
        // Video embed HTML
        let videoHTML = '';
        if (project.hasVideo) {
            videoHTML = `
                <div class="project-video-embed">
                    <iframe src="${project.videoUrl}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
                </div>
            `;
        }
        
        // Build the complete project card
        projectCard.innerHTML = `
            <div class="project-banner">
                <img src="${project.banner}" alt="${project.title}">
            </div>
            
            <div class="project-header">
                <span class="project-category">${project.subtitle}</span>
                <h3>${project.title}</h3>
                <p class="project-short-description">${project.shortDescription}</p>
                
                <button class="project-toggle-btn">
                    <span>View Full Project</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>
            
            <div class="project-expanded-content">
                <p class="project-description">${project.fullDescription}</p>
                
                ${beforeAfterHTML}
                
                ${videoHTML}
                
                <div class="project-images-grid">
                    ${imagesHTML}
                </div>
                
                <div class="project-tools">
                    ${toolsHTML}
                </div>
            </div>
        `;
        
        // Add toggle functionality
        const toggleBtn = projectCard.querySelector('.project-toggle-btn');
        toggleBtn.addEventListener('click', () => {
            toggleProject(projectCard, toggleBtn);
        });
        
        projectsContainer.appendChild(projectCard);
        
        // Setup before/after slider if present
        if (project.hasBeforeAfter) {
            setupBeforeAfterSlider(projectCard);
        }
    });
}

// ===== TOGGLE PROJECT EXPAND/COLLAPSE =====
function toggleProject(projectCard, toggleBtn) {
    const isExpanded = projectCard.classList.contains('expanded');
    const btnText = toggleBtn.querySelector('span');
    
    // Close other expanded projects
    document.querySelectorAll('.project-card.expanded').forEach(card => {
        if (card !== projectCard) {
            card.classList.remove('expanded');
            const otherBtn = card.querySelector('.project-toggle-btn span');
            if (otherBtn) otherBtn.textContent = 'View Full Project';
        }
    });
    
    if (isExpanded) {
        // Collapse
        projectCard.classList.remove('expanded');
        btnText.textContent = 'View Full Project';
    } else {
        // Expand
        projectCard.classList.add('expanded');
        btnText.textContent = 'Close Project';
        
        // Smooth scroll to project
        setTimeout(() => {
            projectCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// ===== BEFORE/AFTER SLIDER FUNCTIONALITY =====
function setupBeforeAfterSlider(projectCard) {
    const slider = projectCard.querySelector('.slider-input');
    const afterImage = projectCard.querySelector('.after-image');
    const handle = projectCard.querySelector('.slider-handle');
    
    if (!slider || !afterImage || !handle) return;
    
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        afterImage.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        handle.style.left = `${value}%`;
    });
}

// ===== SETUP FILTER BUTTONS =====
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.masonry-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            items.forEach(item => {
                const category = item.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    if (typeof gsap !== 'undefined') {
                        gsap.to(item, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.3,
                            display: 'block',
                            onStart: () => {
                                item.style.display = 'block';
                            }
                        });
                    } else {
                        item.classList.remove('hidden');
                        item.style.display = 'block';
                    }
                } else {
                    if (typeof gsap !== 'undefined') {
                        gsap.to(item, {
                            opacity: 0,
                            scale: 0.8,
                            duration: 0.3,
                            onComplete: () => {
                                item.style.display = 'none';
                            }
                        });
                    } else {
                        item.classList.add('hidden');
                        setTimeout(() => {
                            if (item.classList.contains('hidden')) {
                                item.style.display = 'none';
                            }
                        }, 300);
                    }
                }
            });
        });
    });
}

// ===== LIGHTBOX FUNCTIONALITY =====
let currentLightboxItem = null;

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    
    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        navigateLightbox(-1);
    });
    
    nextBtn.addEventListener('click', () => {
        navigateLightbox(1);
    });
}

function navigateLightbox(direction) {
    if (!currentLightboxItem) return;
    
    const currentIndex = workItems.findIndex(item => item.id === currentLightboxItem.id);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = workItems.length - 1;
    if (newIndex >= workItems.length) newIndex = 0;
    
    openLightbox(workItems[newIndex]);
}

function openLightbox(item) {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const caption = document.getElementById('lightboxCaption');
    
    currentLightboxItem = item;
    
    content.innerHTML = '';
    
    if (item.type === 'video' && item.videoUrl) {
        let videoSrc = item.videoUrl;
        
        if (item.isExternal) {
            if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
                const videoId = videoSrc.split('/').pop().split('?')[0];
                videoSrc = `https://www.youtube.com/embed/${videoId}`;
            } else if (videoSrc.includes('vimeo.com')) {
                const videoId = videoSrc.split('/').pop().split('?')[0];
                videoSrc = `https://player.vimeo.com/video/${videoId}`;
            }
            
            const iframe = document.createElement('iframe');
            iframe.src = videoSrc;
            iframe.width = '100%';
            iframe.style.aspectRatio = '16 / 9';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.borderRadius = '8px';
            content.appendChild(iframe);
        } else {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.style.width = '100%';
            video.style.maxHeight = '85vh';
            video.style.borderRadius = '8px';
            content.appendChild(video);
        }
    } else {
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title;
        content.appendChild(img);
    }
    
    caption.innerHTML = `
        <strong>${item.title}</strong><br>
        <span style="color: #a0a0aa;">${item.category}</span>
    `;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    
    const iframe = content.querySelector('iframe');
    const video = content.querySelector('video');
    
    if (iframe) {
        iframe.src = iframe.src;
    }
    if (video) {
        video.pause();
    }
    
    lightbox.style.opacity = '0';
    
    setTimeout(() => {
        lightbox.classList.remove('active');
        lightbox.style.opacity = '';
        document.body.style.overflow = '';
        currentLightboxItem = null;
    }, 300);
}

// ===== SHOWREEL FUNCTIONALITY =====
function setupShowreel() {
    const thumbnail = document.getElementById('showreelThumbnail');
    const videoPlayer = document.getElementById('showreelVideoPlayer');
    const video = document.getElementById('showreelVideo');
    
    if (!thumbnail || !videoPlayer || !video) return;
    
    thumbnail.addEventListener('click', () => {
        thumbnail.style.display = 'none';
        videoPlayer.classList.add('active');
        video.play();
        
        videoPlayer.style.opacity = '0';
        setTimeout(() => {
            videoPlayer.style.transition = 'opacity 0.5s ease';
            videoPlayer.style.opacity = '1';
        }, 50);
    });
    
    video.addEventListener('ended', () => {
        videoPlayer.style.opacity = '0';
        setTimeout(() => {
            videoPlayer.classList.remove('active');
            thumbnail.style.display = 'block';
            video.currentTime = 0;
        }, 500);
    });
}

// ===== HELPER: ADD NEW WORK ITEM =====
// To add new items in the future, use this template:
/*
{
    id: NEXT_NUMBER,
    title: "Your Work Title",
    img: "./images/your-image.png",  // or "./images/your-cover.png" for videos
    category: "design" | "animation" | "cg" | "illustration",
    type: "image" | "video",
    videoUrl: "./videos/your-video.mp4", // only for videos
    isExternal: true, // only if YouTube/Vimeo
    height: 400 // any number between 350-600
}

Simply copy the template above, fill in your details, and add it to the workItems array!
*/