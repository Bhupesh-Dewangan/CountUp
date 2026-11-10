/**
 * CountUp - Unit & Measurement Converter Engine
 * Conversions across 11 domains (Length, Area, Weight, Temperature, Data, Speed, Time, Volume, Pressure, Energy, Currency with customizable baseline rates).
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.modes = window.CountUp.modes || {};

// Unit Converter Engine
const convCatBtns = document.querySelectorAll(".conv-cat-btn");
const convFromInput = document.querySelector("#conv-from-val");
const convToInput = document.querySelector("#conv-to-val");
const convFromSelect = document.querySelector("#conv-from-unit");
const convToSelect = document.querySelector("#conv-to-unit");
const convSwapBtn = document.querySelector("#conv-swap-btn");
const convFormulaVal = document.querySelector("#conv-formula-val");
const convCurrencyRatesCard = document.querySelector("#conv-currency-rates-card");
const convRatesGrid = document.querySelector("#conv-rates-grid");
const convRatesResetBtn = document.querySelector("#conv-rates-reset-btn");

let convActiveCat = "length";

// Baseline Exchange Rates Definition (Base: 1 USD)
const defaultCurrencyRates = {
  USD: { name: "US Dollar", symbol: "$", rate: 1.0 },
  INR: { name: "Indian Rupee", symbol: "₹", rate: 86.5 },
  EUR: { name: "Euro", symbol: "€", rate: 0.92 },
  GBP: { name: "British Pound", symbol: "£", rate: 0.79 },
  JPY: { name: "Japanese Yen", symbol: "¥", rate: 153.2 },
  CAD: { name: "Canadian Dollar", symbol: "CA$", rate: 1.39 },
  AUD: { name: "Australian Dollar", symbol: "AU$", rate: 1.52 },
  AED: { name: "UAE Dirham", symbol: "د.إ", rate: 3.67 },
  CNY: { name: "Chinese Yuan", symbol: "¥", rate: 7.24 },
  CHF: { name: "Swiss Franc", symbol: "Fr", rate: 0.88 },
};

function loadStoredCurrencyRates() {
  try {
    const saved = localStorage.getItem("countup_currency_rates");
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = JSON.parse(JSON.stringify(defaultCurrencyRates));
      Object.keys(parsed).forEach((k) => {
        if (merged[k] && typeof parsed[k].rate === "number" && parsed[k].rate > 0) {
          merged[k].rate = parsed[k].rate;
        }
      });
      return merged;
    }
  } catch (e) {
    // Fallback to defaults
  }
  return JSON.parse(JSON.stringify(defaultCurrencyRates));
}

let activeCurrencyRates = loadStoredCurrencyRates();

function buildCurrencyUnitMap() {
  const units = {};
  Object.keys(activeCurrencyRates).forEach((code) => {
    const curr = activeCurrencyRates[code];
    units[`${code} (${curr.symbol})`] = 1 / curr.rate;
  });
  return units;
}

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
  area: {
    name: "Area",
    defaultFrom: "Square Meter",
    defaultTo: "Square Foot",
    units: {
      "Square Meter": 1,
      "Square Kilometer": 1000000,
      "Square Centimeter": 0.0001,
      "Square Millimeter": 0.000001,
      Hectare: 10000,
      Acre: 4046.8564224,
      "Square Mile": 2589988.110336,
      "Square Yard": 0.83612736,
      "Square Foot": 0.09290304,
      "Square Inch": 0.00064516,
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
      "Foot per second (ft/s)": 0.3048,
    },
  },
  time: {
    name: "Time",
    defaultFrom: "Hour",
    defaultTo: "Minute",
    units: {
      Millisecond: 0.001,
      Second: 1,
      Minute: 60,
      Hour: 3600,
      Day: 86400,
      Week: 604800,
      "Month (30 days)": 2592000,
      "Year (365 days)": 31536000,
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
  pressure: {
    name: "Pressure",
    defaultFrom: "Bar",
    defaultTo: "Pounds per Square Inch (PSI)",
    units: {
      "Pascal (Pa)": 1,
      "Kilopascal (kPa)": 1000,
      "Megapascal (MPa)": 1000000,
      Bar: 100000,
      "Pounds per Square Inch (PSI)": 6894.757293168,
      "Standard Atmosphere (atm)": 101325,
      "Torr (mmHg)": 133.322368,
    },
  },
  energy: {
    name: "Energy",
    defaultFrom: "Kilowatt-hour (kWh)",
    defaultTo: "Joule (J)",
    units: {
      "Joule (J)": 1,
      "Kilojoule (kJ)": 1000,
      "Megajoule (MJ)": 1000000,
      "Calorie (cal)": 4.184,
      "Kilocalorie (kcal)": 4184,
      "Watt-hour (Wh)": 3600,
      "Kilowatt-hour (kWh)": 3600000,
      "Foot-pound (ft-lb)": 1.3558179483314,
      "British Thermal Unit (BTU)": 1055.05585,
    },
  },
  currency: {
    name: "Currency",
    defaultFrom: "USD ($)",
    defaultTo: "INR (₹)",
    units: buildCurrencyUnitMap(),
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
  if (convActiveCat === "currency") {
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(4);
    }
    const dec = Math.abs(num) < 0.01 && num !== 0 ? 4 : 2;
    return parseFloat(num.toFixed(dec)).toString();
  }
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
  } else if (convActiveCat === "currency") {
    const rate = convertUnits(convActiveCat, 1, fromU, toU);
    const rateStr = rate >= 100 ? rate.toFixed(2) : rate.toFixed(4);
    convFormulaVal.textContent = `1 ${fromU} = ${rateStr} ${toU}`;
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

  if (convCurrencyRatesCard) {
    convCurrencyRatesCard.style.display = catKey === "currency" ? "flex" : "none";
  }

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

function renderCurrencyRatesGrid() {
  if (!convRatesGrid) return;
  convRatesGrid.innerHTML = "";

  Object.keys(activeCurrencyRates).forEach((code) => {
    const curr = activeCurrencyRates[code];
    const isBase = code === "USD";

    const itemEl = document.createElement("div");
    itemEl.className = "conv-rate-item";

    const tagEl = document.createElement("div");
    tagEl.className = "conv-rate-tag";
    tagEl.innerHTML = `<span class="conv-rate-code">${code}</span><span class="conv-rate-sym">${curr.symbol}${isBase ? " (Base)" : ""}</span>`;

    const inputEl = document.createElement("input");
    inputEl.type = "number";
    inputEl.className = "conv-rate-input";
    inputEl.value = isBase ? "1.00" : String(curr.rate);
    inputEl.step = isBase ? "0.01" : curr.rate >= 10 ? "0.1" : "0.01";
    inputEl.min = "0.0001";
    if (isBase) {
      inputEl.disabled = true;
      inputEl.style.opacity = "0.6";
    } else {
      inputEl.dataset.curr = code;
      inputEl.addEventListener("input", (e) => {
        const newRate = parseFloat(e.target.value);
        if (!isNaN(newRate) && newRate > 0) {
          activeCurrencyRates[code].rate = newRate;
          try {
            localStorage.setItem("countup_currency_rates", JSON.stringify(activeCurrencyRates));
          } catch (err) {}
          unitDefinitions.currency.units = buildCurrencyUnitMap();
          if (convActiveCat === "currency") {
            syncConversion("forward");
          }
        }
      });
    }

    itemEl.appendChild(tagEl);
    itemEl.appendChild(inputEl);
    convRatesGrid.appendChild(itemEl);
  });
}

if (convRatesResetBtn) {
  convRatesResetBtn.addEventListener("click", () => {
    activeCurrencyRates = JSON.parse(JSON.stringify(defaultCurrencyRates));
    try {
      localStorage.removeItem("countup_currency_rates");
    } catch (err) {}
    unitDefinitions.currency.units = buildCurrencyUnitMap();
    renderCurrencyRatesGrid();
    if (convActiveCat === "currency") {
      syncConversion("forward");
    }
  });
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
renderCurrencyRatesGrid();


  CountUp.modes.converter = {
    unitDefinitions,
    convertUnits,
    populateUnitSelects,
    renderCurrencyRatesGrid,
  };
})();
