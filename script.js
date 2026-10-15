(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ===== FOCUS TRAP ===== */
  var _trap = { modal: null, last: null, handler: null };
  function focusables(el) {
    return Array.prototype.filter.call(
      el.querySelectorAll('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetWidth || n.offsetHeight || n.getClientRects().length; }
    );
  }
  function activateTrap(modal) {
    deactivateTrap();
    _trap.modal = modal;
    _trap.last = document.activeElement;
    _trap.handler = function (e) {
      if (e.key !== "Tab") return;
      var f = focusables(modal);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", _trap.handler);
  }
  function deactivateTrap() {
    if (_trap.handler) { document.removeEventListener("keydown", _trap.handler); _trap.handler = null; }
    if (_trap.modal && _trap.last && typeof _trap.last.focus === "function") {
      try { _trap.last.focus(); } catch (e) {}
    }
    _trap.modal = null; _trap.last = null;
  }

  /* ===== TEMA ===== */
  var themeToggle = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function currentTheme() { return document.documentElement.dataset.theme || "dark"; }
  function updateThemeColor() {
    if (themeMeta) themeMeta.setAttribute("content", currentTheme() === "light" ? "#ffffff" : "#0a0a0f");
  }
  function updateFavicon(theme) {
    var link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    var bg  = theme === "light" ? "%23cb3524" : "%23d4ff00";
    var txt = theme === "light" ? "white" : "black";
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
      + "<rect width='64' height='64' rx='14' fill='" + bg + "'/>"
      + "<text x='50%25' y='54%25' font-family='Arial' font-size='30' font-weight='900' fill='" + txt + "' text-anchor='middle' dominant-baseline='middle'>BA</text>"
      + "</svg>";
  }
  updateThemeColor();
  updateFavicon(currentTheme());
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      updateThemeColor();
      updateFavicon(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ===== LOADER ===== */
  var loader = document.getElementById("loader");
  var loaderBar = document.getElementById("loaderBar");
  if (loader) {
    var p = 0;
    var fill = setInterval(function () {
      p = Math.min(100, p + Math.random() * 22);
      if (loaderBar) loaderBar.style.width = p + "%";
      if (p >= 100) clearInterval(fill);
    }, 120);
    var hideLoader = function () {
      if (loaderBar) loaderBar.style.width = "100%";
      setTimeout(function () { loader.classList.add("hide"); var lb = document.querySelector('.logo-ba'); if (lb) lb.classList.add('is-drawn'); }, 350);
      setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
    };
    window.addEventListener("load", function () { setTimeout(hideLoader, 600); });
    setTimeout(function () { if (loader && !loader.classList.contains("hide")) hideLoader(); }, 3500);
  }

  /* ===== TRANSICIÓN ===== */
  var curtain = document.getElementById("curtain");
  function goToSection(id) {
    var target = document.querySelector("#" + id);
    if (!target) return;
    if (prefersReducedMotion || !curtain) { target.scrollIntoView({ behavior: "auto" }); return; }
    curtain.classList.remove("reveal");
    curtain.classList.add("cover");
    setTimeout(function () {
      target.scrollIntoView({ behavior: "auto" });
      curtain.classList.remove("cover");
      curtain.classList.add("reveal");
      setTimeout(function () { curtain.classList.remove("reveal"); }, 500);
    }, 420);
  }

  /* ===== SIDEBAR ===== */
  var body = document.body;
  var menuToggle = document.getElementById("menuToggle");
  var sidebarClose = document.getElementById("sidebarClose");
  var overlay = document.getElementById("overlay");
  function isDesktop() { return window.matchMedia("(min-width: 900px)").matches; }
  function setToggleAria(open) {
    if (!menuToggle) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar índice de navegación" : "Abrir índice de navegación");
  }
  setToggleAria(isDesktop());
  function toggleSidebar() {
    if (isDesktop()) {
      var collapsed = body.classList.toggle("sidebar-collapsed");
      setToggleAria(!collapsed);
    } else {
      var open = body.classList.toggle("sidebar-open");
      setToggleAria(open);
    }
  }
  function closeSidebar() {
    if (isDesktop()) { body.classList.remove("sidebar-collapsed"); setToggleAria(true); }
    else { body.classList.remove("sidebar-open"); setToggleAria(false); }
  }
  if (menuToggle) menuToggle.addEventListener("click", toggleSidebar);
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);
  window.addEventListener("resize", function () {
    if (isDesktop()) body.classList.remove("sidebar-open");
    else body.classList.remove("sidebar-collapsed");
    setToggleAria(isDesktop());
  });

  /* ===== SCROLL SPY ===== */
  var navLinks = document.querySelectorAll(".nav-link");
  var bottomLinks = document.querySelectorAll(".bottom-link");
  function setActive(id) {
    navLinks.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
    });
    bottomLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Array.prototype.forEach.call(navLinks, function (link) {
      var s = document.querySelector(link.getAttribute("href"));
      if (s) spy.observe(s);
    });
  }

  /* ===== VOLVER ARRIBA + BARRA DE PROGRESO ===== */
  var toTop = document.getElementById("toTop");
  var scrollBar = document.getElementById("scrollProgressBar");
  function toggleToTop() {
    if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
    if (scrollBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      scrollBar.style.width = pct + "%";
    }
  }
  window.addEventListener("scroll", toggleToTop, { passive: true });
  toggleToTop();
  if (toTop) {
    toTop.addEventListener("click", function () {
      if (prefersReducedMotion) window.scrollTo(0, 0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ===== CARRUSEL ===== */
  var track = document.getElementById("carouselTrack");
  var carPrev = document.getElementById("carPrev");
  var carNext = document.getElementById("carNext");
  var carDots = document.getElementById("carDots");
  var slides = track ? Array.prototype.slice.call(track.querySelectorAll(".slide")) : [];
  var carIndex = 0;
  function goToSlide(i) {
    if (!track || !slides.length) return;
    carIndex = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + (carIndex * 100) + "%)";
    if (carDots) {
      Array.prototype.forEach.call(carDots.children, function (d, idx) {
        d.classList.toggle("active", idx === carIndex);
      });
    }
  }
  if (track && slides.length) {
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
      b.addEventListener("click", function () { goToSlide(i); });
      if (carDots) carDots.appendChild(b);
    });
    if (carPrev) carPrev.addEventListener("click", function () { goToSlide(carIndex - 1); });
    if (carNext) carNext.addEventListener("click", function () { goToSlide(carIndex + 1); });
    goToSlide(0);
    if (!prefersReducedMotion) {
      var timer = setInterval(function () { goToSlide(carIndex + 1); }, 5000);
      var carousel = document.getElementById("carousel");
      if (carousel) {
        carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
        carousel.addEventListener("mouseleave", function () { timer = setInterval(function () { goToSlide(carIndex + 1); }, 5000); });
      }
    }
  }

  /* ===== LIGHTBOX ===== */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lbIndex = 0;
  function openLightbox(i) {
    if (!lightbox || !slides[i]) return;
    if (!lightbox.classList.contains("open")) activateTrap(lightbox);
    lbIndex = i;
    var img = slides[i].querySelector("img");
    var cap = slides[i].querySelector("figcaption");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = cap ? cap.textContent : "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (lightbox) lightbox.classList.remove("open");
    document.body.style.overflow = "";
    deactivateTrap();
  }
  function lbGo(i) { openLightbox((i + slides.length) % slides.length); }
  slides.forEach(function (s, i) { s.addEventListener("click", function () { openLightbox(i); }); });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { lbGo(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { lbGo(lbIndex + 1); });
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ===== KONAMI CODE ===== */
  var konamiSeq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var kIdx = 0;
  var konami = document.getElementById("konami");
  var confetti = document.getElementById("confetti");
  var konamiClose = document.getElementById("konamiClose");
  function closeKonami() {
    if (konami) {
      konami.classList.remove("show");
      konami.setAttribute("aria-hidden", "true");
      deactivateTrap();
    }
  }
  function launchKonami() {
    if (!konami) return;
    activateTrap(konami);
    konami.classList.add("show");
    konami.setAttribute("aria-hidden", "false");
    if (!prefersReducedMotion && confetti) {
      confetti.innerHTML = "";
      var cols = currentTheme() === "light"
        ? ["#cb3524", "#1c2b5e", "#ffffff", "#7a0a1c"]
        : ["#d4ff00", "#ff2a2a", "#ffffff", "#000000"];
      for (var i = 0; i < 80; i++) {
        var c = document.createElement("span");
        c.className = "confetti-piece";
        c.style.left = Math.random() * 100 + "%";
        c.style.background = cols[i % cols.length];
        c.style.animationDuration = (2 + Math.random() * 2) + "s";
        c.style.animationDelay = (Math.random() * 0.6) + "s";
        confetti.appendChild(c);
      }
      setTimeout(function () { confetti.innerHTML = ""; }, 5000);
    }
    if (konamiClose) konamiClose.focus();
  }
  if (konamiClose) konamiClose.addEventListener("click", closeKonami);
  if (konami) konami.addEventListener("click", function (e) { if (e.target === konami) closeKonami(); });

  /* ===== GRACIAS MODAL ===== */
  var thanks = document.getElementById("thanks");
  var thanksClose = document.getElementById("thanksClose");
  function showThanks() {
    if (thanks) {
      activateTrap(thanks);
      thanks.classList.add("show");
      thanks.setAttribute("aria-hidden", "false");
      if (thanksClose) thanksClose.focus();
    }
  }
  function hideThanks() {
    if (thanks) {
      thanks.classList.remove("show");
      thanks.setAttribute("aria-hidden", "true");
      deactivateTrap();
    }
  }
  if (thanksClose) thanksClose.addEventListener("click", hideThanks);

  function isModalOpen() {
    return (
      (lightbox && lightbox.classList.contains("open")) ||
      (thanks && thanks.classList.contains("show")) ||
      (konami && konami.classList.contains("show"))
    );
  }
  function isTypingTarget(target) {
    if (!target) return false;
    var tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  /* ===== TECLADO GLOBAL ===== */
  document.addEventListener("keydown", function (e) {
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbGo(lbIndex - 1);
      if (e.key === "ArrowRight") lbGo(lbIndex + 1);
      return;
    }
    if (e.key === "Escape") {
      if (thanks && thanks.classList.contains("show")) hideThanks();
      else if (konami && konami.classList.contains("show")) closeKonami();
      else if (botOpen && botPanel && botPanel.classList.contains("open")) closeBot();
      else closeSidebar();
    }
    if (!isTypingTarget(e.target) && !isModalOpen() && (e.key === "t" || e.key === "T") && themeToggle) {
      themeToggle.click();
    }
  });

  /* ===== KONAMI KEYBOARD ===== */
  document.addEventListener("keydown", function (e) {
    if (isTypingTarget(e.target) || isModalOpen()) return;
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konamiSeq[kIdx]) {
      kIdx++;
      if (kIdx === konamiSeq.length) { launchKonami(); kIdx = 0; }
    } else {
      kIdx = (key === konamiSeq[0]) ? 1 : 0;
    }
  });

  /* ===== REVEAL ===== */
  var revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ===== AÑO ===== */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ===== ANCLAS ===== */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (anchor) {
    anchor.addEventListener("click", function (event) {
      var href = anchor.getAttribute("href");
      if (href && href.length > 1) {
        var id = href.slice(1);
        if (document.getElementById(id)) {
          event.preventDefault();
          if (!isDesktop()) closeSidebar();
          goToSection(id);
        }
      }
    });
  });

  /* ===== FRASE CABECERA ===== */
  var tagline = document.getElementById("tagline");
  var frases = [
    "Programador en formación, apasionado de los shooters, la tecnología y el fútbol.",
    "Estudiante de 1º DAM en el IES Simarro.",
    "Mi objetivo: trabajar de programador o llegar a ser profesor.",
    "Gamer, futbolista y amante de la tecnología."
  ];
  if (tagline && frases.length > 1 && !prefersReducedMotion) {
    tagline.style.transition = "opacity 0.25s ease";
    var fraseIndex = 0;
    setInterval(function () {
      fraseIndex = (fraseIndex + 1) % frases.length;
      tagline.style.opacity = "0";
      setTimeout(function () {
        tagline.textContent = frases[fraseIndex];
        tagline.style.opacity = "1";
      }, 250);
    }, 5000);
  }

  /* ===== COPIAR EMAIL (delegación) ===== */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".copy-btn[data-email]") : null;
    if (!btn) return;
    var email = btn.getAttribute("data-email");
    var done = function () {
      btn.classList.add("copied");
      var lbl = btn.querySelector(".copy-label");
      var old = lbl ? lbl.textContent : "";
      if (lbl) lbl.textContent = "¡Copiado!";
      setTimeout(function () {
        btn.classList.remove("copied");
        if (lbl) lbl.textContent = old;
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
      done();
    }
  });

  /* ===== INFO-CARDS (template reutilizable) ===== */
  var ICONS = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 7 10 6 10-6"></path></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z"></path></svg>'
  };
  var INFO_CARDS = [
    { icon: "mail", label: "Email",
      value: '<address class="info-value"><a href="mailto:boralbbat@alu.edu.gva.es">boralbbat@alu.edu.gva.es</a></address>',
      extra: '<button class="copy-btn" type="button" data-email="boralbbat@alu.edu.gva.es" aria-label="Copiar correo"><span class="copy-icon">⧉</span> <span class="copy-label">Copiar</span></button>' },
    { icon: "pin", label: "Ubicación",
      value: '<span class="info-value">Xàtiva · Comunitat Valenciana</span>',
      extra: '<a class="info-link" href="https://www.google.com/maps?q=X%C3%A0tiva+Valencia" target="_blank" rel="noopener noreferrer">Ver en el mapa ↗</a>' },
    { icon: "star", label: "Disponibilidad",
      value: '<span class="info-value"><span class="avail-dot" aria-hidden="true"></span>Abierto a prácticas y proyectos</span>',
      extra: "" }
  ];
  function mountInfoCards() {
    var host = document.getElementById("infoCards");
    var tpl = document.getElementById("tpl-info-card");
    if (!host || !tpl) return;
    var frag = document.createDocumentFragment();
    INFO_CARDS.forEach(function (d) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.querySelector(".info-icon").innerHTML = ICONS[d.icon] || "";
      node.querySelector(".info-label").textContent = d.label;
      node.querySelector(".info-value-slot").innerHTML = d.value;
      var extra = node.querySelector(".info-extra");
      if (d.extra) extra.innerHTML = d.extra; else extra.remove();
      frag.appendChild(node);
    });
    host.replaceChildren(frag);
  }
  mountInfoCards();

  /* ===== FORMULARIO DE CONTACTO (Formspree) ===== */
  var FORM_ENDPOINT = "https://formspree.io/f/mqpawkyp";
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var fName = document.getElementById("formName");
  var fEmail = document.getElementById("formEmail");
  var fMsg = document.getElementById("formMsg");
  var errName = document.getElementById("errName");
  var errEmail = document.getElementById("errEmail");
  var errMsg = document.getElementById("errMsg");
  var charCount = document.getElementById("charCount");
  var MAX_MSG = 500;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function mark(input, errEl, ok, msg) {
    if (!input) return;
    if (ok) {
      input.classList.remove("invalid");
      if (errEl) errEl.textContent = "";
    } else {
      input.classList.add("invalid");
      if (errEl) errEl.textContent = msg;
    }
  }
  function validateName() {
    if (!fName) return true;
    var v = fName.value.trim();
    if (v === "") { fName.classList.remove("invalid"); if (errName) errName.textContent = ""; return false; }
    mark(fName, errName, v.length >= 2, "Introduce al menos 2 caracteres");
    return v.length >= 2;
  }
  function validateEmail() {
    if (!fEmail) return true;
    var v = fEmail.value.trim();
    if (v === "") { fEmail.classList.remove("invalid"); if (errEmail) errEmail.textContent = ""; return false; }
    mark(fEmail, errEmail, emailRe.test(v), "Formato de email no válido");
    return emailRe.test(v);
  }
  function validateMsg() {
    if (!fMsg) return true;
    var n = fMsg.value.length;
    if (charCount) {
      charCount.textContent = n + "/" + MAX_MSG;
      charCount.classList.toggle("warn", n > MAX_MSG * 0.9);
    }
    if (n === 0) { fMsg.classList.remove("invalid"); if (errMsg) errMsg.textContent = ""; return false; }
    mark(fMsg, errMsg, n >= 10, "El mensaje es muy corto (mín. 10)");
    return n >= 10;
  }
  if (fName) fName.addEventListener("input", validateName);
  if (fEmail) fEmail.addEventListener("input", validateEmail);
  if (fMsg) fMsg.addEventListener("input", validateMsg);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var okName = validateName();
      var okEmail = validateEmail();
      var okMsg = validateMsg();
      if (!okName || !okEmail || !okMsg) {
        if (!okName && fName && fName.value.trim() === "") mark(fName, errName, false, "Este campo es obligatorio");
        if (!okEmail && fEmail && fEmail.value.trim() === "") mark(fEmail, errEmail, false, "Este campo es obligatorio");
        if (!okMsg && fMsg && fMsg.value.length === 0) mark(fMsg, errMsg, false, "Este campo es obligatorio");
        if (formStatus) { formStatus.textContent = "Revisa los campos marcados en rojo."; formStatus.classList.add("error"); }
        return;
      }
      var data = {
        name: fName ? fName.value : "",
        email: fEmail ? fEmail.value : "",
        message: fMsg ? fMsg.value : "",
        _subject: "Web personal · Nuevo mensaje de " + (fName ? fName.value : "un visitante"),
        _replyto: fEmail ? fEmail.value : ""
      };
      if (formStatus) { formStatus.textContent = "Enviando…"; formStatus.classList.remove("error"); }
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
      .then(function (r) {
        if (!r.ok) throw new Error("Respuesta no válida");
        if (formStatus) formStatus.textContent = "";
        form.reset();
        if (charCount) charCount.textContent = "0/" + MAX_MSG;
        showThanks();
      })
      .catch(function () {
        if (formStatus) {
          formStatus.textContent = "No se pudo enviar. Inténtalo por correo: boralbbat@alu.edu.gva.es";
          formStatus.classList.add("error");
        }
      });
    });
  }

  /* ===== PROYECTOS (API GitHub con caché y reintento) ===== */
  var projectsGrid = document.getElementById("projectsGrid");
  var projectsIntro = document.getElementById("projectsIntro");
  var projectsSearch = document.getElementById("projectsSearch");
  var projectsLangs = document.getElementById("projectsLangs");
  var GITHUB_USER = "Borj-a239";
  var allRepos = [];
  var activeLang = "";
  var GH_REPOS_CACHE_KEY = "gh_repos_cache_v1";
  var GH_REPOS_TTL = 60 * 60 * 1000;

  function langColor(lang) {
    var map = { JavaScript:"#f1e05a", HTML:"#e34c26", CSS:"#563d7c", Python:"#3572A5", Java:"#b07219", TypeScript:"#3178c6", Shell:"#89e051", C:"#555555", "C#":"178600", PHP:"#4F5D95", Go:"#00ADD8" };
    return map[lang] || "#d4ff00";
  }
  function formatNum(n) { return n >= 1000 ? (n/1000).toFixed(1) + "k" : n; }
  function escapeHtml(s) { return (s || "").replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function renderProjectCard(r) {
    var tpl = document.getElementById("tpl-project");
    if (!tpl) return null;
    var node = tpl.content.firstElementChild.cloneNode(true);
    var title = node.querySelector(".pc-title");
    title.textContent = r.name;
    title.href = r.html_url;
    var langWrap = node.querySelector(".pc-lang");
    if (r.language) {
      langWrap.querySelector(".pc-dot").style.background = langColor(r.language);
      langWrap.querySelector(".pc-lang-name").textContent = r.language;
    } else {
      langWrap.remove();
    }
    node.querySelector(".pc-desc").textContent = r.description || "Sin descripción todavía.";
    node.querySelector(".pc-stars").textContent = "★ " + formatNum(r.stargazers_count);
    node.querySelector(".pc-forks").textContent = "⑂ " + formatNum(r.forks_count);
    node.querySelector(".pc-date").textContent = new Date(r.pushed_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    var link = node.querySelector(".pc-link");
    link.href = r.html_url;
    return node;
  }
  function renderProjects() {
    if (!projectsGrid) return;
    var q = (projectsSearch && projectsSearch.value || "").trim().toLowerCase();
    var list = allRepos.filter(function (r) {
      var matchText = !q || (r.name || "").toLowerCase().indexOf(q) >= 0 || (r.description || "").toLowerCase().indexOf(q) >= 0;
      var matchLang = !activeLang || r.language === activeLang;
      return matchText && matchLang;
    });
    if (!list.length) {
      projectsGrid.innerHTML = '<p class="proj-empty">Sin resultados con ese filtro. <button class="lang-chip" type="button" data-lang="">Limpiar</button></p>';
    } else {
      var frag = document.createDocumentFragment();
      list.forEach(function (r) { var n = renderProjectCard(r); if (n) frag.appendChild(n); });
      projectsGrid.replaceChildren(frag);
    }
    if (projectsIntro) projectsIntro.textContent = "Mostrando " + list.length + " de " + allRepos.length + " repositorios" + (activeLang ? " · lenguaje: " + activeLang : "") + ".";
  }
  function buildLangChips() {
    if (!projectsLangs) return;
    var counts = {};
    allRepos.forEach(function (r) { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    var langs = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    var html = '<button class="lang-chip active" type="button" data-lang="" aria-pressed="true">Todos</button>';
    langs.forEach(function (l) {
      html += '<button class="lang-chip" type="button" data-lang="' + escapeHtml(l) + '" aria-pressed="false"><span class="chip-dot" style="background:' + langColor(l) + '"></span>' + escapeHtml(l) + ' (' + counts[l] + ')</button>';
    });
    projectsLangs.innerHTML = html;
  }
  function processRepos(repos) {
    return repos
      .filter(function (r) { return !r.fork && (r.description || r.language); })
      .sort(function (a, b) { return (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)); })
      .slice(0, 24);
  }
  function applyRepos(repos) { allRepos = repos; buildLangChips(); renderProjects(); }
  function ghCacheGet() {
    try {
      var c = JSON.parse(localStorage.getItem(GH_REPOS_CACHE_KEY));
      if (c && Array.isArray(c.repos) && c.repos.length) return c;
    } catch (e) {}
    return null;
  }
  function ghCacheSet(repos) {
    try { localStorage.setItem(GH_REPOS_CACHE_KEY, JSON.stringify({ t: Date.now(), repos: repos })); } catch (e) {}
  }
  function renderProjectsError() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML =
      '<p class="proj-empty">' +
      'No he podido cargar los repos ahora mismo (límite de peticiones de GitHub). ' +
      'Prueba de nuevo en unos minutos o míralos directamente. ' +
      '<br><button class="retry-btn" type="button" id="retryProjects">↻ Reintentar</button> ' +
      '<a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener">Ver mis repos ↗</a>' +
      '</p>';
    var btn = document.getElementById("retryProjects");
    if (btn) btn.addEventListener("click", function () { loadProjects(true); });
  }
  function loadProjects(force) {
    if (!projectsGrid) return;
    var cache = ghCacheGet();
    if (cache && !force && (Date.now() - cache.t) < GH_REPOS_TTL) { applyRepos(processRepos(cache.repos)); return; }
    projectsGrid.innerHTML = '<div class="proj-skeleton"></div><div class="proj-skeleton"></div><div class="proj-skeleton"></div><div class="proj-skeleton"></div>';
    fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?sort=updated&per_page=100", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (repos) { var processed = processRepos(repos); ghCacheSet(repos); applyRepos(processed); })
      .catch(function () { if (cache) applyRepos(processRepos(cache.repos)); else renderProjectsError(); });
  }
  if (projectsSearch) projectsSearch.addEventListener("input", renderProjects);
  if (projectsLangs) projectsLangs.addEventListener("click", function (e) {
    var chip = e.target.closest(".lang-chip");
    if (!chip) return;
    activeLang = chip.getAttribute("data-lang") || "";
    Array.prototype.forEach.call(projectsLangs.querySelectorAll(".lang-chip"), function (c) {
      var on = (c.getAttribute("data-lang") || "") === activeLang;
      c.classList.toggle("active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderProjects();
  });
  loadProjects();

  /* ===== WIDGETS EN DIRECTO ===== */
  var munInput = document.getElementById('munInput');
  var munList = document.getElementById('munList');
  var weatherBody = document.getElementById('weatherBody');
  var weatherTimer = null;
  var WEATHER_DEFAULT = { name: 'Xàtiva', admin1: 'Valencia', lat: 38.9917, lon: -0.5222 };

  function normCity(s) { return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

  function weatherInfo(code) {
    var m = {
      0: ['☀️','Despejado'], 1: ['🌤️','Mayormente despejado'], 2: ['⛅','Parcialmente nublado'], 3: ['☁️','Nublado'],
      45: ['🌫️','Niebla'], 48: ['🌫️','Niebla con escarcha'], 51: ['🌦️','Llovizna'], 53: ['🌦️','Llovizna'], 55: ['🌧️','Llovizna'],
      61: ['🌦️','Lluvia ligera'], 63: ['🌧️','Lluvia'], 65: ['🌧️','Lluvia intensa'], 66: ['🌧️','Lluvia helada'], 67: ['🌧️','Lluvia helada'],
      71: ['🌨️','Nieve'], 73: ['🌨️','Nieve'], 75: ['❄️','Nieve'], 77: ['❄️','Granizo'], 80: ['🌦️','Chubascos'], 81: ['🌧️','Chubascos'],
      82: ['⛈️','Chubascos fuertes'], 85: ['🌨️','Chubascos de nieve'], 86: ['❄️','Chubascos de nieve'], 95: ['⛈️','Tormenta'],
      96: ['⛈️','Tormenta con granizo'], 99: ['⛈️','Tormenta fuerte']
    };
    return m[code] || ['🌡️','—'];
  }

  function renderWeather(d, name, sub) {
    if (!weatherBody) return;
    var c = d.current || {};
    var dy = d.daily || {};
    var w = weatherInfo(c.weather_code);
    var mx = (dy.temperature_2m_max || [])[0];
    var mn = (dy.temperature_2m_min || [])[0];
    weatherBody.innerHTML =
      '<div class="wx-now"><span class="wx-emoji">' + w[0] + '</span><div>' +
        '<div class="wx-temp">' + Math.round(c.temperature_2m || 0) + '°</div>' +
        '<div class="wx-cond">' + w[1] + '</div></div></div>' +
      '<div class="wx-stats">' +
        '<span>⬆ ' + Math.round(mx || 0) + '°</span>' +
        '<span>⬇ ' + Math.round(mn || 0) + '°</span>' +
        '<span>💧 ' + (c.relative_humidity_2m || 0) + '%</span>' +
        '<span>🌬 ' + Math.round(c.wind_speed_10m || 0) + ' km/h</span>' +
        '<span class="wx-city">' + escapeHtml(name) + (sub ? ' · ' + escapeHtml(sub) : '') + '</span>' +
      '</div>';
  }

  function loadCoords(lat, lon, name, sub) {
    if (!weatherBody) return;
    weatherBody.innerHTML = '<div class="live-skeleton wx-skel"></div>';
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min&timezone=auto';
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { renderWeather(d, name, sub); })
      .catch(function () { weatherBody.innerHTML = '<p class="live-empty">No se pudo cargar el tiempo.</p>'; });
  }

  function normalizeCityInput(value) {
    var raw = (value || '').trim();
    var sep = raw.indexOf(' · ');
    if (sep === -1) return { name: raw, region: '' };
    return { name: raw.slice(0, sep).trim(), region: raw.slice(sep + 3).trim() };
  }

  function searchCityWeather(query, regionName) {
    if (!weatherBody) return;
    query = (query || '').trim();
    regionName = (regionName || '').trim();
    if (query.length < 2) { weatherBody.innerHTML = '<p class="live-empty">Escribe al menos 2 letras.</p>'; return; }
    weatherBody.innerHTML = '<div class="live-skeleton wx-skel"></div>';
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=10&language=es&format=json';
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var results = (data.results || []).filter(function (item) { return item && item.latitude != null && item.longitude != null && item.name; });
        if (!results.length) { weatherBody.innerHTML = '<p class="live-empty">No encontré esa ciudad.</p>'; return; }
        var q = normCity(query), rq = normCity(regionName);
        results.sort(function (a, b) {
          var an = normCity(a.name), bn = normCity(b.name);
          var aq = an === q, bq = bn === q;
          if (aq !== bq) return aq ? -1 : 1;
          if (rq) {
            var ar = normCity(a.admin1 || '') === rq || normCity(a.admin2 || '') === rq;
            var br = normCity(b.admin1 || '') === rq || normCity(b.admin2 || '') === rq;
            if (ar !== br) return ar ? -1 : 1;
          }
          return (b.population || 0) - (a.population || 0);
        });
        var item = results[0];
        loadCoords(item.latitude, item.longitude, item.name, item.admin1 || regionName || '');
      })
      .catch(function () { weatherBody.innerHTML = '<p class="live-empty">No se pudo buscar esa ciudad.</p>'; });
  }

  function updateSuggestions(query) {
    if (!munList) return;
    var parsed = normalizeCityInput(query);
    var clean = (parsed.name || '').trim();
    var region = (parsed.region || '').trim();
    clearTimeout(weatherTimer);
    if (clean.length < 2) { munList.innerHTML = ''; return; }
    weatherTimer = setTimeout(function () {
      var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(clean) + '&count=10&language=es&format=json';
      fetch(url)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var results = (data.results || []).filter(function (item) { return item && item.latitude != null && item.longitude != null && item.name; });
          var q = normCity(clean), rq = normCity(region);
          results.sort(function (a, b) {
            var an = normCity(a.name), bn = normCity(b.name);
            var aq = an === q, bq = bn === q;
            if (aq !== bq) return aq ? -1 : 1;
            if (rq) {
              var ar = normCity(a.admin1 || '') === rq || normCity(a.admin2 || '') === rq;
              var br = normCity(b.admin1 || '') === rq || normCity(b.admin2 || '') === rq;
              if (ar !== br) return ar ? -1 : 1;
            }
            return (b.population || 0) - (a.population || 0);
          });
          results = results.slice(0, 10);
          munList.innerHTML = '';
          results.forEach(function (item) {
            var option = document.createElement('option');
            var label = item.name + (item.admin1 ? ' · ' + item.admin1 : '');
            option.value = label; option.label = label; option.textContent = label;
            munList.appendChild(option);
          });
        })
        .catch(function () { munList.innerHTML = ''; });
    }, 250);
  }

  if (munInput) {
    munInput.addEventListener('input', function () { updateSuggestions(munInput.value); });
    munInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); var city = normalizeCityInput(munInput.value); searchCityWeather(city.name, city.region); }
    });
    munInput.addEventListener('change', function () { var city = normalizeCityInput(munInput.value); if (city.name) searchCityWeather(city.name, city.region); });
  }
  loadCoords(WEATHER_DEFAULT.lat, WEATHER_DEFAULT.lon, WEATHER_DEFAULT.name, WEATHER_DEFAULT.admin1);

  var hnList = document.getElementById('hnList');
  function loadHN() {
    if (!hnList) return;
    hnList.innerHTML = '<li class="live-skeleton"></li><li class="live-skeleton"></li>';
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(function (r) { return r.json(); })
      .then(function (ids) {
        var top = (ids || []).slice(0, 5);
        return Promise.all(top.map(function (id) {
          return fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json').then(function (r) { return r.json(); });
        }));
      })
      .then(function (items) {
        var html = items.filter(Boolean).map(function (it) {
          var domain = 'news.ycombinator.com';
          if (it.url) { try { domain = it.url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, ''); } catch (e) {} }
          var href = it.url || ('https://news.ycombinator.com/item?id=' + it.id);
          return '<li><a href="' + href + '" target="_blank" rel="noopener">' + escapeHtml(it.title || '(sin título)') + '</a>' +
            '<span class="hn-meta">' + escapeHtml(domain) + ' · ' + it.score + ' pts · ' + (it.descendants || 0) + ' 💬</span></li>';
        }).join('');
        hnList.innerHTML = html || '<li class="live-empty">Sin noticias.</li>';
      })
      .catch(function () { hnList.innerHTML = '<li class="live-empty">No se pudo cargar Hacker News.</li>'; });
  }
  loadHN();

  var ghHeat = document.getElementById('ghHeat');
  var ghSummary = document.getElementById('ghSummary');
  var ghLegend = document.getElementById('ghLegend');
  var GH_CACHE_KEY = 'gh_heat_cache_v5';
  var GH_CACHE_TTL = 10 * 60 * 1000;

  function ghLevel(n) { return n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4; }
  function ghFromArr(a) {
    if (!Array.isArray(a) || !a.length) return null;
    var sum = 0;
    var out = a.map(function (c) {
      var cnt = c.count != null ? c.count : (c.value != null ? c.value : 0);
      sum += cnt;
      return { date: c.date || '', count: cnt, level: c.level != null ? c.level : ghLevel(cnt) };
    });
    return sum > 0 ? out : null;
  }
  function ghFromObj(map) {
    if (!map || typeof map !== 'object' || Array.isArray(map) || !Object.keys(map).length) return null;
    var end = new Date(), arr = [], sum = 0;
    for (var i = 364; i >= 0; i--) {
      var dd = new Date(end); dd.setDate(end.getDate() - i);
      var iso = dd.toISOString().slice(0, 10);
      var raw = map[iso];
      var cnt = raw == null ? 0 : (typeof raw === 'object' ? (raw.count != null ? raw.count : (raw.value || 0)) : raw);
      sum += cnt;
      arr.push({ date: iso, count: cnt, level: ghLevel(cnt) });
    }
    return sum > 0 ? arr : null;
  }
  function ghPick(d) { return ghFromArr(d.days) || ghFromArr(d.lastYear) || ghFromObj(d.contributions); }

  function ghRender(days) {
    ghHeat.style.display = 'grid';
    var offset = days.length ? new Date(days[0].date).getDay() : 0;
    var pad = [];
    for (var k = 0; k < offset; k++) pad.push({ empty: true });
    days = pad.concat(days);
    var total = 0, best = 0;
    days.forEach(function (c) { if (!c.empty) { total += c.count; if (c.count > best) best = c.count; } });
    ghHeat.innerHTML = days.map(function (c) {
      if (c.empty) return '<span class="gh-cell gh-empty"></span>';
      return '<span class="gh-cell" style="background:var(--gh' + c.level + ')" title="' + c.date + ': ' + c.count + ' contribuciones"></span>';
    }).join('');
    if (ghSummary) ghSummary.innerHTML =
      '<div class="gh-stat"><strong>' + total + '</strong><span>commits · 1 año</span></div>' +
      '<div class="gh-stat"><strong>' + best + '</strong><span>mejor día</span></div>';
    if (ghLegend) ghLegend.innerHTML =
      '<span>Menos</span><span class="gh-swatches">' +
      [0,1,2,3,4].map(function(l){ return '<i style="background:var(--gh'+l+')"></i>'; }).join('') +
      '</span><span>Más</span>';
  }

  function ghFallbackImage(total) {
    ghHeat.style.display = 'block';
    var col = (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#39d353').replace('#', '');
    ghHeat.innerHTML = '';
    var img = document.createElement('img');
    img.src = 'https://ghchart.rshah.org/' + col + '/Borj-a239';
    img.alt = 'Mapa de contribuciones de GitHub de Borj-a239';
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;max-width:720px;height:auto;display:block;margin:0 auto;border-radius:8px;background:var(--surface-2)';
    img.onerror = function () {
      ghHeat.innerHTML = '<p class="live-empty">No se pudo cargar el gráfico. <a href="https://github.com/Borj-a239" target="_blank" rel="noopener">Ver en GitHub ↗</a></p>';
    };
    ghHeat.appendChild(img);
    if (ghSummary) ghSummary.innerHTML =
      '<div class="gh-stat"><strong>' + (total != null ? total : '—') + '</strong><span>commits · 1 año</span></div>';
    if (ghLegend) ghLegend.innerHTML =
      '<span>Menos</span><span class="gh-swatches">' +
      [1,2,3,4].map(function(l){ return '<i style="background:var(--gh'+l+')"></i>'; }).join('') +
      '</span><span>Más</span>';
  }

  function loadHeat(force) {
    if (!ghHeat) return;
    if (!force) {
      try {
        var c = JSON.parse(localStorage.getItem(GH_CACHE_KEY));
        if (c && c.days && (Date.now() - c.t) < GH_CACHE_TTL) { ghRender(c.days); return; }
      } catch (e) {}
    }
    ghHeat.style.display = 'grid';
    ghHeat.innerHTML = '<div class="live-skeleton"></div>';
    var lastTotal = null;
    var urls = [
      'https://github-contributions-api.jogruber.de/v4/Borj-a239?y=last',
      'https://github-contributions-api.jogruber.de/v4/Borj-a239?y=2025',
      'https://github-contributions-api.jogruber.de/v4/Borj-a239?y=2026'
    ];
    (function tryNext(i) {
      if (i >= urls.length) { ghFallbackImage(lastTotal); return; }
      fetch(urls[i])
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) {
          var t = (d.total && (d.total.lastYear != null ? d.total.lastYear : d.total.allTime));
          if (t != null) lastTotal = t;
          var days = ghPick(d);
          if (days) {
            try { localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ t: Date.now(), days: days })); } catch (e) {}
            ghRender(days);
          } else { tryNext(i + 1); }
        })
        .catch(function () { tryNext(i + 1); });
    })(0);
  }
  loadHeat();

  /* ===== CURSOR PERSONALIZADO ===== */
  if (finePointer && !prefersReducedMotion) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (dot && ring) {
      var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
      document.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px)";
      });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        requestAnimationFrame(loop);
      })();
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a,.bot-launcher,.bot-close,.bot-send,.bot-chip,.bot-action")) ring.classList.add("is-hover");
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a,.bot-launcher,.bot-close,.bot-send,.bot-chip,.bot-action")) ring.classList.remove("is-hover");
      });
    }
  }

  /* ===== PARTÍCULAS DEL HERO (optimizadas) ===== */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.closest(".hero");
    var parts = [];
    var LINK = 110, LINK2 = LINK * LINK;
    function resize() {
      if (!hero) return;
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
      var n = Math.min(50, Math.floor(canvas.width / 18));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.6 + 0.4
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var col = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d4ff00";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.globalAlpha = (1 - d2 / LINK2) * 0.25;
            ctx.strokeStyle = col;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (!document.hidden) requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) draw(); });
  }

  /* ===== FACADE DEL JUEGO (click-to-play) ===== */
  var facades = document.querySelectorAll(".game-facade");
  Array.prototype.forEach.call(facades, function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-src");
      if (!src) return;
      var frame = document.createElement("iframe");
      frame.src = src;
      frame.title = "Juego en GDevelop";
      frame.setAttribute("allow", "autoplay; fullscreen; scripts");
      frame.setAttribute("tabindex", "0");
      frame.style.cssText = "display:block;width:100%;aspect-ratio:16/10;border:0;border-radius:12px";
      function focusGame() {
        try {
          var d = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
          if (!d) return;
          var c = d.querySelector("canvas");
          if (c) { c.setAttribute("tabindex", "0"); c.focus(); return; }
          if (frame.contentWindow) frame.contentWindow.focus();
        } catch (e) {}
      }
      frame.addEventListener("load", function () {
        focusGame();
        setTimeout(focusGame, 150);
        setTimeout(focusGame, 400);
        try {
          var d2 = frame.contentDocument || frame.contentWindow.document;
          d2.addEventListener("keydown", function (e) { if (e.code === "Space") e.preventDefault(); });
        } catch (e) {}
      });
      frame.addEventListener("click", focusGame);
      btn.parentNode.replaceChild(frame, btn);
      setTimeout(focusGame, 300);
    });
  });

  /* ============================================================
     [C1] XATBOT DE CONTACTE — respuesta automática rule-based
     Gratis, sin backend y sin API keys. Recorrido del dato:
     entrada -> normalizar (sin acentos/minúsculas) -> puntuar
     reglas por keywords -> renderizar burbuja + quick replies ->
     si hay accio: prefill del #contactForm -> submit Formspree ->
     correo real. Reutiliza helpers del IIFE (escapeHtml, goToSection,
     form/fName/fMsg, showThanks).
     ============================================================ */
  var botLauncher = document.getElementById("botLauncher");
  var botPanel = document.getElementById("botPanel");
  var botLog = document.getElementById("botLog");
  var botQuick = document.getElementById("botQuick");
  var botFormEl = document.getElementById("botForm");
  var botInput = document.getElementById("botInput");
  var botCloseBtn = document.getElementById("botClose");
  var botOpen = false, botName = "", botGreeted = false;

  function botCap(s) { return (s || "").replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function botNorm(s) { return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  function botRich(t) { return escapeHtml(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }

  // Base de conocimiento local. Cada regla: id, keywords, respuesta,
  // quick replies [texto, id-destino] y acción opcional.
  var BOT_KB = [
    { id: "greet", keys: ["hola","buenas","hey","que tal","saludos","holi","bon dia","buenos dias","buenas tardes"],
      res: "¡Hola! 👋 Soy el asistente de Borja. Puedo contarte qué estudia, si está disponible para prácticas, enseñarte sus proyectos o abrirte directamente el formulario de contacto.",
      quick: [["¿Quién es Borja?","who"],["¿Está disponible?","avail"],["Ver proyectos","projects"],["Escribirle","contact"]] },

    { id: "who", keys: ["quien eres","quien es","sobre ti","sobre el","borja","que haces","a que te dedicas","eres"],
      res: "Borja Albert Bataller, estudiante de **1º DAM** en el IES Simarro (Xàtiva). Vengo del mundo del hardware (GM de SMX) y ahora programo. Le van los shooters, montar PCs y el Atleti. 🎮⚽",
      quick: [["Formación","form"],["Proyectos","projects"],["Escribirle","contact"]] },

    { id: "form", keys: ["formacion","estudia","dam","ies","simarro","clases","estudios","gm","smx","asignatura"],
      res: "Está en **1º DAM** (Desarrollo de Aplicaciones Multiplataforma) en el IES Simarro. Antes hizo GM de SMX (Sistemas Microinformáticos y Redes). Su meta: trabajar programando o acabar enseñando. 📚",
      quick: [["Proyectos","projects"],["Disponibilidad","avail"],["Escribirle","contact"]] },

    { id: "avail", keys: ["disponible","practicas","trabajo","empleo","freelance","presupuesto","precio","contratar","horario","fct","practica"],
      res: "Está **abierto a prácticas (FCT) y proyectos**. Si quieres que te eche un cable o quieres su CV, lo más rápido es el formulario: me llega al correo al instante. 📬",
      action: "form", actionLabel: "Abrir formulario",
      quick: [["Ver proyectos","projects"],["Su correo","mail"]] },

    { id: "projects", keys: ["proyecto","proyectos","github","repos","repositorio","juego","gdevelop","portfolio","hecho","codigo"],
      res: "Todo su código está en GitHub (@Borj-a239): esta web, ejercicios de DAM y un juego en GDevelop. Lo tienes en la sección **Proyectos** de la web, cargado en vivo desde la API. 🚀",
      action: "section:proyectos", actionLabel: "Ver Proyectos",
      quick: [["Disponibilidad","avail"],["Escribirle","contact"]] },

    { id: "contact", keys: ["contacto","escribir","correo","email","mail","mensaje","hablar","hablemos","telefono","numero"],
      res: "¡Genial! Te abro el formulario de contacto. En cuanto lo envíes, el mensaje me llega directo al correo de Borja. 📬",
      action: "form", actionLabel: "Abrir formulario",
      quick: [["Su correo","mail"],["Disponibilidad","avail"]] },

    { id: "mail", keys: ["correo electronico","direccion correo","email de contacto"],
      res: "Su correo es **boralbbat@alu.edu.gva.es**. Puedes copiarlo con el botón de la sección Contacto. ✉️",
      action: "mail", actionLabel: "Enviar correo",
      quick: [["Escribirle","contact"],["Ver proyectos","projects"]] },

    { id: "hobbies", keys: ["videojuego","juego","halo","cs","valorant","call of duty","rainbow","battlefield","futbol","atletico","atleti","gusta","hobby"],
      res: "Le van los shooters (Halo, CS2, Valorant, CoD, Rainbow Six, Battlefield), montar PCs y redes, y es del Atleti. 💪❤️🤍",
      quick: [["Formación","form"],["Proyectos","projects"],["Escribirle","contact"]] },

    { id: "name", keys: ["me llamo","mi nombre es","nombre es"],
      res: function (t) {
        var m = t.match(/(?:me llamo|mi nombre es|nombre es)\s+([a-záéíóúñ ]{2,30})/i);
        var n = m ? botCap(m[1].trim()) : "";
        if (n) { botName = n; if (fName && !fName.value) fName.value = n; }
        return n ? ("Encantado, " + n + ". Te he prefillado el nombre en el formulario. 👇") : "¿Me dices tu nombre? (ej: me llamo Ana)";
      },
      quick: [["Escribirle","contact"]] },

    { id: "thanks", keys: ["gracias","genial","perfecto","bien","ok","vale","crack","molt be"],
      res: "¡De nada! 😄 Si quieres, te dejo el formulario listo para escribirle.",
      action: "form", actionLabel: "Abrir formulario" },

    { id: "bye", keys: ["adios","hasta luego","chao","bye","nos vemos","me voy"],
      res: "¡Hasta pronto! 👋 Recuerda que el formulario de contacto siempre está disponible.",
      quick: [["Escribirle","contact"]] }
  ];
  var BOT_BY_ID = {};
  BOT_KB.forEach(function (r) { BOT_BY_ID[r.id] = r; });

  function botBest(text) {
    var t = botNorm(text), best = null, score = 0;
    BOT_KB.forEach(function (r) {
      var s = 0;
      r.keys.forEach(function (k) { if (t.indexOf(botNorm(k)) >= 0) s++; });
      if (s > score) { score = s; best = r; }
    });
    return score > 0 ? best : null;
  }

  function botBubble(role, html) {
    var el = document.createElement("div");
    el.className = "bot-msg bot-" + role;
    el.innerHTML = html;
    botLog.appendChild(el);
    botLog.scrollTop = botLog.scrollHeight;
  }
  function botSay(text) { botBubble("bot", botRich(text)); }
  function botTyping(on) {
    var el = document.getElementById("botTyping");
    if (on) {
      if (!el) {
        el = document.createElement("div");
        el.id = "botTyping"; el.className = "bot-typing";
        el.innerHTML = "<span></span><span></span><span></span>";
        botLog.appendChild(el); botLog.scrollTop = botLog.scrollHeight;
      }
    } else if (el) el.remove();
  }
  function renderQuick(list) {
    botQuick.innerHTML = "";
    (list || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "bot-chip";
      b.setAttribute("data-bot-intent", q[1]);
      b.textContent = q[0];
      botQuick.appendChild(b);
    });
  }
  function botReply(rule, userText) {
    var res = typeof rule.res === "function" ? rule.res(userText || "") : rule.res;
    botBubble("bot", botRich(res));
    if (rule.action) {
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "bot-action";
      btn.setAttribute("data-bot-action", rule.action);
      btn.textContent = rule.actionLabel || "Continuar";
      botLog.appendChild(btn);
      botLog.scrollTop = botLog.scrollHeight;
    }
    renderQuick(rule.quick || []);
  }
  function botOpenForm() {
    goToSection("contacto");
    setTimeout(function () {
      if (fName && !fName.value && botName) fName.value = botName;
      if (fMsg && !fMsg.value) fMsg.value = "Hola Borja, te escribo desde el asistente de la web: ";
      if (fName) fName.focus();
    }, 500);
    botSay("Te he abierto el formulario de contacto aquí abajo. 👇");
  }
  function botSend(text, intentId) {
    if (!botOpen) openBot();
    botBubble("user", botRich(text || ""));
    botQuick.innerHTML = "";
    botInput.value = "";
    botTyping(true);
    var delay = prefersReducedMotion ? 0 : 420;
    setTimeout(function () {
      botTyping(false);
      var rule = intentId ? BOT_BY_ID[intentId] : botBest(text);
      botReply(rule || BOT_BY_ID["greet"], text || "");
    }, delay);
  }
  function openBot() {
    botOpen = true;
    botPanel.classList.add("open");
    botLauncher.classList.add("active");
    botPanel.setAttribute("aria-hidden", "false");
    botLauncher.setAttribute("aria-expanded", "true");
    botLauncher.setAttribute("aria-label", "Cerrar asistente de contacto");
    if (!botGreeted) { botGreeted = true; botReply(BOT_BY_ID["greet"], ""); }
    setTimeout(function () { botInput.focus(); }, 60);
    try { localStorage.setItem("bot_seen", "1"); } catch (e) {}
  }
  function closeBot() {
    botOpen = false;
    botPanel.classList.remove("open");
    botLauncher.classList.remove("active");
    botPanel.setAttribute("aria-hidden", "true");
    botLauncher.setAttribute("aria-expanded", "false");
    botLauncher.setAttribute("aria-label", "Abrir asistente de contacto");
    if (botLauncher) botLauncher.focus();
  }

  if (botLauncher) botLauncher.addEventListener("click", function () { botOpen ? closeBot() : openBot(); });
  if (botCloseBtn) botCloseBtn.addEventListener("click", closeBot);
  if (botFormEl) botFormEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = botInput.value.trim();
    if (v) botSend(v);
  });
  if (botQuick) botQuick.addEventListener("click", function (e) {
    var c = e.target.closest("[data-bot-intent]");
    if (c) botSend(c.textContent, c.getAttribute("data-bot-intent"));
  });
  if (botLog) botLog.addEventListener("click", function (e) {
    var a = e.target.closest("[data-bot-action]");
    if (!a) return;
    var act = a.getAttribute("data-bot-action");
    if (act === "form") botOpenForm();
    else if (act === "mail") window.location.href = "mailto:boralbbat@alu.edu.gva.es";
    else if (act.indexOf("section:") === 0) goToSection(act.slice(8));
  });
})();