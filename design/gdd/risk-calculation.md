# Risk Calculation System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre

## Summary

Toma piloto + mecha + misión y produce probabilidades de éxito, daño y lesión. Es el corazón matemático del juego.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Pilot Entity, Mecha Entity, Mission Data, Game Configuration`

## Overview

El Risk Calculation System es el núcleo matemático del juego. Recibe tres inputs — un `Pilot`, un `Mecha`, y una `MissionInstance` — y produce cuatro outputs: probabilidad de éxito de la misión, probabilidad de daño al mecha, probabilidad de lesión al piloto, y probabilidad de que el daño sea grave en lugar de leve.

No toma decisiones ni genera números aleatorios — solo calcula probabilidades deterministas a partir de los datos. Los dados los tira Mission Resolution System en el momento de la resolución. Risk Calculation existe para que ese roll sea significativo: los modificadores de piloto, mecha y misión se combinan en una sola función de probabilidad que el jugador puede aprender a leer con el tiempo.

El sistema se usa en dos momentos distintos. Primero durante la asignación: la Mission Card UI le pide el `success_chance` para mostrar un indicador cualitativo de riesgo (LOW / MEDIUM / HIGH / CRITICAL) — nunca el porcentaje exacto. Después durante la resolución: Mission Resolution System usa los cuatro outputs para hacer los rolls finales. Esta separación garantiza que el jugador toma decisiones con información parcial, no con certeza matemática — implementando el Pilar 1 directamente.

## Player Fantasy

El jugador nunca ve este sistema — ve sus consecuencias. Ve que García (skill 4, VETERAN) tiene muchas más chances de éxito que Reyes (skill 2, RECKLESS) en la misma misión. Lo infiere. Lo aprende. Eventualmente empieza a leer la Mission Card con más sofisticación: "zona industrial, daño leve probable, mando el mecha de transporte que ya tiene light damage porque el bonus de tipo no aplica y prefiero reservar el de combate".

Esa lectura emergente es el Pilar 1 en acción. El jugador nunca ve las probabilidades exactas — ve el indicador cualitativo (HIGH RISK), recuerda los últimos resultados, y construye un modelo mental del sistema que es aproximado pero suficiente para tomar decisiones mejores con el tiempo.

La tensión emocional del juego ocurre en el espacio entre lo que el jugador sabe (indicador de riesgo), lo que infiere (patrones aprendidos), y lo que ignora (los valores exactos ocultos). Risk Calculation define ese espacio.

## Detailed Design

### Inputs y outputs

```
calculate_risk(pilot: Pilot, mecha: Mecha, mission: MissionInstance) -> RiskResult
```

**RiskResult:**

| Campo | Tipo | Descripción |
|---|---|---|
| `success_chance` | float [0.05, 0.95] | Probabilidad de éxito de la misión |
| `mecha_damage_chance` | float [0.02, 0.90] | Probabilidad de que el mecha reciba daño |
| `pilot_injury_chance` | float [0.01, 0.60] | Probabilidad de que el piloto se lesione |
| `heavy_damage_chance` | float [0.10, 0.70] | Si hay daño, probabilidad de que sea HEAVY en lugar de LIGHT |

---

### Indicador cualitativo de riesgo (para Mission Card UI)

La UI nunca muestra `success_chance` como número. Lo convierte a una etiqueta:

| `success_chance` | Indicador visible |
|---|---|
| ≥ 0.75 | `LOW RISK` |
| 0.55 – 0.74 | `MEDIUM RISK` |
| 0.35 – 0.54 | `HIGH RISK` |
| < 0.35 | `CRITICAL RISK` |

---

### Modificadores aplicados (todos se suman sobre la base)

| Modificador | Fuente | Valor |
|---|---|---|
| `base_success` | `1.0 - mission.actual_difficulty` | 0.05 – 0.95 |
| `skill_modifier` | Pilot: `(skill_level - 1) × 0.08` | 0.00 – 0.32 |
| `trait_success_mod` | Pilot trait (ver tabla) | -0.05 – +0.15 |
| `type_match_bonus` | Mecha type vs mission preferred | 0.00 o +0.15 |
| `specialist_bonus` | Pilot SPECIALIST + tipo coincide | 0.00 o +0.20 |
| `damage_state_penalty` | Mecha LIGHT_DAMAGE | 0.00 o -0.05 |

*`specialist_bonus` y `type_match_bonus` son mutuamente excluyentes: si el piloto tiene SPECIALIST y el tipo coincide, solo se aplica `specialist_bonus` (el mayor).*

---

### Modificadores de daño al mecha

| Modificador | Fuente | Efecto |
|---|---|---|
| `actual_damage_chance` | MissionInstance | Base de daño al mecha |
| `durability_modifier` | Mecha durability | ×0.80 / ×1.00 / ×1.20 |
| `trait_damage_mod` | Pilot trait | RECKLESS +0.10 / CAUTIOUS -0.12 / otros 0.00 |

---

### Modificadores de lesión al piloto

La lesión del piloto es independiente del daño al mecha. Ocurre principalmente en misiones fallidas:

| Modificador | Fuente | Efecto |
|---|---|---|
| `base_injury_chance` | `actual_difficulty × 0.30` | Riesgo base de lesión |
| `trait_injury_mod` | RECKLESS +0.10 / CAUTIOUS -0.08 | Ajuste por rasgo |
| Resultado de misión | Misión fallida multiplica por 1.5 | Aplicado por Mission Resolution, no aquí |

## Formulas

### Probabilidad de éxito

```
skill_modifier     = (pilot.skill_level - 1) × 0.08
trait_success_mod  = ver tabla de rasgos en Pilot Entity System
type_bonus         = specialist_bonus (0.20) si pilot.trait == SPECIALIST y tipos coinciden
                     sino type_match_bonus (0.15) si mecha.type == mission.preferred_mecha_type
                     sino 0.00
