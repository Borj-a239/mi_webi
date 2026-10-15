(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  function theme() { return document.documentElement.dataset.theme || "dark"; }

  /* Favicon dinàmic: Atleti (clar) / verd àcid (fosc) */
  function setFavicon(t) {
    var l = document.querySelector('link[rel="icon"]');
    if (!l) return;
    var bg = t === "light" ? "%23cb3524" : "%23d4ff00";
    var tx = t === "light" ? "white" : "black";
    l.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='" + bg + "'/><text x='50%25' y='54%25' font-family='Arial' font-size='30' font-weight='900' fill='" + tx + "' text-anchor='middle' dominant-baseline='middle'>BA</text></svg>";
  }
  setFavicon(theme());

  /* Inyectar chrome compartit */
  document.body.insertAdjacentHTML("afterbegin",
      '<a class="skip-link" href="#contenido">Saltar al contenido principal</a>'
    + '<div class="cursor-dot" id="cursorDot" aria-hidden="true"></div>'
    + '<div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>'
    + '<button class="theme-toggle" id="themeToggle" aria-label="Cambiar modo claro/oscuro">'
    +   '<svg class="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>'
    +   '<svg class="icon icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>'
    + '</button>');

  /* Theme toggle funcional (sense dependre de script.js) */
  var tt = document.getElementById("themeToggle");
  var meta = document.querySelector('meta[name="theme-color"]');
  if (tt) tt.addEventListener("click", function () {
    var next = theme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    if (meta) meta.setAttribute("content", next === "light" ? "#ffffff" : "#0a0a0f");
    try { localStorage.setItem("theme", next); } catch (e) {}
    setFavicon(next);
  });

  /* Cursor personalitzat */
  if (fine && !reduced) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) { if (e.target.closest("a,button")) ring.classList.add("is-hover"); });
    document.addEventListener("mouseout",  function (e) { if (e.target.closest("a,button")) ring.classList.remove("is-hover"); });
  }
})();