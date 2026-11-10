/**
 * CountUp - Core Utilities Module
 * Provides currency formatting, toast notifications, and clipboard copying utilities.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};

  const copyToast = document.querySelector("#copy-toast");
  let copyToastTimer = null;

  function showCopyToast(message) {
    if (!copyToast) return;
    copyToast.textContent = message || "Copied to clipboard";
    copyToast.classList.remove("copy-toast-hidden");

    if (copyToastTimer) clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(() => {
      copyToast.classList.add("copy-toast-hidden");
    }, 1800);
  }

  function copyTextToClipboard(text) {
    if (!text || text === "Error" || text === "Cannot divide by zero") return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyToast(`Copied "${text}"`);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showCopyToast(`Copied "${text}"`);
    } catch (e) {
      showCopyToast("Unable to copy");
    }
    document.body.removeChild(textarea);
  }

  function formatCurrency(val) {
    if (isNaN(val) || !isFinite(val)) return "₹0.00";
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  // Bind click events on all copy display buttons
  function initCopyButtons() {
    document.querySelectorAll(".copy-display-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const targetInput = targetId ? document.querySelector(`#${targetId}`) : null;
        const val = targetInput ? targetInput.value : "";
        if (val) {
          copyTextToClipboard(val);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyButtons);
  } else {
    initCopyButtons();
  }

  // Export module
  CountUp.utils = {
    showCopyToast,
    copyTextToClipboard,
    fallbackCopy,
    formatCurrency,
    initCopyButtons,
  };

  // Global aliases
  window.showCopyToast = showCopyToast;
  window.copyTextToClipboard = copyTextToClipboard;
  window.formatCurrency = formatCurrency;
})();
