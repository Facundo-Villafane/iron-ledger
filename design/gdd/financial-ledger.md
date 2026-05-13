# Financial Ledger System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P3 — Presión financiera constante

## Summary

Gestiona el balance de créditos del gremio, el historial de transacciones, y los costos fijos semanales. Es la capa económica del juego.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Game Configuration`

## Overview

El Financial Ledger System mantiene el balance de créditos del gremio, registra cada transacción con su categoría y semana, y calcula el cierre financiero al final de cada semana. Es el árbitro económico del juego: sin él, no hay presión financiera, no hay game over por quiebra, y no hay condición de victoria económica.

El sistema expone tres funciones centrales: agregar créditos (`add_credits`), descontar créditos (`deduct_credits`), y ejecutar el cierre semanal (`process_weekly_close`). El cierre semanal aplica en orden los ingresos de misiones completadas, el alquiler del hangar, los salarios de pilotos activos, y los costos de reparación pendientes — produciendo el balance final de la semana y emitiendo una señal si el resultado cae por debajo de `BANKRUPTCY_THRESHOLD`.

Además del balance, mantiene un `transaction_log` — un historial de todas las transacciones del juego, categorizado por tipo (MISSION\_REWARD / RENT / SALARY / REPAIR). Este log es lo que el Weekly Ledger UI muestra al jugador al final de cada semana: el desglose de qué entró y qué salió.

## Player Fantasy

El ledger es el corazón emocional del Pilar 3. El jugador ve el número de créditos después de cada cierre semanal y siente algo: alivio si subió, tensión si bajó, pánico si está cerca de cero. Ese número no es abstracto — representa cuántas semanas más puede sobrevivir el gremio.

La fantasía es la del dueño de un negocio precario que revisa sus cuentas el domingo a la noche. El alquiler ya se pagó, los salarios ya se descontaron, lo que queda es lo que hay. El "Iron Ledger" del título no es metafórico — es literalmente este registro contable que el jugador aprende a leer semana a semana.

El `transaction_log` amplifica esto: ver "RENT: -1200 cr" y "SALARY × 3: -900 cr" listados explícitamente hace que los costos fijos sean tangibles, no invisibles. El jugador entiende exactamente por qué su balance bajó — y eso hace que las decisiones de asignación de la semana siguiente sean más conscientes.

## Detailed Design

### Estructura de datos

```gdscript
# financial_ledger.gd
class_name FinancialLedger
extends Node
```

---

**Estado del ledger**

| Campo | Tipo | Descripción |
|---|---|---|
| `current_balance` | int | Balance actual en créditos. Puede ser negativo |
| `transaction_log` | Array[Transaction] | Historial completo de transacciones |
| `current_week` | int | Semana actual — sincronizado con Weekly Cycle System |

---

**Estructura de Transaction**

| Campo | Tipo | Descripción |
|---|---|---|
| `amount` | int | Positivo = ingreso / Negativo = egreso |
| `category` | TransactionCategory | MISSION_REWARD / RENT / SALARY / REPAIR |
| `description` | String | Texto legible ("Misión: Transporte zona industrial") |
| `week` | int | Semana en que ocurrió |

---

**Señales**

| Señal | Cuándo se emite | Quién escucha |
|---|---|---|
| `balance_changed(new_balance: int)` | Después de cada `add_credits` o `deduct_credits` | HUD, Weekly Ledger UI |
| `bankruptcy_triggered` | Al final del cierre semanal si `current_balance ≤ BANKRUPTCY_THRESHOLD` | Win/Lose Detection |

---

### API pública

| Método | Parámetros | Descripción |
|---|---|---|
| `add_credits(amount, category, description)` | int, enum, String | Suma créditos y registra transacción |
| `deduct_credits(amount, category, description)` | int, enum, String | Resta créditos y registra transacción |
| `process_weekly_close(active_pilots, completed_missions, repair_costs)` | Array, Array, int | Ejecuta el cierre semanal completo en orden |
| `get_week_transactions(week)` | int | Devuelve todas las transacciones de una semana |

---

### Secuencia del cierre semanal (`process_weekly_close`)

El orden importa — los ingresos van primero:

1. Por cada misión en `completed_missions`: `add_credits(actual_reward, MISSION_REWARD, ...)`
2. `deduct_credits(HANGAR_WEEKLY_RENT, RENT, "Alquiler del hangar")`
3. Por cada piloto en `active_pilots`: `deduct_credits(PILOT_WEEKLY_SALARY, SALARY, ...)`
4. `deduct_credits(repair_costs, REPAIR, "Costos de reparación")` si `repair_costs > 0`
5. Verificar `current_balance ≤ BANKRUPTCY_THRESHOLD` → emitir `bankruptcy_triggered` si aplica

## Formulas

**Balance inicial:**
```
current_balance = STARTING_CREDITS
```

**Cierre semanal — balance resultante:**
```
weekly_income   = sum(mission.actual_reward for mission in completed_missions)
weekly_expenses = HANGAR_WEEKLY_RENT
                + (active_pilot_count × PILOT_WEEKLY_SALARY)
                + repair_costs

