# Pilot Entity System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P2 — Apego a los recursos

## Summary

Modelo de datos del piloto: stats, especialización, estado de salud, y rasgos. Seis sistemas distintos lo consumen.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Game Configuration`

## Overview

El Pilot Entity System define el modelo de datos de un piloto del gremio. Un piloto es un `Resource` de Godot con campos de identidad (nombre, retrato), un stat de habilidad, una especialización, un estado de salud, y un rasgo pasivo opcional. No contiene lógica propia — es la estructura que otros sistemas leen y modifican.

Es el asset más humano del juego y el que genera el Pilar 2 (Apego a los recursos). El jugador nombra mentalmente a sus pilotos, recuerda quién sobrevivió a qué misión, y siente el costo cuando uno queda fuera de servicio tres semanas. El sistema de datos sostiene ese apego: un piloto tiene nombre, tiene historia implícita en sus stats, y tiene un estado que cambia como consecuencia de las decisiones del jugador.

Para el MVP, cada piloto tiene: **nombre** (generado o asignado), **nivel de habilidad** (1–5), **especialización** (COMBAT / TRANSPORT / SALVAGE / GENERALIST), **estado actual** (AVAILABLE / ASSIGNED / IN\_PROGRESS / RECOVERING), **semanas de recuperación restantes**, y **un rasgo pasivo** de una lista cerrada de cuatro opciones.

## Player Fantasy

El piloto es el recurso más valioso del gremio y el único con nombre propio. Cuando "García" lleva tres misiones exitosas seguidas, el jugador empieza a confiar en él — y esa confianza es exactamente el momento en que mandarlo a una misión de combate de alto riesgo se convierte en una decisión real, no en un cálculo abstracto.

La fantasía no es gestionar estadísticas — es gestionar personas. El `skill_level 4` de García no es un número, es la razón por la que siempre lo asignás a las misiones complicadas. El rasgo CAUTELOSO de Reyes no es un modificador, es por qué lo reservás para las misiones de transporte seguras. El sistema de datos hace posible esa narrativa emergente sin escribir una sola línea de historia explícita.

El momento de mayor tensión del Pilar 2 ocurre cuando el piloto favorito del jugador queda RECOVERING por cuatro semanas y hay que cubrir con pilotos menos confiables. Ese costo emocional nace de estos campos de datos.

## Detailed Design

### Estructura de datos

```gdscript
# pilot.gd
class_name Pilot
extends Resource
```

---

**Campos de identidad**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String | UUID generado al crear el piloto |
| `pilot_name` | String | Nombre visible — generado desde lista o asignado |
| `portrait_id` | String | Referencia a sprite de retrato (clave en atlas) |

---

**Campos de stats**

| Campo | Tipo | Rango | Descripción |
|---|---|---|---|
| `skill_level` | int | 1 – 5 | Habilidad general — el modificador más importante en Risk Calculation |
| `specialization` | PilotSpec | enum | COMBAT / TRANSPORT / SALVAGE / GENERALIST |
| `trait` | PilotTrait | enum | Un rasgo pasivo — ver tabla de rasgos abajo |

---

**Campos de estado**

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | PilotStatus | AVAILABLE / ASSIGNED / IN_PROGRESS / RECOVERING |
| `recovery_weeks_remaining` | int | Semanas hasta volver a AVAILABLE. 0 si no está lesionado |
| `assigned_mission_id` | String | ID de la misión activa. `""` si no está asignado |

---

**Campos de historial** *(solo lectura, para UI)*

| Campo | Tipo | Descripción |
|---|---|---|
| `missions_completed` | int | Contador de misiones terminadas con éxito |
| `missions_failed` | int | Contador de misiones fallidas |

---

### Estados y transiciones

| Estado | Quién lo escribe | Condición de entrada | Condición de salida |
|---|---|---|---|
| `AVAILABLE` | Damage System / inicio de juego | Creado / recuperado de lesión | Asignado a misión |
| `ASSIGNED` | Assignment System | Jugador confirma asignación | Semana avanza |
| `IN_PROGRESS` | Weekly Cycle System | Inicio de semana con misión activa | Mission Resolution resuelve |
| `RECOVERING` | Damage System | Lesión recibida en resolución | `recovery_weeks_remaining` llega a 0 |

---

### Tabla de rasgos (MVP — 4 opciones)

| Rasgo | Efecto en Risk Calculation | Descripción para el jugador |
|---|---|---|
| `VETERAN` | +0.10 a probabilidad de éxito | Piloto experimentado, rendimiento consistente |
| `RECKLESS` | +0.15 éxito / +0.10 a `damage_chance` del piloto | Efectivo pero se mete en problemas |
| `CAUTIOUS` | -0.05 éxito / -0.12 a `damage_chance` | Lento pero cuida el equipo |
| `SPECIALIST` | +0.20 éxito cuando `specialization` coincide con `mecha_type` | Máximo rendimiento con su mecha ideal, promedio con otros |

*Un piloto tiene exactamente un rasgo asignado al crearse. No cambia en el MVP.*

## Formulas

El Pilot Entity System no calcula — expone datos. Pero define los modificadores que Risk Calculation System consume:

**Modificador de habilidad:**
```
skill_modifier = (skill_level - 1) × 0.08
```

| `skill_level` | `skill_modifier` |
|---|---|
| 1 | +0.00 |
| 2 | +0.08 |
| 3 | +0.16 |
| 4 | +0.24 |
| 5 | +0.32 |

Un piloto nivel 5 aporta +0.32 a la probabilidad de éxito base antes de que Risk Calculation aplique otros factores. Un piloto nivel 1 no aporta nada — es el baseline.

**Modificador de rasgo:**

Definido en la tabla de rasgos del Detailed Design. Los valores son los que Risk Calculation lee directamente del enum `PilotTrait`.

**Tiempo de recuperación:**

```
recovery_weeks = PILOT_RECOVERY_WEEKS        # lesión leve
recovery_weeks = PILOT_INJURY_SEVERE_WEEKS   # lesión grave
```

Ambos valores vienen de `GameConfig`. El Damage System escribe `recovery_weeks_remaining` al momento de la lesión. El Weekly Cycle System lo decrementa en 1 cada cierre de semana y transiciona a AVAILABLE cuando llega a 0.

## Edge Cases

1. **Todos los pilotos en RECOVERING simultáneamente**: el gremio no puede asignar ninguna misión esa semana. El juego no bloquea — simplemente no hay pilotos disponibles. Los costos fijos igual se pagan. Es una situación de crisis válida, no un bug.

2. **Piloto en IN_PROGRESS recibe otra asignación**: imposible por diseño — el Assignment System verifica que `status == AVAILABLE` antes de aceptar una asignación. Un piloto IN_PROGRESS no aparece como seleccionable en la UI.

3. **`recovery_weeks_remaining` llega a 0 con el piloto ya en otra misión**: no puede ocurrir — un piloto RECOVERING no puede ser asignado. La transición RECOVERING → AVAILABLE ocurre al cierre de semana, antes de que el jugador haga asignaciones para la semana siguiente.

4. **Piloto con `specialization = GENERALIST` y rasgo `SPECIALIST`**: combinación válida pero subóptima — GENERALIST nunca activa el bonus de SPECIALIST (que requiere coincidencia de tipo). El sistema no lo bloquea; es una combinación ineficiente que puede generarse proceduralmente.

5. **`missions_completed` y `missions_failed` en overflow**: contadores de int. A efectos prácticos de un juego de 12 semanas con 3-5 misiones por semana, el máximo teórico es ~60 misiones. Sin riesgo de overflow.

6. **Piloto generado sin retrato disponible**: si `portrait_id` referencia un sprite inexistente, la UI muestra un retrato placeholder. El sistema de datos no valida esto — es responsabilidad del pipeline de assets.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Game Configuration** | `PILOT_RECOVERY_WEEKS`, `PILOT_INJURY_SEVERE_WEEKS`, `STARTING_PILOTS` |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Risk Calculation System** | `skill_level`, `specialization`, `trait` — para calcular probabilidad de éxito |
| **Assignment System** | `status`, `id` — valida disponibilidad y registra asignación |
| **Weekly Cycle System** | `status`, `recovery_weeks_remaining` — decrementa recuperación y transiciona estados |
| **Damage System** | Escribe `status = RECOVERING`, `recovery_weeks_remaining` tras lesión |
| **Mission Resolution System** | Lee `id` del piloto asignado para reportar resultados |
| **Main Hangar Screen UI** | Lee todos los campos visibles — muestra roster completo |
| **Assignment UI** | Lee `status`, `skill_level`, `specialization`, `trait` — muestra opciones de asignación |
| **Result Report UI** | Lee `pilot_name`, `portrait_id` — muestra quién participó y qué le pasó |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `skill_modifier` por nivel | Fórmula (0.08 por nivel) | 0.08 | 0.05 – 0.12 | Cuánto impacta el skill en el resultado. Más alto = pilotos de nivel 5 dominan todo |
| Modificadores de rasgo | Tabla de rasgos | Ver tabla | ±0.05 de ajuste | El balance entre rasgos — RECKLESS no debe dominar siempre |
| `PILOT_RECOVERY_WEEKS` | Game Configuration | 2 | 1 – 4 | Cuánto tiempo castiga una lesión leve |
| `PILOT_INJURY_SEVERE_WEEKS` | Game Configuration | 4 | 3 – 6 | Cuánto tiempo castiga una lesión grave — debe doler |
| `STARTING_PILOTS` | Game Configuration | 3 | 2 – 4 | Con 2: juego muy frágil desde el inicio / Con 4: demasiado margen |
| Distribución de `skill_level` inicial | Generador de pilotos | 1×nivel 4, 1×nivel 3, 1×nivel 2 | — | Qué tan fuerte arranca el gremio |
| Distribución de rasgos inicial | Generador de pilotos | 1 de cada rasgo salvo SPECIALIST | — | Asegurar variedad en el roster inicial |

**Notas de tuning:**
- El `skill_modifier` de 0.08 por nivel da un spread de 0.32 entre nivel 1 y 5 — suficiente para que importe sin volver inútil a los pilotos bajos.
- Si los jugadores siempre eligen RECKLESS, subir el `damage_chance` del rasgo. Si nunca lo eligen, bajarlo.
- `PILOT_INJURY_SEVERE_WEEKS = 4` es el número más importante de este sistema — es lo que hace que perder un piloto clave sea un evento memorable.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Un `Pilot` Resource carga todos sus campos sin errores | Test unitario: instanciar piloto con valores válidos, assert todos los campos accesibles | Lógica |
| AC-2 | `skill_modifier` calculado es correcto para cada nivel (1→0.0, 3→0.16, 5→0.32) | Test unitario: verificar los 5 valores | Lógica |
| AC-3 | Un piloto en RECOVERING no puede ser seleccionado en la Assignment UI | Test manual: lesionar piloto, verificar que no aparece en lista de asignación | Integración |
| AC-4 | `recovery_weeks_remaining` se decrementa en 1 por semana y transiciona a AVAILABLE al llegar a 0 | Test unitario: simular 4 cierres de semana con piloto lesionado grave, assert transición | Lógica |
| AC-5 | Piloto con `SPECIALIST` y `GENERALIST` no recibe el bonus de especialización | Test unitario: calcular modificador de rasgo para esa combinación, assert == 0 | Lógica |
| AC-6 | El roster inicial tiene exactamente `STARTING_PILOTS` pilotos con la distribución de skill y rasgos correcta | Test unitario: inicializar juego nuevo, assert count y distribución | Lógica |
| AC-7 | Piloto con `portrait_id` inválido no crashea la UI — muestra placeholder | Test manual: asignar ID inexistente, verificar que la UI no lanza error | Visual |
| AC-8 | `missions_completed` se incrementa en 1 tras cada misión exitosa del piloto | Test unitario: resolver misión exitosa, assert contador | Lógica |
