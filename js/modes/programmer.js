/**
 * CountUp - Programmer / Number Base Calculator Engine
 * Live Quad-Base monitor (HEX, DEC, OCT, BIN), 64-bit BigInt bitwise logic (AND, OR, XOR, NOT, shifts), and word size architecture.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.recall = window.CountUp.recall || {};
  window.CountUp.modes = window.CountUp.modes || {};

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


  // History recall integration
  CountUp.recall.programmer = function(item) {
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
  };

  CountUp.modes.programmer = {
    handleProgInput,
    evaluateProgExpression,
    switchBase,
    getCurrentInput: () => progCurrentInput,
  };
})();
