const topNav = document.getElementById("topNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

function syncTopNavState() {
  const isScrolled = window.scrollY > 20;
  topNav?.classList.toggle("is-scrolled", isScrolled);
}

function closeMobileNav() {
  topNav?.classList.remove("is-open");
  navToggle?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const willOpen = !topNav?.classList.contains("is-open");
  topNav?.classList.toggle("is-open", willOpen);
  navToggle.classList.toggle("is-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

window.addEventListener("scroll", syncTopNavState, { passive: true });
syncTopNavState();

const chartCards = document.querySelectorAll("[data-chart]");

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function configureSharedChartText(chart) {
  const title = chart.querySelector(".chart-title");
  if (title && chart.dataset.title) {
    title.textContent = chart.dataset.title;
  }

  const note = chart.querySelector(".chart-note");
  if (note && chart.dataset.caption) {
    note.textContent = chart.dataset.caption;
  }
}

function configureRingChart(chart) {
  const safeValue = clampPercent(chart.dataset.value || 0);
  const unit = chart.dataset.unit || "%";

  chart.style.setProperty("--value", safeValue);

  const number = chart.querySelector(".chart-number");
  if (number) {
    number.textContent = `${safeValue}${unit}`;
  }
}

function configureBarsChart(chart) {
  const unit = chart.dataset.unit || "%";
  const values = (chart.dataset.values || "")
    .split(",")
    .map((value) => clampPercent(value.trim()))
    .filter((value, index, arr) => index < arr.length);
  const labels = (chart.dataset.labels || "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);

  const barsContainer = chart.querySelector(".chart-bars");
  const legend = chart.querySelector(".chart-legend");

  if (!barsContainer || !legend || !values.length) {
    return;
  }

  barsContainer.innerHTML = "";
  legend.innerHTML = "";

  values.forEach((value, index) => {
    const label = labels[index] || `Kennzahl ${index + 1}`;

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.setProperty("--bar-value", value);
    bar.style.setProperty("--bar-index", index);
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", `${label}: ${value}${unit}`);
    bar.dataset.label = label;
    bar.dataset.value = `${value}${unit}`;
    barsContainer.appendChild(bar);

    const legendItem = document.createElement("li");
    legendItem.className = "chart-legend-item";
    legendItem.innerHTML = `<span class="chart-dot"></span><span>${label}: <strong>${value}${unit}</strong></span>`;
    legend.appendChild(legendItem);
  });
}

chartCards.forEach((chart) => {
  configureSharedChartText(chart);

  if (chart.dataset.chart === "ring") {
    configureRingChart(chart);
  }

  if (chart.dataset.chart === "bars") {
    configureBarsChart(chart);
  }
});

const eligibilityQuestions = [
  { id: "q-duration", text: "Haben Sie seit mehr als 3 Monaten neuropathische Schmerzen?", weight: 1 },
  { id: "q-meds-relief", text: "Bringen Medikamente bislang keine ausreichende Linderung?", weight: 1 },
  { id: "q-side-effects", text: "Belasten Nebenwirkungen der Medikamente Ihren Alltag?", weight: 1 },
  { id: "q-long-term", text: "Wünschen Sie sich eine langfristige, alltagsnahe Lösung?", weight: 1 },
  { id: "q-impairment", text: "Schränken die Schmerzen Schlaf, Bewegung oder Arbeit deutlich ein?", weight: 1 }
];

const startWizardButton = document.getElementById("startWizard");
const wizardStart = document.getElementById("wizardStart");
const wizardStep = document.getElementById("wizardStep");
const wizardProgress = document.getElementById("wizardProgress");
const wizardQuestion = document.getElementById("wizardQuestion");
const answerNoButton = document.getElementById("answerNo");
const answerYesButton = document.getElementById("answerYes");
const wizardBackButton = document.getElementById("wizardBack");
const wizardAnnounce = document.getElementById("wizardAnnounce");
const eligibilityResult = document.getElementById("eligibilityResult");

let currentStep = -1;
const answers = Array(eligibilityQuestions.length).fill(null);

function showStep(stepIndex) {
  if (!wizardStep || !wizardProgress || !wizardQuestion || !wizardBackButton || !wizardAnnounce) {
    return;
  }

  const question = eligibilityQuestions[stepIndex];
  if (!question) {
    return;
  }

  currentStep = stepIndex;
  wizardProgress.textContent = `Frage ${stepIndex + 1} von ${eligibilityQuestions.length}`;
  wizardQuestion.textContent = question.text;
  wizardBackButton.disabled = stepIndex === 0;
  wizardAnnounce.textContent = `${wizardProgress.textContent}. ${question.text}`;
}

function showResult() {
  const score = answers.reduce((sum, answer, index) => {
    if (!answer) {
      return sum;
    }

    return sum + eligibilityQuestions[index].weight;
  }, 0);

  if (!eligibilityResult || !wizardStep || !wizardStart || !startWizardButton) {
    return;
  }

  if (score >= 4) {
    eligibilityResult.textContent = "Sie erfüllen viele Kriterien. Sprechen Sie zeitnah mit einem Zentrum über die Testphase.";
    eligibilityResult.style.color = "#35d7c8";
  } else if (score >= 2) {
    eligibilityResult.textContent = "Es gibt erste Hinweise auf Eignung. Lassen Sie sich individuell beraten.";
    eligibilityResult.style.color = "#f7b172";
  } else {
    eligibilityResult.textContent = "Aktuell ist die Eignung unklar. Besprechen Sie Ihre Optionen mit Ihrer Ärztin/Ihrem Arzt.";
    eligibilityResult.style.color = "#f58ea7";
  }

  wizardStep.hidden = true;
  wizardStart.hidden = false;
  startWizardButton.textContent = "Erneut starten";
  startWizardButton.focus();
}

function handleAnswer(answer) {
  if (currentStep < 0) {
    return;
  }

  answers[currentStep] = answer;

  if (currentStep >= eligibilityQuestions.length - 1) {
    showResult();
    return;
  }

  showStep(currentStep + 1);
}

startWizardButton?.addEventListener("click", () => {
  answers.fill(null);
  currentStep = 0;

  if (wizardStart && wizardStep && eligibilityResult) {
    wizardStart.hidden = true;
    wizardStep.hidden = false;
    eligibilityResult.textContent = "";
  }

  showStep(currentStep);
  answerYesButton?.focus();
});

answerYesButton?.addEventListener("click", () => handleAnswer(true));
answerNoButton?.addEventListener("click", () => handleAnswer(false));

wizardBackButton?.addEventListener("click", () => {
  if (currentStep <= 0) {
    return;
  }

  showStep(currentStep - 1);
});

const centers = [
  { name: "Schmerzzentrum Hamburg", region: "Nord" },
  { name: "Klinik für Neuromodulation Berlin", region: "Ost" },
  { name: "Neurostimulation Köln", region: "West" },
  { name: "Zentrum München Süd", region: "Süd" },
  { name: "Uniklinik Leipzig", region: "Ost" }
];

const citySelect = document.getElementById("citySelect");
const centerList = document.getElementById("centerList");

function renderCenters(region) {
  const filtered = region === "alle" ? centers : centers.filter((c) => c.region === region);
  centerList.innerHTML = filtered
    .map((c) => `<li><strong>${c.name}</strong> – Region ${c.region}</li>`)
    .join("");
}

citySelect?.addEventListener("change", (e) => {
  renderCenters(e.target.value);
});
renderCenters("alle");

const journeyRange = document.getElementById("journeyRange");
const journeyMonth = document.getElementById("journeyMonth");
const opiatesBar = document.getElementById("opiatesBar");
const neuroBar = document.getElementById("neuroBar");
const opiatesInfo = document.getElementById("opiatesInfo");
const neuroInfo = document.getElementById("neuroInfo");

function updateJourney(month) {
  const m = Number(month);
  const opiatesRelief = Math.max(20, 65 - m * 1.5);
  const neuroRelief = Math.min(90, 35 + m * 2.2);

  journeyMonth.textContent = m;
  opiatesBar.style.width = `${opiatesRelief}%`;
  neuroBar.style.width = `${neuroRelief}%`;

  opiatesInfo.textContent = `Schmerzlinderung: ca. ${Math.round(opiatesRelief)}% • Medikamentenbedarf tendenziell höher`;
  neuroInfo.textContent = `Schmerzlinderung: ca. ${Math.round(neuroRelief)}% • häufig geringerer Arzneimittelbedarf`;
}

journeyRange?.addEventListener("input", (e) => updateJourney(e.target.value));
updateJourney(journeyRange?.value ?? 12);

const expertForm = document.getElementById("expertForm");
const expertMessage = document.getElementById("expertMessage");
expertForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  expertMessage.textContent = "Danke! Ihre Frage wurde an unser Expertenteam gesendet.";
  expertMessage.style.color = "#35d7c8";
  expertForm.reset();
});

const consultingForm = document.getElementById("consultingForm");
const consultingMessage = document.getElementById("consultingMessage");
consultingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  consultingMessage.textContent = "Vielen Dank! Wir melden uns zeitnah zur Terminabstimmung.";
  consultingMessage.style.color = "#35d7c8";
  consultingForm.reset();
});


const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }
}
