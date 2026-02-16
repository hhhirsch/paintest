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
const eligibilityCta = document.getElementById("eligibilityCta");
const wizardTransition = document.getElementById("wizardTransition");
const wizardTransitionPulse = wizardTransition?.querySelector(".nerve-transition__pulse");
const wizardMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentStep = -1;
let isWizardTransitioning = false;
let queuedStep = null;
let queuedFocusTarget = null;
const answers = Array(eligibilityQuestions.length).fill(null);

function setWizardControlsDisabled(disabled) {
  answerNoButton?.toggleAttribute("disabled", disabled);
  answerYesButton?.toggleAttribute("disabled", disabled);
  wizardBackButton?.toggleAttribute("disabled", disabled || currentStep <= 0);
}

function updateAnswerSelection(stepIndex) {
  const answer = answers[stepIndex];
  answerNoButton?.classList.toggle("is-selected", answer === false);
  answerYesButton?.classList.toggle("is-selected", answer === true);
}

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
  updateAnswerSelection(stepIndex);
}

function runQueuedStep() {
  if (queuedStep === null) {
    return;
  }

  const nextStep = queuedStep;
  const focusTarget = queuedFocusTarget;
  queuedStep = null;
  queuedFocusTarget = null;
  transitionToStep(nextStep, focusTarget);
}

function transitionToStep(stepIndex, focusTarget = null) {
  const question = eligibilityQuestions[stepIndex];
  if (!question) {
    return;
  }

  if (isWizardTransitioning) {
    queuedStep = stepIndex;
    queuedFocusTarget = focusTarget;
    return;
  }

  if (wizardMotionPreference.matches || !wizardTransition || !wizardTransitionPulse) {
    showStep(stepIndex);
    focusTarget?.focus();
    return;
  }

  isWizardTransitioning = true;
  setWizardControlsDisabled(true);
  wizardTransition.hidden = false;
  wizardTransition.classList.remove("is-active");
  void wizardTransition.offsetWidth;

  const completeTransition = () => {
    wizardTransition.classList.remove("is-active");
    wizardTransition.hidden = true;
    showStep(stepIndex);
    setWizardControlsDisabled(false);
    isWizardTransitioning = false;
    focusTarget?.focus();
    runQueuedStep();
  };

  wizardTransitionPulse.addEventListener("animationend", completeTransition, { once: true });
  wizardTransition.classList.add("is-active");
}

function renderEligibilityCta(variant) {
  if (!eligibilityCta) {
    return;
  }

  const ctaByVariant = {
    high: `
      <p class="result-cta__copy">Nächster Schritt: Vereinbaren Sie einen Termin zur strukturierten Abklärung.</p>
      <div class="result-cta__actions">
        <a href="#zentren" class="btn btn--primary">Passendes Zentrum finden</a>
        <a href="#beratung" class="btn btn--secondary">Beratung & Termin anfragen</a>
      </div>
    `,
    medium: `
      <p class="result-cta__copy">Ein beratendes Gespräch kann helfen, Ihren individuellen Nutzen realistisch einzuordnen.</p>
      <div class="result-cta__actions">
        <a href="#beratung" class="btn btn--secondary">Beratungsgespräch vereinbaren</a>
      </div>
    `,
    low: `
      <p class="result-cta__copy">Empfehlung: Besprechen Sie Ihre Beschwerden in Ruhe mit Ihrer Ärztin oder Ihrem Arzt, bevor Sie weitere Schritte planen.</p>
    `
  };

  eligibilityCta.innerHTML = ctaByVariant[variant] || "";
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
    eligibilityResult.textContent = "Ihre Selbsteinschätzung: hohe Eignung. Sie erfüllen viele Kriterien für ein vertiefendes Gespräch zur Neurostimulation.";
    eligibilityResult.style.color = "#35d7c8";
    renderEligibilityCta("high");
  } else if (score >= 2) {
    eligibilityResult.textContent = "Ihre Selbsteinschätzung: mögliche Eignung. Es gibt erste Hinweise, die in einer Beratung individuell eingeordnet werden sollten.";
    eligibilityResult.style.color = "#f7b172";
    renderEligibilityCta("medium");
  } else {
    eligibilityResult.textContent = "Ihre Selbsteinschätzung: unklare Eignung. Eine ärztliche Rücksprache hilft, passende nächste Schritte ohne Zeitdruck zu planen.";
    eligibilityResult.style.color = "#f58ea7";
    renderEligibilityCta("low");
  }

  wizardStep.hidden = true;
  wizardStart.hidden = false;
  wizardTransition?.classList.remove("is-active");
  if (wizardTransition) {
    wizardTransition.hidden = true;
  }
  isWizardTransitioning = false;
  queuedStep = null;
  queuedFocusTarget = null;
  startWizardButton.textContent = "Erneut starten";
  startWizardButton.focus();
}

