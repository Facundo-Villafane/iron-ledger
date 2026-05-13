# Main Hangar Screen UI

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-13
> **Implements Pillar**: P1 / P2 / P3 — Pantalla principal donde viven los tres pilares

## Summary

La pantalla central del juego. Muestra el estado del hangar, el roster de pilotos, las misiones disponibles, y el estado financiero. Es donde el jugador toma todas sus decisiones.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` · Key deps: `Pilot Entity, Mecha Entity, Mission Generation, Financial Ledger, Assignment System, Repair System`

## Overview

La Main Hangar Screen es la pantalla donde el jugador pasa la mayor parte del tiempo. Muestra simultáneamente el estado de los mechas en sus bahías, el roster de pilotos, las misiones disponibles de la semana, el balance financiero con su proyección de supervivencia, y los controles de reparación. Desde esta pantalla el jugador accede a la Assignment UI (al seleccionar una misión) y puede iniciar reparaciones de mechas dañados.

La pantalla tiene cuatro zonas visuales: **Header** (semana actual, balance, runway), **Panel de Hangar** (las bahías con el estado de cada mecha), **Panel de Roster** (los pilotos con su estado), y **Panel de Misiones** (el pool disponible). El botón "Avanzar turno" está siempre visible.

El diseño sigue la dirección visual "Industrial Ledger": la información se presenta como un tablero operativo. Los números críticos — balance y semanas en rojo — deben ser legibles de un vistazo.

> **Constraint de escalabilidad**: todas las listas (bahías, pilotos, mechas) se renderizan dinámicamente desde los datos — nunca hardcodeadas. El layout debe funcionar correctamente con 3 bahías (MVP) y escalar a 4–6 bahías cuando se agreguen upgrades de hangar en versiones futuras. Mismo criterio para el roster de pilotos.

## Player Fantasy

El jugador abre el hangar y ve todo de un vistazo: bahía 1 operativa, bahía 2 con el mecha en reparación, bahía 3 lista. Roster: García disponible, Reyes recovering semana 3/4, Torres asignado. Misiones: 4 disponibles, una de alto riesgo que paga bien.

No necesita navegar entre pantallas para entender el estado del gremio. Todo está ahí, en una sola pantalla, como el tablero de operaciones de un negocio real. La información es densa pero organizada — el jugador experimentado lee el estado completo en segundos.

La tensión visual es parte del diseño: ver una bahía vacía (mecha BROKEN sin reparar), ver a los pilotos con sus indicadores de estado, ver el balance en rojo con el contador de semanas — todo eso cuenta una historia sin necesitar texto de narrativa.

## Detailed Design

### Layout de la pantalla

```
┌──────────────────────────────────────────────────────────────┐

│  HEADER: Semana 4/12 │ Balance: 6.200 cr │ Runway: 2 semanas │

├───────────────────┬──────────────────────────────────────────┤

│  PANEL HANGAR     │  PANEL MISIONES                          │

│  ┌──┐ ┌──┐ ┌──┐   │  [Misión 1] [Misión 2]                   │

│  │B1│ │B2│ │B3│   │  [Misión 3] [Misión 4]                   │

│  └──┘ └──┘ └──┘   │                                          │

├───────────────────┤                                          │

│  PANEL ROSTER     │                                          │

│  [P1] [P2] [P3]   │                                          │

