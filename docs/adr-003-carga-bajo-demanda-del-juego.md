# ADR-003 · Carga bajo demanda del juego (facade click-to-play)

**Fecha:** 2026-02-10 · **Estado:** Aceptado

## Contexto
En "Proyectos" tengo un juego hecho con GDevelop autoalojado en `juego/index.html`. La forma "fácil" de incrustarlo era un `<iframe>` directo en el HTML. Pero un iframe de GDevelop arranca el motor (WebGL, bucle de `requestAnimationFrame` y sus assets) **durante la carga inicial de la página**, justo cuando Lighthouse mide el LCP. Eso dispara el tiempo de carga y baja la nota de rendimiento, aunque el usuario ni haya hecho scroll hasta el juego.

## Decisión
No cargo el iframe en el HTML. Pongo una **fachada** —un `<button class="game-facade" data-src="juego/index.html">`— y solo inyecto el `<iframe>` cuando el usuario hace click. En `script.js`, el listener de `.game-facade` crea el iframe, le pone el `src` desde `data-src` y el `allow="autoplay; fullscreen; scripts"`, y lo sustituye en el DOM (`btn.parentNode.replaceChild`).

La misma filosofía la aplico a los `<video>` de "Me gusta": todos con `preload="none"`, para que no descarguen un solo byte hasta que el usuario les da a play.

## Consecuencias
- ✅ **LCP protegido:** el juego y los vídeos no penalizan la carga inicial; Lighthouse móvil sube a 92. El coste de render solo lo paga quien decide jugar.
- ✅ **Desacople URL/DOM:** la ruta del juego vive en `data-src`, no en el HTML, así que cambiar el juego es tocar un atributo, no reescribir la sección.
- ✅ **Accesibilidad:** al montar el iframe, `focusGame()` busca el `<canvas>` interno, le añade `tabindex="0"` y le pasa el foco, para que el teclado no se quede en la fachada muerta.
- ⚠️ **No es un embed "puro":** el juego no aparece solo al entrar, hace falta un click. Lo considero un trade-off aceptable a cambio del rendimiento.
- ⚠️ **Dependencia de la fachada:** si el JS no carga, el botón no hace nada. Lo mitigué dejando la fachada visible y con texto claro ("Pulsa para jugar"), no un iframe vacío.
