/**
 * CountUp - Date & Age Calculator Engine
 * Chronological age breakdown, calendar interval calculation (business vs weekend days), and duration addition/subtraction.
 */
(() => {
  "use strict";

  window.CountUp = window.CountUp || {};
  window.CountUp.modes = window.CountUp.modes || {};

// Date & Age Calculator Engine
const dateTabBtns = document.querySelectorAll(".date-tab-btn");
const dateSubtabPanels = document.querySelectorAll(".date-subtab-panel");

// Format Date object to YYYY-MM-DD
function formatDateForInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD string to local Date object
function parseDateString(str) {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Subtab switching
dateTabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    dateTabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const targetSubtab = btn.dataset.datesub;
    dateSubtabPanels.forEach((panel) => {
      panel.classList.toggle("active-subtab", panel.id === `date-subtab-${targetSubtab}`);
    });
  });
});

// Tool 1: Age Calculator
const ageDobInput = document.querySelector("#age-dob");
const ageTargetInput = document.querySelector("#age-target");
const ageCalcBtn = document.querySelector("#age-calc-btn");
const ageResPrimary = document.querySelector("#age-res-primary");
const ageResMonths = document.querySelector("#age-res-months");
const ageResWeeks = document.querySelector("#age-res-weeks");
const ageResDays = document.querySelector("#age-res-days");
const ageResNext = document.querySelector("#age-res-next");

function runAgeCalculation() {
  if (!ageDobInput || !ageTargetInput || !ageResPrimary) return;

  const dob = parseDateString(ageDobInput.value);
  const target = parseDateString(ageTargetInput.value);

  if (!dob || !target) {
    ageResPrimary.textContent = "Please select valid dates";
    return;
  }

  if (dob > target) {
    ageResPrimary.textContent = "Birth date cannot be after target date";
    if (ageResMonths) ageResMonths.textContent = "-";
    if (ageResWeeks) ageResWeeks.textContent = "-";
    if (ageResDays) ageResDays.textContent = "-";
    if (ageResNext) ageResNext.textContent = "-";
    return;
  }

  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const msDiff = target.getTime() - dob.getTime();
  const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remDaysAfterWeeks = totalDays % 7;
  const totalMonths = years * 12 + months;

  // Next birthday calculation
  let nextBdayYear = target.getFullYear();
  let nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate());
  if (nextBday < target) {
    nextBdayYear += 1;
    nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate());
  }

  const msToNext = nextBday.getTime() - target.getTime();
  const daysUntilNext = Math.ceil(msToNext / (1000 * 60 * 60 * 24));
  const dayName = nextBday.toLocaleDateString("en-US", { weekday: "long" });

  ageResPrimary.textContent = `${years} Years, ${months} Months, ${days} Days`;
  if (ageResMonths) ageResMonths.textContent = `${totalMonths.toLocaleString()} Months`;
  if (ageResWeeks) {
    ageResWeeks.textContent = `${totalWeeks.toLocaleString()} Weeks${remDaysAfterWeeks > 0 ? ` + ${remDaysAfterWeeks}d` : ""}`;
  }
  if (ageResDays) ageResDays.textContent = `${totalDays.toLocaleString()} Days`;
  if (ageResNext) {
    ageResNext.textContent = daysUntilNext === 0 ? "Today is birthday!" : `${daysUntilNext} Days (${dayName})`;
  }
}

if (ageCalcBtn) ageCalcBtn.addEventListener("click", runAgeCalculation);
if (ageDobInput) ageDobInput.addEventListener("input", runAgeCalculation);
if (ageTargetInput) ageTargetInput.addEventListener("input", runAgeCalculation);

// Tool 2: Date Difference
const diffStartInput = document.querySelector("#diff-start");
const diffEndInput = document.querySelector("#diff-end");
const diffCalcBtn = document.querySelector("#diff-calc-btn");
const diffResPrimary = document.querySelector("#diff-res-primary");
const diffResDays = document.querySelector("#diff-res-days");
const diffResWeeks = document.querySelector("#diff-res-weeks");
const diffResBusiness = document.querySelector("#diff-res-business");
const diffResWeekends = document.querySelector("#diff-res-weekends");

function runDiffCalculation() {
  if (!diffStartInput || !diffEndInput || !diffResPrimary) return;

  const d1 = parseDateString(diffStartInput.value);
  const d2 = parseDateString(diffEndInput.value);

  if (!d1 || !d2) {
    diffResPrimary.textContent = "Please select valid dates";
    return;
  }

  const isReverse = d1 > d2;
  const start = isReverse ? d2 : d1;
  const end = isReverse ? d1 : d2;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const msDiff = end.getTime() - start.getTime();
  const totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;

  let businessDays = 0;
  let weekendDays = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);

  diffResPrimary.textContent = parts.join(", ") + (isReverse ? " (Past)" : "");
  if (diffResDays) diffResDays.textContent = `${totalDays.toLocaleString()} Days`;
  if (diffResWeeks) diffResWeeks.textContent = `${weeks.toLocaleString()} Weeks, ${remDays} Days`;
  if (diffResBusiness) diffResBusiness.textContent = `${businessDays.toLocaleString()} Days`;
  if (diffResWeekends) diffResWeekends.textContent = `${weekendDays.toLocaleString()} Days`;
}

