// script.js

// Detecta si el usuario prefiere reducir animaciones
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ TEMA CLARO / OSCURO ============ */
const themeToggle = document.getElementById("themeToggle");

function currentTheme() {
  return document.documentElement.dataset.theme || "dark";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

/* ============ LOADER DE ENTRADA ============ */
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");

if (loader) {
  let p = 0;
  const fill = setInterval(() => {
    p = Math.min(100, p + Math.random() * 22);
    if (loaderBar) loaderBar.style.width = p + "%";
    if (p >= 100) clearInterval(fill);
  }, 120);

  const hideLoader = () => {
    if (loaderBar) loaderBar.style.width = "100%";
    setTimeout(() => loader.classList.add("hide"), 350);
    setTimeout(() => { if (loader) loader.remove(); }, 900);
  };

  window.addEventListener("load", () => setTimeout(hideLoader, 600));
  setTimeout(() => { if (loader && !loader.classList.contains("hide")) hideLoader(); }, 3500);
}

/* ============ TRANSICIÓN DE PÁGINA (cortinilla) ============ */
const curtain = document.getElementById("curtain");

function goToSection(id) {
  const target = document.querySelector("#" + id);
  if (!target) return;

  if (prefersReducedMotion || !curtain) {
    target.scrollIntoView({ behavior: "auto" });
    return;
  }

  curtain.classList.remove("reveal");
  curtain.classList.add("cover");

  setTimeout(() => {
    target.scrollIntoView({ behavior: "auto" });
    curtain.classList.remove("cover");
    curtain.classList.add("reveal");
    setTimeout(() => curtain.classList.remove("reveal"), 500);
  }, 420);
}

/* ============ ÍNDICE LATERAL ============ */
const body = document.body;
const menuToggle = document.getElementById("menuToggle");
const sidebarClose = document.getElementById("sidebarClose");
const overlay = document.getElementById("overlay");
const isDesktop = () => window.matchMedia("(min-width: 900px)").matches;

function setToggleAria(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar índice de navegación" : "Abrir índice de navegación");
}

setToggleAria(isDesktop());

function toggleSidebar() {
  if (isDesktop()) {
    const collapsed = body.classList.toggle("sidebar-collapsed");
    setToggleAria(!collapsed);
  } else {
    const open = body.classList.toggle("sidebar-open");
    setToggleAria(open);
  }
}

function closeSidebar() {
  if (isDesktop()) {
    body.classList.remove("sidebar-collapsed");
    setToggleAria(true);
  } else {
    body.classList.remove("sidebar-open");
    setToggleAria(false);
  }
}

menuToggle.addEventListener("click", toggleSidebar);
sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

window.addEventListener("resize", () => {
  if (isDesktop()) body.classList.remove("sidebar-open");
  else body.classList.remove("sidebar-collapsed");
  setToggleAria(isDesktop());
});

/* ============ SCROLL SPY ============ */
const navLinks = document.querySelectorAll(".nav-link");
const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActive(id) {
  navLinks.forEach((link) =>
    link.classList.toggle("active", link.getAttribute("href") === "#" + id)
  );
}

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ============ VOLVER ARRIBA ============ */
const toTop = document.getElementById("toTop");

function toggleToTop() {
  if (!toTop) return;
  toTop.classList.toggle("show", window.scrollY > 500);
}
window.addEventListener("scroll", toggleToTop, { passive: true });
toggleToTop();

if (toTop) {
  toTop.addEventListener("click", () => {
    if (prefersReducedMotion) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============ CARRUSEL ============ */
const track = document.getElementById("carouselTrack");
const carPrev = document.getElementById("carPrev");
const carNext = document.getElementById("carNext");
const carDots = document.getElementById("carDots");
const slides = track ? [...track.querySelectorAll(".slide")] : [];
let carIndex = 0;

function goToSlide(i) {
  if (!track) return;
  carIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${carIndex * 100}%)`;
  [...carDots.children].forEach((d, idx) => d.classList.toggle("active", idx === carIndex));
}

if (track && slides.length) {
  // Crear puntos
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
    b.addEventListener("click", () => goToSlide(i));
    carDots.appendChild(b);
  });

  carPrev.addEventListener("click", () => goToSlide(carIndex - 1));
  carNext.addEventListener("click", () => goToSlide(carIndex + 1));
  goToSlide(0);

  // Autoplay (pausable al enfocar o pasar el ratón)
  if (!prefersReducedMotion) {
    let timer = setInterval(() => goToSlide(carIndex + 1), 5000);
    const carousel = document.getElementById("carousel");
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      timer = setInterval(() => goToSlide(carIndex + 1), 5000);
    });
  }
}

/* ============ LIGHTBOX (ampliar imagen) ============ */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  const img = slides[i].querySelector("img");
  const cap = slides[i].querySelector("figcaption");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = cap ? cap.textContent : "";
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function lbGo(i) {
  openLightbox((i + slides.length) % slides.length);
}

slides.forEach((s, i) => s.addEventListener("click", () => openLightbox(i)));
lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => lbGo(lbIndex - 1));
lbNext.addEventListener("click", () => lbGo(lbIndex + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

/* ============ TECLADO (Escape / flechas) ============ */
document.addEventListener("keydown", (e) => {
  if (lightbox && lightbox.classList.contains("open")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lbGo(lbIndex - 1);
    if (e.key === "ArrowRight") lbGo(lbIndex + 1);
    return;
  }
  if (e.key === "Escape") closeSidebar();
});

/* ============ ANIMACIÓN DE APARICIÓN ============ */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

/* ============ AÑO AUTOMÁTICO ============ */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ============ DESPLAZAMIENTO SUAVE + CORTINILLA ============ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (href && href.length > 1) {
      const id = href.slice(1);
      if (document.getElementById(id)) {
        event.preventDefault();
        if (!isDesktop()) closeSidebar();
        goToSection(id);
      }
    }
  });
});

/* ============ CAMBIO DE FRASE EN CABECERA ============ */
const tagline = document.getElementById("tagline");
const frases = [
  "Programador en formación, apasionado de los shooters, la tecnología y el fútbol.",
  "Estudiante de 1º DAM en el IES Simarro.",
  "Mi objetivo: trabajar de programador o llegar a ser profesor.",
  "Gamer, futbolista y amante de la tecnología.",
];

if (tagline && frases.length > 1 && !prefersReducedMotion) {
  tagline.style.transition = "opacity 0.25s ease";
  let fraseIndex = 0;

  setInterval(() => {
    fraseIndex = (fraseIndex + 1) % frases.length;
    tagline.style.opacity = "0";
    setTimeout(() => {
      tagline.textContent = frases[fraseIndex];
      tagline.style.opacity = "1";
    }, 250);
  }, 5000);
}