end_of_week_balance = current_balance + weekly_income - weekly_expenses
```

**Condición de quiebra:**
```
is_bankrupt = end_of_week_balance ≤ BANKRUPTCY_THRESHOLD
```

**Proyección de supervivencia** *(solo para UI informativa, no afecta lógica)*:
```
weeks_of_runway = floor(current_balance / weekly_fixed_cost)
weekly_fixed_cost = HANGAR_WEEKLY_RENT + (active_pilot_count × PILOT_WEEKLY_SALARY)
```

Muestra al jugador cuántas semanas puede sobrevivir sin ingresos. No es un valor de juego — es contexto para decisiones.

**Ejemplo de cierre semana 1:**
```
Ingresos:   2 misiones completadas → 1400 + 900 = 2300 cr
Gastos:     Alquiler 1200 + Salarios 3×300 = 2100 cr + Reparación 400 cr = 2500 cr
Balance:    8000 + 2300 - 2500 = 7800 cr
```

## Edge Cases

1. **Balance negativo sin quiebra**: si `BANKRUPTCY_THRESHOLD` es negativo (ej: -500), el balance puede ser negativo sin disparar game over. El sistema lo permite — el número se muestra en rojo en la UI pero el juego continúa.

2. **Semana sin misiones completadas**: `weekly_income = 0`. El cierre igual descuenta costos fijos. El jugador puede terminar la semana con menos créditos que con los que empezó — es la situación de presión máxima.

3. **Semana sin pilotos activos**: si todos están RECOVERING, `active_pilot_count = 0` y el costo de salarios es 0. Solo se paga el alquiler. Situación rara pero válida.

4. **`repair_costs = 0`**: cuando no hubo daño esa semana, el paso 4 del cierre se omite. No genera transacción de REPAIR con valor 0.

5. **`deduct_credits` con monto mayor al balance**: permitido — el balance puede quedar negativo. El sistema no bloquea el descuento, solo registra la transacción y verifica la condición de quiebra al cierre.

6. **`process_weekly_close` llamado dos veces en la misma semana**: el Weekly Cycle System garantiza que esto no ocurra. Si ocurriera, el ledger aplicaría los costos fijos dos veces — sería un bug del llamador, no del ledger.

7. **`transaction_log` sin límite de tamaño**: en 12 semanas con ~10 transacciones por semana, el log tiene ~120 entradas. Sin problema de memoria. Si el juego se extiende a más semanas en el futuro, revisar.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Game Configuration** | `STARTING_CREDITS`, `HANGAR_WEEKLY_RENT`, `PILOT_WEEKLY_SALARY`, `BANKRUPTCY_THRESHOLD` |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Repair System** | Llama `deduct_credits` para cobrar costos de reparación |
| **Weekly Cycle System** | Llama `process_weekly_close` al cierre de cada semana |
| **Win/Lose Detection** | Escucha señal `bankruptcy_triggered` |
| **Weekly Ledger UI** | Llama `get_week_transactions` para mostrar el desglose semanal |
| **Main Hangar Screen UI** | Lee `current_balance` y `weeks_of_runway` para mostrar el estado financiero |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `STARTING_CREDITS` | Game Configuration | `8000` | `4000 – 15000` | Cuánto margen de error tiene el jugador al inicio |
| `HANGAR_WEEKLY_RENT` | Game Configuration | `1200` | `600 – 2000` | La presión financiera base — el costo que nunca desaparece |
| `PILOT_WEEKLY_SALARY` | Game Configuration | `300` | `100 – 600` | Penaliza tener el roster completo activo |
| `BANKRUPTCY_THRESHOLD` | Game Configuration | `0` | `-1000 – 0` | Margen de deuda permitido. En 0: quiebra inmediata al llegar a cero |

**El ratio crítico — costo fijo vs ingreso esperado:**
```
weekly_fixed_cost    = 1200 + (3 × 300) = 2100 cr
expected_income_low  = 1 misión × 800 cr mínimo = 800 cr   → déficit de 1300 cr
expected_income_avg  = 2 misiones × 1200 cr promedio = 2400 cr → superávit de 300 cr
expected_income_good = 3 misiones × 1400 cr = 4200 cr → superávit de 2100 cr
```

El diseño es intencional: **completar 1 misión por semana es insuficiente**. El jugador necesita completar al menos 2 para mantenerse a flote, y 3 para crecer. Con 3 mechas disponibles, completar 2 de 3 misiones es el objetivo mínimo — y el Risk Calculation System asegura que no sea trivial.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | `current_balance` inicia exactamente en `STARTING_CREDITS` al comenzar una partida nueva | Test unitario: inicializar ledger, assert balance == 8000 | Lógica |
| AC-2 | `add_credits` suma correctamente y emite `balance_changed` | Test unitario: add 1000, assert balance +1000 y señal emitida | Lógica |
| AC-3 | `deduct_credits` resta correctamente y permite balance negativo | Test unitario: deducir más del balance, assert negativo sin error | Lógica |
| AC-4 | `process_weekly_close` aplica ingresos antes que gastos | Test unitario: verificar orden de transacciones en el log | Lógica |
| AC-5 | `bankruptcy_triggered` se emite cuando `balance ≤ BANKRUPTCY_THRESHOLD` al cierre | Test unitario: configurar escenario de quiebra, assert señal emitida | Lógica |
| AC-6 | `bankruptcy_triggered` NO se emite si el balance es positivo tras el cierre | Test unitario: cierre con superávit, assert señal NO emitida | Lógica |
| AC-7 | `get_week_transactions` devuelve solo las transacciones de la semana solicitada | Test unitario: registrar en semanas 1 y 2, pedir semana 1, assert solo esas | Lógica |
| AC-8 | Semana sin reparaciones no genera transacción REPAIR de valor 0 | Test unitario: cierre sin daños, assert log sin entrada REPAIR | Lógica |
| AC-9 | `weeks_of_runway` calcula correctamente con balance 7800 y fixed cost 2100 → 3 semanas | Test unitario: assert floor(7800/2100) == 3 | Lógica |
