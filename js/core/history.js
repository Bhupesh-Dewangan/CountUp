/**
 * CountUp - Calculation History Module
 * Manages calculation tape records, localStorage persistence, UI rendering, one-click recall, and desktop docked sidebar state.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.recall = window.CountUp.recall || {};

  const historyToggleBtn = document.querySelector("#history-toggle");
  const closeHistoryBtn = document.querySelector("#close-history");
  const clearHistoryBtn = document.querySelector("#clear-history");
  const historyDrawer = document.querySelector("#history-drawer");
  const historyList = document.querySelector("#history-list");
  const historyEmptyState = document.querySelector("#history-empty");
  const drawerBackdrop = document.querySelector("#drawer-backdrop");

  let calcHistory = [];
  try {
    const savedHistory = localStorage.getItem("countup_history");
    if (savedHistory) calcHistory = JSON.parse(savedHistory);
  } catch (e) {
    calcHistory = [];
  }

  function openHistoryDrawer() {
    if (historyDrawer) {
      if (typeof window.closeDrawer === "function") {
        window.closeDrawer();
      }
      historyDrawer.classList.remove("drawer-hidden");
      if (drawerBackdrop && window.innerWidth < 1024) {
        drawerBackdrop.classList.remove("backdrop-hidden");
      }
      const box = document.querySelector("#box");
      if (box) box.classList.add("history-docked");
      if (historyToggleBtn) historyToggleBtn.classList.add("active");
      if (window.innerWidth >= 1024) {
        try {
          localStorage.setItem("countup_desktop_history_open", "true");
        } catch (e) {}
      }
      renderHistoryList();
    }
  }

  function closeHistoryDrawer() {
    if (historyDrawer) {
      historyDrawer.classList.add("drawer-hidden");
      const navDrawer = document.querySelector("#nav-drawer");
      if (drawerBackdrop && (!navDrawer || navDrawer.classList.contains("drawer-hidden"))) {
        drawerBackdrop.classList.add("backdrop-hidden");
      }
      const box = document.querySelector("#box");
      if (box) box.classList.remove("history-docked");
      if (historyToggleBtn) historyToggleBtn.classList.remove("active");
      if (window.innerWidth >= 1024) {
        try {
          localStorage.setItem("countup_desktop_history_open", "false");
        } catch (e) {}
      }
    }
  }

  function toggleHistoryDrawer() {
    const box = document.querySelector("#box");
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      if (box && box.classList.contains("history-docked")) {
        closeHistoryDrawer();
      } else {
        openHistoryDrawer();
      }
    } else {
      if (historyDrawer && !historyDrawer.classList.contains("drawer-hidden")) {
        closeHistoryDrawer();
      } else {
        openHistoryDrawer();
      }
    }
  }

  function addHistoryEntry(mode, expression, result) {
    if (!expression || !result || result === "Error" || result === "Cannot divide by zero") return;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const entry = {
      id: Date.now() + Math.random(),
      mode,
      expression,
      result,
      time: timeStr,
    };
    calcHistory.unshift(entry);
    if (calcHistory.length > 50) calcHistory.pop();
    try {
      localStorage.setItem("countup_history", JSON.stringify(calcHistory));
    } catch (e) {}
    renderHistoryList();
  }

  function renderHistoryList() {
    if (!historyList || !historyEmptyState) return;

    if (calcHistory.length === 0) {
      historyEmptyState.style.display = "flex";
      historyList.innerHTML = "";
      return;
    }

    historyEmptyState.style.display = "none";
    historyList.innerHTML = "";

    calcHistory.forEach((item) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.title = "Click to recall into calculator";
      li.innerHTML = `
        <div class="history-item-top">
          <span class="history-item-mode">${item.mode}</span>
          <span class="history-item-time">${item.time}</span>
        </div>
        <div class="history-item-expr">${item.expression} =</div>
        <div class="history-item-result">${item.result}</div>
      `;

      li.addEventListener("click", () => {
        recallHistoryItem(item);
      });

      historyList.appendChild(li);
    });
  }

  function recallHistoryItem(item) {
    if (item.mode === "Standard") {
      if (typeof window.switchMode === "function") window.switchMode("standard");
      if (window.CountUp.recall && window.CountUp.recall.standard) {
        window.CountUp.recall.standard(item);
      } else {
        const display = document.querySelector("#show");
        const subDisplay = document.querySelector("#sub-display");
        if (display) display.value = item.result;
        if (subDisplay) subDisplay.textContent = `${item.expression} =`;
      }
    } else if (item.mode === "Scientific") {
      if (typeof window.switchMode === "function") window.switchMode("scientific");
      if (window.CountUp.recall && window.CountUp.recall.scientific) {
        window.CountUp.recall.scientific(item);
      } else {
        const sciDisplay = document.querySelector("#sci-show");
        const sciSubDisplay = document.querySelector("#sci-sub-display");
        if (sciDisplay) sciDisplay.value = item.result;
        if (sciSubDisplay) sciSubDisplay.textContent = `${item.expression} =`;
      }
    } else if (item.mode.startsWith("Programmer")) {
      if (typeof window.switchMode === "function") window.switchMode("programmer");
      if (window.CountUp.recall && window.CountUp.recall.programmer) {
        window.CountUp.recall.programmer(item);
      } else {
        const progDisplay = document.querySelector("#prog-show");
        const progSubDisplay = document.querySelector("#prog-sub-display");
        if (progDisplay) progDisplay.value = item.result;
        if (progSubDisplay) progSubDisplay.textContent = `${item.expression} =`;
      }
    }

    if (window.innerWidth < 1024) {
      closeHistoryDrawer();
    }
  }

  if (historyToggleBtn) historyToggleBtn.addEventListener("click", toggleHistoryDrawer);
  if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", closeHistoryDrawer);
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      calcHistory = [];
      try {
        localStorage.removeItem("countup_history");
      } catch (e) {}
      renderHistoryList();
    });
  }

  // Initial history render
  renderHistoryList();

  // Initialize desktop history docked state
  if (window.innerWidth >= 1024) {
    const desktopHistoryPref = localStorage.getItem("countup_desktop_history_open");
    if (desktopHistoryPref !== "false") {
      openHistoryDrawer();
    }
  }

  CountUp.history = {
    addHistoryEntry,
    renderHistoryList,
    recallHistoryItem,
    openHistoryDrawer,
    closeHistoryDrawer,
    toggleHistoryDrawer,
    getHistory: () => calcHistory,
  };

  window.addHistoryEntry = addHistoryEntry;
  window.renderHistoryList = renderHistoryList;
  window.recallHistoryItem = recallHistoryItem;
  window.openHistoryDrawer = openHistoryDrawer;
  window.closeHistoryDrawer = closeHistoryDrawer;
  window.toggleHistoryDrawer = toggleHistoryDrawer;
})();
