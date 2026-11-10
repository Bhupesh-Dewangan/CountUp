/**
 * CountUp - Health & Fitness (BMI) Calculator Engine
 * Metric/Imperial body mass index calculation, WHO category classification, animated gauge needle meter, and target weight intervals.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.modes = window.CountUp.modes || {};

// Health & Fitness (BMI) Calculator Engine
const bmiUnitMetricBtn = document.querySelector("#bmi-unit-metric");
const bmiUnitImperialBtn = document.querySelector("#bmi-unit-imperial");
const bmiMetricHeightWrap = document.querySelector("#bmi-metric-height-wrap");
const bmiImperialHeightWrap = document.querySelector("#bmi-imperial-height-wrap");
const bmiMetricWeightWrap = document.querySelector("#bmi-metric-weight-wrap");
const bmiImperialWeightWrap = document.querySelector("#bmi-imperial-weight-wrap");

const bmiHeightCmInput = document.querySelector("#bmi-height-cm");
const bmiHeightFtInput = document.querySelector("#bmi-height-ft");
const bmiHeightInInput = document.querySelector("#bmi-height-in");
const bmiWeightKgInput = document.querySelector("#bmi-weight-kg");
const bmiWeightLbsInput = document.querySelector("#bmi-weight-lbs");
const bmiCalcBtn = document.querySelector("#bmi-calc-btn");

const bmiResScore = document.querySelector("#bmi-res-score");
const bmiResBadge = document.querySelector("#bmi-res-badge");
const bmiGaugePointer = document.querySelector("#bmi-gauge-pointer");
const bmiResIdeal = document.querySelector("#bmi-res-ideal");
const bmiResStatus = document.querySelector("#bmi-res-status");
const bmiResDiff = document.querySelector("#bmi-res-diff");
const bmiResPrime = document.querySelector("#bmi-res-prime");

let bmiCurrentUnit = "metric";

function setBmiUnit(unit) {
  if (unit === bmiCurrentUnit) return;

  if (unit === "imperial") {
    // Convert current Metric values to Imperial
    const cm = parseFloat(bmiHeightCmInput?.value) || 175;
    const kg = parseFloat(bmiWeightKgInput?.value) || 70;

    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const lbs = Math.round(kg * 2.20462 * 10) / 10;

    if (bmiHeightFtInput) bmiHeightFtInput.value = feet;
    if (bmiHeightInInput) bmiHeightInInput.value = inches;
    if (bmiWeightLbsInput) bmiWeightLbsInput.value = lbs;

    if (bmiMetricHeightWrap) bmiMetricHeightWrap.style.display = "none";
    if (bmiImperialHeightWrap) bmiImperialHeightWrap.style.display = "flex";
    if (bmiMetricWeightWrap) bmiMetricWeightWrap.style.display = "none";
    if (bmiImperialWeightWrap) bmiImperialWeightWrap.style.display = "flex";

    if (bmiUnitMetricBtn) bmiUnitMetricBtn.classList.remove("active");
    if (bmiUnitImperialBtn) bmiUnitImperialBtn.classList.add("active");
  } else {
    // Convert current Imperial values to Metric
    const ft = parseFloat(bmiHeightFtInput?.value) || 5;
    const inch = parseFloat(bmiHeightInInput?.value) || 9;
    const lbs = parseFloat(bmiWeightLbsInput?.value) || 154;

    const totalInches = ft * 12 + inch;
    const cm = Math.round(totalInches * 2.54);
    const kg = Math.round((lbs / 2.20462) * 10) / 10;

    if (bmiHeightCmInput) bmiHeightCmInput.value = cm;
    if (bmiWeightKgInput) bmiWeightKgInput.value = kg;

    if (bmiMetricHeightWrap) bmiMetricHeightWrap.style.display = "flex";
    if (bmiImperialHeightWrap) bmiImperialHeightWrap.style.display = "none";
    if (bmiMetricWeightWrap) bmiMetricWeightWrap.style.display = "flex";
    if (bmiImperialWeightWrap) bmiImperialWeightWrap.style.display = "none";

    if (bmiUnitMetricBtn) bmiUnitMetricBtn.classList.add("active");
    if (bmiUnitImperialBtn) bmiUnitImperialBtn.classList.remove("active");
  }

  bmiCurrentUnit = unit;
  runBmiCalculation();
}

if (bmiUnitMetricBtn) {
  bmiUnitMetricBtn.addEventListener("click", () => setBmiUnit("metric"));
}

if (bmiUnitImperialBtn) {
  bmiUnitImperialBtn.addEventListener("click", () => setBmiUnit("imperial"));
}

function runBmiCalculation() {
  if (!bmiResScore) return;

  let heightMeters = 0;
  let weightKg = 0;

  if (bmiCurrentUnit === "metric") {
    const cm = parseFloat(bmiHeightCmInput?.value) || 0;
    const kg = parseFloat(bmiWeightKgInput?.value) || 0;
    heightMeters = cm / 100;
    weightKg = kg;
  } else {
    const ft = parseFloat(bmiHeightFtInput?.value) || 0;
    const inch = parseFloat(bmiHeightInInput?.value) || 0;
    const lbs = parseFloat(bmiWeightLbsInput?.value) || 0;
    const totalInches = ft * 12 + inch;
    heightMeters = totalInches * 0.0254;
    weightKg = lbs * 0.45359237;
  }

  if (heightMeters <= 0 || weightKg <= 0) {
    bmiResScore.textContent = "-";
    if (bmiResBadge) {
      bmiResBadge.textContent = "Invalid Input";
      bmiResBadge.className = "bmi-category-badge";
    }
    return;
  }

  const bmi = weightKg / (heightMeters * heightMeters);
  const bmiPrime = bmi / 25;

  let category = "";
  let badgeClass = "";
  let status = "";

  if (bmi < 18.5) {
    category = "Underweight";
    badgeClass = "category-under";
    status = "Below normal range";
  } else if (bmi < 25) {
    category = "Normal Weight";
    badgeClass = "category-normal";
    status = "Healthy weight for height";
  } else if (bmi < 30) {
    category = "Overweight";
    badgeClass = "category-over";
    status = "Above normal range";
  } else {
    category = "Obese";
    badgeClass = "category-obese";
    status = "Significantly above normal";
  }

  bmiResScore.textContent = bmi.toFixed(1);
  if (bmiResBadge) {
    bmiResBadge.textContent = category;
    bmiResBadge.className = `bmi-category-badge ${badgeClass}`;
  }

  const minNormalKg = 18.5 * (heightMeters * heightMeters);
  const maxNormalKg = 24.9 * (heightMeters * heightMeters);

  if (bmiCurrentUnit === "metric") {
    if (bmiResIdeal) {
      bmiResIdeal.textContent = `${minNormalKg.toFixed(1)} kg - ${maxNormalKg.toFixed(1)} kg`;
    }
    if (bmiResDiff) {
      if (weightKg < minNormalKg) {
        bmiResDiff.textContent = `Gain ${(minNormalKg - weightKg).toFixed(1)} kg for normal`;
      } else if (weightKg > maxNormalKg) {
        bmiResDiff.textContent = `Lose ${(weightKg - maxNormalKg).toFixed(1)} kg for normal`;
      } else {
        bmiResDiff.textContent = "Optimal healthy weight";
      }
    }
  } else {
    const minLbs = minNormalKg * 2.20462;
    const maxLbs = maxNormalKg * 2.20462;
    const curLbs = parseFloat(bmiWeightLbsInput?.value) || weightKg * 2.20462;

    if (bmiResIdeal) {
      bmiResIdeal.textContent = `${minLbs.toFixed(1)} lbs - ${maxLbs.toFixed(1)} lbs`;
    }
    if (bmiResDiff) {
      if (curLbs < minLbs) {
        bmiResDiff.textContent = `Gain ${(minLbs - curLbs).toFixed(1)} lbs for normal`;
      } else if (curLbs > maxLbs) {
        bmiResDiff.textContent = `Lose ${(curLbs - maxLbs).toFixed(1)} lbs for normal`;
      } else {
        bmiResDiff.textContent = "Optimal healthy weight";
      }
    }
  }

  if (bmiResStatus) bmiResStatus.textContent = status;
  if (bmiResPrime) bmiResPrime.textContent = bmiPrime.toFixed(2);

  // Position visual gauge pointer (clamped between 16 and 40)
  if (bmiGaugePointer) {
    const clampedBmi = Math.min(40, Math.max(16, bmi));
    const pointerPercent = ((clampedBmi - 16) / (40 - 16)) * 100;
    bmiGaugePointer.style.left = `${pointerPercent.toFixed(1)}%`;
  }
}

if (bmiCalcBtn) bmiCalcBtn.addEventListener("click", runBmiCalculation);
[bmiHeightCmInput, bmiHeightFtInput, bmiHeightInInput, bmiWeightKgInput, bmiWeightLbsInput].forEach((input) => {
  if (input) input.addEventListener("input", runBmiCalculation);
});

// Initialize BMI Calculation
runBmiCalculation();


  CountUp.modes.bmi = {
    runBmiCalculation,
    setBmiUnit,
  };
})();