damage_penalty     = -0.05 si mecha.damage_state == LIGHT_DAMAGE, sino 0.00

success_chance = clamp(
    (1.0 - mission.actual_difficulty)
    + skill_modifier
    + trait_success_mod
    + type_bonus
    + damage_penalty,
    0.05, 0.95
)
```

**Ejemplos de `success_chance`:**

| Escenario | Cálculo | Resultado |
|---|---|---|
| Misión fácil (diff 0.25), piloto skill 3, sin bonuses | (0.75) + 0.16 + 0 + 0 + 0 | **0.91 → LOW** |
| Misión media (diff 0.50), piloto skill 2, RECKLESS, tipo coincide | (0.50) + 0.08 + 0.15 + 0.15 + 0 | **0.88 → LOW** |
| Misión difícil (diff 0.70), piloto skill 1, mecha dañado | (0.30) + 0.00 + 0 + 0 - 0.05 | **0.25 → CRITICAL** |
| Misión difícil (diff 0.70), piloto skill 4, VETERAN, tipo coincide | (0.30) + 0.24 + 0.10 + 0.15 + 0 | **0.79 → LOW** |

---

### Probabilidad de daño al mecha

```
trait_damage_mod = +0.10 si RECKLESS / -0.12 si CAUTIOUS / 0.00 otros

mecha_damage_chance = clamp(
    mission.actual_damage_chance × mecha.durability_modifier + trait_damage_mod,
    0.02, 0.90
)
```

---

### Probabilidad de lesión al piloto

```
trait_injury_mod = +0.10 si RECKLESS / -0.08 si CAUTIOUS / 0.00 otros

