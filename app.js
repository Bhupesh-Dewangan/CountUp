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

  if (key === "Escape" && navDrawer && !navDrawer.classList.contains("drawer-hidden")) {
    event.preventDefault();
    closeDrawer();
    return;
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

function openDrawer() {
  if (navDrawer && drawerBackdrop) {
    navDrawer.classList.remove("drawer-hidden");
    drawerBackdrop.classList.remove("backdrop-hidden");
  }
}

function closeDrawer() {
  if (navDrawer && drawerBackdrop) {
    navDrawer.classList.add("drawer-hidden");
    drawerBackdrop.classList.add("backdrop-hidden");
  }
}

if (menuToggleBtn) menuToggleBtn.addEventListener("click", openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

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
const sciButtons = document.querySelectorAll("#sci-btn button");

let sciCurrentInput = "";
let sciIsEvaluated = false;
let sciLastAns = "0";
let sciAngleMode = localStorage.getItem("countup_angle_mode") || "DEG";

if (sciAngleModeBtn) {
  sciAngleModeBtn.textContent = sciAngleMode;
  sciAngleModeBtn.addEventListener("click", () => {
    sciAngleMode = sciAngleMode === "DEG" ? "RAD" : "DEG";
    sciAngleModeBtn.textContent = sciAngleMode;
    localStorage.setItem("countup_angle_mode", sciAngleMode);
  });
}

function calculateFactorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
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

  // Trigonometric & logarithmic replacements
  if (angleMode === "DEG") {
    s = s.replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)");
    s = s.replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)");
    s = s.replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");
  } else {
    s = s.replace(/sin\(([^)]+)\)/g, "Math.sin($1)");
    s = s.replace(/cos\(([^)]+)\)/g, "Math.cos($1)");
    s = s.replace(/tan\(([^)]+)\)/g, "Math.tan($1)");
  }

  s = s.replace(/log\(([^)]+)\)/g, "Math.log10($1)");
  s = s.replace(/ln\(([^)]+)\)/g, "Math.log($1)");
  s = s.replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)");

  try {
    const result = new Function(`return (${s})`)();
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
      const funcMatch = sciCurrentInput.match(/(sin\(|cos\(|tan\(|log\(|ln\(|sqrt\()$/);
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

  if (action === "sin" || action === "cos" || action === "tan" || action === "log" || action === "ln" || action === "sqrt") {
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
    if (btn.id === "sci-angle-mode") return;
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
