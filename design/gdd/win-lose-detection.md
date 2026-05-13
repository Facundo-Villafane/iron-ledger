# Win/Lose Detection

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P3 — Presión financiera constante

## Summary

Verifica al cierre de cada semana si el gremio quebró o ganó la campaña. Emite señales al Game State Manager cuando se cumplen las condiciones.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Financial Ledger, Game State Manager`

## Overview

El Win/Lose Detection System verifica tres condiciones al cierre de cada semana y emite señales al Game State Manager cuando alguna se cumple.

**Condiciones de derrota:**
1. `balance < DEBT_CEILING` — deuda máxima alcanzada, quiebra inmediata
2. `consecutive_weeks_in_debt >= MAX_DEBT_WEEKS` — demasiado tiempo en rojo sin recuperarse

**Condición de victoria:**
3. `current_week >= VICTORY_WEEKS` y `balance >= VICTORY_MIN_CREDITS`

El sistema mantiene un contador interno `consecutive_weeks_in_debt` que se incrementa cada cierre donde `balance < 0` y se resetea a 0 cuando el balance vuelve a positivo. Esto permite que el gremio sobreviva temporalmente en números rojos — pero no indefinidamente y no con deuda ilimitada.

Las condiciones son específicas del modo campaña MVP. En un futuro modo infinito, este sistema sería reemplazado o desactivado.

## Player Fantasy

El jugador en crisis sabe exactamente cuánto tiempo tiene para remontar. Ver el contador de semanas en rojo en el HUD ("En deuda: 2/3 semanas") es presión pura — no es injusto, es información. El gremio tiene una semana más para conseguir dinero antes de que el banco cierre.

La quiebra inmediata por `DEBT_CEILING` es el muro de contención: hay un punto de no retorno donde la deuda es tan profunda que ninguna misión puede salvar al gremio. El jugador que llega ahí sabe que apostó mal y perdió — sin ambigüedad.

## Detailed Design

### Estado interno

| Campo | Tipo | Descripción |
|---|---|---|
| `consecutive_weeks_in_debt` | int | Semanas consecutivas con balance < 0. Se resetea al volver a positivo |

---

### `check_conditions()` — ejecutado por Weekly Cycle en Fase 3

```
balance = ledger.current_balance

# Actualizar contador de deuda
si balance < 0:
    consecutive_weeks_in_debt += 1
sino:
    consecutive_weeks_in_debt = 0

# Condición 1 — Deuda máxima
si balance < DEBT_CEILING:
    emitir game_over_triggered(reason: "DEBT_CEILING")
    return

# Condición 2 — Demasiado tiempo en rojo
si consecutive_weeks_in_debt >= MAX_DEBT_WEEKS:
    emitir game_over_triggered(reason: "DEBT_WEEKS")
    return

# Condición 3 — Victoria
si current_week >= VICTORY_WEEKS y balance >= VICTORY_MIN_CREDITS:
    emitir victory_triggered
    return
```

---

### Señales

| Señal | Cuándo |
|---|---|
| `game_over_triggered(reason)` | Cualquier condición de derrota |
| `victory_triggered` | Condición de victoria cumplida |

## Formulas

```
# Condición de deuda inmediata
is_immediate_bankruptcy = balance < DEBT_CEILING

# Condición de deuda prolongada
is_prolonged_bankruptcy = consecutive_weeks_in_debt >= MAX_DEBT_WEEKS