pilot_injury_chance = clamp(
    mission.actual_difficulty × 0.30 + trait_injury_mod,
    0.01, 0.60
)
```

*Este valor es la chance base. Mission Resolution lo multiplica por 1.5 si la misión falla.*

---

### Probabilidad de daño grave

```
heavy_damage_chance = clamp(mission.actual_difficulty × 0.50, 0.10, 0.70)
```

Misiones difíciles tienden a producir daño grave cuando ocurre daño. Una misión de dificultad 0.60 tiene 30% de chance de que el daño sea HEAVY (si ocurre daño).

## Edge Cases

1. **`success_chance` clampea a 0.95**: un piloto skill 5 VETERAN con type match en una misión fácil puede sumar más de 1.0 — el clamp garantiza que nunca sea certeza absoluta. Siempre hay un 5% de fallo.

2. **`success_chance` clampea a 0.05**: una misión de dificultad extrema con todos los modificadores negativos nunca es imposible. Siempre hay un 5% de éxito.

3. **`specialist_bonus` y `type_match_bonus` simultáneos**: si el piloto es SPECIALIST y el tipo coincide, solo se aplica `specialist_bonus` (0.20). No se acumulan — `type_match_bonus` está incluido conceptualmente en el mayor.

4. **Misión sin `preferred_mecha_type` (NONE)**: `type_bonus = 0.00`. No penaliza ni beneficia ningún tipo de mecha.

5. **`pilot_injury_chance` multiplicada por 1.5 en fallo**: si la base ya era 0.60 (el máximo), 0.60 × 1.5 = 0.90 — el clamp del Damage System lo limita al máximo operativo. Risk Calculation no aplica este multiplicador — lo aplica Mission Resolution.

6. **`heavy_damage_chance` en misión de dificultad mínima (0.05)**: 0.05 × 0.50 = 0.025, clampea a 0.10. Incluso la misión más fácil tiene 10% de chance de daño grave si el daño ocurre.

7. **Mecha con `damage_state == HEAVY_DAMAGE`**: no puede ocurrir — el sistema nunca recibe un mecha en HEAVY_DAMAGE porque el Assignment System no permite asignarlos. El cálculo no necesita manejar este caso.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Pilot Entity System** | `skill_level`, `specialization`, `trait` |
| **Mecha Entity System** | `mecha_type`, `durability`, `damage_state` |
| **Mission Data System** | `actual_difficulty`, `actual_damage_chance`, `preferred_mecha_type` |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Mission Resolution System** | Los cuatro outputs de `RiskResult` para hacer los rolls finales |
| **Mission Card UI** | `success_chance` → convierte a indicador cualitativo LOW/MEDIUM/HIGH/CRITICAL |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `skill_modifier` por nivel | Fórmula (0.08/nivel) | 0.08 | 0.05 – 0.12 | Cuánto importa el skill del piloto. El lever más directo de poder del jugador |
| `type_match_bonus` | Fórmula | 0.15 | 0.05 – 0.25 | Premio por usar el mecha correcto |
| `specialist_bonus` | Fórmula | 0.20 | 0.10 – 0.30 | Premio por combo piloto+mecha ideal. Debe superar `type_match_bonus` |
| `damage_state_penalty` | Fórmula | -0.05 | -0.02 – -0.15 | Penalización por mandar mecha con LIGHT_DAMAGE |
| `injury_base_multiplier` | Fórmula (0.30) | 0.30 | 0.15 – 0.45 | Cuánto escala la dificultad en riesgo de lesión. Muy alto = pilotos siempre lesionados |
| `injury_fail_multiplier` | Mission Resolution (1.5) | 1.5 | 1.2 – 2.0 | Cuánto aumenta el riesgo de lesión al fallar. El castigo por perder |
| `heavy_damage_multiplier` | Fórmula (0.50) | 0.50 | 0.30 – 0.70 | Cuánto escala la dificultad en severidad del daño |
| Umbrales del indicador de riesgo | Mission Card UI | 0.75/0.55/0.35 | ±0.10 | Qué tan fácil/difícil es ver una misión como LOW vs CRITICAL |

**Notas de tuning:**
- Si el juego se siente "siempre lo mismo", bajar `skill_modifier` para que el skill del piloto importe menos y la dificultad de la misión domine más.
- Si los jugadores siempre evitan misiones CRITICAL, bajar `injury_fail_multiplier`. Si las toman sin pensarlo, subirlo.
- Los umbrales del indicador son los más sensibles perceptualmente — un cambio de 0.05 en el umbral HIGH/CRITICAL cambia cuántas misiones el jugador percibe como "peligrosas".

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | `success_chance` siempre está entre 0.05 y 0.95 para cualquier combinación de inputs | Test unitario: 1000 combinaciones aleatorias, assert rango | Lógica |
| AC-2 | Piloto skill 5 VETERAN + tipo coincide + misión easy → `success_chance` clampea a 0.95, no supera | Test unitario: caso extremo positivo, assert == 0.95 | Lógica |
| AC-3 | Piloto skill 1 + mecha LIGHT_DAMAGE + misión diff 0.90 → `success_chance` clampea a 0.05 | Test unitario: caso extremo negativo, assert == 0.05 | Lógica |
| AC-4 | `specialist_bonus` y `type_match_bonus` nunca se acumulan — solo se aplica el mayor | Test unitario: piloto SPECIALIST + tipo coincide, assert type_bonus == 0.20, no 0.35 | Lógica |
| AC-5 | Misión con `preferred_mecha_type = NONE` produce `type_bonus = 0.00` | Test unitario: assert bonus == 0 para cualquier mecha | Lógica |
| AC-6 | `mecha_damage_chance` siempre entre 0.02 y 0.90 | Test unitario: 1000 combinaciones, assert rango | Lógica |
| AC-7 | `pilot_injury_chance` siempre entre 0.01 y 0.60 | Test unitario: 1000 combinaciones, assert rango | Lógica |
| AC-8 | `heavy_damage_chance` mínimo es 0.10 incluso con dificultad mínima | Test unitario: diff = 0.05, assert heavy_damage_chance == 0.10 | Lógica |
| AC-9 | La Mission Card UI muestra CRITICAL para `success_chance < 0.35` y LOW para `≥ 0.75` | Test manual: configurar scenarios extremos, verificar etiqueta correcta | Visual |
