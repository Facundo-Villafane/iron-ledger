# Mecha Entity System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P2 — Apego a los recursos

## Summary

Modelo de datos del mecha: tipo, estado de daño, estado operacional, y modificador de durabilidad. El asset más caro del gremio.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Game Configuration`

## Overview

El Mecha Entity System define el modelo de datos de un mecha del hangar. Un mecha es un `Resource` de Godot con campos de identidad (nombre, sprite), un tipo de unidad, un modificador de durabilidad, un estado de daño estructural, y un estado operacional. No contiene lógica — es la estructura que otros sistemas leen y modifican.

El mecha es el asset más caro del gremio y el más visible en la pantalla del hangar. A diferencia del piloto, no tiene rasgos de personalidad — su "carácter" lo define su tipo y su historial de daño. Un mecha que vuelve de cada misión con daño leve empieza a sentirse como un equipo desgastado pero confiable. Uno que sufre daño grave queda fuera de servicio semanas y deja un slot vacío en el hangar.

Para el MVP, cada mecha tiene: **nombre**, **tipo** (COMBAT / TRANSPORT / SALVAGE), **modificador de durabilidad** (1–3), **estado de daño** (INTACT / LIGHT\_DAMAGE / HEAVY\_DAMAGE), **estado operacional** (AVAILABLE / ASSIGNED / IN\_PROGRESS / UNDER\_REPAIR), y **semanas de reparación restantes**.

## Player Fantasy

El mecha es la herramienta, el piloto es la persona. Pero las herramientas también generan apego cuando cuestan dinero y tiempo repararlas.

La fantasía central del mecha es la **bahía del hangar como espacio físico**. Tres slots. Tres mechas. Cuando uno está en reparación por daño grave, esa bahía queda vacía y el jugador siente la pérdida en términos concretos: menos capacidad de misiones, menos ingresos potenciales esa semana. El mecha destruido no duele porque era querido — duele porque era capital invertido que ahora no genera retorno.

El tipo de mecha crea decisiones de asignación: mandar un mecha de TRANSPORT a una misión de COMBAT es posible pero subóptimo — el jugador aprende que la especialización importa sin que el juego se lo diga explícitamente. La durabilidad baja de un mecha viejo crea tensión acumulada: "¿lo mando a otra misión o lo reservo?"

## Detailed Design

### Estructura de datos

```gdscript
# mecha.gd
class_name Mecha
extends Resource
```

---

**Campos de identidad**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String | UUID generado al crear el mecha |
| `mecha_name` | String | Nombre visible — generado o asignado |
| `sprite_id` | String | Referencia al sprite según tipo y estado de daño |

---

**Campos de stats**

| Campo | Tipo | Rango | Descripción |
|---|---|---|---|
| `mecha_type` | MechaType | enum | COMBAT / TRANSPORT / SALVAGE |
| `durability` | int | 1 – 3 | Calidad estructural — modifica la probabilidad de recibir daño |

---

**Campos de estado**

| Campo | Tipo | Descripción |
|---|---|---|
| `damage_state` | DamageState | INTACT / LIGHT\_DAMAGE / HEAVY\_DAMAGE |
| `status` | MechaStatus | AVAILABLE / ASSIGNED / IN\_PROGRESS / UNDER\_REPAIR |
| `repair_weeks_remaining` | int | Semanas hasta volver a AVAILABLE. 0 si no está en reparación |
| `assigned_mission_id` | String | ID de la misión activa. `""` si no está asignado |

---

**Campos de historial** *(solo lectura, para UI)*

| Campo | Tipo | Descripción |
|---|---|---|
| `missions_completed` | int | Misiones completadas |
| `total_damage_received` | int | Contador de veces que recibió daño (cualquier tipo) |

---

### Estados operacionales y transiciones

| Estado | Quién lo escribe | Condición de entrada | Condición de salida |
|---|---|---|---|
| `AVAILABLE` | Repair System / inicio de juego | Creado / reparación completada | Asignado a misión |
| `ASSIGNED` | Assignment System | Jugador confirma asignación | Semana avanza |
| `IN_PROGRESS` | Weekly Cycle System | Inicio de semana con misión activa | Mission Resolution resuelve |
| `BROKEN` | Damage System | HEAVY_DAMAGE recibido — fuera de servicio, sin reparación iniciada | Jugador paga la reparación |
| `UNDER_REPAIR` | Repair System | Jugador inicia reparación (paga el costo) | `repair_weeks_remaining` llega a 0 |

*`BROKEN` y `UNDER_REPAIR` son estados distintos: un mecha BROKEN está roto esperando que el jugador decida repararlo. Un mecha UNDER_REPAIR está siendo reparado activamente con countdown en curso. El jugador puede optar por no reparar y jugar con menos recursos.*

---

### Estados de daño

| Estado | Descripción | Efecto en juego |
|---|---|---|
| `INTACT` | Sin daño estructural | Sin penalización |
| `LIGHT_DAMAGE` | Daño menor — funcional pero desgastado | `-0.05` a probabilidad de éxito. Reparable manualmente por el jugador |
| `HEAVY_DAMAGE` | Daño grave — fuera de servicio | `status = BROKEN`. No asignable hasta que el jugador pague la reparación |

*Un mecha con `LIGHT_DAMAGE` puede ser asignado — el jugador elige si repararlo (paga 400 cr, 1 semana fuera) o mandarlo igual con el riesgo. Un mecha con `HEAVY_DAMAGE` está `BROKEN` hasta que el jugador decida y pueda pagar la reparación.*

---

### Modificador de durabilidad sobre probabilidad de daño

| `durability` | Modificador sobre `actual_damage_chance` |
|---|---|
| 1 | ×1.20 (más frágil) |
| 2 | ×1.00 (referencia) |
| 3 | ×0.80 (más resistente) |

## Formulas

El Mecha Entity System no calcula — expone datos. Define los modificadores que Risk Calculation y Damage System consumen:

**Modificador de tipo** *(consumido por Risk Calculation)*:
```
type_match_bonus = 0.15   si mecha_type == mission.preferred_mecha_type
type_match_bonus = 0.00   si mecha_type != mission.preferred_mecha_type
                          o si preferred_mecha_type == NONE
