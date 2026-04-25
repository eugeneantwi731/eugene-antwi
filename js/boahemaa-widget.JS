// ============================================================
// BOAHEMAA WIDGET — Main Widget Script
// Depends on: boahemaa-persistence.js (must load first)
//
// Behavior states:
//   hidden    → before preloader clears
//   intro     → page load wave + Akwaaba (first visit only)
//   peek      → default idle, top of head visible, eyes track mouse
//   hover     → rises to waist on mouseover
//   chat-open → panel open, avatar in header
//
// All accent color is read from --green CSS variable.
// Widget automatically inherits whatever color the user picked
// on the hero (saved to localStorage as portfolioTheme).
// ============================================================

(function () {
  'use strict';

  // ---- Config ----
  const FUNCTION_URL = '/.netlify/functions/chat';
  const INTRO_GREETING = "Akwaaba! I'm Boahemaa.";
  const HOVER_GREETING = "Hi there, I'm Boahemaa.";

  const OPENING_MESSAGES = [
    "Hey! I'm Boahemaa, Eugene's AI assistant. Curious about his work? Ask me anything.",
    "Hi there! I'm Boahemaa. I know everything about Eugene and what he does. What would you like to know?",
    "Akwaaba! I'm Boahemaa. I'm here to help you get to know Eugene, his work, and how to work with him.",
    "Hey! I'm Boahemaa. Whether you're a potential client, collaborator, or just curious, I've got you covered.",
    "Hi! I'm Boahemaa, Eugene's assistant. Ask me about his skills, projects, or how to reach him.",
    "Hello! I'm Boahemaa. Eugene built me to help visitors like you learn more about him. What's on your mind?",
    "Hey there! I'm Boahemaa. I'm here to bridge the gap between you and Eugene's work. Where do you want to start?",
    "Hi! I'm Boahemaa. I know Eugene's work inside out. Ask me anything: skills, projects, collabs, you name it.",
    "Akwaaba! I'm Boahemaa. Think of me as your guide to everything Eugene Antwi. What are you looking for?",
    "Hey! I'm Boahemaa. Need to know if Eugene's the right fit for your project? Let's talk.",
    "Hi there! I'm Boahemaa. I live on this portfolio to help you understand who Eugene is and what he creates.",
    "Hello! I'm Boahemaa. I'm here to help you explore Eugene's work and figure out if you'd like to collaborate.",
    "Hey! I'm Boahemaa. From animation to branding to creative tech, I can tell you about all of it. What's up?",
    "Hi! I'm Boahemaa. Eugene built me so his portfolio could talk back. What do you want to know?",
    "Akwaaba! I'm Boahemaa. I'm here, I'm sharp, and I know Eugene's work well. Ask away.",
    "Hey! I'm Boahemaa. If you're trying to understand what Eugene does and whether he's right for you, I can help.",
    "Hi there! I'm Boahemaa, Eugene's AI assistant. Here to answer your questions and make this portfolio feel alive.",
    "Hello! I'm Boahemaa. Whether it's about Eugene's process, his tools, or his vision, I'm your person.",
    "Hey! I'm Boahemaa. I know Eugene's story, his skills, and what he's building. What would you like to know?",
    "Hi! I'm Boahemaa. Ask me about Eugene's animation work, his branding projects, or how to get in touch.",
  ];

  function getRandomOpening() {
    return OPENING_MESSAGES[Math.floor(Math.random() * OPENING_MESSAGES.length)];
  }

  const CHAT_OPENING_MESSAGE = getRandomOpening;  // Called as a function each time
  const CHAT_OPENING_RETURNING = "Welcome back. Ready to pick up where we left off, or is there something new I can help you with?";
  const PARTICLE_COUNT = 10;

  // How long after page load before she peeks (ms)
  // Waits for preloader if present, otherwise just a short delay
  const INTRO_DELAY_FRESH = 800;
  const INTRO_DELAY_RETURNING = 0; // No preloader on inner pages — appear immediately

  // ---- State ----
  let currentState = 'hidden';
  let isChatOpen = false;
  let isWaitingForResponse = false;
  let mouseX = 0;
  let mouseY = 0;
  let hoverTimeout = null;
  let bubbleTimeout = null;
  let eyeTrackRAF = null;

  // ---- DOM Refs (populated on init) ----
  let avatarEl, panelEl, messagesEl, inputEl, sendBtn, headerAvatarEl;
  let leftEyePupil, rightEyePupil;
  let bubbleEl, waveHandEl;

  // ============================================================
  // BUILD HTML
  // ============================================================

  function buildWidget() {
    // ---- Avatar ----
    const avatar = document.createElement('div');
    avatar.id = 'boahemaa-avatar';
    avatar.className = 'state-hidden';
    avatar.setAttribute('aria-label', 'Chat with Boahemaa');
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');

    avatar.innerHTML = `
      <div class="boahemaa-avatar-body">
        <div class="boahemaa-face">
          <div class="boahemaa-initials">AB</div>
          <div class="boahemaa-eyes">
            <div class="boahemaa-eye">
              <div class="boahemaa-pupil"></div>
            </div>
            <div class="boahemaa-eye slow-blink">
              <div class="boahemaa-pupil"></div>
            </div>
          </div>
        </div>
        <span class="boahemaa-wave-hand">👋</span>
        <div class="boahemaa-bubble"></div>
      </div>
    `;

    // ---- Chat Panel ----
    const panel = document.createElement('div');
    panel.id = 'boahemaa-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Boahemaa');

    panel.innerHTML = `
      <div class="boahemaa-panel-header">
        <div class="boahemaa-header-avatar">AB</div>
        <div class="boahemaa-header-info">
          <div class="boahemaa-header-name">Boahemaa</div>
          <div class="boahemaa-header-status">Eugene's AI assistant</div>
        </div>
        <div class="boahemaa-header-actions">
          <button class="boahemaa-btn-icon" id="boahemaa-new-chat" title="New conversation" aria-label="New conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="boahemaa-btn-icon boahemaa-btn-close" id="boahemaa-close" title="Close" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="boahemaa-messages" id="boahemaa-messages"></div>
      <div class="boahemaa-input-area">
        <div class="boahemaa-input-wrapper">
          <textarea
            class="boahemaa-input"
            id="boahemaa-input"
            placeholder="Ask me anything about Eugene…"
            rows="1"
            aria-label="Type your message"
          ></textarea>
          <button class="boahemaa-send-btn" id="boahemaa-send" aria-label="Send message">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    // ---- VFX ring ----
    const vfxRing = document.createElement('div');
    vfxRing.className = 'boahemaa-vfx-ring';
    vfxRing.id = 'boahemaa-vfx';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'boahemaa-vfx-particle';
      dot.style.setProperty('--angle', `${(360 / PARTICLE_COUNT) * i}deg`);
      vfxRing.appendChild(dot);
    }

    document.body.appendChild(avatar);
    document.body.appendChild(panel);
    document.body.appendChild(vfxRing);
  }

  // ============================================================
  // CACHE DOM REFS
  // ============================================================

  function cacheRefs() {
    avatarEl       = document.getElementById('boahemaa-avatar');
    panelEl        = document.getElementById('boahemaa-panel');
    messagesEl     = document.getElementById('boahemaa-messages');
    inputEl        = document.getElementById('boahemaa-input');
    sendBtn        = document.getElementById('boahemaa-send');
    headerAvatarEl = panelEl.querySelector('.boahemaa-header-avatar');
    bubbleEl       = avatarEl.querySelector('.boahemaa-bubble');
    waveHandEl     = avatarEl.querySelector('.boahemaa-wave-hand');

    const pupils = avatarEl.querySelectorAll('.boahemaa-pupil');
    leftEyePupil  = pupils[0];
    rightEyePupil = pupils[1];
  }

  // ============================================================
  // AVATAR STATE MACHINE
  // ============================================================

  function setState(newState) {
    if (!avatarEl) return;
    // Remove all state classes
    ['state-hidden', 'state-peek', 'state-hover', 'state-intro', 'state-chat-open']
      .forEach(c => avatarEl.classList.remove(c));
    avatarEl.classList.add('state-' + newState);
    currentState = newState;
  }

  // ============================================================
  // BUBBLE
  // ============================================================

  function showBubble(text, durationMs = 3000) {
    if (!bubbleEl) return;
    clearTimeout(bubbleTimeout);
    bubbleEl.textContent = text;
    bubbleEl.classList.add('visible');
    bubbleTimeout = setTimeout(() => {
      bubbleEl.classList.remove('visible');
    }, durationMs);
  }

  function hideBubble() {
    if (!bubbleEl) return;
    clearTimeout(bubbleTimeout);
    bubbleEl.classList.remove('visible');
  }

  // ============================================================
  // INTRO SEQUENCE — Akwaaba wave (first visit only)
  // ============================================================

  function playIntro() {
    setState('intro');
    // Wave hand
    waveHandEl.classList.add('waving');
    showBubble(INTRO_GREETING, 3200);

    // After wave, remove hand and drop to peek
    setTimeout(() => {
      waveHandEl.classList.remove('waving');
    }, 2200);

    setTimeout(() => {
      hideBubble();
      setState('peek');
      BoahemaaSession.markIntroduced();
    }, 3600);
  }

  // ============================================================
  // MOUSE TRACKING — Eye pupils follow cursor
  // ============================================================

  function startEyeTracking() {
    if (eyeTrackRAF) return;

    function track() {
      if (!avatarEl || !leftEyePupil || !rightEyePupil) return;

      const rect = avatarEl.getBoundingClientRect();
      // Face center in viewport coords
      const faceCX = rect.left + rect.width / 2;
      const faceCY = rect.bottom - 32; // Approximate eye center height

      const dx = mouseX - faceCX;
      const dy = mouseY - faceCY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy), 80); // Max 80px away
      // Clamp pupil movement to 2.5px radius inside the 9px eye
      const maxOffset = 2.5;
      const scale = Math.min(dist / 80, 1) * maxOffset;

      const px = Math.cos(angle) * scale;
      const py = Math.sin(angle) * scale;

      leftEyePupil.style.transform  = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      rightEyePupil.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;

      eyeTrackRAF = requestAnimationFrame(track);
    }

    eyeTrackRAF = requestAnimationFrame(track);
  }

  function stopEyeTracking() {
    if (eyeTrackRAF) {
      cancelAnimationFrame(eyeTrackRAF);
      eyeTrackRAF = null;
    }
    // Reset pupils to center
    if (leftEyePupil)  leftEyePupil.style.transform  = 'translate(-50%, -50%)';
    if (rightEyePupil) rightEyePupil.style.transform = 'translate(-50%, -50%)';
  }

  // ============================================================
  // VFX BURST — Fires when panel opens
  // ============================================================

  function fireVFX() {
    const ring = document.getElementById('boahemaa-vfx');
    if (!ring) return;
    const particles = ring.querySelectorAll('.boahemaa-vfx-particle');
    particles.forEach(p => {
      p.classList.remove('burst');
      // Force reflow to restart animation
      void p.offsetWidth;
      p.classList.add('burst');
    });
  }

  // ============================================================
  // CHAT PANEL — Open / Close
  // ============================================================

  function openChat() {
    if (isChatOpen) return;
    isChatOpen = true;

    fireVFX();
    setState('chat-open');
    hideBubble();

    panelEl.classList.add('open');
    BoahemaaSession.setChatOpen(true);

    // Only add opening message if panel is empty (not restored from session)
    if (messagesEl.children.length === 0) {
      appendMessage('boahemaa', CHAT_OPENING_MESSAGE(), false);
    }

    // Focus input after animation
    setTimeout(() => {
      if (inputEl) inputEl.focus();
    }, 400);
  }

  function closeChat() {
    if (!isChatOpen) return;
    isChatOpen = false;

    panelEl.classList.remove('open');
    BoahemaaSession.setChatOpen(false);

    // Return avatar to peek after panel closes
    setTimeout(() => {
      setState('peek');
    }, 200);
  }

  // ============================================================
  // MESSAGES — Render and append
  // ============================================================

  function appendMessage(sender, text, saveToSession = true) {
    const msgEl = document.createElement('div');
    msgEl.className = `boahemaa-message from-${sender === 'user' ? 'user' : 'boahemaa'}`;

    const bubble = document.createElement('div');
    bubble.className = 'boahemaa-message-bubble';
    bubble.textContent = text;

    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    scrollToBottom();

    if (saveToSession) {
      BoahemaaSession.appendMessage(
        sender === 'user' ? 'user' : 'assistant',
        text
      );
    }
  }

  function showThinking() {
    const el = document.createElement('div');
    el.className = 'boahemaa-thinking';
    el.id = 'boahemaa-thinking';
    el.innerHTML = `
      <div class="boahemaa-thinking-dot"></div>
      <div class="boahemaa-thinking-dot"></div>
      <div class="boahemaa-thinking-dot"></div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function removeThinking() {
    const el = document.getElementById('boahemaa-thinking');
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  // ============================================================
  // RESTORE SESSION — Called on page load if returning user
  // ============================================================

  function restoreSession() {
    const history = BoahemaaSession.getConversation();

    if (history.length > 0) {
      // Show a small "welcome back" note above restored history
      // This only runs on cross-page navigation, not on a fresh click
      const note = document.createElement('div');
      note.className = 'boahemaa-session-note';
      note.textContent = 'Continuing your conversation';
      messagesEl.appendChild(note);

      // Restore conversation turns
      history.forEach(msg => {
        appendMessage(
          msg.role === 'user' ? 'user' : 'boahemaa',
          msg.content,
          false
        );
      });
    }

    // Restore open state if panel was open on last page
    if (BoahemaaSession.isChatOpen()) {
      openChat();
    }
  }

  // ============================================================
  // NEW CONVERSATION
  // ============================================================

  function startNewConversation() {
    BoahemaaSession.resetConversation();
    messagesEl.innerHTML = '';
    appendMessage('boahemaa', CHAT_OPENING_MESSAGE(), false);
    if (inputEl) {
      inputEl.value = '';
      inputEl.focus();
    }
  }

  // ============================================================
  // SEND MESSAGE — API call
  // ============================================================

  async function sendMessage() {
    if (!inputEl || isWaitingForResponse) return;

    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isWaitingForResponse = true;

    appendMessage('user', text);
    showThinking();

    // Get full conversation history for context
    const history = BoahemaaSession.getConversation();

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: BoahemaaSession.getConversationId(),
          conversationHistory: history,
          pageUrl: window.location.href,
        }),
      });

      const data = await res.json();
      removeThinking();

      if (data.success && data.reply) {
        appendMessage('boahemaa', data.reply);
      } else {
        appendMessage('boahemaa', "Something went wrong on my end. Try again in a moment.");
      }

    } catch (err) {
      removeThinking();
      appendMessage('boahemaa', "I couldn't connect right now. Check your connection and try again.");
      console.warn('Boahemaa fetch error:', err);
    } finally {
      isWaitingForResponse = false;
      sendBtn.disabled = false;
      if (inputEl) inputEl.focus();
    }
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  function bindEvents() {
    // ---- Avatar interactions ----

    avatarEl.addEventListener('mouseenter', () => {
      if (currentState === 'peek') {
        clearTimeout(hoverTimeout);
        setState('hover');
        showBubble(HOVER_GREETING, 2500);
        startEyeTracking();
      }
    });

    avatarEl.addEventListener('mouseleave', () => {
      if (currentState === 'hover') {
        hoverTimeout = setTimeout(() => {
          hideBubble();
          setState('peek');
        }, 300);
      }
    });

    avatarEl.addEventListener('click', () => {
      if (currentState === 'peek' || currentState === 'hover') {
        openChat();
      }
    });

    avatarEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (currentState === 'peek' || currentState === 'hover') {
          openChat();
        }
      }
    });

    // ---- Panel controls ----

    document.getElementById('boahemaa-close').addEventListener('click', closeChat);
    document.getElementById('boahemaa-new-chat').addEventListener('click', startNewConversation);

    // ---- Send message ----

    sendBtn.addEventListener('click', sendMessage);

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });

    // ---- Global mouse tracking for eyes ----
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // ---- Close panel on Escape ----
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isChatOpen) {
        closeChat();
      }
    });

    // ---- Accent color sync ----
    // The hero updates --green on the documentElement when user clicks.
    // We observe that change so the widget updates in real time too.
    // We use a MutationObserver on the style attribute of :root (html element).
    const observer = new MutationObserver(() => {
      // --green is already a CSS variable so everything using it updates
      // automatically. This is here if we ever need to react to the change
      // in JS (e.g. updating canvas-drawn elements in the sprite era).
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  // ============================================================
  // INIT — Entry point
  // ============================================================

  function init() {
    buildWidget();
    cacheRefs();
    bindEvents();
    startEyeTracking();

    const isReturning = BoahemaaSession.hasBeenIntroduced();
    const hasHistory  = BoahemaaSession.getConversation().length > 0;

    // Wait for preloader if it exists, otherwise use delay
    const preloader = document.getElementById('sitePreloader');

    function onPreloaderDone() {
      const delay = isReturning ? INTRO_DELAY_RETURNING : INTRO_DELAY_FRESH;

      setTimeout(() => {
        if (isReturning) {
          // Returning visitor — just peek, no wave
          setState('peek');
          if (hasHistory || BoahemaaSession.isChatOpen()) {
            restoreSession();
          }
        } else {
          // First visit — play intro wave
          playIntro();
        }
      }, delay);
    }

    if (preloader) {
      // Watch for the preloader being hidden/removed
      const preloaderObserver = new MutationObserver((mutations, obs) => {
        const isGone =
          preloader.style.display === 'none' ||
          preloader.style.opacity === '0' ||
          preloader.classList.contains('hidden') ||
          !document.body.contains(preloader);

        if (isGone) {
          obs.disconnect();
          onPreloaderDone();
        }
      });

      preloaderObserver.observe(preloader, {
        attributes: true,
        childList: false,
      });

      // Fallback: if preloader never fires the observer, start after 1.5s
      setTimeout(() => {
        if (currentState === 'hidden') onPreloaderDone();
      }, 1500);

    } else {
      // No preloader on this page
      onPreloaderDone();
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();