// Estado de la calculadora
let current = "0";
let previous = "";
let operation = null;
let justComputed = false;

const currentEl = document.getElementById("currentOperand");
const previousEl = document.getElementById("previousOperand");
const container = document.querySelector(".keys");

function updateDisplay() {
  currentEl.textContent = formatDisplay(current);
  previousEl.textContent = previous && operation ? `${formatDisplay(previous)} ${operation}` : "";
}

function formatDisplay(value) {
  if (value === "Error") return "Error";
  if (value === "" || value === "-") return value || "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return "Error";
  const parts = value.split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  const intFormatted = Number(intPart).toLocaleString("es-CO");
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

function clearAll() {
  current = "0";
  previous = "";
  operation = null;
  justComputed = false;
  updateDisplay();
}

function deleteOne() {
  if (justComputed) {
    // Si recién calculamos, borrar vuelve a 0
    current = "0";
    justComputed = false;
    updateDisplay();
    return;
  }
  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

function appendNumber(num) {
  if (justComputed) {
    current = num;
    justComputed = false;
    updateDisplay();
    return;
  }
  if (current === "0") {
    current = num;
  } else {
    current += num;
  }
  updateDisplay();
}

function appendDecimal() {
  if (justComputed) {
    current = "0.";
    justComputed = false;
    updateDisplay();
    return;
  }
  if (!current.includes(".")) {
    current += current === "" ? "0." : ".";
    updateDisplay();
  }
}

function chooseOperation(op) {
  // Permite cambiar de operación antes de escribir el siguiente número
  if (previous && !justComputed && current === "0") {
    operation = op;
    updateDisplay();
    return;
  }

  if (operation && previous !== "" && current !== "") {
    compute();
  }

  operation = op;
  previous = current;
  current = "0";
  justComputed = false;
  updateDisplay();
}

function compute() {
  const a = parseFloat(previous);
  const b = parseFloat(current);
  if (isNaN(a) || isNaN(b)) return;

  let result;
  switch (operation) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷":
      if (b === 0) {
        current = "Error";
        previous = "";
        operation = null;
        justComputed = true;
        updateDisplay();
        return;
      }
      result = a / b; break;
    case "%":
      // Módulo matemático
      result = a % b; break;
    default: return;
  }

  // Redondeo para evitar errores de flotantes
  result = Math.round(result * 1e12) / 1e12;

  current = String(result);
  previous = "";
  operation = null;
  justComputed = true;
  updateDisplay();
}

// Manejo de clicks
container.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  if (action === "number") return appendNumber(btn.dataset.num);
  if (action === "decimal") return appendDecimal();
  if (action === "operation") return chooseOperation(btn.dataset.op);
  if (action === "equals") return compute();
  if (action === "clear") return clearAll();
  if (action === "delete") return deleteOne();
});

// Soporte de teclado
window.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/\d/.test(key)) return appendNumber(key);
  if (key === "." || key === ",") return appendDecimal();

  if (key === "+" ) return chooseOperation("+");
  if (key === "-" ) return chooseOperation("−");
  if (key === "*" ) return chooseOperation("×");
  if (key === "/")  return chooseOperation("÷");
  if (key === "%")  return chooseOperation("%");

  if (key === "Enter" || key === "=") return compute();
  if (key === "Backspace") return deleteOne();
  if (key === "Escape") return clearAll();
});

// Inicializa
updateDisplay();
