/* ============================================================
   Dulce D' Mari — Colonia Vacacional 2026
   Configura aquí tus datos reales antes de publicar el sitio.
   ============================================================ */
const CONFIG = {
  // 1. Crea una cuenta gratis en https://formspree.io, crea un formulario
  //    y reemplaza "TU_FORM_ID" por el ID que te entregan (ej: "mzblqwer").
  FORMSPREE_ENDPOINT: "https://formspree.io/f/xwvdwqna",

  // 2. Número de WhatsApp de contacto, formato internacional sin "+" ni espacios
  //    (ej: Ecuador 09XXXXXXXX -> "5939XXXXXXXX")
  WHATSAPP_NUMBER: "593987482560",

  // 3. Usuario de Instagram (sin @) para el enlace del pie de página
  INSTAGRAM_HANDLE: "dulce.dmari",

  // 4. Fecha y hora de inicio de la colonia, usada por el contador regresivo
  CAMP_START: "2026-07-07T15:00:00-05:00",
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initCountdown();
  initFooterLinks();
  initForm();
});

/* ---------------- Navigation ---------------- */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- Scroll reveal ---------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------- Countdown ---------------- */
function initCountdown() {
  const target = new Date(CONFIG.CAMP_START).getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  if (!els.days) return;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.days.textContent = "00";
      els.hours.textContent = "00";
      els.mins.textContent = "00";
      els.secs.textContent = "00";
      document.querySelector(".countdown-label").textContent = "¡La colonia ya comenzó!";
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    els.days.textContent = String(d).padStart(2, "0");
    els.hours.textContent = String(h).padStart(2, "0");
    els.mins.textContent = String(m).padStart(2, "0");
    els.secs.textContent = String(s).padStart(2, "0");
  }
  tick();
  const timer = setInterval(tick, 1000);
}

/* ---------------- Footer / WhatsApp links ---------------- */
function initFooterLinks() {
  const wa = document.getElementById("footerWhatsapp");
  if (wa) {
    wa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hola, quisiera más información sobre la Colonia Vacacional Dulce D' Mari."
    )}`;
  }
  const ig = document.getElementById("footerInstagram");
  if (ig) {
    ig.href = `https://instagram.com/${CONFIG.INSTAGRAM_HANDLE}`;
    ig.textContent = `@${CONFIG.INSTAGRAM_HANDLE}`;
  }
}

/* ---------------- Registration form ---------------- */
function initForm() {
  const form = document.getElementById("regForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const status = document.getElementById("formStatus");
  const whatsappFallback = document.getElementById("whatsappFallback");

  function buildWhatsappMessage() {
    const data = new FormData(form);
    const lines = ["Hola, quiero inscribir a mi hijo/a en la Colonia Vacacional Dulce D' Mari:"];
    for (const [key, value] of data.entries()) {
      if (value) lines.push(`- ${key}: ${value}`);
    }
    return lines.join("\n");
  }

  function updateWhatsappFallback() {
    if (!whatsappFallback) return;
    const message = buildWhatsappMessage();
    whatsappFallback.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
  form.addEventListener("input", updateWhatsappFallback);
  updateWhatsappFallback();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const isPlaceholder = CONFIG.FORMSPREE_ENDPOINT.includes("TU_FORM_ID");
    if (isPlaceholder) {
      status.textContent =
        "El formulario aún no está conectado. Usa el botón de WhatsApp abajo para enviar tus datos mientras se configura.";
      status.className = "form-status error";
      updateWhatsappFallback();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    status.textContent = "";
    status.className = "form-status";

    try {
      const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (response.ok) {
        status.textContent = "¡Inscripción enviada con éxito! Te contactaremos pronto para confirmar el cupo.";
        status.className = "form-status success";
        form.reset();
        launchConfetti();
      } else {
        throw new Error("Formspree error");
      }
    } catch (err) {
      status.textContent =
        "No se pudo enviar el formulario. Por favor intenta de nuevo o usa el botón de WhatsApp abajo.";
      status.className = "form-status error";
      updateWhatsappFallback();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar inscripción";
    }
  });
}

/* ---------------- Confetti (celebración al inscribirse) ---------------- */
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const colors = ["#991A3D", "#3A5A2A", "#D7BE9B", "#E3A45B", "#FFFBF3"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12,
  }));

  let frame = 0;
  const maxFrames = 220;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      canvas.style.display = "none";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  if (canvas && canvas.style.display === "block") {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