if (diffCalcBtn) diffCalcBtn.addEventListener("click", runDiffCalculation);
if (diffStartInput) diffStartInput.addEventListener("input", runDiffCalculation);
if (diffEndInput) diffEndInput.addEventListener("input", runDiffCalculation);

// Tool 3: Add / Subtract Duration
const addSubStartInput = document.querySelector("#addsub-start");
const addSubModeAddBtn = document.querySelector("#addsub-mode-add");
const addSubModeSubBtn = document.querySelector("#addsub-mode-sub");
const addSubYearsInput = document.querySelector("#addsub-years");
const addSubMonthsInput = document.querySelector("#addsub-months");
const addSubDaysInput = document.querySelector("#addsub-days");
const addSubCalcBtn = document.querySelector("#addsub-calc-btn");
const addSubResDate = document.querySelector("#addsub-res-date");
const addSubResDayName = document.querySelector("#addsub-res-dayname");

let addSubCurrentOp = "add";

if (addSubModeAddBtn && addSubModeSubBtn) {
  addSubModeAddBtn.addEventListener("click", () => {
    addSubModeAddBtn.classList.add("active");
    addSubModeSubBtn.classList.remove("active");
    addSubCurrentOp = "add";
    runAddSubCalculation();
  });

  addSubModeSubBtn.addEventListener("click", () => {
    addSubModeSubBtn.classList.add("active");
    addSubModeAddBtn.classList.remove("active");
    addSubCurrentOp = "sub";
    runAddSubCalculation();
  });
}

function runAddSubCalculation() {
  if (!addSubStartInput || !addSubResDate) return;

  const start = parseDateString(addSubStartInput.value);
  if (!start) {
    addSubResDate.textContent = "Please select a start date";
    if (addSubResDayName) addSubResDayName.textContent = "-";
    return;
  }

  const years = Math.max(0, parseInt(addSubYearsInput?.value, 10) || 0);
  const months = Math.max(0, parseInt(addSubMonthsInput?.value, 10) || 0);
  const days = Math.max(0, parseInt(addSubDaysInput?.value, 10) || 0);

  const sign = addSubCurrentOp === "add" ? 1 : -1;
  const targetYear = start.getFullYear() + sign * years;
  const targetMonth = start.getMonth() + sign * months;

  const temp = new Date(targetYear, targetMonth, 1);
  const maxDays = new Date(temp.getFullYear(), temp.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(start.getDate(), maxDays);

  const res = new Date(temp.getFullYear(), temp.getMonth(), clampedDay);
  res.setDate(res.getDate() + sign * days);

  const formattedDate = res.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const dayName = res.toLocaleDateString("en-US", { weekday: "long" });

  addSubResDate.textContent = formattedDate;
  if (addSubResDayName) addSubResDayName.textContent = dayName;
}

if (addSubCalcBtn) addSubCalcBtn.addEventListener("click", runAddSubCalculation);
if (addSubStartInput) addSubStartInput.addEventListener("input", runAddSubCalculation);
if (addSubYearsInput) addSubYearsInput.addEventListener("input", runAddSubCalculation);
if (addSubMonthsInput) addSubMonthsInput.addEventListener("input", runAddSubCalculation);
if (addSubDaysInput) addSubDaysInput.addEventListener("input", runAddSubCalculation);

// Set default dates on load
const now = new Date();
const todayStr = formatDateForInput(now);

if (ageDobInput && !ageDobInput.value) ageDobInput.value = "2000-01-01";
if (ageTargetInput && !ageTargetInput.value) ageTargetInput.value = todayStr;

if (diffStartInput && !diffStartInput.value) diffStartInput.value = todayStr;
if (diffEndInput && !diffEndInput.value) {
  const plus30d = new Date();
  plus30d.setDate(plus30d.getDate() + 30);
  diffEndInput.value = formatDateForInput(plus30d);
}

if (addSubStartInput && !addSubStartInput.value) addSubStartInput.value = todayStr;

// Initialize calculations
runAgeCalculation();
runDiffCalculation();
runAddSubCalculation();


  CountUp.modes.dateCalc = {
    runAgeCalculation,
    runDiffCalculation,
    runAddSubCalculation,
    formatDateForInput,
    parseDateString,
  };
})();
