(() => {
  "use strict";

  const display = document.querySelector("#show");
const subDisplay = document.querySelector("#sub-display");
const buttons = document.querySelectorAll("#in-btn button");

let currentInput = "";
let isEvaluated = false;

function isOperator(char) {
  return ["+", "-", "*", "/"].includes(char);
}

function calculateResult(expression) {
  // Strip trailing operators before evaluation
  const sanitized = expression.replace(/[+\-*/]+$/, "").trim();
  if (!sanitized) return "";

  // Validate allowed characters for safety (digits, decimals, standard operators, whitespace)
  if (!/^[\d\.\+\-\*\/\s]+$/.test(sanitized)) {
    return "Error";
  }

  try {
    const result = new Function(`return (${sanitized})`)();
    if (!Number.isFinite(result)) {
      return "Cannot divide by zero";
    }
    // Format precision to eliminate floating point issues (e.g., 0.1 + 0.2 = 0.3)
    return String(parseFloat(Number(result).toPrecision(12)));
  } catch (error) {
    return "Error";
  }
}

function handleInput(value) {
  if (value === "Reset") {
    currentInput = "";
    isEvaluated = false;
    display.value = "";
    if (subDisplay) subDisplay.textContent = "";
    return;
  }

  if (value === "Del") {
    if (isEvaluated || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      currentInput = "";
      isEvaluated = false;
      if (subDisplay) subDisplay.textContent = "";
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    display.value = currentInput;
    return;
  }

  if (value === "±") {
    toggleSign();
    return;
  }

  if (value === "%") {
    applyPercentage();
    return;
  }

  if (value === "=") {
    if (!currentInput || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      return;
    }
    const exprForSub = currentInput.replace(/[+\-*/]+$/, "").trim();
    const result = calculateResult(currentInput);
    if (subDisplay && exprForSub) {
      subDisplay.textContent = `${exprForSub} =`;
    }
    if (typeof addHistoryEntry === "function") {
      addHistoryEntry("Standard", exprForSub, result);
    }
    currentInput = result;
    isEvaluated = true;
    display.value = currentInput;
    return;
  }

  // Operator handling (+, -, *, /)
  if (isOperator(value)) {
    if (currentInput === "Error" || currentInput === "Cannot divide by zero") {
      return;
    }

    if (!currentInput) {
      // Allow starting with negative sign for negative numbers
      if (value === "-") {
        currentInput = "-";
        display.value = currentInput;
      }
      return;
    }

    if (isEvaluated && subDisplay) {
      subDisplay.textContent = `Ans = ${currentInput}`;
    }

    // If an operator is already at the end, replace it with the new operator
    if (isOperator(currentInput.slice(-1))) {
      currentInput = currentInput.slice(0, -1) + value;
    } else {
      currentInput += value;
    }

    isEvaluated = false;
    display.value = currentInput;
    return;
  }

  // Decimal point handling
  if (value === ".") {
    if (isEvaluated || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      if (subDisplay && isEvaluated) subDisplay.textContent = `Ans = ${currentInput}`;
      currentInput = "0.";
      isEvaluated = false;
      display.value = currentInput;
      return;
    }

    if (!currentInput || isOperator(currentInput.slice(-1))) {
      currentInput += "0.";
      display.value = currentInput;
      return;
    }

    // Ensure the current number segment does not already contain a decimal point
    const parts = currentInput.split(/[+\-*/]/);
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(".")) {
      return;
    }

    currentInput += ".";
    display.value = currentInput;
    return;
  }

  // Number digits (0-9)
  if (isEvaluated || currentInput === "Error" || currentInput === "Cannot divide by zero") {
    if (subDisplay && isEvaluated) subDisplay.textContent = `Ans = ${currentInput}`;
    currentInput = value;
    isEvaluated = false;
  } else {
    currentInput += value;
  }

  display.value = currentInput;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    handleInput(button.textContent.trim());
  });
});

function highlightButton(button) {
  if (!button) return;
  button.classList.add("pressed");
  setTimeout(() => {
    button.classList.remove("pressed");
  }, 120);
}

function toggleSign() {
  if (currentInput === "Error" || currentInput === "Cannot divide by zero") return;
  if (!currentInput) {
    currentInput = "-";
    display.value = currentInput;
    return;
  }
  if (currentInput === "-") {
    currentInput = "";
    display.value = "";
    return;
  }

  if (isEvaluated) {
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
    display.value = currentInput;
    isEvaluated = false;
    return;
  }

  if (/^-?\d*\.?\d+$/.test(currentInput)) {
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
    display.value = currentInput;
    return;
  }

  const negMatch = currentInput.match(/(.*[+\-*/])\s*-\s*(\d*\.?\d+)$/);
  if (negMatch) {
    currentInput = negMatch[1] + negMatch[2];
    display.value = currentInput;
    return;
  }

  const posMatch = currentInput.match(/(.*[+\-*/])\s*(\d*\.?\d+)$/);
  if (posMatch) {
    currentInput = posMatch[1] + "-" + posMatch[2];
    display.value = currentInput;
    return;
  }
}

function applyPercentage() {
  if (!currentInput || currentInput === "Error" || currentInput === "Cannot divide by zero") return;
  const match = currentInput.match(/(.*[+\-*/])?\s*(-?\d*\.?\d+)$/);
  if (match) {
    const prefix = match[1] || "";
    const numStr = match[2];
    const val = parseFloat(numStr) / 100;
    const formatted = String(parseFloat(val.toPrecision(12)));
    currentInput = prefix + formatted;
    display.value = currentInput;
    isEvaluated = false;
  }
}

function findButtonForKey(key) {
  if (key === "Enter" || key === "=") {
    return document.querySelector("#equal");
  }
  if (key === "Backspace") {
    return Array.from(buttons).find((b) => b.textContent.trim() === "Del");
  }
  if (key === "Escape" || key === "Delete") {
    return document.querySelector("#reset");
  }
  if (key === "%") {
    return document.querySelector("#percent");
  }
  return Array.from(buttons).find((b) => b.textContent.trim() === key);
}

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (key === "Escape") {
    if (typeof historyDrawer !== "undefined" && historyDrawer && !historyDrawer.classList.contains("drawer-hidden")) {
      event.preventDefault();
      if (typeof closeHistoryDrawer === "function") closeHistoryDrawer();
      return;
    }
    if (navDrawer && !navDrawer.classList.contains("drawer-hidden")) {
      event.preventDefault();
      closeDrawer();
      return;
    }
  }

  if (
    /^[0-9]$/.test(key) ||
    isOperator(key) ||
    key === "." ||
    key === "=" ||
    key === "%" ||
    key === "Enter" ||
    key === "Backspace" ||
    key === "Escape" ||
    key === "Delete"
  ) {
    event.preventDefault();

    let inputVal = key;
    if (key === "Enter") inputVal = "=";
    else if (key === "Backspace") inputVal = "Del";
    else if (key === "Escape" || key === "Delete") inputVal = "Reset";

    const btn = findButtonForKey(key);
    highlightButton(btn);
    handleInput(inputVal);
  }
});

// Theme Toggle Functionality
const themeToggleBtn = document.querySelector("#theme-toggle");
const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector(".theme-icon") : null;

const SUN_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

const MOON_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    if (themeIcon) themeIcon.innerHTML = SUN_ICON;
    if (themeToggleBtn) themeToggleBtn.setAttribute("aria-label", "Switch to light theme");
  } else {
    document.body.classList.remove("dark-theme");
    if (themeIcon) themeIcon.innerHTML = MOON_ICON;
    if (themeToggleBtn) themeToggleBtn.setAttribute("aria-label", "Switch to dark theme");
  }
}

// Retrieve saved theme or system preference
const savedTheme =
  localStorage.getItem("countup_theme") ||
  (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("countup_theme", nextTheme);
  });
}

