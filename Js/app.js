// Estado de la calculadora
const state = {
  current: "0",
  previous: null,
  operator: null,
  justCalculated: false
};

// Elementos
const outputEl = document.getElementById("output");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

// Utilidades
const nf = new Intl.NumberFormat("es-CO");

function formatNumber(str) {
  if (str === "Error") return str;
  if (!str || str === ".") return "0.";
  const [intPart, decPart] = str.split(".");
  const intFormatted = nf.format(parseInt(intPart || "0", 10));
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

function sanitize(str) {
  // Limpia ceros a la izquierda adecuadamente
  if (str.includes(".")) {
    // Mantener los decimales tal cual para no perder precisión visual
    return str.replace(/^(-?)0+(?=\d)/, "$1");
  }
  return String(parseFloat(str)).replace(/NaN/, "0");
}

function updateDisplay() {
  outputEl.textContent = formatNumber(state.current);
  const op = state.operator || "";
  const prev = state.previous !== null ? formatNumber(state.previous) : "";
  historyEl.textContent = prev && op ? `${prev} ${op}` : "";
}

// Operaciones básicas
function compute(aStr, op, bStr) {
  const a = parseFloat(aStr);
  const b = parseFloat(bStr);
  if (!isFinite(a) || !isFinite(b)) return "0";

  let result;
  switch (op) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? NaN : a / b; break;
    default: return bStr;
  }
  if (!isFinite(result)) return "Error";
  // Limita ruido flotante
  const asStr = String(+parseFloat(result.toFixed(12)));
  return asStr;
}

// Acciones
function inputNumber(digit) {
  if (state.justCalculated) {
    state.current = digit;
    state.justCalculated = false;
  } else if (state.current === "0") {
    state.current = digit;
  } else {
    state.current += digit;
  }
  state.current = sanitize(state.current);
}

function inputDecimal() {
  if (state.justCalculated) {
    state.current = "0.";
    state.justCalculated = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function setOperator(op) {
  if (state.operator && state.previous !== null && !state.justCalculated) {
    // Encadenar operaciones al estilo calculadora
    state.previous = compute(state.previous, state.operator, state.current);
    state.current = "0";
  } else if (state.previous === null) {
    state.previous = state.current;
    state.current = "0";
  }
  state.operator = op;
  state.justCalculated = false;
}

function equals() {
  if (state.operator && state.previous !== null) {
    const result = compute(state.previous, state.operator, state.current);
    state.current = result;
    state.previous = null;
    state.operator = null;
    state.justCalculated = true;
  }
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.justCalculated = false;
}

function deleteOne() {
  if (state.justCalculated) {
    // Tras un cálculo, DEL actúa como clear parcial
    state.justCalculated = false;
    state.current = "0";
    return;
  }
  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
    state.current = "0";
  } else {
    state.current = state.current.slice(0, -1);
  }
}

function invertSign() {
  if (state.current === "0") return;
  state.current = state.current.startsWith("-") ? state.current.slice(1) : "-" + state.current;
}

function percent() {
  const n = parseFloat(state.current);
  if (!isFinite(n)) return;
  state.current = String(n / 100);
}

// Eventos UI
keys.addEventListener("pointermove", (e) => {
  if (!(e.target instanceof HTMLElement)) return;
  if (!e.target.classList.contains("btn")) return;
  const rect = e.target.getBoundingClientRect();
  e.target.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.target.style.setProperty("--y", `${e.clientY - rect.top}px`);
});

keys.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const num = target.getAttribute("data-number");
  const op = target.getAttribute("data-operator");
  const action = target.getAttribute("data-action");

  if (num !== null) {
    inputNumber(num);
  } else if (op !== null) {
    if (op === "%") percent();
    else setOperator(op);
  } else if (action) {
    switch (action) {
      case "decimal": inputDecimal(); break;
      case "equals": equals(); break;
      case "clear": clearAll(); break;
      case "delete": deleteOne(); break;
      case "invert": invertSign(); break;
    }
  }
  updateDisplay();
});

// Soporte de teclado
window.addEventListener("keydown", (e) => {
  const { key } = e;

  if ((key >= "0" && key <= "9")) {
    inputNumber(key);
  } else if (key === "." || key === ",") {
    inputDecimal();
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    setOperator(map[key]);
    e.preventDefault();
  } else if (key === "Enter" || key === "=") {
    equals();
    e.preventDefault();
  } else if (key === "Backspace") {
    deleteOne();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    percent();
  }
  updateDisplay();
});

// Init
updateDisplay();
