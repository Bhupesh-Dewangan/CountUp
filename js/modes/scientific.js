/**
 * CountUp - Scientific Calculator Engine
 * Trigonometry (DEG/RAD, 2nd, hyp), logarithms, powers, roots, factorials, permutations, combinations, and parentheses hierarchy.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.recall = window.CountUp.recall || {};
  window.CountUp.modes = window.CountUp.modes || {};

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


  // History recall integration
  CountUp.recall.scientific = function(item) {
    sciCurrentInput = item.result;
    sciLastAns = item.result;
    sciIsEvaluated = true;
    if (sciDisplay) sciDisplay.value = sciCurrentInput;
    if (sciSubDisplay) sciSubDisplay.textContent = `${item.expression} =`;
  };

  CountUp.modes.scientific = {
    handleSciInput,
    evaluateSciExpression,
    getCurrentInput: () => sciCurrentInput,
    reset: () => handleSciInput("C"),
  };
})();