# Condición de victoria
is_victory = (current_week >= VICTORY_WEEKS) AND (balance >= VICTORY_MIN_CREDITS)
```

**Ejemplo — semana 8, balance -500 cr:**
- `DEBT_CEILING = -3000` → -500 > -3000 → sin quiebra inmediata
- `consecutive_weeks_in_debt = 2`, `MAX_DEBT_WEEKS = 3` → sin quiebra por tiempo aún
- El jugador tiene 1 semana más para salir del rojo

**Ejemplo — semana 8, balance -3200 cr:**
- -3200 < -3000 → quiebra inmediata, sin importar el contador

## Edge Cases

1. **Balance exactamente en `DEBT_CEILING`** (e.g. -3000 exacto): la condición es `< DEBT_CEILING`, no `≤`. Balance = -3000 no dispara quiebra inmediata — es el último borde antes del precipicio.
2. **Victoria y quiebra en la misma semana**: imposible por orden de verificación. La condición de deuda se chequea primero — si hay quiebra, se emite `game_over_triggered` y se retorna antes de chequear victoria.
3. **`consecutive_weeks_in_debt` resetea al volver a 0 exactamente**: `balance >= 0` resetea el contador. Un balance de 0 no es deuda — el jugador no pierde por llegar a cero, solo si cae negativo.
4. **Semana 12 con balance positivo pero menor a `VICTORY_MIN_CREDITS`**: no hay victoria — el jugador sobrevivió pero no alcanzó el capital mínimo. El juego continúa... pero ya no hay más semanas. El resultado es GAME_OVER por "no se alcanzó la victoria" aunque el gremio no quebró. Este caso requiere un `reason` especial: "TIMEOUT".
5. **Modo futuro sin condiciones de victoria**: `check_conditions` puede ser configurado para ignorar la condición de victoria — el juego corre indefinidamente.

## Dependencies

| Sistema | Qué consume |
|---|---|
| **Financial Ledger System** | Lee `current_balance` |
| **Game State Manager** | Lee `current_week`; escucha las señales `game_over_triggered` y `victory_triggered` |
| **Game Configuration** | Lee `DEBT_CEILING`, `MAX_DEBT_WEEKS`, `VICTORY_WEEKS`, `VICTORY_MIN_CREDITS` |
| **Weekly Cycle System** | Llama `check_conditions()` en Fase 3 de cada turno |

## Tuning Knobs

| Knob | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|
| `DEBT_CEILING` | `-3000` | `-1500 – -5000` | Cuánta deuda máxima se tolera. Más cerca de 0 = juego más punitivo |
| `MAX_DEBT_WEEKS` | `3` | `2 – 5` | Cuánto tiempo en rojo se permite. Con 2: muy poco margen / Con 5: demasiado tiempo sin consecuencias |
| `VICTORY_MIN_CREDITS` | `5000` | `2000 – 10000` | Capital mínimo para ganar. Más alto = victoria más difícil de sostener |

**Nota**: `DEBT_CEILING` y `MAX_DEBT_WEEKS` trabajan juntos. Con valores agresivos en ambos (e.g. -1500 y 2 semanas), el juego se vuelve muy punitivo. Calibrar en playtesting.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Balance < `DEBT_CEILING` dispara `game_over_triggered` inmediatamente | Test unitario: balance = -3001, assert señal emitida | Lógica |
| AC-2 | Balance = `DEBT_CEILING` exacto NO dispara quiebra | Test unitario: balance = -3000, assert sin señal | Lógica |
| AC-3 | 3 semanas consecutivas en rojo disparan `game_over_triggered` | Test unitario: simular 3 cierres con balance negativo, assert señal en semana 3 | Lógica |
| AC-4 | `consecutive_weeks_in_debt` se resetea cuando el balance vuelve a ≥ 0 | Test unitario: 2 semanas negativas + 1 positiva, assert contador == 0 | Lógica |
| AC-5 | Semana 12 con balance ≥ `VICTORY_MIN_CREDITS` dispara `victory_triggered` | Test unitario: current_week=12, balance=5000, assert señal | Lógica |
| AC-6 | Semana 12 con balance positivo pero < `VICTORY_MIN_CREDITS` dispara GAME_OVER con reason "TIMEOUT" | Test unitario: current_week=12, balance=3000, assert GAME_OVER | Lógica |
| AC-7 | Quiebra se verifica antes que victoria — si ambas aplican, gana la quiebra | Test unitario: semana 12, balance = -3500, assert GAME_OVER no VICTORY | Lógica |
