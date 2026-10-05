# Borja Albert Bataller · Web personal

Web personal estática construida a mano en 1º DAM (IES Simarro, Xàtiva).
Sin frameworks, sin plantillas: solo **HTML5, CSS3 y JavaScript vanilla**.
Gestionada con Git y desplegada en GitHub Pages.

---

## 🧱 Stack

| Capa           | Tecnología                                              |
|----------------|---------------------------------------------------------|
| Estructura     | HTML5 semántico (`header/main/section/article/nav/figure`) |
| Estilos        | CSS3 con custom properties (variables / design tokens)  |
| Comportamiento | JavaScript vanilla (IIFE, sin librerías externas)       |
| Versionado     | Git + GitHub                                            |
| Hosting        | GitHub Pages                                            |
| Contacto       | Formspree (envío real por correo)                       |

---

## 📁 Estructura del proyecto
. ├── index.html Página principal ├── styles.css Estilos + sistema de diseño (tokens) ├── script.js Lógica de interacción ├── img/ Imágenes propias └── docs/ ├── adr-001-css-variables.md └── adr-002-tema-localstorage.md

---

## ▶️ Cómo ejecutarla en local

**Opción A (VS Code):** extensión **Live Server** → botón "Go Live".

**Opción B (terminal):**

```bash
python -m http.server 8000
⚠️ Abrirla con doble clic (file://) puede fallar el fetch del formulario por CORS. Usa siempre un servidor local o GitHub Pages.

📨 Formulario de contacto · recorrido del dato
El usuario escribe en #formName, #formEmail, #formMsg.
Validación en tiempo real: regex de email, longitud mínima, contador de caracteres.
En submit se construye un objeto JS y se serializa con JSON.stringify.
fetch POST a https://formspree.io/f/mqpawkyp con Content-Type: application/json.
Formspree reenvía el correo al propietario y responde 200 OK.
Si r.ok → se muestra el modal de éxito; si falla → mensaje de error + mailto: de respaldo.
Campos _subject y _replyto son metadatos de Formspree (asunto del correo + responder-al remitente).

🎨 Sistema de diseño
Tema oscuro: negro + amarillo flúor (#d4ff00).
Tema claro: blanco + rojo (#ff2a2a).
Tipografía deliberada: Rajdhani (display) + Inter (texto).
Responsive real en 3 anchos: sidebar lateral (≥900px), sidebar plegable, bottom-nav móvil.
Respeta prefers-reduced-motion: desactiva animaciones y cursor personalizado.
♿ Accesibilidad
HTML semántico + atributos aria-* en modales, navegación y toggles.
skip-link, foco atrapado en diálogos, aria-live en el estado del formulario.
Contraste verificado en ambos temas, alt descriptivo en todas las imágenes.
Navegación por teclado completa: carrusel, lightbox, Esc para cerrar, t para cambiar tema.
🧭 Decisiones de arquitectura (ADRs)
ADR-001 · Variables CSS en vez de SASS → ver documento
ADR-002 · localStorage para la persistencia del tema → ver documento
🤖 Proceso y uso de IA
Desarrollo iterativo con Git: commits atómicos con mensajes que explican decisiones.

Prompts clave usados durante el desarrollo:

"Genera una web personal con HTML/CSS/JS vanilla, tema oscuro y sidebar con scroll-spy."
"Añade un formulario con validación en tiempo real y conexión a Formspree."
"Convierte el tema oscuro a negro + amarillo flúor y el claro a blanco + rojo."
"Revisa la rúbrica del curso y dime qué le falta a mi web para llegar a Excelente."
🗺️ Roadmap (v1 → v2)
 Formulario con envío real (Formspree)
 Documentación técnica (README + ADRs)
 Sección "Proyectos" consumiendo la API de GitHub
 Vídeo propio en la sección "Me gusta"
 CV descargable en PDF
 Lighthouse ≥ 90 en rendimiento y accesibilidad
© 2026 Borja Albert Bataller · 1º DAM · IES Simarro · Xàtiva
