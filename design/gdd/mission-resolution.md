# Mission Resolution System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre

## Summary

Tira los dados. Toma las probabilidades del Risk Calculation System y produce el resultado concreto de cada misión: éxito o fallo, daño al mecha, lesión al piloto, recompensa obtenida.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Assignment System, Risk Calculation, Mission Data`

## Overview

El Mission Resolution System es el único sistema del juego que genera números aleatorios durante el gameplay. Recibe cada misión asignada, obtiene las probabilidades del Risk Calculation System, y ejecuta una serie de rolls independientes para determinar: si la misión tuvo éxito, si el mecha sufrió daño y de qué severidad, si el piloto se lesionó y de qué gravedad, y cuántos créditos ingresa.

El sistema produce un `MissionOutcome` por cada misión resuelta y lo entrega al Weekly Cycle System, que lo distribuye al Damage System (para aplicar daño y lesiones) y al Financial Ledger (para registrar la recompensa). También emite una señal con el outcome completo para que el Result Report UI pueda mostrarlo al jugador.

Es el momento de verdad del juego: todo lo que el jugador planeó durante la fase de asignación se resuelve aquí, sin posibilidad de intervención. Los dados caen, las consecuencias aparecen.

## Player Fantasy

El jugador avanza la semana y espera. No puede hacer nada. Las misiones se resuelven una por una y los resultados aparecen en pantalla — éxito, daño leve al mecha de combate, piloto ileso, 1400 créditos. Alivio. Siguiente: fallo en la misión de salvamento, el piloto RECKLESS está lesionado grave, cuatro semanas fuera.

Esa secuencia de resultados es el momento de mayor carga emocional del juego. El jugador ve las consecuencias de sus decisiones materializarse en tiempo real. El éxito se siente merecido porque el jugador mandó al piloto correcto. El fallo duele porque sabía que era riesgoso y lo mandó igual.

El sistema de resolución tiene que ser rápido y legible. Cada resultado debe ser claro en menos de dos segundos de lectura. La información importa — el jugador tiene que saber exactamente qué pasó para tomar mejores decisiones la semana siguiente.

## Detailed Design

### Estructura MissionOutcome

```gdscript
class_name MissionOutcome
```

| Campo | Tipo | Descripción |
|---|---|---|
| `mission_id` | String | ID de la misión resuelta |
| `pilot_id` | String | ID del piloto asignado |
| `mecha_id` | String | ID del mecha asignado |
| `success` | bool | Si la misión tuvo éxito |
| `credits_earned` | int | Créditos obtenidos (0 si falló) |
| `mecha_damaged` | bool | Si el mecha recibió daño |
| `damage_severity` | DamageState | LIGHT_DAMAGE / HEAVY_DAMAGE / INTACT |
| `pilot_injured` | bool | Si el piloto se lesionó |
| `injury_severity` | InjurySeverity | LIGHT / SEVERE |

---

### Proceso de resolución por misión

```
resolve_mission(mission: MissionInstance) -> MissionOutcome
```

**Pasos en orden:**

1. **Obtener probabilidades**: llamar `RiskCalculation.calculate_risk(pilot, mecha, mission)` → `RiskResult`

2. **Roll de éxito**:
   ```
   success = randf() < risk.success_chance
   ```

3. **Roll de daño al mecha** *(independiente del éxito)*:
   ```
   mecha_damaged = randf() < risk.mecha_damage_chance
   ```

4. **Roll de severidad del daño** *(solo si hay daño)*:
   ```
   damage_severity = HEAVY_DAMAGE si randf() < risk.heavy_damage_chance
                     sino LIGHT_DAMAGE
   ```

5. **Roll de lesión al piloto** *(modificado si la misión falló)*:
   ```
   effective_injury_chance = risk.pilot_injury_chance × 1.5 si not success
                             sino risk.pilot_injury_chance
   effective_injury_chance = clamp(effective_injury_chance, 0.01, 0.90)
   pilot_injured = randf() < effective_injury_chance
   ```

6. **Severidad de lesión** *(solo si hay lesión)*:
   ```
   injury_severity = SEVERE si not success and randf() < 0.40
                     sino LIGHT
   ```

7. **Recompensa**:
   ```
   credits_earned = mission.actual_reward si success sino 0
   ```

8. **Emitir señal** `mission_resolved(outcome: MissionOutcome)`

## Formulas

Todas las fórmulas de rolls están definidas en el Detailed Design. La tabla de combinaciones posibles de outcome para claridad de diseño:

**Árbol de outcomes posibles por misión:**

```
Misión resuelta
├── SUCCESS (randf() < success_chance)
│   ├── Sin daño al mecha → credits_earned = actual_reward
│   ├── LIGHT_DAMAGE al mecha → credits_earned = actual_reward
│   └── HEAVY_DAMAGE al mecha → credits_earned = actual_reward
│       (el daño es independiente del éxito)
│
└── FAIL (randf() ≥ success_chance)
    ├── Sin daño, sin lesión → credits_earned = 0
    ├── Daño al mecha + lesión LIGHT → credits_earned = 0
    └── Daño al mecha + lesión SEVERE → credits_earned = 0
