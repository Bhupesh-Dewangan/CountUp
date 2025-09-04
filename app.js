const display = document.querySelector("#show");
const buttons = document.querySelectorAll("#in-btn button");

let currentInput = "";

function isOperator(char) {
  return ["+", "-", "*", "/"].includes(char);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const btnValue = button.textContent;

    if (btnValue === "=") {
      try {
        currentInput = Function("return " + currentInput)().toString();
      } catch (error) {
        currentInput = "Error";
      }
      display.value = currentInput;
    } 
    else if (btnValue === "Reset") {
      currentInput = "";
      display.value = "";
    } 
    else if (btnValue === "Del") {
      currentInput = currentInput.slice(0, -1);
      display.value = currentInput;
    } 
    else {
      // Prevent multiple operators in a row
      if (isOperator(btnValue) && isOperator(currentInput.slice(-1))) {
        return;
      }
      // Prevent multiple decimals in one number
      if (btnValue === "." && /\.\d*$/.test(currentInput)) {
        return;
      }

      currentInput += btnValue;
      display.value = currentInput;
    }
  });
});
