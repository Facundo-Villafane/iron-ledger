# Weekly Cycle System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P1 / P2 / P3 — Orquesta todos los pilares

## Summary

Orquesta la secuencia completa de un turno de juego: generación de misiones → fase de asignación → resolución → consecuencias → cierre financiero. Es el director de escena del juego.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Mission Generation, Assignment, Mission Resolution, Damage, Repair, Financial Ledger, Game State Manager`

## Overview

El Weekly Cycle System orquesta la secuencia completa de un turno de juego. En el MVP, un "turno" equivale a una semana de tiempo de juego (no tiempo real — ver nota de diseño abajo). El sistema ejecuta las fases en orden: genera el pool de misiones, habilita la fase de asignación del jugador, espera la confirmación de avance, ejecuta la resolución de todas las misiones, aplica consecuencias, avanza los contadores de reparación y recuperación, y cierra el balance financiero.

No tiene lógica de gameplay propia — es el coordinador que llama a los sistemas correctos en el orden correcto. Si algún sistema falla, el Weekly Cycle es el punto de triage.

> **Nota de diseño — MVP vs futuro**: en el MVP, un turno = una semana de abstracción. Cuando se agregue el Daily Activity System (VS), el Weekly Cycle pasará a orquestar N ciclos diarios internamente. La API externa no cambia (el jugador sigue presionando "avanzar turno"), pero la semana se convierte en un contenedor de días con sus propias fases. El Weekly Cycle está diseñado para ser extensible en esa dirección.

> **Nota de tiempo de juego**: una "semana" en Iron Ledger es un turno de gestión, no una semana en tiempo real. Una partida completa de 12 semanas debería durar entre 30 minutos y 1 hora de juego real, dependiendo del jugador.

## Player Fantasy

El Weekly Cycle es el ritmo del juego. El jugador aprende a leer ese ritmo: asignar misiones, avanzar el turno, ver los resultados, pagar las cuentas, prepararse para la semana siguiente. La repetición es intencional — el juego vive en ese loop.

Lo que el jugador siente no es el sistema en sí, sino el **peso de avanzar la semana**. Presionar "Avanzar turno" es el momento de mayor tensión porque es el punto de no retorno. Las asignaciones están confirmadas, ya no se puede cambiar nada. El ciclo hace que ese botón tenga consecuencias reales.

## Detailed Design

### Fases del turno en orden

```
advance_week() -> void
```

Llamado cuando el jugador confirma "Avanzar turno". Ejecuta en secuencia:

---

**Fase 1 — Inicio de semana**
```
1. game_state.current_week += 1
2. Marcar misiones AVAILABLE no asignadas → EXPIRED
3. Transicionar misiones ASSIGNED → IN_PROGRESS
```

**Fase 2 — Resolución** *(automática, el jugador no interviene)*
```
4. Para cada misión IN_PROGRESS:
   a. outcome = mission_resolution.resolve_mission(mission)
   b. damage_system.apply_damage(outcome)
   c. ledger.add_credits(outcome.credits_earned) si outcome.success
5. Emitir resolution_complete(outcomes[]) → Result Report UI
```

**Fase 3 — Cierre**
```
6. repair_system.tick_weekly()
7. repair_costs = costos de reparaciones cobradas este turno
8. ledger.process_weekly_close(active_pilots, completed_missions, repair_costs)
9. win_lose_detection.check_conditions()
```

**Fase 4 — Nueva semana** *(solo si el juego continúa)*
```
10. mission_pool = mission_generation.generate_weekly_pool(current_week, guild_tier)
11. Emitir week_started(current_week, mission_pool) → habilita asignación
```

---

### Señales

| Señal | Cuándo |
|---|---|
| `resolution_complete(outcomes)` | Después de resolver todas las misiones |
| `week_started(week, pool)` | Después de generar el nuevo pool — habilita asignación |

## Formulas

Ninguna — el Weekly Cycle es pura orquestación secuencial. Todos los cálculos los realizan los sistemas que coordina.

## Edge Cases

1. **Jugador avanza sin ninguna asignación**: válido — Fase 2 no resuelve nada, no hay ingresos. El cierre igual descuenta costos fijos.
2. **`check_conditions` dispara GAME_OVER**: el Weekly Cycle no ejecuta la Fase 4. El juego transiciona a GAME_OVER y el pool de la semana siguiente nunca se genera.
3. **Todas las misiones fallan**: todos los `credits_earned` son 0. Cierre financiero con ingresos = 0. Semana de déficit puro.
4. **`advance_week` llamado dos veces seguidas**: el Game State Manager bloquea esto — no acepta avances durante la resolución.
5. **Semana 12**: `check_conditions` en Fase 3 evalúa victoria o derrota. Si hay victoria, VICTORY y la Fase 4 no se ejecuta.

## Dependencies

| Sistema | Qué hace el Weekly Cycle con él |
|---|---|
| **Game State Manager** | Incrementa `current_week`, consulta `guild_tier` |
| **Mission Generation System** | Llama `generate_weekly_pool` en Fase 4 |
| **Assignment System** | Llama `get_current_assignments` en Fase 1 |
| **Mission Resolution System** | Llama `resolve_mission` para cada misión en Fase 2 |
| **Damage System** | Llama `apply_damage` para cada outcome en Fase 2 |
| **Financial Ledger System** | Llama `add_credits` y `process_weekly_close` en Fases 2 y 3 |
| **Repair System** | Llama `tick_weekly` en Fase 3 |
| **Win/Lose Detection** | Llama `check_conditions` en Fase 3 |

## Tuning Knobs

Ninguno propio — el Weekly Cycle es estructura pura de orquestación.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | `advance_week` incrementa `current_week` en 1 | Test unitario: llamar una vez, assert current_week == 1 | Lógica |
| AC-2 | Misiones AVAILABLE no asignadas quedan EXPIRED al avanzar | Test unitario: misión sin asignar, advance, assert EXPIRED | Lógica |
| AC-3 | Misiones ASSIGNED transicionan a IN_PROGRESS antes de resolución | Test unitario: assert status IN_PROGRESS durante Fase 2 | Lógica |
| AC-4 | `resolution_complete` se emite con todos los outcomes | Test unitario: 2 misiones, assert señal con 2 outcomes | Lógica |
| AC-5 | Si `check_conditions` dispara GAME_OVER, Fase 4 no ejecuta | Test unitario: simular quiebra, assert pool no generado | Integración |
| AC-6 | Semana sin asignaciones: cierre financiero recibe ingresos = 0 | Test unitario: advance sin asignaciones, assert ledger solo con costos fijos | Lógica |
| AC-7 | `week_started` se emite con el pool correcto al inicio del nuevo turno | Test unitario: assert señal con pool de misiones de la semana | Lógica |
