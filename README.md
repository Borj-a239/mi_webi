# Borja Albert Bataller · Web personal

> Web personal hecha **a mano** con HTML, CSS y JavaScript vanilla. Sin frameworks, sin plantillas, sin generadores. Datos reales en vivo consumidos con `fetch`.

[![Live](https://img.shields.io/badge/🌐_Ver_web-en_vivo-cb3524?style=for-the-badge)](https://borj-a239.github.io/web-personal/)
[![GitHub](https://img.shields.io/badge/GitHub-Borj--a239-1c2b5e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Borj-a239)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-d4ff00?style=for-the-badge&color=d4ff00&labelColor=0a0a0f)](#licencia)

---

## 📌 Qué es

Esta es mi **primera web de marca personal**. No he usado React, Vue, Bootstrap ni WordPress: solo **HTML5, CSS3 y JavaScript puro**. Todo el CSS está hecho con variables (tokens) y todo el JS es código propio, organizado en módulos (IIFE).

Soy estudiante de **1º DAM** en el IES Simarro (Xàtiva). Vengo del hardware (GM de SMX) y ahora programo software: me gusta entender las cosas por dentro, de la pieza al código.

## 🚀 Características

- 🌗 **Tema claro/oscuro con persistencia** (`localStorage` + `prefers-color-scheme`).
- 🎨 **Dos paletas deliberadas**: negro + verde ácido (modo gamer) y rojiblanco del Atlético de Madrid (modo claro).
- 🧭 **Índice lateral con scroll-spy** (`IntersectionObserver`) y transición de cortina.
- 🖼️ **Carrusel + lightbox** accesibles (teclado, foco atrapado).
- 📂 **Proyectos en vivo** desde la API de GitHub, con buscador y filtro por lenguaje (estado en memoria, sin recargar).
- 📊 **Heatmap de actividad** de GitHub con fallback por imagen.
- 🌦️ **Tiempo de cualquier ciudad** (Open-Meteo) y 📰 **Hacker News** en directo.
- ✉️ **Formulario real** vía Formspree con validación en tiempo real.
- 🎮 **Juego GDevelop** autoalojado con fachada click-to-play (carga bajo demanda).
- 📄 **CV imprimible** que genera PDF desde el navegador.
- 🔍 **SEO y Open Graph** por página.
- ♿ **Accesibilidad**: `skip-link`, `aria-*`, foco atrapado en modales, `prefers-reduced-motion`.
- 🥚 **Easter egg Konami** con confeti.

## 🧰 Stack

| Capa | Tecnología |
|---|---|
| Marcado | HTML5 semántico |
| Estilos | CSS3 (variables/tokens, Grid, Flexbox) |
| Lógica | JavaScript vanilla (ES5+, IIFE) |
| Datos | APIs públicas: GitHub, Open-Meteo, Hacker News |
| Correo | Formspree (sin backend propio) |
| Versionado | Git + GitHub Pages |

**0 frameworks · 0 librerías · 0 build step.**

## 📁 Estructura

```text
web-personal/
├── index.html       → Página principal (9 secciones)
├── cv.html          → Currículum (4ª página) + print-to-PDF
├── 404.html         → Página de error
├── gracias.html     → Confirmación de envío
├── styles.css       → Hoja de estilos (tokens CSS, 2 temas)
├── script.js        → Lógica de la página principal
├── layout.js        → Componentes reutilizables (chrome de subpáginas)
├── docs/
│   ├── adr/         → Architecture Decision Records
│   └── prompts/     → Órdenes clave a la IA (archivadas)
├── img/             → Imágenes propias (WebP)
├── mp3/             → Audio propio
├── mp4/             → Vídeo propio
└── juego/           → Juego GDevelop autoalojado
```


## 🗂️ Páginas (4)

| Página | Propósito |
|---|---|
| `index.html` | Marca personal completa: sobre mí, formación, proyectos, gustos, en directo, caso de estudio, contacto. |
| `cv.html` | Currículum imprimible → **Descargar PDF** con `window.print()` y `@media print`. |
| `404.html` | Página de error personalizada. |
| `gracias.html` | Confirmación tras enviar el formulario. |

## 🎨 Temas (paleta deliberada)

**Modo oscuro** — negro + verde ácido:
```css
--bg: #000000; --accent: #d4ff00; --accent-2: #ffffff;

Modo claro — Atlético de Madrid (1ª equipación):

--bg: #ffffff; --accent: #cb3524; --accent-2: #1c2b5e;

Fondo de ratlles verticals rojiblanques (repeating-linear-gradient). Tipografies: Rajdhani (títulos, evoca HUD de videojoc) + Inter (lectura). El favicon canvia de color segons el tema (verd àcid ↔ vermell Atleti).

🌐 APIs consumides (3, sense backend ni claus)
API	Ús	Endpoint
GitHub	Repositoris + heatmap	api.github.com/users/Borj-a239/repos
Open-Meteo	Geocoding + temps	geocoding-api.open-meteo.com · api.open-meteo.com/v1/forecast
Hacker News	Notícies top	hacker-news.firebaseio.com/v0/topstories.json
✉️ Formulario: el recorrido del dato
El visitante rellena nombre, email y mensaje.
JS valida en tiempo real (longitud, regex de email).
Si es válido → fetch POST (JSON) a Formspree.
Formspree me reenvía el correo a boralbbat@alu.edu.gva.es con los datos.
Si la respuesta es ok → se resetea el formulario y se abre gracias.html (modal).
Si falla → se muestra error y se ofrece el mailto: como alternativa.
Sin backend propio, sin claves, sin servidor: el envío es directo al navegador.

📊 Rendimiento y accesibilidad (Lighthouse)
Métrica	Puntuación
Performance	92
Accessibility	97
Best Practices	96
SEO	100
Optimizaciones: imágenes en WebP con loading="lazy", display=swap en fuentes, canvas que se pausa con visibilitychange, prefers-reduced-motion respetado.

🏛️ Decisiones de arquitectura (ADRs)
Documentadas en docs/adr/:

ADR-001 — JavaScript vanilla en lugar de framework.
ADR-002 — Tema claro/oscuro con CSS variables + localStorage.
Cada ADR sigue el formato Contexto → Decisión → Consecuencias.

🤖 Proceso y uso de la IA
He usado IA como apoyo, no como generador automático. Las órdenes clave están archivadas en docs/prompts/. El trabajo real (validar, corregir, entender) es mío. El historial de commits y el changelog (v1.0 → v2.4) muestran la iteración.

📈 Métricas honestas
2 repositorios en GitHub
3 APIs externas consumidas
9 secciones propias
4 páginas
0 frameworks usados
~1.800 líneas de código (HTML+CSS+JS)
Para recalcular líneas: find . -name "*.html" -o -name "*.css" -o -name "*.js" | xargs wc -l

📝 Changelog
v2.4 — Favicon dinámico por tema + confeti Atleti.
v2.3 — Imágenes WebP (Performance 62 → 92) + CV imprimible (cv.html).
v2.2 — Tema claro Atlético de Madrid + layout.js (chrome reutilizable).
v2.1 — 4ª página (cv.html) + subpáginas coherentes.
v2.0 — Widgets en directo (tiempo, HN) + heatmap.
v1.9 — Formulario real (Formspree) + validación.
v1.8 — Proyectos en vivo desde GitHub.
v1.7 — Tema claro/oscuro persistente.
v1.0 — Primera versión.
📄 Licencia
MIT — usa el código como referencia, pero si copias, mantén el crédito.

© 2026 Borja Albert Bataller · Web en construcción 🚧 · Hecha a mano, sin frameworks.
