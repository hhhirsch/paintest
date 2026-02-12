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

const evidenceRing = document.querySelector(".evidence-ring");
if (evidenceRing) {
  const value = Number(evidenceRing.dataset.value || 83);
  const safeValue = Math.max(0, Math.min(100, value));
  evidenceRing.style.setProperty("--value", safeValue);

  const number = evidenceRing.querySelector(".ring-number");
  if (number) {
    number.textContent = `${safeValue}%`;
  }

  const caption = evidenceRing.querySelector(".ring-caption");
  if (caption && evidenceRing.dataset.caption) {
    caption.textContent = evidenceRing.dataset.caption;
  }
}

const eligibilityButton = document.getElementById("checkEligibility");
const eligibilityResult = document.getElementById("eligibilityResult");

eligibilityButton?.addEventListener("click", () => {
  const checked = document.querySelectorAll('input[name="criteria"]:checked').length;
  if (checked >= 4) {
    eligibilityResult.textContent = "Sie erfüllen viele Kriterien. Sprechen Sie zeitnah mit einem Zentrum über die Testphase.";
    eligibilityResult.style.color = "#35d7c8";
  } else if (checked >= 2) {
    eligibilityResult.textContent = "Es gibt erste Hinweise auf Eignung. Lassen Sie sich individuell beraten.";
    eligibilityResult.style.color = "#f7b172";
  } else {
    eligibilityResult.textContent = "Aktuell ist die Eignung unklar. Besprechen Sie Ihre Optionen mit Ihrer Ärztin/Ihrem Arzt.";
    eligibilityResult.style.color = "#f58ea7";
  }
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
