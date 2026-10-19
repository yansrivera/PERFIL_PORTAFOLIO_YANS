(function () {
  const navToggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");
  const year = document.getElementById("year");
  const toTop = document.getElementById("toTop");

  if (year) year.textContent = String(new Date().getFullYear());

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!open);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    const target = event.target;
    if (navList && navToggle && !navList.contains(target) && !navToggle.contains(target)) {
      setNavOpen(false);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setNavOpen(false);
      if (id !== "#home") history.replaceState(null, "", id);
    });
  });

  const navLinks = Array.from(document.querySelectorAll(".nav-list a[href^='#']"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const projects = Array.from(document.querySelectorAll(".project"));
  const emptyProjects = document.getElementById("projectsEmpty");

  function applyFilter(filter) {
    let visible = 0;
    projects.forEach((project) => {
      const tags = (project.getAttribute("data-tags") || "").split(/\s+/);
      const show = filter === "todos" || tags.includes(filter);
      project.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (emptyProjects) emptyProjects.hidden = visible !== 0;
    filterButtons.forEach((button) => {
      const active = button.getAttribute("data-filter") === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.getAttribute("data-filter") || "todos");
      const projectsSection = document.getElementById("projects");
      if (button.classList.contains("skill") && projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  function copyText(value) {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    area.setSelectionRange(0, value.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(area);
    if (copied) return Promise.resolve();
    if (navigator.clipboard) return navigator.clipboard.writeText(value);
    return Promise.reject(new Error("copy failed"));
  }

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";
      const original = button.textContent;
      try {
        await copyText(value);
        button.textContent = "Copiado";
      } catch (error) {
        const link = button.parentElement && button.parentElement.querySelector("a");
        if (link) {
          const range = document.createRange();
          range.selectNodeContents(link);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        button.textContent = "Seleccionado";
      }
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  });

  const form = document.getElementById("contactForm");
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const fields = [
      { input: form.querySelector("#name"), error: form.querySelector("#nameError"), test: (value) => value.trim().length >= 2, message: "Escribe tu nombre (mínimo 2 letras)." },
      { input: form.querySelector("#email"), error: form.querySelector("#emailError"), test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), message: "Escribe un correo válido." },
      { input: form.querySelector("#message"), error: form.querySelector("#messageError"), test: (value) => value.trim().length >= 10, message: "El mensaje necesita al menos 10 caracteres." }
    ];

    function showError(field, message) {
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
      field.error.textContent = message || "";
    }

    fields.forEach((field) => {
      field.input.addEventListener("input", () => {
        if (field.input.getAttribute("aria-invalid") === "true") {
          showError(field, field.test(field.input.value) ? "" : field.message);
        }
      });
    });

    form.addEventListener("submit", (event) => {
      let firstInvalid = null;
      fields.forEach((field) => {
        const ok = field.test(field.input.value);
        showError(field, ok ? "" : field.message);
        if (!ok && !firstInvalid) firstInvalid = field.input;
      });
      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";
      }
    });
  }

  if (toTop) {
    const toggleTop = () => {
      toTop.hidden = window.scrollY < 500;
    };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
