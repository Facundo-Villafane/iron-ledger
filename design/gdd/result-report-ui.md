# Result Report UI

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-13
> **Implements Pillar**: P1 / P2 — El momento de verdad

## Summary

Muestra los resultados de todas las misiones resueltas al final de cada turno. Es la pantalla de consecuencias — el jugador descubre qué pasó con cada misión.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` · Key deps: `Mission Resolution, Damage System`

## Overview

La Result Report UI aparece automáticamente después de que el Weekly Cycle resuelve todas las misiones. Muestra un reporte por cada misión resuelta en secuencia: éxito o fallo, créditos obtenidos, estado del mecha al volver, y estado del piloto. Al revisar todos los resultados, el jugador continúa a la siguiente semana.

La pantalla escucha la señal `resolution_complete(outcomes[])` del Weekly Cycle System y renderiza cada `MissionOutcome` en orden. El jugador avanza manualmente entre resultados — no hay avance automático — para que tenga tiempo de procesar cada consecuencia.

## Player Fantasy

Este es el momento de "abrir el sobre". El jugador avanzó el turno, ahora ve qué pasó. Un resultado tras otro — éxito con daño leve, fallo con piloto lesionado, éxito limpio. La secuencia importa emocionalmente: ver el nombre del piloto, su retrato, y debajo "LESIÓN GRAVE — 4 semanas de recuperación" es un momento de impacto que el diseño de la pantalla tiene que sostener.

El resultado no es solo información — es consecuencia de una decisión que el jugador tomó hace unos minutos. La pantalla lo hace sentir así.

## Detailed Design

### Flujo de pantalla

```
Weekly Cycle emite resolution_complete(outcomes[])
  → Result Report UI aparece
  → Muestra outcome[0]
  → Jugador presiona "Siguiente →"
  → Muestra outcome[1] ... outcome[N]
  → Jugador presiona "Ver cierre financiero" en el último
  → Pantalla cierra, Main Hangar Screen muestra nueva semana
```

---

### Contenido por reporte de misión

| Elemento | Fuente | Siempre visible |
|---|---|---|
| Nombre de misión | `mission.display_name` | ✓ |
| Resultado | `outcome.success` → "ÉXITO" / "FALLO" con color | ✓ |
| Créditos obtenidos | `outcome.credits_earned` ("+ 1.400 cr" / "± 0 cr") | ✓ |
| Retrato del piloto | `pilot.portrait_id` | ✓ |
| Nombre del piloto | `pilot.pilot_name` | ✓ |
| Estado del piloto | `outcome.pilot_injured` → "ILESO" / "LESIÓN LEVE" / "LESIÓN GRAVE" | ✓ |
| Sprite del mecha | `mecha.sprite_id` + `outcome.damage_severity` | ✓ |
| Estado del mecha | `outcome.mecha_damaged` → "INTACTO" / "DAÑO LEVE" / "DAÑO GRAVE" | ✓ |

---

### Estados visuales

| Resultado | Color principal | Tono |
|---|---|---|
| ÉXITO | Verde (`#5ab552`) | Positivo |
| ÉXITO + daño | Verde + badge naranja | Agridulce |
| FALLO | Rojo (`#ac2847`) | Negativo |
| FALLO + lesión grave | Rojo intenso (`#ec273f`) | Crítico |

## Formulas

No aplica — la UI solo lee y muestra `MissionOutcome`. Sin cálculos propios.

## Edge Cases

1. **Sin misiones asignadas ese turno**: `outcomes[]` está vacío. La pantalla muestra "Sin misiones resueltas esta semana" y un botón directo a la siguiente semana.
2. **Misión exitosa con daño grave al mecha**: ÉXITO en verde pero con badge de DAÑO GRAVE en naranja/rojo. El resultado agridulce más frecuente del juego.
3. **Un solo outcome**: la pantalla muestra directamente el botón "Ver cierre financiero" sin "Siguiente →".
4. **Múltiples outcomes**: el jugador navega uno por uno. No se puede ir "atrás" — los resultados ya están aplicados.

## Dependencies

| Sistema | Qué consume |
|---|---|
| **Weekly Cycle System** | Escucha señal `resolution_complete(outcomes[])` |
| **Mission Data System** | Lee `display_name` de cada misión resuelta |
| **Pilot Entity System** | Lee `pilot_name`, `portrait_id` |
| **Mecha Entity System** | Lee `mecha_name`, `sprite_id`, `damage_state` post-resolución |

## Tuning Knobs

Ninguno — la pantalla es presentación pura. Los colores siguen la paleta del art bible.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | La pantalla aparece automáticamente tras `resolution_complete` | Test manual: avanzar turno con misiones, verificar aparición | Integración |
| AC-2 | ÉXITO se muestra en verde, FALLO en rojo | Test manual: ambos casos, verificar colores | Visual |
| AC-3 | Daño GRAVE al mecha se muestra con badge aunque la misión sea exitosa | Test manual: éxito + HEAVY_DAMAGE, verificar badge | Visual |
| AC-4 | Lesión GRAVE al piloto muestra semanas de recuperación | Test manual: lesión grave, verificar "4 semanas de recuperación" | Visual |
| AC-5 | Sin misiones resueltas: pantalla muestra mensaje vacío y botón directo | Test manual: avanzar sin asignaciones, verificar mensaje | Visual |
| AC-6 | Navegación entre outcomes funciona en orden — sin posibilidad de retroceder | Test manual: 3 misiones, navegar forward, verificar no hay botón back | Visual |
