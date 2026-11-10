/**
 * CountUp - Keyboard Shortcuts & Cheatsheet Module
 * Manages global keyboard shortcuts (Alt+1..7, Alt+H, Alt+?, Escape) and the interactive shortcut cheatsheet modal.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};

  const shortcutsBtn = document.querySelector("#shortcuts-btn");
  const shortcutsModal = document.querySelector("#shortcuts-modal");
  const closeShortcutsBtn = document.querySelector("#close-shortcuts");

  function openShortcutsModal() {
    if (shortcutsModal) {
      shortcutsModal.classList.remove("modal-hidden");
    }
  }

  function closeShortcutsModal() {
    if (shortcutsModal) {
      shortcutsModal.classList.add("modal-hidden");
    }
  }

  if (shortcutsBtn) {
    shortcutsBtn.addEventListener("click", () => {
      if (shortcutsModal && !shortcutsModal.classList.contains("modal-hidden")) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
    });
  }

  if (closeShortcutsBtn) {
    closeShortcutsBtn.addEventListener("click", closeShortcutsModal);
  }

  if (shortcutsModal) {
    shortcutsModal.addEventListener("click", (e) => {
      if (e.target === shortcutsModal) {
        closeShortcutsModal();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    const { key, altKey, ctrlKey } = event;

    // Global mode shortcuts (Alt+1 to Alt+7)
    if (altKey && !ctrlKey && key >= "1" && key <= "7") {
      event.preventDefault();
      const modeMap = {
        "1": "standard",
        "2": "scientific",
        "3": "programmer",
        "4": "financial",
        "5": "converter",
        "6": "date",
        "7": "bmi",
      };
      if (modeMap[key] && typeof window.switchMode === "function") {
        window.switchMode(modeMap[key]);
      }
      return;
    }

    // History shortcut (Alt+H or Ctrl+H)
    if ((altKey || ctrlKey) && (key === "h" || key === "H")) {
      event.preventDefault();
      if (typeof window.toggleHistoryDrawer === "function") {
        window.toggleHistoryDrawer();
      }
      return;
    }

    // Shortcuts help modal (Alt+/ or ?)
    if ((altKey && key === "/") || (!altKey && !ctrlKey && key === "?")) {
      if (event.target && (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) return;
      event.preventDefault();
      if (shortcutsModal && !shortcutsModal.classList.contains("modal-hidden")) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
      return;
    }

    // Escape key handling
    if (key === "Escape") {
      if (shortcutsModal && !shortcutsModal.classList.contains("modal-hidden")) {
        event.preventDefault();
        closeShortcutsModal();
        return;
      }
      const historyDrawer = document.querySelector("#history-drawer");
      if (historyDrawer && !historyDrawer.classList.contains("drawer-hidden")) {
        event.preventDefault();
        if (typeof window.closeHistoryDrawer === "function") window.closeHistoryDrawer();
        return;
      }
      const navDrawer = document.querySelector("#nav-drawer");
      if (navDrawer && !navDrawer.classList.contains("drawer-hidden")) {
        event.preventDefault();
        if (typeof window.closeDrawer === "function") window.closeDrawer();
        return;
      }
    }
  });

  CountUp.shortcuts = {
    openShortcutsModal,
    closeShortcutsModal,
  };

  window.openShortcutsModal = openShortcutsModal;
  window.closeShortcutsModal = closeShortcutsModal;
})();
