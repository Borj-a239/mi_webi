# ADR-002 · Persistencia del tema con localStorage

- **Estado:** Aceptado
- **Fecha:** 2026
- **Decisores:** Borja Albert Bataller

---

## Contexto

El usuario debe recordar su preferencia de tema entre visitas y sesiones,
aunque no haya backend ni sesión de usuario. La web se sirve como estática
desde GitHub Pages, así que no puedo guardar la preferencia en el servidor.

## Decisión

Guardar el tema elegido en `localStorage` bajo la clave `"theme"`, con un
**script inline en el `<head>`** que lo lee antes del primer render, y un
`try/catch` alrededor de la lectura/escritura.

## Consecuencias

### ✅ Positivas

- Persistencia entre visitas sin backend ni cookies.
- El script inline evita el **FOUC** (flash del tema incorrecto al cargar).
- Valor inicial derivado de `prefers-color-scheme`, respetando la preferencia del sistema.
- `try/catch` protege contra navegadores en modo privado o `localStorage` corrupto.

### ⚠️ Negativas / trade-offs

- No sincroniza la preferencia entre dispositivos o navegadores distintos.
- Si el usuario limpia el almacenamiento, se pierde la elección (vuelve a la del sistema).
- El script inline duplica algo de lógica con `script.js` (a cambio de no parpadear).

### 💡 Justificación

Para una web personal estática, `localStorage` es la opción más simple que
cumple el requisito de persistencia. La alternativa (cookies) sería más
compleja y no aportaría ventaja; un backend sería desproporcionado.