```

**Modificador de daño previo** *(consumido por Risk Calculation)*:
```
damage_state_penalty = -0.05   si damage_state == LIGHT_DAMAGE
damage_state_penalty =  0.00   si damage_state == INTACT
```
*Un mecha con HEAVY_DAMAGE no puede ser asignado — este modificador nunca se aplica en ese estado.*

**Modificador de durabilidad** *(consumido por Damage System)*:
```
effective_damage_chance = actual_damage_chance × durability_modifier

durability_modifier = 1.20   si durability == 1
durability_modifier = 1.00   si durability == 2
durability_modifier = 0.80   si durability == 3
```

**Tiempo de reparación** *(escrito por Damage System, definido en GameConfig)*:
```
repair_weeks = REPAIR_WEEKS_LIGHT   si damage_state == LIGHT_DAMAGE
repair_weeks = REPAIR_WEEKS_HEAVY   si damage_state == HEAVY_DAMAGE
```

## Edge Cases

1. **Todos los mechas en UNDER_REPAIR simultáneamente**: el hangar queda vacío, no hay misiones posibles. Los costos fijos igual se pagan. Situación de crisis válida — el jugador apostó mal y ahora sufre las consecuencias.

2. **Mecha con LIGHT_DAMAGE asignado y recibe daño grave en la misión**: el Damage System escala el estado a HEAVY_DAMAGE. No hay estado intermedio acumulado — LIGHT_DAMAGE + daño grave = HEAVY_DAMAGE directo.

3. **Mecha en UNDER_REPAIR recibe una asignación**: imposible por diseño — Assignment System verifica `status == AVAILABLE`. Un mecha UNDER_REPAIR no aparece como opción en la UI.

4. **`repair_weeks_remaining` llega a 0 pero el `damage_state` no se resetea**: el Repair System es responsable de escribir `damage_state = INTACT` y `status = AVAILABLE` simultáneamente. Si solo actualiza uno, el mecha queda en estado inconsistente — debe ser atómico.

5. **Mecha con `mecha_type` que no coincide con ninguna misión disponible esa semana**: válido — ese mecha simplemente no tiene bonus de tipo esa semana. No genera error ni bloqueo.

6. **`sprite_id` inválido**: igual que en Pilot Entity — la UI muestra un sprite placeholder. El sistema de datos no valida esto.

7. **`HANGAR_SLOTS` reducido por debajo del número de mechas actuales**: solo puede ocurrir si se edita GameConfig manualmente en medio de una partida. El sistema no destruye mechas existentes — los mechas extra quedan como "supernumerarios" sin slot visual. Caso de testing, no de gameplay normal.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Game Configuration** | `HANGAR_SLOTS`, `REPAIR_COST_LIGHT/HEAVY`, `REPAIR_WEEKS_LIGHT/HEAVY` |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Risk Calculation System** | `mecha_type`, `durability`, `damage_state` — modifica probabilidad de éxito y daño |
| **Assignment System** | `status`, `id` — valida disponibilidad y registra asignación |
| **Weekly Cycle System** | `status`, `repair_weeks_remaining` — decrementa reparación y transiciona estados |
| **Damage System** | Escribe `damage_state`, `status = UNDER_REPAIR`, `repair_weeks_remaining` |
| **Repair System** | Lee `damage_state`; escribe `status = AVAILABLE`, `damage_state = INTACT`, cobra costo al Financial Ledger |
| **Mission Resolution System** | Lee `id` del mecha asignado para reportar resultados |
| **Main Hangar Screen UI** | Lee todos los campos — muestra estado de cada bahía |
| **Assignment UI** | Lee `status`, `mecha_type`, `durability`, `damage_state` — muestra opciones de asignación |
| **Result Report UI** | Lee `mecha_name`, `sprite_id`, `damage_state` — muestra qué le pasó al mecha |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `type_match_bonus` | Fórmula | `0.15` | `0.05 – 0.25` | Cuánto premia usar el mecha correcto. Muy alto = el tipo lo es todo; muy bajo = irrelevante |
| `damage_state_penalty` | Fórmula | `-0.05` | `-0.02 – -0.15` | Cuánto penaliza mandar un mecha con LIGHT_DAMAGE. Si es muy alto, el jugador nunca lo manda |
| `durability_modifier` (escala) | Tabla de durabilidad | ×0.80 / ×1.00 / ×1.20 | ×0.70–×0.90 / ref / ×1.10–×1.30 | Cuánto importa la calidad del mecha en su resistencia al daño |
| `REPAIR_COST_LIGHT` | Game Configuration | `400` | `200 – 700` | Costo de reparar daño leve — debe doler pero no hundir |
| `REPAIR_COST_HEAVY` | Game Configuration | `900` | `600 – 1500` | Costo de reparar daño grave — este es el gasto que puede cambiar el juego |
| `REPAIR_WEEKS_LIGHT` | Game Configuration | `1` | `1 – 2` | Tiempo fuera por daño leve — 1 semana es el mínimo significativo |
| `REPAIR_WEEKS_HEAVY` | Game Configuration | `3` | `2 – 5` | Tiempo fuera por daño grave — determina cuánto impacta perder un mecha |
| `HANGAR_SLOTS` | Game Configuration | `3` | `2 – 4` | Capacidad del hangar — define el techo de ingresos posibles por semana |

**Notas de tuning:**
- `REPAIR_COST_HEAVY` y `REPAIR_WEEKS_HEAVY` son los dos números más impactantes del sistema. Un mecha fuera 3 semanas con 900 cr de costo es una crisis seria con 8000 cr iniciales.
- Si los jugadores nunca mandan mechas con LIGHT_DAMAGE, reducir `damage_state_penalty`. Si siempre los mandan sin importar el daño, subirlo.
- `type_match_bonus` de 0.15 hace que el tipo importe pero no sea determinante — el skill del piloto pesa más.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Un `Mecha` Resource carga todos sus campos sin errores | Test unitario: instanciar mecha con valores válidos, assert todos los campos accesibles | Lógica |
| AC-2 | `type_match_bonus` es 0.15 cuando el tipo coincide y 0.00 cuando no | Test unitario: verificar ambos casos con los tres tipos | Lógica |
| AC-3 | `damage_state_penalty` es -0.05 para LIGHT_DAMAGE y 0.00 para INTACT | Test unitario: assert ambos valores | Lógica |
| AC-4 | `durability_modifier` correcto para cada nivel (1→1.20, 2→1.00, 3→0.80) | Test unitario: verificar los tres valores | Lógica |
| AC-5 | Un mecha con HEAVY_DAMAGE no aparece como opción en Assignment UI | Test manual: poner mecha en HEAVY_DAMAGE, verificar que no aparece en lista | Integración |
| AC-6 | Al completar reparación, `damage_state = INTACT` y `status = AVAILABLE` se escriben en la misma operación | Test unitario: simular fin de reparación, assert ambos campos actualizados simultáneamente | Lógica |
| AC-7 | Un mecha con LIGHT_DAMAGE puede ser asignado a una misión | Test manual: poner mecha en LIGHT_DAMAGE, verificar que aparece disponible en Assignment UI | Integración |
| AC-8 | El hangar inicial tiene exactamente `HANGAR_SLOTS` mechas con tipos variados | Test unitario: inicializar juego nuevo, assert count y distribución de tipos | Lógica |
