/**
 * CountUp - Mode Navigation & Router Module
 * Controls mobile navigation drawer, desktop horizontal mode bar, view switching, and active mode persistence.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};

  const menuToggleBtn = document.querySelector("#menu-toggle");
  const closeDrawerBtn = document.querySelector("#close-drawer");
  const navDrawer = document.querySelector("#nav-drawer");
  const drawerBackdrop = document.querySelector("#drawer-backdrop");
  const modeItems = document.querySelectorAll(".mode-item");
  const modeBadge = document.querySelector("#mode-badge");

  function openDrawer() {
    if (navDrawer && drawerBackdrop) {
      if (typeof window.closeHistoryDrawer === "function") {
        window.closeHistoryDrawer();
      }
      navDrawer.classList.remove("drawer-hidden");
      drawerBackdrop.classList.remove("backdrop-hidden");
    }
  }

  function closeDrawer() {
    if (navDrawer && drawerBackdrop) {
      navDrawer.classList.add("drawer-hidden");
      const historyDrawer = document.querySelector("#history-drawer");
      if (!historyDrawer || historyDrawer.classList.contains("drawer-hidden")) {
        drawerBackdrop.classList.add("backdrop-hidden");
      }
    }
  }

  function switchMode(modeName) {
    if (!modeName) return;

    modeItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.mode === modeName);
    });

    const activeItem = Array.from(modeItems).find((item) => item.dataset.mode === modeName);
    if (activeItem && modeBadge) {
      const label = activeItem.querySelector("span");
      if (label) modeBadge.textContent = label.textContent.trim();
    }

    const views = document.querySelectorAll(".mode-view");
    views.forEach((view) => view.classList.remove("active-view"));

    const targetView = document.querySelector(`#${modeName}-view`);
    if (targetView) {
      targetView.classList.add("active-view");
    }

    const box = document.querySelector("#box");
    if (box) {
      box.classList.toggle("scientific-mode", modeName === "scientific");
      box.classList.toggle("programmer-mode", modeName === "programmer");
      box.classList.toggle("financial-mode", modeName === "financial");
      box.classList.toggle("converter-mode", modeName === "converter");
      box.classList.toggle("date-mode", modeName === "date");
      box.classList.toggle("bmi-mode", modeName === "bmi");
    }

    try {
      localStorage.setItem("countup_mode", modeName);
    } catch (e) {}

    closeDrawer();
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", () => {
      closeDrawer();
      if (typeof window.closeHistoryDrawer === "function") {
        window.closeHistoryDrawer();
      }
    });
  }

  modeItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchMode(btn.dataset.mode);
    });
  });

  // Restore saved mode or default to standard
  const savedMode = localStorage.getItem("countup_mode") || "standard";
  switchMode(savedMode);

  CountUp.router = {
    openDrawer,
    closeDrawer,
    switchMode,
    getCurrentMode: () => localStorage.getItem("countup_mode") || "standard",
  };

  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;
  window.switchMode = switchMode;
})();
