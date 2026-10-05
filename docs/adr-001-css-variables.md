# ADR-001 · Variables CSS en vez de SASS

- **Estado:** Aceptado
- **Fecha:** 2026
- **Decisores:** Borja Albert Bataller

---

## Contexto

La web necesita un sistema de diseño coherente con **dos temas** (claro/oscuro)
que se pueda cambiar en tiempo real, sin recompilar nada. El proyecto es una
web estática de una sola página, servida directamente desde GitHub Pages, y
estoy aprendiendo a fondo el stack nativo en 1º DAM.

## Decisión

Usar **CSS Custom Properties** (`--accent`, `--bg`, `--text`, etc.) declaradas
en `:root` y redefinidas bajo `:root[data-theme="..."]`, en lugar de un
preprocesador como SASS o LESS.

## Consecuencias

### ✅ Positivas

- Cero dependencias y cero build tool: el CSS final es el CSS que escribo.
- El cambio de tema se aplica en **runtime** (solo cambia un atributo `data-theme`),
  sin recompilar ni recargar la página.
- Integración natural con `localStorage` y con `prefers-color-scheme`.
- Legibilidad: cualquier persona entiende el sistema de un vistazo.

### ⚠️ Negativas / trade-offs

- No tengo anidado, mixins ni funciones propias de SASS.
- En un proyecto muy grande, la gestión manual de tokens podría volverse farragosa.

### 💡 Justificación

Para una web estática de una sola página, el coste de configurar un pipeline de
compilación no se paga. Las variables CSS nativas resuelven exactamente el
problema (tematización en runtime) con menos complejidad. Si el proyecto
creciera a un SPA multi-página, reconsideraría un sistema de tokens con build.
