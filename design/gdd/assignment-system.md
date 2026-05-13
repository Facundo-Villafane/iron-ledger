# Assignment System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre / P2 — Apego a los recursos

## Summary

Valida y registra la asignación de un piloto + mecha a una misión. Es la acción central del juego — la única decisión directa que toma el jugador.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Pilot Entity, Mecha Entity, Mission Generation`

## Overview

El Assignment System gestiona la acción principal del juego: asignar un piloto y un mecha a una misión disponible. Valida que la combinación sea legal (piloto AVAILABLE, mecha AVAILABLE, misión AVAILABLE, ninguno ya asignado a otra misión), registra la asignación en los tres objetos, y permite cancelarla o reasignarla mientras el turno no haya avanzado.

Es la única ventana de decisión directa del jugador. Antes de confirmar el avance de semana, el jugador puede ajustar todas sus asignaciones libremente — una vez que el turno avanza, las misiones pasan a IN\_PROGRESS y las asignaciones se vuelven inmutables hasta la resolución.

El sistema no calcula probabilidades ni resultados — eso lo hace Risk Calculation y Mission Resolution. El Assignment System solo se pregunta: ¿es esta combinación válida ahora mismo? Si sí, la registra. Si no, la rechaza con un motivo claro.

## Player Fantasy

Este es el momento del juego. El jugador mira el tablero: tres misiones disponibles, tres mechas en el hangar, tres pilotos en el roster. Tiene que decidir quién va a dónde — y sabe que una vez que avance la semana, no puede cambiar nada.

La tensión no viene de la mecánica de asignación en sí (es simple: seleccionar, confirmar) sino de las preguntas que la rodean. ¿Mando a García a la misión de combate difícil o lo reservo por si viene algo peor la semana que viene? ¿Vale la pena arriesgar el mecha de transporte en una misión que no es su especialización porque el de combate está en reparación?

El sistema tiene que ser lo suficientemente rápido y claro para que esa deliberación ocurra en la cabeza del jugador, no en la interfaz. Asignar, reasignar, cancelar — todo fluido, sin fricción técnica. La fricción es emocional, y esa es la parte buena.

## Detailed Design

[To be designed]

## Formulas

Este sistema no tiene fórmulas matemáticas. Su lógica es de validación booleana:

```
can_assign(pilot, mecha, mission) -> bool:
    return pilot.status == AVAILABLE
        and mecha.status == AVAILABLE
        and mission.status == AVAILABLE
        and pilot.assigned_mission_id == ""
        and mecha.assigned_mission_id == ""
```

El único cálculo relacionado que expone es el **conteo de asignaciones del turno**, usado por la UI para saber cuántos slots quedan:

```
assignments_this_turn = count(missions where status == ASSIGNED)
available_slots       = HANGAR_SLOTS - assignments_this_turn
```

## Edge Cases

1. **Piloto o mecha ya asignado a otra misión**: la validación falla en regla 4 o 5. La Assignment UI no debería mostrarlos como disponibles, pero si el sistema recibe el request igual, lo rechaza con motivo claro.

2. **El jugador no asigna ninguna misión y avanza la semana**: válido — el Weekly Cycle avanza, no hay misiones IN_PROGRESS, el cierre financiero igual descuenta costos fijos. Es una semana de déficit puro.

3. **Cancelar una asignación después de avanzar la semana**: imposible — una vez que el Weekly Cycle transiciona las misiones a IN_PROGRESS, el Assignment System no acepta cancelaciones. La UI bloquea esta acción.

4. **Reasignar una misión ya asignada**: el jugador cancela la asignación actual y hace una nueva. No es un flujo especial — es `cancel_assignment` seguido de `assign`. El sistema no tiene un método "reasignar" directo.

5. **Misión ASSIGNED intenta recibir una segunda asignación**: falla validación 3 (`mission.status != AVAILABLE`). Una misión solo puede tener un piloto y un mecha.

6. **Todos los pilotos disponibles, ningún mecha disponible (todos en reparación)**: `can_assign` falla para cualquier combinación. El jugador no puede hacer ninguna asignación ese turno. El sistema no genera error — simplemente no hay combinaciones válidas.

## Dependencies

| Sistema | Relación |
|---|---|
| **Pilot Entity System** | Lee y escribe `status`, `assigned_mission_id` |
| **Mecha Entity System** | Lee y escribe `status`, `assigned_mission_id` |
| **Mission Data System** | Lee y escribe `status`, `assigned_pilot_id`, `assigned_mecha_id` |
| **Game Configuration** | Lee `HANGAR_SLOTS` para calcular `available_slots` |
| **Weekly Cycle System** | Llama `get_current_assignments()` antes de avanzar |
| **Assignment UI** | Llama `assign`, `cancel_assignment`, `get_current_assignments` |
| **Risk Calculation System** | No depende directamente — la UI llama a Risk Calc por separado para mostrar el indicador |

## Tuning Knobs

Ninguno. El Assignment System es lógica de validación pura — no tiene valores ajustables. Los límites de asignación están determinados por `HANGAR_SLOTS` en Game Configuration.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | `assign` con piloto, mecha y misión AVAILABLE retorna OK y actualiza los tres objetos | Test unitario: setup válido, assert status de los tres == ASSIGNED | Lógica |
| AC-2 | `assign` con piloto RECOVERING retorna ERROR "Piloto no disponible" | Test unitario: piloto en RECOVERING, assert resultado == ERROR | Lógica |
| AC-3 | `assign` con mecha UNDER_REPAIR retorna ERROR "Mecha no disponible" | Test unitario: mecha en UNDER_REPAIR, assert resultado == ERROR | Lógica |
| AC-4 | `assign` con piloto ya asignado a otra misión retorna ERROR "Piloto ya asignado" | Test unitario: piloto ASSIGNED, assert resultado == ERROR | Lógica |
| AC-5 | `cancel_assignment` libera piloto, mecha y misión correctamente | Test unitario: cancelar asignación válida, assert los tres == AVAILABLE | Lógica |
| AC-6 | `cancel_assignment` después de avanzar semana es rechazado | Test unitario: misión IN_PROGRESS, assert cancelación rechazada | Lógica |
| AC-7 | `get_current_assignments` devuelve exactamente las misiones en estado ASSIGNED | Test unitario: 2 de 3 misiones asignadas, assert count == 2 | Lógica |
| AC-8 | Señal `assignment_made` se emite con los IDs correctos tras asignación exitosa | Test unitario: conectar señal, assert emitida con pilot_id, mecha_id, mission_id correctos | Lógica |