// Navigation Drawer & Mode Router
const menuToggleBtn = document.querySelector("#menu-toggle");
const closeDrawerBtn = document.querySelector("#close-drawer");
const navDrawer = document.querySelector("#nav-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const modeItems = document.querySelectorAll(".mode-item");
const modeBadge = document.querySelector("#mode-badge");

// Calculation History Elements & State
const historyToggleBtn = document.querySelector("#history-toggle");
const historyDrawer = document.querySelector("#history-drawer");
const closeHistoryBtn = document.querySelector("#close-history-btn");
const clearHistoryBtn = document.querySelector("#clear-history-btn");
const historyEmptyState = document.querySelector("#history-empty");
const historyList = document.querySelector("#history-list");

let calcHistory = [];
try {
  const savedHistory = localStorage.getItem("countup_history");
  if (savedHistory) calcHistory = JSON.parse(savedHistory);
} catch (e) {
  calcHistory = [];
}

function openDrawer() {
  if (navDrawer && drawerBackdrop) {
    closeHistoryDrawer();
    navDrawer.classList.remove("drawer-hidden");
    drawerBackdrop.classList.remove("backdrop-hidden");
  }
}

function closeDrawer() {
  if (navDrawer && drawerBackdrop) {
    navDrawer.classList.add("drawer-hidden");
    if (!historyDrawer || historyDrawer.classList.contains("drawer-hidden")) {
      drawerBackdrop.classList.add("backdrop-hidden");
    }
  }
}

function openHistoryDrawer() {
  if (historyDrawer && drawerBackdrop) {
    closeDrawer();
    historyDrawer.classList.remove("drawer-hidden");
    drawerBackdrop.classList.remove("backdrop-hidden");
    renderHistoryList();
  }
}

function closeHistoryDrawer() {
  if (historyDrawer && drawerBackdrop) {
    historyDrawer.classList.add("drawer-hidden");
    if (!navDrawer || navDrawer.classList.contains("drawer-hidden")) {
      drawerBackdrop.classList.add("backdrop-hidden");
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
    time: timeStr
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
    switchMode("standard");
    currentInput = item.result;
    isEvaluated = true;
    if (display) display.value = currentInput;
    if (subDisplay) subDisplay.textContent = `${item.expression} =`;
  } else if (item.mode === "Scientific") {
    switchMode("scientific");
    sciCurrentInput = item.result;
    sciLastAns = item.result;
    sciIsEvaluated = true;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    if (sciSubDisplay) sciSubDisplay.textContent = `${item.expression} =`;
  } else if (item.mode.startsWith("Programmer")) {
    switchMode("programmer");
    progCurrentInput = item.result;
    progLastAns = item.result;
    progIsEvaluated = true;
    if (progDisplay) progDisplay.value = progCurrentInput;
    if (progSubDisplay) progSubDisplay.textContent = `${item.expression} =`;
    try {
      let n;
      if (progCurrentBase === "HEX") n = BigInt("0x" + item.result);
      else if (progCurrentBase === "OCT") n = BigInt("0o" + item.result);
      else if (progCurrentBase === "BIN") n = BigInt("0b" + item.result);
      else n = BigInt(item.result);
      updateBaseMonitor(n);
    } catch (e) {}
  }
  closeHistoryDrawer();
}

if (menuToggleBtn) menuToggleBtn.addEventListener("click", openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
if (historyToggleBtn) historyToggleBtn.addEventListener("click", openHistoryDrawer);
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
if (drawerBackdrop) {
  drawerBackdrop.addEventListener("click", () => {
    closeDrawer();
    closeHistoryDrawer();
  });
}

// Initial history render
renderHistoryList();

function switchMode(modeName) {
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

  localStorage.setItem("countup_mode", modeName);
  closeDrawer();
}

modeItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchMode(btn.dataset.mode);
  });
});

// Restore saved mode or default to standard
const savedMode = localStorage.getItem("countup_mode") || "standard";
switchMode(savedMode);

// Scientific Calculator Engine
const sciDisplay = document.querySelector("#sci-show");
const sciSubDisplay = document.querySelector("#sci-sub-display");
const sciAngleModeBtn = document.querySelector("#sci-angle-mode");
const sciButtons = document.querySelectorAll("#sci-btn button, .sci-func-bar button.sci-operator");
const sci2ndBtn = document.querySelector("#sci-2nd-btn");
const sciHypBtn = document.querySelector("#sci-hyp-btn");

let sciCurrentInput = "";
let sciIsEvaluated = false;
let sciLastAns = "0";
let sciAngleMode = localStorage.getItem("countup_angle_mode") || "DEG";
let sciIs2nd = false;
let sciIsHyp = false;

if (sciAngleModeBtn) {
  sciAngleModeBtn.textContent = sciAngleMode;
  sciAngleModeBtn.addEventListener("click", () => {
    sciAngleMode = sciAngleMode === "DEG" ? "RAD" : "DEG";
    sciAngleModeBtn.textContent = sciAngleMode;
    localStorage.setItem("countup_angle_mode", sciAngleMode);
  });
}

function updateSciKeyLabels() {
  const sinBtn = document.querySelector('[data-action="sin"]');
  const cosBtn = document.querySelector('[data-action="cos"]');
  const tanBtn = document.querySelector('[data-action="tan"]');
  const sqrtBtn = document.querySelector('[data-action="sqrt"]');

  if (sinBtn) {
    if (sciIsHyp) sinBtn.textContent = sciIs2nd ? "asinh" : "sinh";
    else sinBtn.textContent = sciIs2nd ? "asin" : "sin";
  }
  if (cosBtn) {
    if (sciIsHyp) cosBtn.textContent = sciIs2nd ? "acosh" : "cosh";
    else cosBtn.textContent = sciIs2nd ? "acos" : "cos";
  }
  if (tanBtn) {
    if (sciIsHyp) tanBtn.textContent = sciIs2nd ? "atanh" : "tanh";
    else tanBtn.textContent = sciIs2nd ? "atan" : "tan";
  }
  if (sqrtBtn) {
    sqrtBtn.innerHTML = sciIs2nd ? "&sup3;&radic;" : "&radic;";
  }
}

if (sci2ndBtn) {
  sci2ndBtn.addEventListener("click", () => {
    sciIs2nd = !sciIs2nd;
    sci2ndBtn.classList.toggle("active", sciIs2nd);
    updateSciKeyLabels();
  });
}

if (sciHypBtn) {
  sciHypBtn.addEventListener("click", () => {
    sciIsHyp = !sciIsHyp;
    sciHypBtn.classList.toggle("active", sciIsHyp);
    updateSciKeyLabels();
  });
}

function calculateFactorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function nPr(n, r) {
  if (n < 0 || r < 0 || r > n) return NaN;
  return calculateFactorial(n) / calculateFactorial(n - r);
}

function nCr(n, r) {
  if (n < 0 || r < 0 || r > n) return NaN;
  return calculateFactorial(n) / (calculateFactorial(r) * calculateFactorial(n - r));
}

function autoCloseParens(expr) {
  const openCount = (expr.match(/\(/g) || []).length;
  const closeCount = (expr.match(/\)/g) || []).length;
  let closed = expr;
  for (let i = 0; i < openCount - closeCount; i++) {
    closed += ")";
  }
  return closed;
}

function evaluateSciExpression(expression, angleMode) {
  let s = autoCloseParens(expression.trim());
  if (!s) return "";

  // Replace factorial: e.g. 5!
  s = s.replace(/(\d+(\.\d+)?)!/g, (_, n) => calculateFactorial(parseFloat(n)));

  // Replace constants & operators
  s = s.replace(/π/g, "(Math.PI)");
  s = s.replace(/\be\b/g, "(Math.E)");
  s = s.replace(/\^/g, "**");
  s = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  // Hyperbolic
  s = s.replace(/\basinh\(([^)]+)\)/g, "Math.asinh($1)");
  s = s.replace(/\bacosh\(([^)]+)\)/g, "Math.acosh($1)");
  s = s.replace(/\batanh\(([^)]+)\)/g, "Math.atanh($1)");
  s = s.replace(/\bsinh\(([^)]+)\)/g, "Math.sinh($1)");
  s = s.replace(/\bcosh\(([^)]+)\)/g, "Math.cosh($1)");
  s = s.replace(/\btanh\(([^)]+)\)/g, "Math.tanh($1)");

  // Inverse trig & standard trig
  if (angleMode === "DEG") {
    s = s.replace(/\basin\(([^)]+)\)/g, "(Math.asin($1) * 180 / Math.PI)");
    s = s.replace(/\bacos\(([^)]+)\)/g, "(Math.acos($1) * 180 / Math.PI)");
    s = s.replace(/\batan\(([^)]+)\)/g, "(Math.atan($1) * 180 / Math.PI)");
    s = s.replace(/\bsin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)");
    s = s.replace(/\bcos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)");
    s = s.replace(/\btan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");
  } else {
    s = s.replace(/\basin\(([^)]+)\)/g, "Math.asin($1)");
    s = s.replace(/\bacos\(([^)]+)\)/g, "Math.acos($1)");
    s = s.replace(/\batan\(([^)]+)\)/g, "Math.atan($1)");
    s = s.replace(/\bsin\(([^)]+)\)/g, "Math.sin($1)");
    s = s.replace(/\bcos\(([^)]+)\)/g, "Math.cos($1)");
    s = s.replace(/\btan\(([^)]+)\)/g, "Math.tan($1)");
  }

  s = s.replace(/\blog\(([^)]+)\)/g, "Math.log10($1)");
  s = s.replace(/\bln\(([^)]+)\)/g, "Math.log($1)");
  s = s.replace(/\bsqrt\(([^)]+)\)/g, "Math.sqrt($1)");
  s = s.replace(/\bcbrt\(([^)]+)\)/g, "Math.cbrt($1)");
  s = s.replace(/\bnPr\(([^,]+),([^)]+)\)/g, "nPr($1,$2)");
  s = s.replace(/\bnCr\(([^,]+),([^)]+)\)/g, "nCr($1,$2)");

  try {
    const fn = new Function("nPr", "nCr", `return (${s})`);
    const result = fn(nPr, nCr);
    if (!Number.isFinite(result)) {
      return "Cannot divide by zero";
    }
    return String(parseFloat(Number(result).toPrecision(12)));
  } catch (err) {
    return "Error";
  }
}