```

**Severidad de lesión:**
```
injury_severity = SEVERE si (not success) AND (randf() < 0.40)
                  sino LIGHT
```

En fallo, 40% de las lesiones son graves. En éxito, todas las lesiones son leves — un piloto que completó la misión puede estar golpeado pero no gravemente herido.

**Recompensa parcial**: en MVP no existe — o la misión sale o no sale. El reward parcial puede ser un knob para versiones futuras.

## Edge Cases

1. **Misión exitosa con daño HEAVY al mecha**: perfectamente válido — el mecha cumplió pero salió mal parado. El jugador cobra la recompensa y paga la reparación. Es el outcome más tenso del árbol.

2. **Misión fallida sin ningún daño ni lesión**: posible — los rolls son independientes. El piloto y el mecha vuelven intactos pero sin créditos. Frustrante pero no devastador.

3. **Misión resuelta sin piloto o mecha asignado**: no puede ocurrir — el Weekly Cycle System solo llama `resolve_mission` con misiones en estado IN_PROGRESS, que por definición tienen piloto y mecha asignados.

4. **Todos los rolls caen en el peor caso simultáneamente** (fallo + HEAVY_DAMAGE + lesión SEVERE): el outcome más duro del juego. Con probabilidades base, muy poco probable — pero posible. Es el momento que el jugador va a recordar.

5. **`actual_reward` de la misión es 0**: en MVP todos los templates tienen reward > 0, pero el sistema lo maneja sin problema — `credits_earned = 0` en fallo, `credits_earned = 0` en éxito también si el template así lo define.

6. **Múltiples misiones resueltas en el mismo turno**: cada una se resuelve independientemente con su propio set de rolls. No hay correlación entre resultados de misiones distintas.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Risk Calculation System** | `calculate_risk(pilot, mecha, mission)` → `RiskResult` con las cuatro probabilidades |
| **Mission Data System** | Lee `actual_reward`, `assigned_pilot_id`, `assigned_mecha_id` de cada `MissionInstance` |
| **Pilot Entity System** | Lee `skill_level`, `trait`, `specialization` (via Risk Calculation) |
| **Mecha Entity System** | Lee `mecha_type`, `durability`, `damage_state` (via Risk Calculation) |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Damage System** | Recibe `MissionOutcome` — aplica `damage_severity` al mecha e `injury_severity` al piloto |
| **Financial Ledger System** | Recibe `credits_earned` — llama `add_credits` por cada misión exitosa |
| **Weekly Cycle System** | Orquesta la resolución — llama `resolve_mission` para cada misión IN_PROGRESS |
| **Result Report UI** | Escucha señal `mission_resolved` — muestra el outcome al jugador |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `injury_fail_multiplier` | Fórmula (×1.5) | 1.5 | 1.2 – 2.0 | Cuánto aumenta el riesgo de lesión al fallar. El castigo por perder |
| `severe_injury_on_fail_chance` | Fórmula (0.40) | 0.40 | 0.20 – 0.60 | Qué fracción de lesiones en fallo son graves |
| Recompensa parcial en fallo | No existe en MVP | — | 0 – 50% del reward | Para versiones futuras — suaviza el castigo del fallo |

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Misión con `success_chance = 1.0` siempre retorna `success = true` | Test unitario: mockear risk con chance 1.0, assert success | Lógica |
| AC-2 | Misión con `success_chance = 0.0` siempre retorna `success = false` | Test unitario: mockear risk con chance 0.0, assert not success | Lógica |
| AC-3 | `credits_earned = actual_reward` en éxito y `0` en fallo | Test unitario: ambos casos, assert valores correctos | Lógica |
| AC-4 | El daño al mecha es independiente del éxito — puede ocurrir en éxito y no ocurrir en fallo | Test unitario: 1000 runs con probabilidades medias, assert distribución independiente | Lógica |
| AC-5 | `injury_severity = LIGHT` cuando la misión es exitosa, incluso si hay lesión | Test unitario: éxito + lesión, assert severity == LIGHT | Lógica |
| AC-6 | `effective_injury_chance` en fallo no supera 0.90 aunque la base × 1.5 lo exceda | Test unitario: injury_chance base = 0.60, assert effective ≤ 0.90 | Lógica |
| AC-7 | Señal `mission_resolved` se emite con el `MissionOutcome` correcto | Test unitario: conectar señal, assert todos los campos del outcome | Lógica |
| AC-8 | Resolución de 3 misiones en el mismo turno produce 3 outcomes independientes | Test unitario: resolver 3, assert outcomes distintos en distribución estadística | Lógica |
