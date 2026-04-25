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
    CONVERSATION:  'boahemaa_conversation',   // Array of {role, content} message objects
    CHAT_OPEN:     'boahemaa_chat_open',       // 'true' | 'false'
    INTRODUCED:    'boahemaa_introduced',      // 'true' once Akwaaba intro has played
    CONVERSATION_ID: 'boahemaa_conversation_id', // UUID for this session's MongoDB tracking
  };

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
