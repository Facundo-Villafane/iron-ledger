# Mission Card UI

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-13
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre

## Summary

Muestra la información visible de una misión al jugador. Nunca expone datos ocultos. El indicador de riesgo es cualitativo y solo se actualiza cuando hay una combinación piloto+mecha seleccionada.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` · Key deps: `Mission Data, Risk Calculation`

## Overview

La Mission Card UI es el panel que muestra la información de una misión cuando el jugador la selecciona desde el pool del hangar. Expone únicamente los campos `[VISIBLE]` de la `MissionInstance` — nunca datos ocultos como `actual_difficulty` o `actual_damage_chance`.

El elemento central de la card es el **indicador de riesgo cualitativo** (LOW / MEDIUM / HIGH / CRITICAL). Este indicador tiene dos modos: sin asignación activa muestra el riesgo base de la misión calculado con un piloto promedio hipotético; con una combinación piloto+mecha seleccionada en la Assignment UI, se actualiza en tiempo real para reflejar esa combinación específica.

Esta actualización en vivo es la implementación directa del Pilar 1: el jugador ve cómo cambia el riesgo al cambiar la asignación, pero nunca ve el número exacto — solo la etiqueta cualitativa.

## Player Fantasy

El jugador lee la card de una misión de combate en zona RESTRICTED: "Actividad rival confirmada", "Control de tráfico". Sabe por experiencia que RESTRICTED significa más daño al mecha. Los risk tags le dicen algo pero no todo. El indicador dice HIGH RISK sin asignación.

Selecciona a García (skill 4, VETERAN) y el mecha de combate. El indicador baja a MEDIUM RISK. Funciona. El jugador aprende: ese combo mejora las chances en misiones de combate. No sabe cuánto exactamente — eso es intencional.

La card no es solo información, es el momento de inferencia donde el Pilar 1 ocurre.

## Detailed Design

### Contenido de la card

| Elemento | Fuente | Visible siempre |
|---|---|---|
| Nombre | `mission.display_name` | ✓ |
| Tipo | `mission.type` (ícono + texto) | ✓ |
| Zona | `mission.zone_type` | ✓ |
| Reward hint | `mission.reward_hint` ("800–1800 cr") | ✓ |
| Duración | `mission.duration_weeks` ("1 semana") | ✓ |
| Mecha preferido | `mission.preferred_mecha_type` | ✓ |
| Risk tags | `mission.risk_tags` (1–2 badges) | ✓ |
| Indicador de riesgo | Calculado por Risk Calculation | ✓ (varía según asignación) |
| Botón "Asignar" | — | Solo si status == AVAILABLE |
| Botón "Cancelar asignación" | — | Solo si status == ASSIGNED |

---

### Dos modos del indicador de riesgo

**Sin asignación activa** — usa piloto y mecha promedio hipotético:
```
risk_preview = RiskCalc.calculate_risk(
    pilot(skill=2, trait=NONE, spec=GENERALIST),
    mecha(type=NONE, durability=2, damage=INTACT),
    mission
)
```

**Con piloto+mecha seleccionados** en Assignment UI — se actualiza en tiempo real:
```
risk_preview = RiskCalc.calculate_risk(pilot_selected, mecha_selected, mission)
```

---

### Tabla de etiquetas de riesgo

| `success_chance` | Etiqueta | Color |
|---|---|---|
| ≥ 0.75 | LOW RISK | Verde (`#9de64e`) |
| 0.55 – 0.74 | MEDIUM RISK | Amarillo (`#f3a833`) |
| 0.35 – 0.54 | HIGH RISK | Naranja (`#e98537`) |
| < 0.35 | CRITICAL RISK | Rojo (`#ec273f`) |

## Formulas

La conversión de `success_chance` a etiqueta está definida en la tabla de riesgo del Detailed Design. La UI no calcula probabilidades — llama a Risk Calculation y muestra la etiqueta resultante.

## Edge Cases

1. **`preferred_mecha_type = NONE`**: no se muestra el campo "Mecha preferido".
2. **Misión ASSIGNED**: botón "Asignar" reemplazado por "Cancelar asignación". Indicador muestra riesgo con el combo actualmente asignado.
3. **Misión EXPIRED o COMPLETED**: no aparece en el pool — la card nunca se abre para estas.
4. **`reward_hint` con min == max**: se muestra como valor fijo ("1200 cr") sin guión de rango.
5. **Risk Calculation con piloto promedio hipotético**: siempre retorna valor en rango [0.05, 0.95] — sin casos especiales en la UI.

## Dependencies

| Sistema | Qué consume |
|---|---|
| **Mission Data System** | Todos los campos `[VISIBLE]` de `MissionInstance` |
| **Risk Calculation System** | `calculate_risk` para el indicador de riesgo |
| **Assignment System** | Llama `cancel_assignment` al presionar "Cancelar asignación" |

## Tuning Knobs

Los umbrales de etiquetas (0.75 / 0.55 / 0.35) son ajustables en la implementación. Ver Risk Calculation System GDD para el razonamiento detrás de esos valores.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Ningún campo `[HIDDEN]` aparece en la card en ningún estado | Code review: la card solo lee campos marcados VISIBLE | Integración |
| AC-2 | El indicador muestra CRITICAL para misiones de alta dificultad sin asignación | Test manual: misión diff 0.80, verificar etiqueta CRITICAL | Visual |
| AC-3 | El indicador se actualiza al seleccionar piloto+mecha en Assignment UI | Test manual: seleccionar distintos combos, verificar cambio de etiqueta | Integración |
| AC-4 | Misión ASSIGNED muestra "Cancelar asignación" en lugar de "Asignar" | Test manual: asignar misión, abrir card, verificar botón | Visual |
| AC-5 | `preferred_mecha_type = NONE` no muestra el campo de mecha preferido | Test manual: misión sin preferencia, verificar ausencia del campo | Visual |
| AC-6 | `reward_hint` con min == max muestra valor único sin guión | Test manual: template con min==max, verificar display | Visual |
