const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav]");
const storedTheme =
  window.localStorage.getItem("digifyra-theme") ||
  window.localStorage.getItem("digitory-theme");

if (storedTheme === "dark" || storedTheme === "light") {
  document.body.classList.toggle("theme-dark", storedTheme === "dark");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("is-open");
  });
}

const headerInner = document.querySelector(".site-header__inner");

if (headerInner) {
  const themeToggle = document.createElement("button");
  themeToggle.type = "button";
  themeToggle.className = "theme-toggle";
  themeToggle.setAttribute("aria-label", "Toggle light and dark theme");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  const updateThemeLabel = () => {
    const isDark = document.body.classList.contains("theme-dark");
    themeToggle.textContent = "";
    themeToggle.dataset.theme = isDark ? "dark" : "light";
    themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#020617" : "#2563EB");
    }
  };

  updateThemeLabel();

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("theme-dark");
    window.localStorage.setItem("digifyra-theme", isDark ? "dark" : "light");
    updateThemeLabel();
  });

  if (navMenu) {
    headerInner.insertBefore(themeToggle, navMenu);
  } else {
    headerInner.append(themeToggle);
  }
}

const params = new URLSearchParams(window.location.search);
const selectedTemplate = params.get("template");
const selectedCategory = params.get("category");
const selectedPlan = params.get("plan");
const templateBanner = document.querySelector("#selected-template-banner");
const templateText = document.querySelector("#selected-template-text");

if (selectedTemplate && templateBanner && templateText) {
  templateBanner.hidden = false;
  templateText.textContent = `${selectedTemplate} has been added to your enquiry.`;
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const countdownElements = document.querySelectorAll("[data-countdown]");

countdownElements.forEach((element) => {
  const eventDate = element.dataset.countdown;
  const labels = ["Days", "Hours", "Minutes", "Seconds"];

  const renderCountdown = () => {
    const targetDate = new Date(eventDate);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (Number.isNaN(targetDate.getTime())) {
      element.textContent = "Event date coming soon";
      return;
    }

    if (diff <= 0) {
      element.innerHTML = `
        <div class="countdown__item"><span class="countdown__value">0</span><span>Days</span></div>
        <div class="countdown__item"><span class="countdown__value">0</span><span>Hours</span></div>
        <div class="countdown__item"><span class="countdown__value">0</span><span>Minutes</span></div>
        <div class="countdown__item"><span class="countdown__value">0</span><span>Seconds</span></div>
      `;
      return;
    }

    const units = [
      Math.floor(diff / (1000 * 60 * 60 * 24)),
      Math.floor((diff / (1000 * 60 * 60)) % 24),
      Math.floor((diff / (1000 * 60)) % 60),
      Math.floor((diff / 1000) % 60),
    ];

    element.innerHTML = units
      .map(
        (value, index) => `
          <div class="countdown__item">
            <span class="countdown__value">${value}</span>
            <span>${labels[index]}</span>
          </div>
        `
      )
      .join("");
  };

  renderCountdown();
  window.setInterval(renderCountdown, 1000);
});

document.querySelectorAll("[data-form-intent]").forEach((form) => {
  const categoryField = form.querySelector('[name="service"]');
  const templateField = form.querySelector('[name="template_name"]');
  const planField = form.querySelector('[name="plan"]');
  const detailsField = form.querySelector('[name="details"]');

  if (selectedCategory && categoryField) {
    categoryField.value = selectedCategory;
  }

  if (selectedTemplate && templateField) {
    templateField.value = selectedTemplate;
  }

  if (selectedPlan && planField) {
    const hasMatchingOption = Array.from(planField.options).some(
      (option) => option.value === selectedPlan
    );

    if (hasMatchingOption) {
      planField.value = selectedPlan;
    }
  }

  if (selectedTemplate && detailsField && !detailsField.value.trim()) {
    detailsField.value = `Selected template: ${selectedTemplate}\n`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('input[name="company"]');
    if (honeypot && honeypot.value.trim()) {
      return;
    }

    const name = form.querySelector('[name="name"]')?.value.trim() || "there";
    const email = form.querySelector('[name="email"]')?.value.trim() || "not provided";
    const phone = form.querySelector('[name="phone"]')?.value.trim() || "not provided";
    const service = form.querySelector('[name="service"]')?.value.trim() || "website";
    const templateName = form.querySelector('[name="template_name"]')?.value.trim() || "Not specified";
    const plan = form.querySelector('[name="plan"]')?.value.trim() || "custom";
    const timeline = form.querySelector('[name="timeline"]')?.value.trim() || "Not specified";
    const details = form.querySelector('[name="details"]')?.value.trim() || "No extra details shared.";
    const message = [
      "Hello Digifyra,",
      "",
      "I would like to enquire about a website.",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Category: ${service}`,
      `Template: ${templateName}`,
      `Plan: ${plan}`,
      `Timeline: ${timeline}`,
      `Details: ${details}`,
    ].join("\n");

    const emailTarget = form.dataset.email;
    const subject = form.dataset.subject || "Website Enquiry";

    if (emailTarget) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        emailTarget
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      const mailtoUrl = `mailto:${emailTarget}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(message)}`;

      const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = mailtoUrl;
        return;
      }

      return;
    }
  });
});

const yearNode = document.querySelector("[data-current-year]");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

document.querySelectorAll("[data-quiz-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    const container = button.closest(".game-card");
    const result = container?.querySelector("[data-quiz-result]");
    if (result) {
      result.textContent = button.dataset.quizAnswer || "";
    }
  });
});
