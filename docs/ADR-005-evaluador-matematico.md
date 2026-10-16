# ADR-005 · Evaluador matemático propio en el Xatbot (sin eval)

## Estado
Aceptada.

## Contexto
El Xatbot (ADR-004) debía poder calcular. La tentación obvia en JS es
`eval(expresion)` o `new Function("return " + expresion)`. Pero en un chat público
de una web estática eso es una **puerta de inyección de código**: un usuario
escribiría algo malicioso y el navegador lo ejecutaría con mis permisos. Tampoco
quería traer una librería (contradice "sin dependencias" del criterio 6).

## Decisión
Implementar un **parser propio** dentro de `script.js`:
- **Tokenizador**: recorre el string y emite tokens (num, nombre, operador,
  paréntesis, coma). Rechaza cualquier carácter fuera del conjunto matemático.
- **Descenso recursivo** con precedencia correcta:
  `expr → term → factor → unary → primary`, con `^` asociativa por la derecha y
  funciones con argumentos (`sqrt`, `sin`, `cos`, `tan`, `log`, `ln`, `abs`,
  `round`, `floor`, `ceil`, `pow`, `min`, `max`, `hypot`, `sign`) y constantes
  (`pi`, `e`).
- El *dispatcher* (`botTool`) intenta el parser **antes** de puntuar intenciones;
  si el texto no parsea limpio, devuelve `null` y cae al `BOT_KB`. Así una frase
  normal nunca se confunde con una operación.

## Consecuencias
- Positivas: **cero riesgo de inyección** (no se evalúa código), cero dependencias,
  control total de errores (división por cero, token inesperado → no se rompe la
  página, simplemente no se trata como matemática), y es un ejercicio típico de
  Programación que puedo explicar en la defensa.
- Negativas: no entiende notación libre como "dos más dos" (solo `2+2`); las
  funciones exigen paréntesis. Mitigado con el `help` que da ejemplos.

## Justificación
Un evaluador propio convierte un riesgo de seguridad en una demostración de
competencia técnica. Prefiero 80 líneas de parser que una línea de `eval()` que me
puede costar la nota de arquitectura (y la seguridad del visitante).