function handleSciInput(btn) {
  const action = btn.dataset.action;
  const text = btn.textContent.trim();

  if (btn.id === "sci-reset") {
    sciCurrentInput = "";
    sciIsEvaluated = false;
    if (sciDisplay) sciDisplay.value = "";
    if (sciSubDisplay) sciSubDisplay.textContent = "";
    return;
  }

  if (btn.id === "sci-del") {
    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = "";
      sciIsEvaluated = false;
      if (sciSubDisplay) sciSubDisplay.textContent = "";
    } else {
      const funcMatch = sciCurrentInput.match(/(sin\(|cos\(|tan\(|asin\(|acos\(|atan\(|sinh\(|cosh\(|tanh\(|log\(|ln\(|sqrt\(|cbrt\(|nPr\(|nCr\()$/);
      if (funcMatch) {
        sciCurrentInput = sciCurrentInput.slice(0, -funcMatch[0].length);
      } else {
        sciCurrentInput = sciCurrentInput.slice(0, -1);
      }
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (btn.id === "sci-equal" || action === "=") {
    if (!sciCurrentInput || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      return;
    }
    const exprForSub = autoCloseParens(sciCurrentInput);
    const result = evaluateSciExpression(sciCurrentInput, sciAngleMode);
    if (sciSubDisplay) sciSubDisplay.textContent = `${exprForSub} =`;
    if (typeof addHistoryEntry === "function") {
      addHistoryEntry("Scientific", exprForSub, result);
    }
    sciCurrentInput = result;
    if (result !== "Error" && result !== "Cannot divide by zero") {
      sciLastAns = result;
    }
    sciIsEvaluated = true;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "ans") {
    if (sciIsEvaluated) {
      sciCurrentInput = sciLastAns;
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += sciLastAns;
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "inv") {
    if (sciCurrentInput && !sciIsEvaluated) {
      sciCurrentInput = `1/(${sciCurrentInput})`;
    } else {
      sciCurrentInput = "1/(";
    }
    sciIsEvaluated = false;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "sin" || action === "cos" || action === "tan") {
    let fnName = action;
    if (sciIsHyp) fnName = sciIs2nd ? `a${action}h` : `${action}h`;
    else fnName = sciIs2nd ? `a${action}` : action;

    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = `${fnName}(`;
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += `${fnName}(`;
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "sqrt") {
    const fnName = sciIs2nd ? "cbrt" : "sqrt";
    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = `${fnName}(`;
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += `${fnName}(`;
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "cbrt") {
    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = "cbrt(";
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += "cbrt(";
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "npr" || action === "ncr") {
    const fnName = action === "npr" ? "nPr(" : "nCr(";
    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = fnName;
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += fnName;
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "log" || action === "ln") {
    if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
      sciCurrentInput = `${action}(`;
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += `${action}(`;
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "pi") {
    if (sciIsEvaluated) {
      sciCurrentInput = "π";
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += "π";
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "e") {
    if (sciIsEvaluated) {
      sciCurrentInput = "e";
      sciIsEvaluated = false;
    } else {
      sciCurrentInput += "e";
    }
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "fact") {
    if (sciCurrentInput && !sciCurrentInput.endsWith("!")) {
      sciCurrentInput += "!";
      sciIsEvaluated = false;
      if (sciDisplay) sciDisplay.value = sciCurrentInput;
    }
    return;
  }

  if (action === "pow") {
    if (sciCurrentInput && !/[\+\-\*\/\^]$/.test(sciCurrentInput)) {
      sciCurrentInput += "^";
      sciIsEvaluated = false;
      if (sciDisplay) sciDisplay.value = sciCurrentInput;
    }
    return;
  }

  if (action === "pm") {
    const match = sciCurrentInput.match(/(.*[+\-*/(])?\s*(-?\d*\.?\d+)$/);
    if (match) {
      const prefix = match[1] || "";
      const numStr = match[2];
      const toggled = numStr.startsWith("-") ? numStr.slice(1) : `-${numStr}`;
      sciCurrentInput = prefix + toggled;
    } else if (!sciCurrentInput) {
      sciCurrentInput = "-";
    }
    sciIsEvaluated = false;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  if (action === "%") {
    const match = sciCurrentInput.match(/(.*[+\-*/(])?\s*(-?\d*\.?\d+)$/);
    if (match) {
      const prefix = match[1] || "";
      const numStr = match[2];
      const val = parseFloat(numStr) / 100;
      const formatted = String(parseFloat(val.toPrecision(12)));
      sciCurrentInput = prefix + formatted;
      if (sciDisplay) sciDisplay.value = sciCurrentInput;
      sciIsEvaluated = false;
    }
    return;
  }

  // Operator handling (+, -, *, /)
  if (["+", "-", "*", "/"].includes(action)) {
    if (sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") return;
    if (!sciCurrentInput) {
      if (action === "-") {
        sciCurrentInput = "-";
        if (sciDisplay) sciDisplay.value = sciCurrentInput;
      }
      return;
    }
    if (/[+\-*/]$/.test(sciCurrentInput)) {
      sciCurrentInput = sciCurrentInput.slice(0, -1) + action;
    } else {
      sciCurrentInput += action;
    }
    sciIsEvaluated = false;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    return;
  }

  // Digits and parentheses
  const val = action || text;
  if (sciIsEvaluated || sciCurrentInput === "Error" || sciCurrentInput === "Cannot divide by zero") {
    sciCurrentInput = val === "." ? "0." : val;
    sciIsEvaluated = false;
  } else {
    sciCurrentInput += val;
  }
  if (sciDisplay) sciDisplay.value = sciCurrentInput;
}

if (sciButtons) {
  sciButtons.forEach((btn) => {
    if (btn.id === "sci-angle-mode" || btn.id === "sci-2nd-btn" || btn.id === "sci-hyp-btn") return;
    btn.addEventListener("click", () => handleSciInput(btn));
  });
}

// Programmer Calculator Engine
const progDisplay = document.querySelector("#prog-show");
const progSubDisplay = document.querySelector("#prog-sub-display");
const progWordSizeBtn = document.querySelector("#prog-word-size");
const progButtons = document.querySelectorAll("#prog-btn button");
const baseRows = document.querySelectorAll(".base-row");

let progCurrentBase = "DEC";
let progWordSize = "QWORD";
let progCurrentInput = "";
let progIsEvaluated = false;
let progLastAns = "0";

const wordSizeMap = {
  QWORD: 64,
  DWORD: 32,
  WORD: 16,
  BYTE: 8,
};

const wordSizeLabels = {
  QWORD: "QWORD (64-bit)",
  DWORD: "DWORD (32-bit)",
  WORD: "WORD (16-bit)",
  BYTE: "BYTE (8-bit)",
};

const wordSizeCycle = ["QWORD", "DWORD", "WORD", "BYTE"];

function maskBigInt(val, bits) {
  const mask = (1n << BigInt(bits)) - 1n;
  return val & mask;
}

function formatBinaryString(binStr) {
  const rem = binStr.length % 4;
  const padded = rem ? "0".repeat(4 - rem) + binStr : binStr;
  const parts = padded.match(/.{1,4}/g);
  return parts ? parts.join(" ") : binStr;
}

function updateBaseMonitor(valBigInt) {
  const hexEl = document.querySelector("#val-hex");
  const decEl = document.querySelector("#val-dec");
  const octEl = document.querySelector("#val-oct");
  const binEl = document.querySelector("#val-bin");

  if (!hexEl || !decEl || !octEl || !binEl) return;

  const bits = wordSizeMap[progWordSize] || 64;
  const masked = maskBigInt(valBigInt, bits);

  hexEl.textContent = masked.toString(16).toUpperCase();
  decEl.textContent = masked.toString(10);
  octEl.textContent = masked.toString(8);
  binEl.textContent = formatBinaryString(masked.toString(2));
}

function updateKeyStatesForBase(base) {
  const hexKeys = document.querySelectorAll(".prog-hex-key");
  const numKeys = document.querySelectorAll(".prog-num");

  hexKeys.forEach((key) => {
    key.classList.toggle("disabled-key", base !== "HEX");
  });

  numKeys.forEach((key) => {
    const val = key.dataset.num;
    if (val === "00") {
      key.classList.toggle("disabled-key", base === "BIN");
      return;
    }
    const num = parseInt(val, 10);
    let allowed = false;
    if (base === "HEX" || base === "DEC") allowed = num >= 0 && num <= 9;
    else if (base === "OCT") allowed = num >= 0 && num <= 7;
    else if (base === "BIN") allowed = num >= 0 && num <= 1;

    key.classList.toggle("disabled-key", !allowed);
  });
}

function switchBase(newBase) {
  if (progCurrentBase === newBase) return;

  if (progCurrentInput && /^[0-9A-Fa-f]+$/.test(progCurrentInput)) {
    try {
      let n;
      if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
      else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
      else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
      else n = BigInt(progCurrentInput);

      const bits = wordSizeMap[progWordSize] || 64;
      const masked = maskBigInt(n, bits);

      if (newBase === "HEX") progCurrentInput = masked.toString(16).toUpperCase();
      else if (newBase === "OCT") progCurrentInput = masked.toString(8);
      else if (newBase === "BIN") progCurrentInput = masked.toString(2);
      else progCurrentInput = masked.toString(10);

      if (progDisplay) progDisplay.value = progCurrentInput;
      updateBaseMonitor(masked);
    } catch (e) {}
  }

  progCurrentBase = newBase;
  baseRows.forEach((row) => {
    row.classList.toggle("active", row.dataset.base === newBase);
  });
  updateKeyStatesForBase(newBase);
}

if (baseRows) {
  baseRows.forEach((row) => {
    row.addEventListener("click", () => {
      switchBase(row.dataset.base);
    });
  });
}

if (progWordSizeBtn) {
  progWordSizeBtn.addEventListener("click", () => {
    const nextIdx = (wordSizeCycle.indexOf(progWordSize) + 1) % wordSizeCycle.length;
    progWordSize = wordSizeCycle[nextIdx];
    progWordSizeBtn.textContent = wordSizeLabels[progWordSize];

    if (progCurrentInput && /^[0-9A-Fa-f]+$/.test(progCurrentInput)) {
      try {
        let n;
        if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
        else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
        else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
        else n = BigInt(progCurrentInput);

        const bits = wordSizeMap[progWordSize];
        const masked = maskBigInt(n, bits);
        updateBaseMonitor(masked);
      } catch (e) {}
    }
  });
}

function evaluateProgExpression(expression, base, wordSize) {
  let s = autoCloseParens(expression.trim());
  if (!s) return "";

  s = s.replace(/\bAND\b/g, "&");
  s = s.replace(/\bOR\b/g, "|");
  s = s.replace(/\bXOR\b/g, "^");
  s = s.replace(/\bNOT\b/g, "~");
  s = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  s = s.replace(/\b([0-9A-Fa-f]+)\b/g, (match) => {
    if (["AND", "OR", "XOR", "NOT"].includes(match)) return match;
    let n;
    if (base === "HEX") n = BigInt("0x" + match);
    else if (base === "OCT") n = BigInt("0o" + match);
    else if (base === "BIN") n = BigInt("0b" + match);
    else n = BigInt(match);
    return n.toString() + "n";
  });

  try {
    const rawRes = new Function(`return (${s})`)();
    const bits = wordSizeMap[wordSize] || 64;
    const masked = maskBigInt(BigInt(rawRes), bits);

    if (base === "HEX") return masked.toString(16).toUpperCase();
    if (base === "OCT") return masked.toString(8);
    if (base === "BIN") return masked.toString(2);
    return masked.toString(10);
  } catch (err) {
    return "Error";
  }
}

function handleProgInput(btn) {
  const hex = btn.dataset.hex;
  const num = btn.dataset.num;
  const action = btn.dataset.action;
  const text = btn.textContent.trim();

  if (btn.id === "prog-reset") {
    progCurrentInput = "";
    progIsEvaluated = false;
    if (progDisplay) progDisplay.value = "";
    if (progSubDisplay) progSubDisplay.textContent = "";
    updateBaseMonitor(0n);
    return;
  }

  if (btn.id === "prog-del") {
    if (progIsEvaluated || progCurrentInput === "Error") {
      progCurrentInput = "";
      progIsEvaluated = false;
      if (progSubDisplay) progSubDisplay.textContent = "";
    } else {
      const kwMatch = progCurrentInput.match(/(AND|XOR|NOT|OR|<<|>>)$/);
      if (kwMatch) {
        progCurrentInput = progCurrentInput.slice(0, -kwMatch[0].length).trim();
      } else {
        progCurrentInput = progCurrentInput.slice(0, -1);
      }
    }
    if (progDisplay) progDisplay.value = progCurrentInput;
    if (progCurrentInput && /^[0-9A-Fa-f]+$/.test(progCurrentInput)) {
      try {
        let n;
        if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
        else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
        else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
        else n = BigInt(progCurrentInput);
        updateBaseMonitor(n);
      } catch (e) {}
    } else if (!progCurrentInput) {
      updateBaseMonitor(0n);
    }
    return;
  }

  if (btn.id === "prog-equal" || action === "=") {
    if (!progCurrentInput || progCurrentInput === "Error") return;
    const exprForSub = autoCloseParens(progCurrentInput);
    const result = evaluateProgExpression(progCurrentInput, progCurrentBase, progWordSize);
    if (progSubDisplay) progSubDisplay.textContent = `${exprForSub} =`;
    if (typeof addHistoryEntry === "function") {
      addHistoryEntry("Programmer", `${exprForSub} (${progCurrentBase})`, result);
    }
    progCurrentInput = result;
    if (result !== "Error") {
      progLastAns = result;
      try {
        let n;
        if (progCurrentBase === "HEX") n = BigInt("0x" + result);
        else if (progCurrentBase === "OCT") n = BigInt("0o" + result);
        else if (progCurrentBase === "BIN") n = BigInt("0b" + result);
        else n = BigInt(result);
        updateBaseMonitor(n);
      } catch (e) {}
    }
    progIsEvaluated = true;
    if (progDisplay) progDisplay.value = progCurrentInput;
    return;
  }

  if (action === "ans") {
    if (progIsEvaluated) {
      progCurrentInput = progLastAns;
      progIsEvaluated = false;
    } else {
      progCurrentInput += progLastAns;
    }
    if (progDisplay) progDisplay.value = progCurrentInput;
    return;
  }

  if (action === "pm") {
    if (progCurrentInput && /^[0-9A-Fa-f]+$/.test(progCurrentInput)) {
      try {
        let n;
        if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
        else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
        else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
        else n = BigInt(progCurrentInput);

        const bits = wordSizeMap[progWordSize] || 64;
        const negated = maskBigInt(-n, bits);
        if (progCurrentBase === "HEX") progCurrentInput = negated.toString(16).toUpperCase();
        else if (progCurrentBase === "OCT") progCurrentInput = negated.toString(8);
        else if (progCurrentBase === "BIN") progCurrentInput = negated.toString(2);
        else progCurrentInput = negated.toString(10);

        if (progDisplay) progDisplay.value = progCurrentInput;
        updateBaseMonitor(negated);
        return;
      } catch (e) {}
    }
  }

  if (["AND", "OR", "XOR", "NOT", "<<", ">>", "+", "-", "*", "/", "%"].includes(action)) {
    if (progCurrentInput === "Error") return;
    if (!progCurrentInput && action !== "NOT") return;

    if (action === "NOT") {
      if (progCurrentInput && /^[0-9A-Fa-f]+$/.test(progCurrentInput)) {
        try {
          let n;
          if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
          else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
          else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
          else n = BigInt(progCurrentInput);

          const bits = wordSizeMap[progWordSize] || 64;
          const inverted = maskBigInt(~n, bits);
          if (progCurrentBase === "HEX") progCurrentInput = inverted.toString(16).toUpperCase();
          else if (progCurrentBase === "OCT") progCurrentInput = inverted.toString(8);
          else if (progCurrentBase === "BIN") progCurrentInput = inverted.toString(2);
          else progCurrentInput = inverted.toString(10);

          if (progDisplay) progDisplay.value = progCurrentInput;
          updateBaseMonitor(inverted);
          return;
        } catch (e) {}
      } else {
        progCurrentInput += "NOT ";
      }
    } else {
      progCurrentInput += ` ${action} `;
    }
    progIsEvaluated = false;
    if (progDisplay) progDisplay.value = progCurrentInput;
    return;
  }

  if (action === "(" || action === ")") {
    progCurrentInput += action;
    progIsEvaluated = false;
    if (progDisplay) progDisplay.value = progCurrentInput;
    return;
  }

  const digit = hex || num || text;
  if (progIsEvaluated || progCurrentInput === "Error") {
    progCurrentInput = digit;
    progIsEvaluated = false;
  } else {
    progCurrentInput += digit;
  }

  if (progDisplay) progDisplay.value = progCurrentInput;

  if (/^[0-9A-Fa-f]+$/.test(progCurrentInput.trim())) {
    try {
      let n;
      if (progCurrentBase === "HEX") n = BigInt("0x" + progCurrentInput);
      else if (progCurrentBase === "OCT") n = BigInt("0o" + progCurrentInput);
      else if (progCurrentBase === "BIN") n = BigInt("0b" + progCurrentInput);
      else n = BigInt(progCurrentInput);
      updateBaseMonitor(n);
    } catch (e) {}
  }
}

if (progButtons) {
  progButtons.forEach((btn) => {
    btn.addEventListener("click", () => handleProgInput(btn));
  });
}

updateKeyStatesForBase("DEC");

// Financial Calculator Engine
const finTabBtns = document.querySelectorAll(".fin-tab-btn");
const finSubPanels = document.querySelectorAll(".fin-subtab-panel");

function switchFinTab(tabKey) {
  finTabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.subtab === tabKey);
  });
  finSubPanels.forEach((panel) => {
    panel.classList.toggle("active-subtab", panel.id === `fin-subtab-${tabKey}`);
  });
}

if (finTabBtns) {
  finTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchFinTab(btn.dataset.subtab));
  });
}

function formatCurrency(val) {
  if (isNaN(val) || !isFinite(val)) return "$0.00";
  return (
    "$" +
    Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// 1. EMI Calculation
const emiPrincipalInput = document.querySelector("#emi-principal");
const emiRateInput = document.querySelector("#emi-rate");
const emiTenureInput = document.querySelector("#emi-tenure");
const emiCalcBtn = document.querySelector("#emi-calc-btn");
const emiMonthlyEl = document.querySelector("#emi-res-monthly");
const emiPrincipalEl = document.querySelector("#emi-res-principal");
const emiInterestEl = document.querySelector("#emi-res-interest");
const emiTotalEl = document.querySelector("#emi-res-total");

function calculateEMI() {
  const P = parseFloat(emiPrincipalInput?.value) || 0;
  const annualRate = parseFloat(emiRateInput?.value) || 0;
  const years = parseFloat(emiTenureInput?.value) || 0;

  if (P <= 0 || years <= 0) {
    if (emiMonthlyEl) emiMonthlyEl.textContent = "$0.00";
    if (emiPrincipalEl) emiPrincipalEl.textContent = formatCurrency(P);
    if (emiInterestEl) emiInterestEl.textContent = "$0.00";
    if (emiTotalEl) emiTotalEl.textContent = formatCurrency(P);
    return;
  }

  const n = years * 12;
  let emi = 0;
  let total = 0;
  let interest = 0;

  if (annualRate === 0) {
    emi = P / n;
    total = P;
    interest = 0;
  } else {
    const r = annualRate / 12 / 100;
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    total = emi * n;
    interest = total - P;
  }

  if (emiMonthlyEl) emiMonthlyEl.textContent = formatCurrency(emi);
  if (emiPrincipalEl) emiPrincipalEl.textContent = formatCurrency(P);
  if (emiInterestEl) emiInterestEl.textContent = formatCurrency(interest);
  if (emiTotalEl) emiTotalEl.textContent = formatCurrency(total);
}

if (emiCalcBtn) emiCalcBtn.addEventListener("click", calculateEMI);
[emiPrincipalInput, emiRateInput, emiTenureInput].forEach((input) => {
  input?.addEventListener("input", calculateEMI);
});

// 2. SIP Calculation
const sipMonthlyInput = document.querySelector("#sip-monthly");
const sipRateInput = document.querySelector("#sip-rate");
const sipYearsInput = document.querySelector("#sip-years");
const sipCalcBtn = document.querySelector("#sip-calc-btn");
const sipMaturityEl = document.querySelector("#sip-res-maturity");
const sipInvestedEl = document.querySelector("#sip-res-invested");
const sipReturnsEl = document.querySelector("#sip-res-returns");

function calculateSIP() {
  const monthly = parseFloat(sipMonthlyInput?.value) || 0;
  const annualReturn = parseFloat(sipRateInput?.value) || 0;
  const years = parseFloat(sipYearsInput?.value) || 0;

  if (monthly <= 0 || years <= 0) {
    if (sipMaturityEl) sipMaturityEl.textContent = "$0.00";
    if (sipInvestedEl) sipInvestedEl.textContent = "$0.00";
    if (sipReturnsEl) sipReturnsEl.textContent = "$0.00";
    return;
  }

  const n = years * 12;
  const invested = monthly * n;
  let maturity = invested;

  if (annualReturn > 0) {
    const i = annualReturn / 12 / 100;
    maturity = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  const returns = maturity - invested;

  if (sipMaturityEl) sipMaturityEl.textContent = formatCurrency(maturity);
  if (sipInvestedEl) sipInvestedEl.textContent = formatCurrency(invested);
  if (sipReturnsEl) sipReturnsEl.textContent = formatCurrency(returns);
}

if (sipCalcBtn) sipCalcBtn.addEventListener("click", calculateSIP);
[sipMonthlyInput, sipRateInput, sipYearsInput].forEach((input) => {
  input?.addEventListener("input", calculateSIP);
});

// 3. GST Calculation
const gstAmountInput = document.querySelector("#gst-amount");
const gstCustomRateInput = document.querySelector("#gst-custom-rate");
const gstSlabBtns = document.querySelectorAll(".gst-slab-btn");
const gstModeAddBtn = document.querySelector("#gst-mode-add");
const gstModeRemoveBtn = document.querySelector("#gst-mode-remove");
const gstNetEl = document.querySelector("#gst-res-net");
const gstTaxEl = document.querySelector("#gst-res-tax");
const gstTotalEl = document.querySelector("#gst-res-total");

let gstMode = "add";

function calculateGST() {
  const amount = parseFloat(gstAmountInput?.value) || 0;
  const rate = parseFloat(gstCustomRateInput?.value) || 0;

  let net = 0;
  let tax = 0;
  let total = 0;

  if (amount <= 0 || rate <= 0) {
    net = amount;
    tax = 0;
    total = amount;
  } else if (gstMode === "add") {
    tax = (amount * rate) / 100;
    total = amount + tax;
    net = amount;
  } else {
    net = amount / (1 + rate / 100);
    tax = amount - net;
    total = amount;
  }

  if (gstNetEl) gstNetEl.textContent = formatCurrency(net);
  if (gstTaxEl) gstTaxEl.textContent = formatCurrency(tax);
  if (gstTotalEl) gstTotalEl.textContent = formatCurrency(total);
}

gstSlabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    gstSlabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (gstCustomRateInput) gstCustomRateInput.value = btn.dataset.rate;
    calculateGST();
  });
});

if (gstCustomRateInput) {
  gstCustomRateInput.addEventListener("input", () => {
    gstSlabBtns.forEach((b) => {
      b.classList.toggle("active", b.dataset.rate === gstCustomRateInput.value);
    });
    calculateGST();
  });
}

if (gstModeAddBtn) {
  gstModeAddBtn.addEventListener("click", () => {
    gstMode = "add";
    gstModeAddBtn.classList.add("active");
    gstModeRemoveBtn.classList.remove("active");
    calculateGST();
  });
}

if (gstModeRemoveBtn) {
  gstModeRemoveBtn.addEventListener("click", () => {
    gstMode = "remove";
    gstModeRemoveBtn.classList.add("active");
    gstModeAddBtn.classList.remove("active");
    calculateGST();
  });
}

if (gstAmountInput) gstAmountInput.addEventListener("input", calculateGST);

// Unit Converter Engine
const convCatBtns = document.querySelectorAll(".conv-cat-btn");
const convFromInput = document.querySelector("#conv-from-val");
const convToInput = document.querySelector("#conv-to-val");
const convFromSelect = document.querySelector("#conv-from-unit");
const convToSelect = document.querySelector("#conv-to-unit");
const convSwapBtn = document.querySelector("#conv-swap-btn");
const convFormulaVal = document.querySelector("#conv-formula-val");

let convActiveCat = "length";

const unitDefinitions = {
  length: {
    name: "Length",
    defaultFrom: "Meter",
    defaultTo: "Foot",
    units: {
      Meter: 1,
      Kilometer: 1000,
      Centimeter: 0.01,
      Millimeter: 0.001,
      Mile: 1609.344,
      Yard: 0.9144,
      Foot: 0.3048,
      Inch: 0.0254,
    },
  },
  weight: {
    name: "Weight",
    defaultFrom: "Kilogram",
    defaultTo: "Pound",
    units: {
      Kilogram: 1,
      Gram: 0.001,
      Milligram: 0.000001,
      "Metric Ton": 1000,
      Pound: 0.45359237,
      Ounce: 0.028349523125,
    },
  },
  temperature: {
    name: "Temperature",
    defaultFrom: "Celsius",
    defaultTo: "Fahrenheit",
    units: {
      Celsius: "C",
      Fahrenheit: "F",
      Kelvin: "K",
    },
  },
  data: {
    name: "Data",
    defaultFrom: "Megabyte",
    defaultTo: "Gigabyte",
    units: {
      Byte: 1,
      Kilobyte: 1024,
      Megabyte: 1048576,
      Gigabyte: 1073741824,
      Terabyte: 1099511627776,
      Bit: 0.125,
    },
  },
  speed: {
    name: "Speed",
    defaultFrom: "km/h",
    defaultTo: "mph",
    units: {
      "m/s": 1,
      "km/h": 1 / 3.6,
      mph: 0.44704,
      Knot: 0.514444,
    },
  },
  volume: {
    name: "Volume",
    defaultFrom: "Liter",
    defaultTo: "Gallon (US)",
    units: {
      Liter: 1,
      Milliliter: 0.001,
      "Cubic Meter": 1000,
      "Gallon (US)": 3.785411784,
      "Quart (US)": 0.946352946,
      "Pint (US)": 0.473176473,
      "Cup (US)": 0.2365882365,
      "Fluid Ounce (US)": 0.0295735295625,
      "Tablespoon (US)": 0.01478676478125,
      "Teaspoon (US)": 0.00492892159375,
    },
  },
};

function convertUnits(cat, val, fromU, toU) {
  if (isNaN(val)) return 0;
  if (fromU === toU) return val;

  if (cat === "temperature") {
    let c = val;
    if (fromU === "Fahrenheit") c = ((val - 32) * 5) / 9;
    else if (fromU === "Kelvin") c = val - 273.15;

    if (toU === "Celsius") return c;
    if (toU === "Fahrenheit") return (c * 9) / 5 + 32;
    if (toU === "Kelvin") return c + 273.15;
    return c;
  }

  const units = unitDefinitions[cat].units;
  const inBase = val * units[fromU];
  return inBase / units[toU];
}

function formatConvertedNumber(num) {
  if (num === 0) return "0";
  if (Math.abs(num) < 0.00001 || Math.abs(num) >= 1e9) {
    return num.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(parseFloat(num.toPrecision(8)));
}

function updateFormulaPreview() {
  if (!convFormulaVal || !convFromSelect || !convToSelect) return;
  const fromU = convFromSelect.value;
  const toU = convToSelect.value;

  if (convActiveCat === "temperature") {
    if (fromU === "Celsius" && toU === "Fahrenheit") {
      convFormulaVal.textContent = "(°C × 9/5) + 32 = °F";
    } else if (fromU === "Fahrenheit" && toU === "Celsius") {
      convFormulaVal.textContent = "(°F − 32) × 5/9 = °C";
    } else if (fromU === "Celsius" && toU === "Kelvin") {
      convFormulaVal.textContent = "°C + 273.15 = K";
    } else {
      convFormulaVal.textContent = `${fromU} to ${toU}`;
    }
  } else {
    const rate = convertUnits(convActiveCat, 1, fromU, toU);
    convFormulaVal.textContent = `1 ${fromU} = ${formatConvertedNumber(rate)} ${toU}`;
  }
}

function syncConversion(direction = "forward") {
  if (!convFromInput || !convToInput || !convFromSelect || !convToSelect) return;

  const fromU = convFromSelect.value;
  const toU = convToSelect.value;

  if (direction === "forward") {
    const val = parseFloat(convFromInput.value);
    if (isNaN(val)) {
      convToInput.value = "";
    } else {
      const res = convertUnits(convActiveCat, val, fromU, toU);
      convToInput.value = formatConvertedNumber(res);
    }
  } else {
    const val = parseFloat(convToInput.value);
    if (isNaN(val)) {
      convFromInput.value = "";
    } else {
      const res = convertUnits(convActiveCat, val, toU, fromU);
      convFromInput.value = formatConvertedNumber(res);
    }
  }

  updateFormulaPreview();
}

function populateUnitSelects(catKey) {
  if (!convFromSelect || !convToSelect) return;
  const def = unitDefinitions[catKey];
  if (!def) return;

  convFromSelect.innerHTML = "";
  convToSelect.innerHTML = "";

  Object.keys(def.units).forEach((unitName) => {
    const optFrom = document.createElement("option");
    optFrom.value = unitName;
    optFrom.textContent = unitName;
    if (unitName === def.defaultFrom) optFrom.selected = true;
    convFromSelect.appendChild(optFrom);

    const optTo = document.createElement("option");
    optTo.value = unitName;
    optTo.textContent = unitName;
    if (unitName === def.defaultTo) optTo.selected = true;
    convToSelect.appendChild(optTo);
  });

  syncConversion("forward");
}

convCatBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    convCatBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    convActiveCat = btn.dataset.cat;
    populateUnitSelects(convActiveCat);
  });
});

if (convFromInput) {
  convFromInput.addEventListener("input", () => syncConversion("forward"));
}

if (convToInput) {
  convToInput.addEventListener("input", () => syncConversion("backward"));
}

if (convFromSelect) {
  convFromSelect.addEventListener("change", () => syncConversion("forward"));
}

if (convToSelect) {
  convToSelect.addEventListener("change", () => syncConversion("forward"));
}

if (convSwapBtn) {
  convSwapBtn.addEventListener("click", () => {
    const prevFrom = convFromSelect.value;
    convFromSelect.value = convToSelect.value;
    convToSelect.value = prevFrom;
    syncConversion("forward");
  });
}

populateUnitSelects("length");

// Date & Age Calculator Engine
const dateTabBtns = document.querySelectorAll(".date-tab-btn");
const dateSubtabPanels = document.querySelectorAll(".date-subtab-panel");

// Format Date object to YYYY-MM-DD
function formatDateForInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD string to local Date object
function parseDateString(str) {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Subtab switching
dateTabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    dateTabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const targetSubtab = btn.dataset.datesub;
    dateSubtabPanels.forEach((panel) => {
      panel.classList.toggle("active-subtab", panel.id === `date-subtab-${targetSubtab}`);
    });
  });
});

// Tool 1: Age Calculator
const ageDobInput = document.querySelector("#age-dob");
const ageTargetInput = document.querySelector("#age-target");
const ageCalcBtn = document.querySelector("#age-calc-btn");
const ageResPrimary = document.querySelector("#age-res-primary");
const ageResMonths = document.querySelector("#age-res-months");
const ageResWeeks = document.querySelector("#age-res-weeks");
const ageResDays = document.querySelector("#age-res-days");
const ageResNext = document.querySelector("#age-res-next");

function runAgeCalculation() {
  if (!ageDobInput || !ageTargetInput || !ageResPrimary) return;

  const dob = parseDateString(ageDobInput.value);
  const target = parseDateString(ageTargetInput.value);

  if (!dob || !target) {
    ageResPrimary.textContent = "Please select valid dates";
    return;
  }

  if (dob > target) {
    ageResPrimary.textContent = "Birth date cannot be after target date";
    if (ageResMonths) ageResMonths.textContent = "-";
    if (ageResWeeks) ageResWeeks.textContent = "-";
    if (ageResDays) ageResDays.textContent = "-";
    if (ageResNext) ageResNext.textContent = "-";
    return;
  }

  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const msDiff = target.getTime() - dob.getTime();
  const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remDaysAfterWeeks = totalDays % 7;
  const totalMonths = years * 12 + months;

  // Next birthday calculation
  let nextBdayYear = target.getFullYear();
  let nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate());
  if (nextBday < target) {
    nextBdayYear += 1;
    nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate());
  }

  const msToNext = nextBday.getTime() - target.getTime();
  const daysUntilNext = Math.ceil(msToNext / (1000 * 60 * 60 * 24));
  const dayName = nextBday.toLocaleDateString("en-US", { weekday: "long" });

  ageResPrimary.textContent = `${years} Years, ${months} Months, ${days} Days`;
  if (ageResMonths) ageResMonths.textContent = `${totalMonths.toLocaleString()} Months`;
  if (ageResWeeks) {
    ageResWeeks.textContent = `${totalWeeks.toLocaleString()} Weeks${remDaysAfterWeeks > 0 ? ` + ${remDaysAfterWeeks}d` : ""}`;
  }
  if (ageResDays) ageResDays.textContent = `${totalDays.toLocaleString()} Days`;
  if (ageResNext) {
    ageResNext.textContent = daysUntilNext === 0 ? "Today is birthday!" : `${daysUntilNext} Days (${dayName})`;
  }
}

if (ageCalcBtn) ageCalcBtn.addEventListener("click", runAgeCalculation);
if (ageDobInput) ageDobInput.addEventListener("input", runAgeCalculation);
if (ageTargetInput) ageTargetInput.addEventListener("input", runAgeCalculation);

// Tool 2: Date Difference
const diffStartInput = document.querySelector("#diff-start");
const diffEndInput = document.querySelector("#diff-end");
const diffCalcBtn = document.querySelector("#diff-calc-btn");
const diffResPrimary = document.querySelector("#diff-res-primary");
const diffResDays = document.querySelector("#diff-res-days");
const diffResWeeks = document.querySelector("#diff-res-weeks");
const diffResBusiness = document.querySelector("#diff-res-business");
const diffResWeekends = document.querySelector("#diff-res-weekends");

function runDiffCalculation() {
  if (!diffStartInput || !diffEndInput || !diffResPrimary) return;

  const d1 = parseDateString(diffStartInput.value);
  const d2 = parseDateString(diffEndInput.value);

  if (!d1 || !d2) {
    diffResPrimary.textContent = "Please select valid dates";
    return;
  }

  const isReverse = d1 > d2;
  const start = isReverse ? d2 : d1;
  const end = isReverse ? d1 : d2;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const msDiff = end.getTime() - start.getTime();
  const totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;

  let businessDays = 0;
  let weekendDays = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);

  diffResPrimary.textContent = parts.join(", ") + (isReverse ? " (Past)" : "");
  if (diffResDays) diffResDays.textContent = `${totalDays.toLocaleString()} Days`;
  if (diffResWeeks) diffResWeeks.textContent = `${weeks.toLocaleString()} Weeks, ${remDays} Days`;
  if (diffResBusiness) diffResBusiness.textContent = `${businessDays.toLocaleString()} Days`;
  if (diffResWeekends) diffResWeekends.textContent = `${weekendDays.toLocaleString()} Days`;
}

if (diffCalcBtn) diffCalcBtn.addEventListener("click", runDiffCalculation);
if (diffStartInput) diffStartInput.addEventListener("input", runDiffCalculation);
if (diffEndInput) diffEndInput.addEventListener("input", runDiffCalculation);

// Tool 3: Add / Subtract Duration
const addSubStartInput = document.querySelector("#addsub-start");
const addSubModeAddBtn = document.querySelector("#addsub-mode-add");
const addSubModeSubBtn = document.querySelector("#addsub-mode-sub");
const addSubYearsInput = document.querySelector("#addsub-years");
const addSubMonthsInput = document.querySelector("#addsub-months");
const addSubDaysInput = document.querySelector("#addsub-days");
const addSubCalcBtn = document.querySelector("#addsub-calc-btn");
const addSubResDate = document.querySelector("#addsub-res-date");
const addSubResDayName = document.querySelector("#addsub-res-dayname");

let addSubCurrentOp = "add";

if (addSubModeAddBtn && addSubModeSubBtn) {
  addSubModeAddBtn.addEventListener("click", () => {
    addSubModeAddBtn.classList.add("active");
    addSubModeSubBtn.classList.remove("active");
    addSubCurrentOp = "add";
    runAddSubCalculation();
  });

  addSubModeSubBtn.addEventListener("click", () => {
    addSubModeSubBtn.classList.add("active");
    addSubModeAddBtn.classList.remove("active");
    addSubCurrentOp = "sub";
    runAddSubCalculation();
  });
}

function runAddSubCalculation() {
  if (!addSubStartInput || !addSubResDate) return;

  const start = parseDateString(addSubStartInput.value);
  if (!start) {
    addSubResDate.textContent = "Please select a start date";
    if (addSubResDayName) addSubResDayName.textContent = "-";
    return;
  }

  const years = Math.max(0, parseInt(addSubYearsInput?.value, 10) || 0);
  const months = Math.max(0, parseInt(addSubMonthsInput?.value, 10) || 0);
  const days = Math.max(0, parseInt(addSubDaysInput?.value, 10) || 0);

  const sign = addSubCurrentOp === "add" ? 1 : -1;
  const targetYear = start.getFullYear() + sign * years;
  const targetMonth = start.getMonth() + sign * months;

  const temp = new Date(targetYear, targetMonth, 1);
  const maxDays = new Date(temp.getFullYear(), temp.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(start.getDate(), maxDays);

  const res = new Date(temp.getFullYear(), temp.getMonth(), clampedDay);
  res.setDate(res.getDate() + sign * days);

  const formattedDate = res.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const dayName = res.toLocaleDateString("en-US", { weekday: "long" });

  addSubResDate.textContent = formattedDate;
  if (addSubResDayName) addSubResDayName.textContent = dayName;
}

if (addSubCalcBtn) addSubCalcBtn.addEventListener("click", runAddSubCalculation);
if (addSubStartInput) addSubStartInput.addEventListener("input", runAddSubCalculation);
if (addSubYearsInput) addSubYearsInput.addEventListener("input", runAddSubCalculation);
if (addSubMonthsInput) addSubMonthsInput.addEventListener("input", runAddSubCalculation);
if (addSubDaysInput) addSubDaysInput.addEventListener("input", runAddSubCalculation);

// Set default dates on load
const now = new Date();
const todayStr = formatDateForInput(now);

if (ageDobInput && !ageDobInput.value) ageDobInput.value = "2000-01-01";
if (ageTargetInput && !ageTargetInput.value) ageTargetInput.value = todayStr;

if (diffStartInput && !diffStartInput.value) diffStartInput.value = todayStr;
if (diffEndInput && !diffEndInput.value) {
  const plus30d = new Date();
  plus30d.setDate(plus30d.getDate() + 30);
  diffEndInput.value = formatDateForInput(plus30d);
}

if (addSubStartInput && !addSubStartInput.value) addSubStartInput.value = todayStr;

// Initialize calculations
runAgeCalculation();
runDiffCalculation();
runAddSubCalculation();

// Health & Fitness (BMI) Calculator Engine
const bmiUnitMetricBtn = document.querySelector("#bmi-unit-metric");
const bmiUnitImperialBtn = document.querySelector("#bmi-unit-imperial");
const bmiMetricHeightWrap = document.querySelector("#bmi-metric-height-wrap");
const bmiImperialHeightWrap = document.querySelector("#bmi-imperial-height-wrap");
const bmiMetricWeightWrap = document.querySelector("#bmi-metric-weight-wrap");
const bmiImperialWeightWrap = document.querySelector("#bmi-imperial-weight-wrap");

const bmiHeightCmInput = document.querySelector("#bmi-height-cm");
const bmiHeightFtInput = document.querySelector("#bmi-height-ft");
const bmiHeightInInput = document.querySelector("#bmi-height-in");
const bmiWeightKgInput = document.querySelector("#bmi-weight-kg");
const bmiWeightLbsInput = document.querySelector("#bmi-weight-lbs");
const bmiCalcBtn = document.querySelector("#bmi-calc-btn");

const bmiResScore = document.querySelector("#bmi-res-score");
const bmiResBadge = document.querySelector("#bmi-res-badge");
const bmiGaugePointer = document.querySelector("#bmi-gauge-pointer");
const bmiResIdeal = document.querySelector("#bmi-res-ideal");
const bmiResStatus = document.querySelector("#bmi-res-status");
const bmiResDiff = document.querySelector("#bmi-res-diff");
const bmiResPrime = document.querySelector("#bmi-res-prime");

let bmiCurrentUnit = "metric";

function setBmiUnit(unit) {
  if (unit === bmiCurrentUnit) return;

  if (unit === "imperial") {
    // Convert current Metric values to Imperial
    const cm = parseFloat(bmiHeightCmInput?.value) || 175;
    const kg = parseFloat(bmiWeightKgInput?.value) || 70;

    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const lbs = Math.round(kg * 2.20462 * 10) / 10;

    if (bmiHeightFtInput) bmiHeightFtInput.value = feet;
    if (bmiHeightInInput) bmiHeightInInput.value = inches;
    if (bmiWeightLbsInput) bmiWeightLbsInput.value = lbs;

    if (bmiMetricHeightWrap) bmiMetricHeightWrap.style.display = "none";
    if (bmiImperialHeightWrap) bmiImperialHeightWrap.style.display = "flex";
    if (bmiMetricWeightWrap) bmiMetricWeightWrap.style.display = "none";
    if (bmiImperialWeightWrap) bmiImperialWeightWrap.style.display = "flex";

    if (bmiUnitMetricBtn) bmiUnitMetricBtn.classList.remove("active");
    if (bmiUnitImperialBtn) bmiUnitImperialBtn.classList.add("active");
  } else {
    // Convert current Imperial values to Metric
    const ft = parseFloat(bmiHeightFtInput?.value) || 5;
    const inch = parseFloat(bmiHeightInInput?.value) || 9;
    const lbs = parseFloat(bmiWeightLbsInput?.value) || 154;

    const totalInches = ft * 12 + inch;
    const cm = Math.round(totalInches * 2.54);
    const kg = Math.round((lbs / 2.20462) * 10) / 10;

    if (bmiHeightCmInput) bmiHeightCmInput.value = cm;
    if (bmiWeightKgInput) bmiWeightKgInput.value = kg;

    if (bmiMetricHeightWrap) bmiMetricHeightWrap.style.display = "flex";
    if (bmiImperialHeightWrap) bmiImperialHeightWrap.style.display = "none";
    if (bmiMetricWeightWrap) bmiMetricWeightWrap.style.display = "flex";
    if (bmiImperialWeightWrap) bmiImperialWeightWrap.style.display = "none";

    if (bmiUnitMetricBtn) bmiUnitMetricBtn.classList.add("active");
    if (bmiUnitImperialBtn) bmiUnitImperialBtn.classList.remove("active");
  }

  bmiCurrentUnit = unit;
  runBmiCalculation();
}

if (bmiUnitMetricBtn) {
  bmiUnitMetricBtn.addEventListener("click", () => setBmiUnit("metric"));
}

if (bmiUnitImperialBtn) {
  bmiUnitImperialBtn.addEventListener("click", () => setBmiUnit("imperial"));
}

function runBmiCalculation() {
  if (!bmiResScore) return;

  let heightMeters = 0;
  let weightKg = 0;

  if (bmiCurrentUnit === "metric") {
    const cm = parseFloat(bmiHeightCmInput?.value) || 0;
    const kg = parseFloat(bmiWeightKgInput?.value) || 0;
    heightMeters = cm / 100;
    weightKg = kg;
  } else {
    const ft = parseFloat(bmiHeightFtInput?.value) || 0;
    const inch = parseFloat(bmiHeightInInput?.value) || 0;
    const lbs = parseFloat(bmiWeightLbsInput?.value) || 0;
    const totalInches = ft * 12 + inch;
    heightMeters = totalInches * 0.0254;
    weightKg = lbs * 0.45359237;
  }

  if (heightMeters <= 0 || weightKg <= 0) {
    bmiResScore.textContent = "-";
    if (bmiResBadge) {
      bmiResBadge.textContent = "Invalid Input";
      bmiResBadge.className = "bmi-category-badge";
    }
    return;
  }

  const bmi = weightKg / (heightMeters * heightMeters);
  const bmiPrime = bmi / 25;

  let category = "";
  let badgeClass = "";
  let status = "";

  if (bmi < 18.5) {
    category = "Underweight";
    badgeClass = "category-under";
    status = "Below normal range";
  } else if (bmi < 25) {
    category = "Normal Weight";
    badgeClass = "category-normal";
    status = "Healthy weight for height";
  } else if (bmi < 30) {
    category = "Overweight";
    badgeClass = "category-over";
    status = "Above normal range";
  } else {
    category = "Obese";
    badgeClass = "category-obese";
    status = "Significantly above normal";
  }

  bmiResScore.textContent = bmi.toFixed(1);
  if (bmiResBadge) {
    bmiResBadge.textContent = category;
    bmiResBadge.className = `bmi-category-badge ${badgeClass}`;
  }

  const minNormalKg = 18.5 * (heightMeters * heightMeters);
  const maxNormalKg = 24.9 * (heightMeters * heightMeters);

  if (bmiCurrentUnit === "metric") {
    if (bmiResIdeal) {
      bmiResIdeal.textContent = `${minNormalKg.toFixed(1)} kg - ${maxNormalKg.toFixed(1)} kg`;
    }
    if (bmiResDiff) {
      if (weightKg < minNormalKg) {
        bmiResDiff.textContent = `Gain ${(minNormalKg - weightKg).toFixed(1)} kg for normal`;
      } else if (weightKg > maxNormalKg) {
        bmiResDiff.textContent = `Lose ${(weightKg - maxNormalKg).toFixed(1)} kg for normal`;
      } else {
        bmiResDiff.textContent = "Optimal healthy weight";
      }
    }
  } else {
    const minLbs = minNormalKg * 2.20462;
    const maxLbs = maxNormalKg * 2.20462;
    const curLbs = parseFloat(bmiWeightLbsInput?.value) || weightKg * 2.20462;

    if (bmiResIdeal) {
      bmiResIdeal.textContent = `${minLbs.toFixed(1)} lbs - ${maxLbs.toFixed(1)} lbs`;
    }
    if (bmiResDiff) {
      if (curLbs < minLbs) {
        bmiResDiff.textContent = `Gain ${(minLbs - curLbs).toFixed(1)} lbs for normal`;
      } else if (curLbs > maxLbs) {
        bmiResDiff.textContent = `Lose ${(curLbs - maxLbs).toFixed(1)} lbs for normal`;
      } else {
        bmiResDiff.textContent = "Optimal healthy weight";
      }
    }
  }

  if (bmiResStatus) bmiResStatus.textContent = status;
  if (bmiResPrime) bmiResPrime.textContent = bmiPrime.toFixed(2);

  // Position visual gauge pointer (clamped between 16 and 40)
  if (bmiGaugePointer) {
    const clampedBmi = Math.min(40, Math.max(16, bmi));
    const pointerPercent = ((clampedBmi - 16) / (40 - 16)) * 100;
    bmiGaugePointer.style.left = `${pointerPercent.toFixed(1)}%`;
  }
}

if (bmiCalcBtn) bmiCalcBtn.addEventListener("click", runBmiCalculation);
[bmiHeightCmInput, bmiHeightFtInput, bmiHeightInInput, bmiWeightKgInput, bmiWeightLbsInput].forEach((input) => {
  if (input) input.addEventListener("input", runBmiCalculation);
});

// Initialize BMI Calculation
runBmiCalculation();

// One-Click Clipboard Copying with Toast Notification
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
})();