└───────────────────┴───────────────────[AVANZAR TURNO]────────┘
```

*Las grillas de bahías y pilotos renderizan dinámicamente — el layout escala de 3 a N slots sin cambios de código.*

---

### Header

| Elemento | Dato | Estado visual |
|---|---|---|
| Número de semana | `current_week / VICTORY_WEEKS` | Texto neutro |
| Balance | `ledger.current_balance` | Verde si ≥ 0, rojo si < 0 |
| Runway | `weeks_of_runway` | Amarillo si ≤ 3, rojo si ≤ 1 |
| Semanas en rojo | `consecutive_weeks_in_debt / MAX_DEBT_WEEKS` | Solo visible si balance < 0 |

---

### Panel de Hangar — por bahía

| Elemento | Fuente |
|---|---|
| Sprite del mecha | `mecha.sprite_id` + `mecha.damage_state` |
| Nombre | `mecha.mecha_name` |
| Tipo | `mecha.mecha_type` (ícono) |
| Estado | `mecha.status` — badge de color |
| Semanas de reparación restantes | `mecha.repair_weeks_remaining` (si UNDER_REPAIR) |
| Botón "Reparar" | Visible si `damage_state != INTACT` y `status != UNDER_REPAIR` |

---

### Panel de Roster — por piloto

| Elemento | Fuente |
|---|---|
| Retrato | `pilot.portrait_id` |
| Nombre | `pilot.pilot_name` |
| Skill | `pilot.skill_level` (barras o número) |
| Especialización | `pilot.specialization` (ícono) |
| Rasgo | `pilot.trait` |
| Estado | `pilot.status` — badge de color |
| Semanas de recuperación | `pilot.recovery_weeks_remaining` (si RECOVERING) |

---

### Panel de Misiones

Grilla de cards clickeables → abre Assignment UI.

| Elemento | Fuente |
|---|---|
| Nombre | `mission.display_name` |
| Tipo | `mission.type` (ícono) |
| Zona | `mission.zone_type` |
| Reward hint | `mission.reward_hint` |
| Duración | `mission.duration_weeks` |
| Risk tags | `mission.risk_tags` |
| Badge "ASIGNADA" | Si `mission.status == ASSIGNED` |

---

### Botón "Avanzar turno"

- Siempre visible
- Deshabilitado durante resolución
- Muestra confirmación si hay misiones sin asignar: "¿Seguro? Quedan X misiones disponibles sin asignar"

## Formulas

No aplica — la UI solo lee y muestra datos. La derivación de `weeks_of_runway` la calcula el Financial Ledger.

## Edge Cases

1. **Todas las bahías BROKEN**: Panel de Hangar muestra todas en estado roto. Botón "Avanzar turno" sigue activo.
2. **Pool de misiones vacío**: Panel de Misiones muestra "Sin misiones disponibles esta semana".
3. **Balance negativo**: número en rojo, contador de semanas en rojo visible en header.
4. **Mecha BROKEN sin fondos para reparar**: botón "Reparar" visible pero costo en rojo. Al intentar: mensaje "Fondos insuficientes", sin cambio de estado.
5. **Más de 5 misiones** (futura expansión): Panel de Misiones hace scroll. En MVP no ocurre.
6. **Más de 3 bahías o pilotos** (upgrades futuros): grillas se expanden dinámicamente sin cambios de código.

## Dependencies

| Sistema | Qué lee/llama la UI |
|---|---|
| **Mecha Entity System** | Todos los campos de cada mecha |
| **Pilot Entity System** | Todos los campos de cada piloto |
| **Mission Generation System** | Pool de misiones AVAILABLE |
| **Financial Ledger System** | `current_balance`, `weeks_of_runway`, `consecutive_weeks_in_debt` |
| **Assignment System** | Llama `cancel_assignment` al cancelar una asignación |
| **Repair System** | Llama `repair_mecha` al presionar "Reparar" |
| **Weekly Cycle System** | Llama `advance_week` al presionar "Avanzar turno" |
| **Game State Manager** | Lee `current_week` |

## Tuning Knobs

Ninguno propio. Los umbrales de color (runway ≤ 3 = amarillo, ≤ 1 = rojo) son constantes de UI ajustables en la implementación, no en Game Configuration.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | La pantalla muestra el estado correcto de todas las bahías al iniciar semana | Test manual: verificar cada badge de estado contra datos reales | Visual |
| AC-2 | Balance negativo muestra número en rojo y contador de semanas en rojo | Test manual: forzar balance negativo, verificar colores | Visual |
| AC-3 | Botón "Reparar" visible solo para mechas con daño no en reparación | Test manual: verificar visibilidad en cada estado de daño | Visual |
| AC-4 | Botón "Reparar" con fondos insuficientes muestra mensaje sin iniciar reparación | Test manual: balance < costo, intentar reparar, verificar mensaje | Integración |
| AC-5 | Click en misión disponible abre Assignment UI con esa misión pre-seleccionada | Test manual: click → verificar que Assignment UI abre con la misión correcta | Integración |
| AC-6 | Confirmación aparece al avanzar turno con misiones sin asignar | Test manual: dejar misiones sin asignar, click avanzar, verificar dialog | Visual |
| AC-7 | La grilla de bahías renderiza correctamente con 3 y con 5 slots | Test manual: cambiar HANGAR_SLOTS en config, verificar layout | Visual |
