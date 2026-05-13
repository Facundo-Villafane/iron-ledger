# Damage System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P2 — Apego a los recursos

## Summary

Aplica las consecuencias de daño e lesión a mechas y pilotos tras la resolución de misiones. Escribe los estados de daño y los contadores de recuperación.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Mission Resolution, Mecha Entity, Pilot Entity`

## Overview

El Damage System recibe cada `MissionOutcome` del Mission Resolution System y aplica sus consecuencias a las entidades afectadas. Si el mecha sufrió daño, actualiza su `damage_state` y, si el daño es grave, lo pone en `UNDER_REPAIR` con su contador de semanas. Si el piloto se lesionó, lo pone en `RECOVERING` con su contador de recuperación.

El sistema no cobra costos financieros — eso lo hace el Repair System al cierre semanal. El Damage System solo escribe estados y contadores, dejando el rastro que el Repair System y el Weekly Cycle System van a gestionar semana a semana.

También actualiza los contadores de historial de pilotos y mechas (`missions_completed`, `missions_failed`, `total_damage_received`) que la UI usa para mostrar el track record de cada unidad.

## Player Fantasy

El daño es la memoria del juego. Cuando el mecha vuelve con LIGHT_DAMAGE por tercera semana seguida, el jugador empieza a preguntarse si debería repararlo antes de mandarlo de nuevo. Cuando el piloto favorito queda RECOVERING cuatro semanas, ese vacío en el roster se siente físicamente.

El Damage System no crea esas emociones directamente — las habilita escribiendo los estados correctos en el momento correcto. El `UNDER_REPAIR` en la bahía 2 es lo que hace que el hangar se sienta incompleto. El `RECOVERING` del piloto es lo que fuerza al jugador a improvisar con quien tiene disponible.

## Detailed Design

### API pública

```
apply_damage(outcome: MissionOutcome) -> void
```

Llamado por el Weekly Cycle System para cada `MissionOutcome` después de la resolución.

---

### Flujo de aplicación de daño al mecha

```
si outcome.mecha_damaged:
    mecha.damage_state = outcome.damage_severity
    mecha.total_damage_received += 1

    si outcome.damage_severity == HEAVY_DAMAGE:
        mecha.status = UNDER_REPAIR
        mecha.repair_weeks_remaining = REPAIR_WEEKS_HEAVY

    si outcome.damage_severity == LIGHT_DAMAGE:
        # mecha.status se mantiene AVAILABLE
        # penalización de -0.05 aplicada por Risk Calculation en próxima misión
        pass
```

---

### Flujo de aplicación de lesión al piloto

```
si outcome.pilot_injured:
    pilot.status = RECOVERING

    si outcome.injury_severity == SEVERE:
        pilot.recovery_weeks_remaining = PILOT_INJURY_SEVERE_WEEKS
    sino:
        pilot.recovery_weeks_remaining = PILOT_RECOVERY_WEEKS
```

---

### Actualización de historial

```
si outcome.success:
    pilot.missions_completed += 1
    mecha.missions_completed += 1
sino:
    pilot.missions_failed += 1
```

---

### Señal emitida

| Señal | Cuándo |
|---|---|
| `damage_applied(pilot_id, mecha_id, outcome)` | Después de aplicar todo el daño de un outcome |

## Formulas

No aplica — el Damage System es lógica condicional pura. Los valores de `REPAIR_WEEKS_HEAVY`, `PILOT_RECOVERY_WEEKS`, `PILOT_INJURY_SEVERE_WEEKS` vienen de Game Configuration.

## Edge Cases

1. **Mecha ya tiene LIGHT_DAMAGE y recibe daño grave**: `damage_state` escala a HEAVY_DAMAGE directamente. No hay acumulación — LIGHT + HEAVY = HEAVY.
2. **Mecha ya tiene LIGHT_DAMAGE y recibe daño leve nuevamente**: `damage_state` se mantiene LIGHT_DAMAGE. El contador `total_damage_received` sube, el estado no cambia.
3. **Piloto lesionado en misión exitosa**: `injury_severity` siempre es LIGHT en éxito (definido en Mission Resolution). El sistema aplica `PILOT_RECOVERY_WEEKS` sin verificar — confía en el caller.
4. **`outcome.mecha_damaged = false`**: no se toca `damage_state` ni `status` del mecha. El mecha vuelve en el mismo estado en que salió.
5. **Misión fallida sin daño ni lesión**: solo se incrementa `pilot.missions_failed`. Ningún otro campo cambia.

## Dependencies

| Sistema | Relación |
|---|---|
| **Mission Resolution System** | Produce el `MissionOutcome` que Damage System consume |
| **Mecha Entity System** | Escribe `damage_state`, `status`, `repair_weeks_remaining`, `total_damage_received`, `missions_completed` |
| **Pilot Entity System** | Escribe `status`, `recovery_weeks_remaining`, `missions_completed`, `missions_failed` |
| **Game Configuration** | Lee `REPAIR_WEEKS_HEAVY`, `PILOT_RECOVERY_WEEKS`, `PILOT_INJURY_SEVERE_WEEKS` |
| **Weekly Cycle System** | Llama `apply_damage` para cada outcome tras la resolución |
| **Repair System** | Escucha el estado resultante — gestiona costos y countdown semanal |

## Tuning Knobs

Ninguno propio. Los tiempos de recuperación y reparación viven en Game Configuration (`REPAIR_WEEKS_HEAVY`, `PILOT_RECOVERY_WEEKS`, `PILOT_INJURY_SEVERE_WEEKS`).

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | HEAVY_DAMAGE pone al mecha en UNDER_REPAIR con `repair_weeks_remaining = REPAIR_WEEKS_HEAVY` | Test unitario: outcome con HEAVY_DAMAGE, assert mecha.status y weeks | Lógica |
| AC-2 | LIGHT_DAMAGE actualiza `damage_state` pero mantiene mecha en AVAILABLE | Test unitario: outcome con LIGHT_DAMAGE, assert status == AVAILABLE | Lógica |
| AC-3 | LIGHT_DAMAGE sobre mecha ya en LIGHT_DAMAGE no cambia el estado | Test unitario: aplicar dos LIGHT consecutivos, assert damage_state == LIGHT_DAMAGE | Lógica |
| AC-4 | HEAVY_DAMAGE sobre mecha en LIGHT_DAMAGE escala a HEAVY_DAMAGE | Test unitario: LIGHT → HEAVY, assert damage_state == HEAVY_DAMAGE | Lógica |
| AC-5 | Lesión SEVERE pone al piloto en RECOVERING con `PILOT_INJURY_SEVERE_WEEKS` | Test unitario: outcome con SEVERE, assert pilot.status y weeks | Lógica |
| AC-6 | Lesión LIGHT pone al piloto en RECOVERING con `PILOT_RECOVERY_WEEKS` | Test unitario: outcome con LIGHT injury, assert pilot.recovery_weeks_remaining | Lógica |
| AC-7 | Sin daño ni lesión: solo se actualiza el historial | Test unitario: outcome sin daño, assert solo missions_completed/failed cambia | Lógica |
| AC-8 | `damage_applied` se emite tras cada aplicación | Test unitario: conectar señal, assert emitida con pilot_id y mecha_id correctos | Lógica |
