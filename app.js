/**
 * CountUp - Multi-Calculator Suite Main Application Orchestrator
 * Bootstraps and coordinates core services, calculator engines, and responsive window synchronization.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};

  // Responsive resize listener for desktop history synchronization
  let resizeSyncTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeSyncTimer);
    resizeSyncTimer = setTimeout(() => {
      const isDesktop = window.innerWidth >= 1024;
      const boxEl = document.querySelector("#box");
      const drawerBackdrop = document.querySelector("#drawer-backdrop");
      const navDrawer = document.querySelector("#nav-drawer");
      const historyDrawer = document.querySelector("#history-drawer");
      const historyToggleBtn = document.querySelector("#history-toggle");

      if (isDesktop) {
        if (drawerBackdrop) drawerBackdrop.classList.add("backdrop-hidden");
        if (navDrawer) navDrawer.classList.add("drawer-hidden");
        const desktopHistoryPref = localStorage.getItem("countup_desktop_history_open");
        if (desktopHistoryPref !== "false") {
          if (boxEl) boxEl.classList.add("history-docked");
          if (historyDrawer) historyDrawer.classList.remove("drawer-hidden");
          if (historyToggleBtn) historyToggleBtn.classList.add("active");
        }
      } else {
        if (boxEl) boxEl.classList.remove("history-docked");
        if (historyToggleBtn) historyToggleBtn.classList.remove("active");
        if (historyDrawer) historyDrawer.classList.add("drawer-hidden");
      }
    }, 100);
  });

  // Application Ready
  console.log("CountUp Calculator Suite initialized successfully.");
})();
