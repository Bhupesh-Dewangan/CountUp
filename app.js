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

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    if (themeIcon) themeIcon.textContent = "☀️";
    if (themeToggleBtn) themeToggleBtn.setAttribute("aria-label", "Switch to light theme");
  } else {
    document.body.classList.remove("dark-theme");
    if (themeIcon) themeIcon.textContent = "🌙";
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
