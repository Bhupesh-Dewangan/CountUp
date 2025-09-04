const display = document.querySelector("#show");
const buttons = document.querySelectorAll("#in-btn button");

let currentInput = "";

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const btnValue = button.textContent;

    if (btnValue === "=") {
      try {
        currentInput = eval(currentInput);
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
      currentInput += btnValue;
      display.value = currentInput;
    }
  });
});
