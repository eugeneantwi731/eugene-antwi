// ============================================================
// BOAHEMAA — Cross-Page Persistence Module
// Manages conversation state, chat open/close state, and
// intro tracking across page navigations within a session.
//
// Uses sessionStorage: survives page navigation but dies
// when the tab closes — same scope as the preloader logic.
//
// USAGE:
//   Include this script on every page before boahemaa-widget.js
//   The widget reads from BoaheemaSession on init.
// ============================================================

const BoahemaaSession = (() => {

  const KEYS = {
    CONVERSATION:  'boahemaa_conversation',
    CHAT_OPEN:     'boahemaa_chat_open',
    INTRODUCED:    'boahemaa_introduced',
    CONVERSATION_ID: 'boahemaa_conversation_id',
    SESSION_STAMP: 'boahemaa_session_stamp',   // Timestamp to detect tab restore
  };

  // ---- TAB RESTORE DETECTION ----
  // Chrome restores sessionStorage on tab restore after crash/power off.
  // We stamp a timestamp every 30s. On load, if the stamp is older than
  // 60s, we know the tab was restored and clear conversation state.
  (function detectTabRestore() {
    const stamp = sessionStorage.getItem(KEYS.SESSION_STAMP);
    const now = Date.now();

    if (stamp && (now - parseInt(stamp, 10)) > 60000) {
      // Tab was restored after too long — clear conversation, keep introduced flag
      sessionStorage.removeItem(KEYS.CONVERSATION);
      sessionStorage.removeItem(KEYS.CHAT_OPEN);
      sessionStorage.removeItem(KEYS.CONVERSATION_ID);
    }

    // Refresh the stamp now and keep refreshing every 30s while tab is alive
    sessionStorage.setItem(KEYS.SESSION_STAMP, String(now));
    setInterval(() => {
      sessionStorage.setItem(KEYS.SESSION_STAMP, String(Date.now()));
    }, 30000);
  })();

  // ---- READ ----

  function getConversation() {
    try {
      const raw = sessionStorage.getItem(KEYS.CONVERSATION);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function isChatOpen() {
    return sessionStorage.getItem(KEYS.CHAT_OPEN) === 'true';
  }

  function hasBeenIntroduced() {
    return sessionStorage.getItem(KEYS.INTRODUCED) === 'true';
  }

  function getConversationId() {
    let id = sessionStorage.getItem(KEYS.CONVERSATION_ID);
    if (!id) {
      // Generate a lightweight UUID-like ID
      id = 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(KEYS.CONVERSATION_ID, id);
    }
    return id;
  }

  // ---- WRITE ----

  function saveConversation(messagesArray) {
    try {
      sessionStorage.setItem(KEYS.CONVERSATION, JSON.stringify(messagesArray));
    } catch {
      // sessionStorage full or unavailable — fail silently, don't break chat
      console.warn('Boahemaa: could not save conversation to sessionStorage.');
    }
  }

  function appendMessage(role, content) {
    const history = getConversation();
    history.push({ role, content });
    saveConversation(history);
    return history;
  }

  function setChatOpen(isOpen) {
    sessionStorage.setItem(KEYS.CHAT_OPEN, isOpen ? 'true' : 'false');
  }

  function markIntroduced() {
    sessionStorage.setItem(KEYS.INTRODUCED, 'true');
  }

  // ---- RESET ----
  // Called when user explicitly starts a new conversation via the new chat button.
  // Does NOT reset the introduced flag — she doesn't re-do the Akwaaba wave
  // just because the user cleared the chat.

  function resetConversation() {
    sessionStorage.removeItem(KEYS.CONVERSATION);
    // Generate a fresh conversation ID for MongoDB tracking
    const newId = 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem(KEYS.CONVERSATION_ID, newId);
  }

  // Full reset — for when tab closes (called on beforeunload if needed)
  // sessionStorage handles this automatically but this can be called manually.
  function resetAll() {
    Object.values(KEYS).forEach(key => sessionStorage.removeItem(key));
  }

  // ---- EXPORT ----

  return {
    getConversation,
    isChatOpen,
    hasBeenIntroduced,
    getConversationId,
    saveConversation,
    appendMessage,
    setChatOpen,
    markIntroduced,
    resetConversation,
    resetAll,
  };

})();

// Make available globally for the widget and any other scripts
window.BoahemaaSession = BoahemaaSession;