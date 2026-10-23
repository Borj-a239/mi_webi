# ADR-004 · Xatbot rule-based sin backend ni API keys

**Fecha:** 2026-02-28 · **Estado:** Aceptado

## Contexto
El criterio de "Contacto real" pide un canal con respuesta automática. Las opciones "pro" (un LLM vía la API del centro o de un proveedor) tienen un problema serio para una web estática: **las API keys se exponen en el frontend**, y además el correo de contacto (`boralbbat@alu.edu.gva.es`) es dato del centro que no quiero enviar por una API de terceros. No tengo backend propio. Necesitaba un asistente que respondiera solo, sin servidor, sin claves y sin sacar datos del navegador.

## Decisión
Construyo el **Xatbot** 100% en el cliente, sin red. Es un sistema de reglas, no de ML:

- **Base de conocimiento** (`BOT_KB`): array de intenciones con `keys` (palabras que activan), `res` (respuesta, a veces función), `quick` (chips de seguimiento) y `action` (acción de UI).
- **Matching por scoring** (`botBest`): normalizo el texto (quito acentos, bajo a minúsculas) y cuento cuántas `keys` de cada intención aparecen; gana la de mayor score. Sin embeddings, sin modelo.
- **Herramientas locales** (`botTool`): antes de las reglas, pruebo utilidades que sí dan valor — matemáticas (parser propio, ver ADR-005), fecha/hora, dados, moneda, unidades, color, contraseña, IMC, regla de tres. Todo se calcula en el navegador.
- **Acciones, no solo texto:** cada respuesta puede lanzar un botón `data-bot-action` que abre el formulario y lo **prefilladea** (`botOpenForm` rellena `#formName` con el nombre que le di), copia el correo, o salta a una sección.

## Consecuencias
- ✅ **Sin backend, sin keys, sin coste, sin filtraciones:** el único punto de salida a la red sigue siendo el submit del formulario a Formspree; el bot no envía nada.
- ✅ **Recorrido del dato explicable en la defensa:** input → `botTool` → `botBest` → `botReply` → acción. Todo local y auditable.
- ✅ **Privado por diseño:** el correo del centro no viaja por ninguna API externa; el bot lo lee de `INFO_CARDS` y lo copia al portapapeles si el usuario lo pide.
- ✅ **Accesible:** el log es `role="log" aria-live="polite"`, así que un lector de pantalla anuncia cada respuesta.
- ⚠️ **No entiende lenguaje libre:** solo responde a frases programadas. Lo dejé explícito en la intención `help`: *"soy un bot de reglas y solo respondo a un número limitado de frases programadas"*. Si no entiende, deriva al formulario.
- ⚠️ **El matching por keywords puede confundir intenciones cercanas** (p. ej. "proyecto" vs "proyectos"). Lo mitigué dando a cada intención varias `keys` y priorizando el score.