function handleAnswer(answer) {
  if (currentStep < 0 || isWizardTransitioning) {
    return;
  }

  answers[currentStep] = answer;
  updateAnswerSelection(currentStep);

  if (currentStep >= eligibilityQuestions.length - 1) {
    showResult();
    return;
  }

  transitionToStep(currentStep + 1, answerYesButton);
}

function startWizard() {
  if (isWizardTransitioning) {
    return;
  }

  answers.fill(null);
  currentStep = 0;
  updateAnswerSelection(currentStep);

  if (wizardStart && wizardStep && eligibilityResult) {
    wizardStart.hidden = true;
    wizardStep.hidden = false;
    eligibilityResult.textContent = "";
    if (eligibilityCta) {
      eligibilityCta.innerHTML = "";
    }
  }

  transitionToStep(currentStep, wizardQuestion);
}

startWizardButton?.addEventListener("click", startWizard);

answerYesButton?.addEventListener("click", () => handleAnswer(true));
answerNoButton?.addEventListener("click", () => handleAnswer(false));

wizardBackButton?.addEventListener("click", () => {
  if (currentStep <= 0 || isWizardTransitioning) {
    return;
  }

  transitionToStep(currentStep - 1, answerYesButton);
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
  
  const nameInput = document.getElementById("expertName");
  const questionInput = document.getElementById("expertQuestion");
  
  // Validierung
  if (!nameInput?.value.trim()) {
    nameInput?.setAttribute("aria-invalid", "true");
    expertMessage.textContent = "Bitte geben Sie Ihren Namen ein.";
    expertMessage.setAttribute("role", "alert");
    expertMessage.classList.remove("success");
    expertMessage.classList.add("error");
    nameInput?.focus();
    return;
  }
  
  if (!questionInput?.value.trim() || questionInput.value.trim().length < 10) {
    questionInput?.setAttribute("aria-invalid", "true");
    expertMessage.textContent = "Bitte beschreiben Sie Ihre Frage ausführlicher (mind. 10 Zeichen).";
    expertMessage.setAttribute("role", "alert");
    expertMessage.classList.remove("success");
    expertMessage.classList.add("error");
    questionInput?.focus();
    return;
  }
  
  // Erfolg
  nameInput?.removeAttribute("aria-invalid");
  questionInput?.removeAttribute("aria-invalid");
  expertMessage.textContent = "✓ Ihre Frage wurde übermittelt. Wir melden uns in Kürze.";
  expertMessage.classList.add("success");
  expertMessage.classList.remove("error");
  expertForm.reset();
});

const consultingForm = document.getElementById("consultingForm");
const consultingMessage = document.getElementById("consultingMessage");
consultingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  
  const nameInput = document.getElementById("consultingName");
  const emailInput = document.getElementById("consultingEmail");
  
  // Validierung
  if (!nameInput?.value.trim()) {
    nameInput?.setAttribute("aria-invalid", "true");
    consultingMessage.textContent = "Bitte geben Sie Ihren Namen ein.";
    consultingMessage.setAttribute("role", "alert");
    consultingMessage.classList.remove("success");
    consultingMessage.classList.add("error");
    nameInput?.focus();
    return;
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput?.value.trim() || !emailPattern.test(emailInput.value.trim())) {
    emailInput?.setAttribute("aria-invalid", "true");
    consultingMessage.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    consultingMessage.setAttribute("role", "alert");
    consultingMessage.classList.remove("success");
    consultingMessage.classList.add("error");
    emailInput?.focus();
    return;
  }
  
  // Erfolg
  nameInput?.removeAttribute("aria-invalid");
  emailInput?.removeAttribute("aria-invalid");
  consultingMessage.textContent = "✓ Vielen Dank! Wir melden uns zeitnah zur Terminabstimmung.";
  consultingMessage.classList.add("success");
  consultingMessage.classList.remove("error");
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

// Cookie-Banner Management
const cookieBanner = document.getElementById("cookieBanner");
const acceptBtn = document.getElementById("acceptCookies");
const declineBtn = document.getElementById("declineCookies");

// Banner anzeigen wenn noch keine Präferenz gesetzt
if (!localStorage.getItem("cookieConsent")) {
  cookieBanner?.removeAttribute("hidden");
}

acceptBtn?.addEventListener("click", () => {
  localStorage.setItem("cookieConsent", "all");
  cookieBanner?.setAttribute("hidden", "");
});

declineBtn?.addEventListener("click", () => {
  localStorage.setItem("cookieConsent", "necessary");
  cookieBanner?.setAttribute("hidden", "");
});
