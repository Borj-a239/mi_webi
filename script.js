// script.js
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ===== TEMA ===== */
  var themeToggle = document.getElementById("themeToggle");
  function currentTheme() { return document.documentElement.dataset.theme || "dark"; }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
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
      setTimeout(function () { loader.classList.add("hide"); }, 350);
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
  menuToggle.addEventListener("click", toggleSidebar);
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);
  window.addEventListener("resize", function () {
    if (isDesktop()) body.classList.remove("sidebar-open");
    else body.classList.remove("sidebar-collapsed");
    setToggleAria(isDesktop());
  });

  /* ===== SCROLL SPY (sidebar + bottom nav) ===== */
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

  /* ===== VOLVER ARRIBA ===== */
  var toTop = document.getElementById("toTop");
  function toggleToTop() { if (toTop) toTop.classList.toggle("show", window.scrollY > 500); }
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
    if (!track) return;
    carIndex = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + (carIndex * 100) + "%)";
    Array.prototype.forEach.call(carDots.children, function (d, idx) {
      d.classList.toggle("active", idx === carIndex);
    });
  }
  if (track && slides.length) {
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
      b.addEventListener("click", function () { goToSlide(i); });
      carDots.appendChild(b);
    });
    carPrev.addEventListener("click", function () { goToSlide(carIndex - 1); });
    carNext.addEventListener("click", function () { goToSlide(carIndex + 1); });
    goToSlide(0);
    if (!prefersReducedMotion) {
      var timer = setInterval(function () { goToSlide(carIndex + 1); }, 5000);
      var carousel = document.getElementById("carousel");
      carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
      carousel.addEventListener("mouseleave", function () { timer = setInterval(function () { goToSlide(carIndex + 1); }, 5000); });
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
  function closeLightbox() { lightbox.classList.remove("open"); document.body.style.overflow = ""; }
  function lbGo(i) { openLightbox((i + slides.length) % slides.length); }
  slides.forEach(function (s, i) { s.addEventListener("click", function () { openLightbox(i); }); });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { lbGo(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { lbGo(lbIndex + 1); });
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ===== TECLADO ===== */
  document.addEventListener("keydown", function (e) {
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbGo(lbIndex - 1);
      if (e.key === "ArrowRight") lbGo(lbIndex + 1);
      return;
    }
    if (e.key === "Escape") { closeSidebar(); closeKonami(); }
    if (e.key === "t" || e.key === "T") { if (themeToggle && !e.target.closest("input,textarea")) themeToggle.click(); }
  });

  /* ===== REVEAL ===== */
  var revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
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
      setTimeout(function () { tagline.textContent = frases[fraseIndex]; tagline.style.opacity = "1"; }, 250);
    }, 5000);
  }

  /* ===== COPIAR EMAIL ===== */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function () {
        copyBtn.classList.add("copied");
        var lbl = copyBtn.querySelector(".copy-label");
        var old = lbl ? lbl.textContent : "";
        if (lbl) lbl.textContent = "¡Copiado!";
        setTimeout(function () { copyBtn.classList.remove("copied"); if (lbl) lbl.textContent = old; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = email; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ===== FORMULARIO DE CONTACTO ===== */
  // >>> Pega aquí la URL de Formspree o Web3Forms. Si la dejas vacía, simula el envío. <<<
  var FORM_ENDPOINT = "";
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var thanks = document.getElementById("thanks");
  var thanksClose = document.getElementById("thanksClose");
  function showThanks() {
    if (thanks) { thanks.classList.add("show"); thanks.setAttribute("aria-hidden", "false"); if (thanksClose) thanksClose.focus(); }
  }
  function hideThanks() { if (thanks) { thanks.classList.remove("show"); thanks.setAttribute("aria-hidden", "true"); } }
  if (thanksClose) thanksClose.addEventListener("click", hideThanks);
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value
      };
      formStatus.textContent = "Enviando…";
      formStatus.classList.remove("error");
      if (!FORM_ENDPOINT) {
        // Modo demo: simula éxito para poder ver la página de gracias.
        setTimeout(function () {
          formStatus.textContent = "";
          form.reset();
          showThanks();
        }, 700);
        return;
      }
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
      .then(function (r) {
        if (!r.ok) throw new Error("bad");
        formStatus.textContent = "";
        form.reset();
        showThanks();
      })
      .catch(function () {
        formStatus.textContent = "No se pudo enviar. Inténtalo por correo.";
        formStatus.classList.add("error");
      });
    });
  }

  /* ===== CURSOR PERSONALIZADO ===== */
  if (finePointer && !prefersReducedMotion) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (dot && ring) {
      var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
      document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = "translate(" + mx + "px," + my + "px)"; });
      (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        requestAnimationFrame(loop);
      })();
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a")) ring.classList.add("is-hover");
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a")) ring.classList.remove("is-hover");
      });
    }
  }

  /* ===== PARTÍCULAS DEL HERO ===== */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.closest(".hero");
    var parts = [];
    function resize() {
      canvas.width = hero.clientWidth; canvas.height = hero.clientHeight;
      var n = Math.min(70, Math.floor(canvas.width / 16));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 1.6 + 0.4 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var col = getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() || "#0066ff";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = col; ctx.globalAlpha = 0.5; ctx.fill();
        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.globalAlpha = (1 - d / 110) * 0.25; ctx.strokeStyle = col; ctx.stroke(); }
        }
      }
      ctx.globalAlpha = 1;
      if (!document.hidden) requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) draw(); });
  }

  /* ===== KONAMI CODE ===== */
  var konamiSeq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var kIdx = 0;
  var konami = document.getElementById("konami");
  var confetti = document.getElementById("confetti");
  var konamiClose = document.getElementById("konamiClose");
  function closeKonami() { if (konami) { konami.classList.remove("show"); konami.setAttribute("aria-hidden", "true"); } }
  function launchKonami() {
    if (!konami) return;
    konami.classList.add("show"); konami.setAttribute("aria-hidden", "false");
    if (!prefersReducedMotion && confetti) {
      confetti.innerHTML = "";
      var cols = ["#e50914", "#0066ff", "#f8fafc", "#ffd166"];
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
  document.addEventListener("keydown", function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konamiSeq[kIdx]) { kIdx++; if (kIdx === konamiSeq.length) { launchKonami(); kIdx = 0; } }
    else { kIdx = (key === konamiSeq[0]) ? 1 : 0; }
  });
})();
