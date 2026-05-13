# Repair System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P2 — Apego a los recursos / P3 — Presión financiera constante

## Summary

Gestiona el countdown semanal de reparaciones de mechas y recuperación de pilotos. Calcula y reporta los costos de reparación para el cierre financiero semanal.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Damage System, Financial Ledger`

## Overview

El Repair System tiene dos responsabilidades: calcular los costos de reparación de cada semana para el Financial Ledger, y hacer avanzar los contadores de reparación/recuperación al cierre de cada turno.

Las reparaciones son automáticas — el jugador no tiene que iniciarlas manualmente. El daño LIGHT se repara al cierre de la semana siguiente (costo `REPAIR_COST_LIGHT`, mecha vuelve a INTACT). El daño HEAVY tarda `REPAIR_WEEKS_HEAVY` semanas en resolverse (costo `REPAIR_COST_HEAVY` cobrado la semana que ocurre el daño). La recuperación de pilotos lesionados se decrementa también al cierre de cada semana hasta que el piloto vuelve a AVAILABLE.

Al final de cada semana el sistema devuelve al Weekly Cycle System el total de costos de reparación, que el Weekly Cycle pasa al Financial Ledger como parte del cierre financiero.

## Player Fantasy

La reparación manual pone al jugador ante una decisión económica real cada vez que un mecha vuelve dañado. ¿Reparo el mecha con daño leve ahora (400 cr, 1 semana fuera) para mandarlo óptimo la próxima, o lo mando igual con el riesgo de que vuelva roto y cueste 900 cr más 3 semanas fuera?

Un mecha BROKEN en la bahía es un slot que no genera ingresos. Si el jugador no tiene dinero para repararlo, tiene que sobrevivir con menos capacidad de misiones y menos ingresos posibles — lo que hace aún más difícil juntar el dinero para repararlo. Esa espiral de presión es exactamente el Pilar 3 en acción.

## Detailed Design

### API pública

| Método | Parámetros | Descripción |
|---|---|---|
| `repair_mecha(mecha_id)` | String | Jugador inicia reparación — valida fondos, cobra costo, inicia countdown |
| `tick_weekly()` | — | Decrementa contadores, transiciona estados completados al cierre de semana |

---

### Flujo de `repair_mecha`

```
si mecha.damage_state == HEAVY_DAMAGE y mecha.status == BROKEN:
    costo = REPAIR_COST_HEAVY
    semanas = REPAIR_WEEKS_HEAVY

si mecha.damage_state == LIGHT_DAMAGE y mecha.status == AVAILABLE:
    costo = REPAIR_COST_LIGHT
    semanas = REPAIR_WEEKS_LIGHT

ledger.deduct_credits(costo, REPAIR, "Reparación: " + mecha.mecha_name)
mecha.status = UNDER_REPAIR
mecha.repair_weeks_remaining = semanas
emitir repair_initiated(mecha_id, costo, semanas)
```

---

### Flujo de `tick_weekly` (llamado por Weekly Cycle al cierre de semana)

```
para cada piloto con status == RECOVERING:
    pilot.recovery_weeks_remaining -= 1
    si recovery_weeks_remaining == 0:
        pilot.status = AVAILABLE
        emitir pilot_recovered(pilot_id)

para cada mecha con status == UNDER_REPAIR:
    mecha.repair_weeks_remaining -= 1
    si repair_weeks_remaining == 0:
        mecha.status = AVAILABLE
        mecha.damage_state = INTACT
        emitir mecha_repaired(mecha_id)
```

---

### Señales

| Señal | Cuándo |
|---|---|
| `repair_initiated(mecha_id, cost, weeks)` | Jugador inicia reparación |
| `mecha_repaired(mecha_id)` | Reparación completada, mecha vuelve a AVAILABLE |
| `pilot_recovered(pilot_id)` | Piloto vuelve a AVAILABLE |

## Formulas

Ninguna propia — los costos y tiempos vienen de Game Configuration (`REPAIR_COST_LIGHT`, `REPAIR_COST_HEAVY`, `REPAIR_WEEKS_LIGHT`, `REPAIR_WEEKS_HEAVY`).

## Edge Cases

1. **Jugador intenta reparar sin suficientes créditos**: `repair_mecha` verifica `ledger.current_balance ≥ costo` antes de proceder. Si no alcanza, emite `repair_failed(mecha_id, "fondos insuficientes")` y no modifica ningún estado.

2. **Jugador repara mecha BROKEN la misma semana que se dañó**: válido — paga, inicia countdown ese mismo turno. El mecha no estará disponible hasta la semana N + `REPAIR_WEEKS_HEAVY`.

3. **`tick_weekly` con counter ya en 0**: no debería ocurrir — el tick anterior ya transicionó el estado. Si ocurre, el sistema ignora silenciosamente.

4. **Mecha UNDER_REPAIR recibe otro intento de `repair_mecha`**: rechazado — el mecha ya está siendo reparado.

5. **Todos los pilotos RECOVERING + todos los mechas BROKEN**: el jugador no puede hacer asignaciones. Solo puede esperar y reparar si tiene fondos. Es el peor estado posible del gremio — y una situación de gameplay válida.

## Dependencies

| Sistema | Relación |
|---|---|
| **Damage System** | Establece los estados iniciales (BROKEN, LIGHT_DAMAGE) que Repair System gestiona |
| **Financial Ledger System** | `repair_mecha` llama `deduct_credits` para cobrar el costo |
| **Mecha Entity System** | Escribe `status`, `damage_state`, `repair_weeks_remaining` |
| **Pilot Entity System** | Escribe `status`, `recovery_weeks_remaining` en `tick_weekly` |
| **Weekly Cycle System** | Llama `tick_weekly` al cierre de cada semana |
| **Main Hangar Screen UI** | Muestra el botón "Reparar" para mechas BROKEN y LIGHT_DAMAGE |

## Tuning Knobs

Los mismos que en Game Configuration: `REPAIR_COST_LIGHT`, `REPAIR_COST_HEAVY`, `REPAIR_WEEKS_LIGHT`, `REPAIR_WEEKS_HEAVY`. Ver Game Configuration GDD para rangos seguros y notas de tuning.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | `repair_mecha` con fondos suficientes cobra el costo correcto e inicia countdown | Test unitario: assert deducción + status UNDER_REPAIR + weeks correctos | Lógica |
| AC-2 | `repair_mecha` sin fondos suficientes es rechazado sin cambiar estado | Test unitario: balance < costo, assert estado sin cambios | Lógica |
| AC-3 | `tick_weekly` decrementa `repair_weeks_remaining` en 1 | Test unitario: mecha con 2 weeks, tick, assert 1 | Lógica |
| AC-4 | Cuando countdown llega a 0, mecha → AVAILABLE + INTACT | Test unitario: mecha con 1 week, tick, assert status y damage_state | Lógica |
| AC-5 | `tick_weekly` decrementa `recovery_weeks_remaining` del piloto en 1 | Test unitario: piloto con 3 weeks, tick, assert 2 | Lógica |
| AC-6 | Cuando countdown piloto llega a 0, piloto → AVAILABLE | Test unitario: piloto con 1 week, tick, assert status == AVAILABLE | Lógica |
| AC-7 | Mecha UNDER_REPAIR no puede recibir otra llamada a `repair_mecha` | Test unitario: assert rechazado con mecha ya UNDER_REPAIR | Lógica |
