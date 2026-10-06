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
  updateThemeColor();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      updateThemeColor();
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
      var cols = ["#d4ff00", "#ff2a2a", "#ffffff", "#000000"];
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
        setTimeout(function () {
          copyBtn.classList.remove("copied");
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
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

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

  /* ===== PROYECTOS (API GitHub) ===== */
  var projectsGrid = document.getElementById("projectsGrid");
  var projectsIntro = document.getElementById("projectsIntro");
  var projectsSearch = document.getElementById("projectsSearch");
  var projectsLangs = document.getElementById("projectsLangs");
  var GITHUB_USER = "Borj-a239";
  var allRepos = [];
  var activeLang = "";

  function langColor(lang) {
    var map = { JavaScript:"#f1e05a", HTML:"#e34c26", CSS:"#563d7c", Python:"#3572A5", Java:"#b07219", TypeScript:"#3178c6", Shell:"#89e051", C:"#555555", "C#":"178600", PHP:"#4F5D95", Go:"#00ADD8" };
    return map[lang] || "#d4ff00";
  }
  function formatNum(n) { return n >= 1000 ? (n/1000).toFixed(1) + "k" : n; }
  function escapeHtml(s) { return (s || "").replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function cardHTML(r) {
    var desc = escapeHtml(r.description || "Sin descripción todavía.");
    var lang = r.language || "";
    var color = lang ? langColor(lang) : "var(--muted)";
    var url = r.html_url;
    var name = escapeHtml(r.name);
    var fecha = new Date(r.pushed_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    return '<article class="project-card">'
      + '<div class="pc-head"><h3><a href="' + url + '" target="_blank" rel="noopener">' + name + '</a></h3>'
      + (lang ? '<span class="pc-lang"><span class="pc-dot" style="background:' + color + '"></span>' + lang + '</span>' : '')
      + '</div>'
      + '<p class="pc-desc">' + desc + '</p>'
      + '<div class="pc-meta">'
      + '<span class="pc-stat">★ ' + formatNum(r.stargazers_count) + '</span>'
      + '<span class="pc-stat">⑂ ' + formatNum(r.forks_count) + '</span>'
      + '<span class="pc-stat">' + fecha + '</span>'
      + '<a class="pc-link" href="' + url + '" target="_blank" rel="noopener">Ver ↗</a>'
      + '</div></article>';
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
      projectsGrid.innerHTML = list.map(cardHTML).join("");
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
  function loadProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '<div class="proj-skeleton"></div><div class="proj-skeleton"></div><div class="proj-skeleton"></div><div class="proj-skeleton"></div>';
    fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?sort=updated&per_page=100", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (repos) {
        allRepos = repos
          .filter(function (r) { return !r.fork && (r.description || r.language); })
          .sort(function (a, b) { return (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)); })
          .slice(0, 24);
        buildLangChips();
        renderProjects();
      })
      .catch(function () {
        projectsGrid.innerHTML = '<p class="proj-empty">No se pudo cargar GitHub ahora mismo (límite de la API). <a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener">Ver mis repos ↗</a></p>';
      });
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

  /* ============================================================
     WIDGETS EN DIRECTO (sin backend, sin API key, con CORS)
     ============================================================ */
  function norm(s) { return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

  /* --- 1) TIEMPO (Open-Meteo) con cascada provincia → municipio --- */
  var PROVINCIAS = [
    {n:'Álava',la:42.85,lo:-2.67},{n:'Albacete',la:39.01,lo:-1.86},{n:'Alicante',la:38.34,lo:-0.48},
    {n:'Almería',la:36.83,lo:-2.46},{n:'Asturias',la:43.36,lo:-5.85},{n:'Ávila',la:40.66,lo:-4.69},
    {n:'Badajoz',la:38.88,lo:-6.97},{n:'Baleares',la:39.57,lo:2.65},{n:'Barcelona',la:41.39,lo:2.17},
    {n:'Burgos',la:42.34,lo:-3.70},{n:'Cáceres',la:39.48,lo:-6.37},{n:'Cádiz',la:36.53,lo:-6.29},
    {n:'Cantabria',la:43.46,lo:-3.81},{n:'Castellón',la:39.99,lo:-0.04},{n:'Ciudad Real',la:38.99,lo:-3.93},
    {n:'Córdoba',la:37.88,lo:-4.78},{n:'Cuenca',la:40.07,lo:-2.13},{n:'Guadalajara',la:40.63,lo:-3.16},
    {n:'Guipúzcoa',la:43.32,lo:-1.98},{n:'Huelva',la:37.26,lo:-6.94},{n:'Huesca',la:42.14,lo:-0.41},
    {n:'Jaén',la:37.77,lo:-3.79},{n:'A Coruña',la:43.37,lo:-8.40},{n:'La Rioja',la:42.47,lo:-2.45},
    {n:'Las Palmas',la:28.10,lo:-15.43},{n:'León',la:42.60,lo:-5.57},{n:'Lleida',la:41.62,lo:0.63},
    {n:'Lugo',la:43.01,lo:-7.56},{n:'Madrid',la:40.42,lo:-3.70},{n:'Málaga',la:36.72,lo:-4.42},
    {n:'Murcia',la:37.99,lo:-1.13},{n:'Navarra',la:42.81,lo:-1.64},{n:'Ourense',la:42.34,lo:-7.86},
    {n:'Palencia',la:42.01,lo:-4.53},{n:'Pontevedra',la:42.43,lo:-8.64},{n:'Salamanca',la:40.97,lo:-5.66},
    {n:'Sta. C. de Tenerife',la:28.46,lo:-16.25},{n:'Segovia',la:40.95,lo:-4.12},{n:'Sevilla',la:37.39,lo:-5.98},
    {n:'Soria',la:41.76,lo:-2.47},{n:'Tarragona',la:41.12,lo:1.25},{n:'Teruel',la:40.34,lo:-1.11},
    {n:'Toledo',la:39.86,lo:-4.02},{n:'Valencia',la:39.47,lo:-0.38},{n:'Valladolid',la:41.65,lo:-4.72},
    {n:'Bizkaia',la:43.26,lo:-2.93},{n:'Zamora',la:41.50,lo:-5.75},{n:'Zaragoza',la:41.65,lo:-0.88},
    {n:'Ceuta',la:35.89,lo:-5.32},{n:'Melilla',la:35.29,lo:-2.94}
  ];
  var provMap = {};
  PROVINCIAS.forEach(function (p) { provMap[p.n] = p; });
  var provSelect = document.getElementById('provSelect');
  var munSelect = document.getElementById('munSelect');
  var weatherBody = document.getElementById('weatherBody');
  var currentProv = 'Valencia';

  function weatherInfo(code) {
    var m = {
      0:['☀️','Despejado'],1:['🌤️','Mayormente despejado'],2:['⛅','Parcialmente nublado'],3:['☁️','Nublado'],
      45:['🌫️','Niebla'],48:['🌫️','Niebla con escarcha'],51:['🌦️','Llovizna'],53:['🌦️','Llovizna'],55:['🌧️','Llovizna'],
      61:['🌦️','Lluvia ligera'],63:['🌧️','Lluvia'],65:['🌧️','Lluvia intensa'],66:['🌧️','Lluvia helada'],67:['🌧️','Lluvia helada'],
      71:['🌨️','Nieve'],73:['🌨️','Nieve'],75:['❄️','Nieve'],77:['❄️','Granizo'],80:['🌦️','Chubascos'],81:['🌧️','Chubascos'],
      82:['⛈️','Chubascos fuertes'],85:['🌨️','Chubascos de nieve'],86:['❄️','Chubascos de nieve'],95:['⛈️','Tormenta'],
      96:['⛈️','Tormenta con granizo'],99:['⛈️','Tormenta fuerte']
    };
    return m[code] || ['🌡️','—'];
  }
  function renderWeather(d, name, sub) {
    var c = d.current || {}, dy = d.daily || {};
    var w = weatherInfo(c.weather_code);
    var mx = (dy.temperature_2m_max || [])[0], mn = (dy.temperature_2m_min || [])[0];
    weatherBody.innerHTML =
      '<div class="wx-now"><span class="wx-emoji">' + w[0] + '</span>' +
      '<div><div class="wx-temp">' + Math.round(c.temperature_2m || 0) + '°</div>' +
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
  function loadCapital() {
    var p = provMap[currentProv];
    if (p) loadCoords(p.la, p.lo, p.n, 'Capital');
  }

  function loadMunicipios(lat, lon, provName) {
    if (!munSelect) return;
    munSelect.disabled = true;
    munSelect.innerHTML = '<option value="">Cargando municipios…</option>';
    var dLat = 1.4, dLon = 1.9;
    var vb = (lon - dLon) + ',' + (lat + dLat) + ',' + (lon + dLon) + ',' + (lat - dLat);
    var url = 'https://nominatim.openstreetmap.org/search?viewbox=' + encodeURIComponent(vb) +
      '&bounded=1&format=jsonv2&limit=100&featuretype=settlement&addressdetails=1&accept-language=es&countrycodes=es';
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (arr) {
        var seen = {}, list = [];
        (arr || []).forEach(function (x) {
          var a = x.address || {};
          var name = a.municipality || a.city || a.town || a.village || a.city_district || a.suburb;
          if (!name) return;
          var key = norm(name);
          if (seen[key]) return; seen[key] = 1;
          list.push({ name: name, lat: x.lat, lon: x.lon });
        });
        list.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
        var opts = '<option value="">Capital (' + escapeHtml(provName) + ')</option>' +
          list.map(function (m) {
            return '<option value="' + m.lat + '|' + m.lon + '|' + escapeHtml(m.name) + '">' + escapeHtml(m.name) + '</option>';
          }).join('');
        munSelect.innerHTML = opts;
        munSelect.disabled = false;
      })
      .catch(function () {
        munSelect.innerHTML = '<option value="">Capital (' + escapeHtml(provName) + ')</option>';
        munSelect.disabled = false;
      });
  }

  if (provSelect) {
    var sorted = PROVINCIAS.slice().sort(function (a, b) { return a.n.localeCompare(b.n, 'es'); });
    provSelect.innerHTML = sorted.map(function (p) {
      return '<option' + (p.n === currentProv ? ' selected' : '') + '>' + p.n + '</option>';
    }).join('');
    provSelect.addEventListener('change', function () {
      currentProv = provSelect.value;
      var p = provMap[currentProv];
      loadCapital();
      if (p) loadMunicipios(p.la, p.lo, currentProv);
    });
  }
  if (munSelect) {
    munSelect.addEventListener('change', function () {
      var v = munSelect.value;
      if (!v) { loadCapital(); return; }
      var parts = v.split('|');
      loadCoords(parts[0], parts[1], parts[2], currentProv);
    });
  }
  loadCapital();
  (function () { var p = provMap[currentProv]; if (p) loadMunicipios(p.la, p.lo, currentProv); })();

  /* --- 2) HACKER NEWS (Firebase) --- */
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

  /* --- 3) HEATMAP GITHUB (jogruber interactivo + imagen real rshah de respaldo) --- */
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
  function ghPick(d) {
    return ghFromArr(d.days) || ghFromArr(d.lastYear) || ghFromObj(d.contributions);
  }

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
          } else {
            tryNext(i + 1);
          }
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
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px)";
      });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        requestAnimationFrame(loop);
      })();
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a")) {
          ring.classList.add("is-hover");
        }
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest("a,button,.copy-btn,.car-btn,.nav-link,.bottom-link,.social a")) {
          ring.classList.remove("is-hover");
        }
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
      if (!hero) return;
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
      var n = Math.min(70, Math.floor(canvas.width / 16));
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
        p.x += p.vx;
        p.y += p.vy;
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
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.globalAlpha = (1 - d / 110) * 0.25;
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
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) draw();
    });
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
          d2.addEventListener("keydown", function (e) {
            if (e.code === "Space") e.preventDefault();
          });
        } catch (e) {}
      });
      frame.addEventListener("click", focusGame);
      btn.parentNode.replaceChild(frame, btn);
      setTimeout(focusGame, 300);
    });
  });
})();