const display = document.querySelector("#show");
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
    return;
  }

  if (value === "Del") {
    if (isEvaluated || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      currentInput = "";
      isEvaluated = false;
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    display.value = currentInput;
    return;
  }

  if (value === "=") {
    if (!currentInput || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      return;
    }
    const result = calculateResult(currentInput);
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
