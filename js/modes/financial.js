/**
 * CountUp - Financial & Business Calculator Engine
 * Loan EMI, SIP wealth projection, Compound Interest (FD & RD with multi-frequency compounding), and GST tax calculators.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.modes = window.CountUp.modes || {};

// Financial Calculator Engine
const finTabBtns = document.querySelectorAll(".fin-tab-btn");
const finSubPanels = document.querySelectorAll(".fin-subtab-panel");

function switchFinTab(tabKey) {
  finTabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.subtab === tabKey);
  });
  finSubPanels.forEach((panel) => {
    panel.classList.toggle("active-subtab", panel.id === `fin-subtab-${tabKey}`);
  });
}

if (finTabBtns) {
  finTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchFinTab(btn.dataset.subtab));
  });
}

function formatCurrency(val) {
  if (isNaN(val) || !isFinite(val)) return "₹0.00";
  return (
    "₹" +
    Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// 1. EMI Calculation
const emiPrincipalInput = document.querySelector("#emi-principal");
const emiRateInput = document.querySelector("#emi-rate");
const emiTenureInput = document.querySelector("#emi-tenure");
const emiCalcBtn = document.querySelector("#emi-calc-btn");
const emiMonthlyEl = document.querySelector("#emi-res-monthly");
const emiPrincipalEl = document.querySelector("#emi-res-principal");
const emiInterestEl = document.querySelector("#emi-res-interest");
const emiTotalEl = document.querySelector("#emi-res-total");

function calculateEMI() {
  const P = parseFloat(emiPrincipalInput?.value) || 0;
  const annualRate = parseFloat(emiRateInput?.value) || 0;
  const years = parseFloat(emiTenureInput?.value) || 0;

  if (P <= 0 || years <= 0) {
    if (emiMonthlyEl) emiMonthlyEl.textContent = "₹0.00";
    if (emiPrincipalEl) emiPrincipalEl.textContent = formatCurrency(P);
    if (emiInterestEl) emiInterestEl.textContent = "₹0.00";
    if (emiTotalEl) emiTotalEl.textContent = formatCurrency(P);
    return;
  }

  const n = years * 12;
  let emi = 0;
  let total = 0;
  let interest = 0;

  if (annualRate === 0) {
    emi = P / n;
    total = P;
    interest = 0;
  } else {
    const r = annualRate / 12 / 100;
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    total = emi * n;
    interest = total - P;
  }

  if (emiMonthlyEl) emiMonthlyEl.textContent = formatCurrency(emi);
  if (emiPrincipalEl) emiPrincipalEl.textContent = formatCurrency(P);
  if (emiInterestEl) emiInterestEl.textContent = formatCurrency(interest);
  if (emiTotalEl) emiTotalEl.textContent = formatCurrency(total);
}

if (emiCalcBtn) emiCalcBtn.addEventListener("click", calculateEMI);
[emiPrincipalInput, emiRateInput, emiTenureInput].forEach((input) => {
  input?.addEventListener("input", calculateEMI);
});

// 2. SIP Calculation
const sipMonthlyInput = document.querySelector("#sip-monthly");
const sipRateInput = document.querySelector("#sip-rate");
const sipYearsInput = document.querySelector("#sip-years");
const sipCalcBtn = document.querySelector("#sip-calc-btn");
const sipMaturityEl = document.querySelector("#sip-res-maturity");
const sipInvestedEl = document.querySelector("#sip-res-invested");
const sipReturnsEl = document.querySelector("#sip-res-returns");

function calculateSIP() {
  const monthly = parseFloat(sipMonthlyInput?.value) || 0;
  const annualReturn = parseFloat(sipRateInput?.value) || 0;
  const years = parseFloat(sipYearsInput?.value) || 0;

  if (monthly <= 0 || years <= 0) {
    if (sipMaturityEl) sipMaturityEl.textContent = "₹0.00";
    if (sipInvestedEl) sipInvestedEl.textContent = "₹0.00";
    if (sipReturnsEl) sipReturnsEl.textContent = "₹0.00";
    return;
  }

  const n = years * 12;
  const invested = monthly * n;
  let maturity = invested;

  if (annualReturn > 0) {
    const i = annualReturn / 12 / 100;
    maturity = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  const returns = maturity - invested;

  if (sipMaturityEl) sipMaturityEl.textContent = formatCurrency(maturity);
  if (sipInvestedEl) sipInvestedEl.textContent = formatCurrency(invested);
  if (sipReturnsEl) sipReturnsEl.textContent = formatCurrency(returns);
}

if (sipCalcBtn) sipCalcBtn.addEventListener("click", calculateSIP);
[sipMonthlyInput, sipRateInput, sipYearsInput].forEach((input) => {
  input?.addEventListener("input", calculateSIP);
});

// 3. Compound Interest (FD/RD) Calculation
const ciTypeFdBtn = document.querySelector("#ci-type-fd");
const ciTypeRdBtn = document.querySelector("#ci-type-rd");
const ciAmountLabel = document.querySelector("#ci-amount-label");
const ciPrincipalInput = document.querySelector("#ci-principal");
const ciRateInput = document.querySelector("#ci-rate");
const ciRateChips = document.querySelectorAll(".ci-chip-btn");
const ciTenureInput = document.querySelector("#ci-tenure");
const ciFreqBtns = document.querySelectorAll(".ci-freq-btn");
const ciCalcBtn = document.querySelector("#ci-calc-btn");

const ciMaturityEl = document.querySelector("#ci-res-maturity");
const ciDepositLabelEl = document.querySelector("#ci-res-deposit-label");
const ciPrincipalEl = document.querySelector("#ci-res-principal");
const ciInterestEl = document.querySelector("#ci-res-interest");
const ciApyEl = document.querySelector("#ci-res-apy");
const ciGrowthEl = document.querySelector("#ci-res-growth");

let ciDepositType = "fd";
let ciCompoundingFreq = 4;

function calculateCompoundInterest() {
  const amount = parseFloat(ciPrincipalInput?.value) || 0;
  const annualRate = parseFloat(ciRateInput?.value) || 0;
  const years = parseFloat(ciTenureInput?.value) || 0;
  const freq = ciCompoundingFreq || 4;

  if (amount <= 0 || years <= 0) {
    if (ciMaturityEl) ciMaturityEl.textContent = formatCurrency(amount);
    if (ciPrincipalEl) ciPrincipalEl.textContent = formatCurrency(amount);
    if (ciInterestEl) ciInterestEl.textContent = "₹0.00";
    if (ciApyEl) ciApyEl.textContent = "0.00%";
    if (ciGrowthEl) ciGrowthEl.textContent = "+0.00%";
    return;
  }

  const r = annualRate / 100;
  let maturity = 0;
  let totalDeposit = 0;
  let interest = 0;
  let apy = 0;

  if (ciDepositType === "fd") {
    totalDeposit = amount;
    if (annualRate === 0) {
      maturity = amount;
      interest = 0;
      apy = 0;
    } else {
      maturity = amount * Math.pow(1 + r / freq, freq * years);
      interest = maturity - totalDeposit;
      apy = (Math.pow(1 + r / freq, freq) - 1) * 100;
    }
  } else {
    const totalMonths = Math.round(years * 12);
    totalDeposit = amount * totalMonths;
    if (annualRate === 0) {
      maturity = totalDeposit;
      interest = 0;
      apy = 0;
    } else {
      const im = Math.pow(1 + r / freq, freq / 12) - 1;
      maturity = amount * (1 + im) * ((Math.pow(1 + im, totalMonths) - 1) / im);
      interest = maturity - totalDeposit;
      apy = (Math.pow(1 + r / freq, freq) - 1) * 100;
    }
  }

  const growthPct = totalDeposit > 0 ? (interest / totalDeposit) * 100 : 0;

  if (ciMaturityEl) ciMaturityEl.textContent = formatCurrency(maturity);
  if (ciPrincipalEl) ciPrincipalEl.textContent = formatCurrency(totalDeposit);
  if (ciInterestEl) ciInterestEl.textContent = formatCurrency(interest);
  if (ciApyEl) ciApyEl.textContent = (isFinite(apy) ? apy.toFixed(2) : "0.00") + "%";
  if (ciGrowthEl) {
    const sign = growthPct >= 0 ? "+" : "";
    ciGrowthEl.textContent = sign + (isFinite(growthPct) ? growthPct.toFixed(2) : "0.00") + "%";
  }
}

if (ciTypeFdBtn) {
  ciTypeFdBtn.addEventListener("click", () => {
    ciDepositType = "fd";
    ciTypeFdBtn.classList.add("active");
    ciTypeRdBtn?.classList.remove("active");
    if (ciAmountLabel) ciAmountLabel.textContent = "Total Deposit Amount";
    if (ciDepositLabelEl) ciDepositLabelEl.textContent = "Total Principal";
    if (ciPrincipalInput && (ciPrincipalInput.value === "5000" || ciPrincipalInput.value === "1000")) {
      ciPrincipalInput.value = "100000";
    }
    calculateCompoundInterest();
  });
}

if (ciTypeRdBtn) {
  ciTypeRdBtn.addEventListener("click", () => {
    ciDepositType = "rd";
    ciTypeRdBtn.classList.add("active");
    ciTypeFdBtn?.classList.remove("active");
    if (ciAmountLabel) ciAmountLabel.textContent = "Monthly Installment";
    if (ciDepositLabelEl) ciDepositLabelEl.textContent = "Total Invested";
    if (ciPrincipalInput && ciPrincipalInput.value === "100000") {
      ciPrincipalInput.value = "5000";
    }
    calculateCompoundInterest();
  });
}

ciRateChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    ciRateChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    if (ciRateInput) ciRateInput.value = chip.dataset.rate;
    calculateCompoundInterest();
  });
});

if (ciRateInput) {
  ciRateInput.addEventListener("input", () => {
    ciRateChips.forEach((chip) => {
      chip.classList.toggle("active", parseFloat(chip.dataset.rate) === parseFloat(ciRateInput.value));
    });
    calculateCompoundInterest();
  });
}

ciFreqBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    ciFreqBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    ciCompoundingFreq = parseInt(btn.dataset.freq, 10) || 4;
    calculateCompoundInterest();
  });
});

if (ciCalcBtn) ciCalcBtn.addEventListener("click", calculateCompoundInterest);
[ciPrincipalInput, ciTenureInput].forEach((input) => {
  input?.addEventListener("input", calculateCompoundInterest);
});

calculateCompoundInterest();

// 4. GST Calculation
const gstAmountInput = document.querySelector("#gst-amount");
const gstCustomRateInput = document.querySelector("#gst-custom-rate");
const gstSlabBtns = document.querySelectorAll(".gst-slab-btn");
const gstModeAddBtn = document.querySelector("#gst-mode-add");
const gstModeRemoveBtn = document.querySelector("#gst-mode-remove");
const gstNetEl = document.querySelector("#gst-res-net");
const gstTaxEl = document.querySelector("#gst-res-tax");
const gstTotalEl = document.querySelector("#gst-res-total");

let gstMode = "add";

function calculateGST() {
  const amount = parseFloat(gstAmountInput?.value) || 0;
  const rate = parseFloat(gstCustomRateInput?.value) || 0;

  let net = 0;
  let tax = 0;
  let total = 0;

  if (amount <= 0 || rate <= 0) {
    net = amount;
    tax = 0;
    total = amount;
  } else if (gstMode === "add") {
    tax = (amount * rate) / 100;
    total = amount + tax;
    net = amount;
  } else {
    net = amount / (1 + rate / 100);
    tax = amount - net;
    total = amount;
  }

  if (gstNetEl) gstNetEl.textContent = formatCurrency(net);
  if (gstTaxEl) gstTaxEl.textContent = formatCurrency(tax);
  if (gstTotalEl) gstTotalEl.textContent = formatCurrency(total);
}

gstSlabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    gstSlabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (gstCustomRateInput) gstCustomRateInput.value = btn.dataset.rate;
    calculateGST();
  });
});

if (gstCustomRateInput) {
  gstCustomRateInput.addEventListener("input", () => {
    gstSlabBtns.forEach((b) => {
      b.classList.toggle("active", b.dataset.rate === gstCustomRateInput.value);
    });
    calculateGST();
  });
}

if (gstModeAddBtn) {
  gstModeAddBtn.addEventListener("click", () => {
    gstMode = "add";
    gstModeAddBtn.classList.add("active");
    gstModeRemoveBtn.classList.remove("active");
    calculateGST();
  });
}

if (gstModeRemoveBtn) {
  gstModeRemoveBtn.addEventListener("click", () => {
    gstMode = "remove";
    gstModeRemoveBtn.classList.add("active");
    gstModeAddBtn.classList.remove("active");
    calculateGST();
  });
}

if (gstAmountInput) gstAmountInput.addEventListener("input", calculateGST);


  CountUp.modes.financial = {
    switchFinTab,
    calculateEMI,
    calculateSIP,
    calculateCompoundInterest,
    calculateGST,
  };
})();
