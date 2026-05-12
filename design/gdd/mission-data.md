# Mission Data System

> **Status**: Approved
> **Author**: Design session + agents
> **Last Updated**: 2026-05-11
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre

## Summary

Capa de datos pura que define el modelo de MissionTemplate y MissionInstance. Establece qué información de una misión es visible para el jugador y qué permanece oculta hasta la resolución — implementando directamente el Pilar 1 (Decisiones bajo incertidumbre).

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `None`

## Overview

El Mission Data System es la capa de datos que define qué es una misión en Iron Ledger. Establece dos estructuras: el **MissionTemplate** (el molde fijo por tipo de misión — transporte, combate, salvamento) y el **MissionInstance** (una misión concreta generada desde un template, con valores resueltos para esa semana específica). Todo sistema que necesita saber "qué misiones existen" o "qué parámetros tiene esta misión" los lee desde aquí.

El sistema no tiene lógica propia — es una fuente de verdad de datos. Expone:
- Los tres tipos de misión con sus rangos de parámetros base
- Para cada instancia: qué información es visible para el jugador (reward estimado, tipo, zona) y qué es oculta hasta la resolución (modificadores de riesgo exactos, complicaciones)
- Las constantes de balance que Mission Generation usa para crear la distribución semanal de misiones

La separación entre datos visibles y ocultos no es un detalle técnico — es la implementación directa del Pilar 1 (Decisiones bajo incertidumbre). El Mission Data System es el lugar donde se define exactamente qué sabe el jugador y qué no.

## Player Fantasy

El Mission Data System es infraestructura invisible. El jugador nunca lo toca directamente — lo que siente es lo que este sistema habilita.

**Lo que habilita**: La sensación de leer una carta de misión y saber que hay más información de la que ves. El texto que dice "zona con actividad rival reportada" no es decorativo — es un parámetro de riesgo oculto que este sistema define y que el Risk Calculation System va a usar. El jugador no sabe cuánto pesa ese modificador. Eso es intencional. El Mission Data System es el origen de esa incertidumbre.

**Fantasy indirecta**: El jugador fantasea con tener información perfecta que nunca va a tener. Cada lectura de una misión es un acto de inferencia — "¿qué significa 'facción rival activa' en términos reales de riesgo?" La respuesta está en los datos ocultos de esta estructura, y el jugador solo la descubre cuando la misión vuelve.

Esta es la implementación de diseño del Pilar 1. El sistema de datos no es neutral — es una herramienta deliberada de ocultamiento de información.

## Detailed Design

### Core Rules

**Regla 1 — Dos estructuras separadas**
El sistema define dos tipos de objeto:
- **`MissionTemplate`**: molde de diseño, inmutable, uno por familia de misión. Vive en los archivos de datos del juego.
- **`MissionInstance`**: copia concreta generada por Mission Generation System para una semana específica. Mutable (su estado cambia a medida que avanza el ciclo).

**Regla 2 — Separación visible/oculto**
Cada campo de `MissionInstance` tiene visibilidad definida. La Mission Card UI solo puede leer campos marcados `[VISIBLE]`. Los campos `[HIDDEN]` solo los consumen sistemas internos (Risk Calculation, Mission Resolution). Esta regla es inviolable — ningún sistema puede exponer un campo `[HIDDEN]` directamente al jugador.

**Regla 3 — El tipo de misión siempre es visible**
`type` (TRANSPORT / COMBAT / SALVAGE) es siempre `[VISIBLE]`. La incertidumbre del jugador está en los parámetros de riesgo, no en el tipo.

**Regla 4 — Risk tags: exactamente 1 o 2**
Cada `MissionInstance` tiene entre 1 y 2 risk tags visibles (strings de advertencia vaga). Las misiones de bajo riesgo tienen 1. Las de mayor riesgo tienen 2. Los risk tags son el único indicio visible de los parámetros ocultos.

---

**Campos de `MissionTemplate`**

| Campo | Tipo | Visible | Descripción |
|---|---|---|---|
| `id` | String | — | Identificador único del template |
| `type` | MissionType | ✓ | TRANSPORT / COMBAT / SALVAGE |
| `display_name` | String | ✓ | Nombre de la misión |
| `zone_type` | ZoneType | ✓ | URBAN\_DENSE / INDUSTRIAL / RESIDENTIAL / PORT / RESTRICTED |
| `base_reward_min` | int | ✓ (como rango) | Créditos mínimos (se muestra como "800–1800 cr") |
| `base_reward_max` | int | ✓ (como rango) | Créditos máximos |
| `base_duration_weeks` | int | ✓ | Semanas para completar (1–3) |
| `risk_tags` | Array[String] | ✓ | 1–2 advertencias vagas ("zona con actividad rival") |
| `base_difficulty` | float | ✗ | 0.0–1.0 — consumido por Risk Calculation |
| `damage_chance_base` | float | ✗ | Probabilidad base de daño a mecha |
| `collateral_chance_base` | float | ✗ | Probabilidad base de daño colateral |
| `preferred_mecha_type` | MechaType | ✓ (como "preferido") | NONE / COMBAT / TRANSPORT / SALVAGE |
| `unlock_tier` | int | ✗ | Tier mínimo del gremio para que aparezca |

---

**Campos de `MissionInstance`** (generada desde template + valores resueltos)

| Campo | Tipo | Visible | Descripción |
|---|---|---|---|
| `template_id` | String | ✗ | Referencia al template fuente |
| `type` | MissionType | ✓ | Copiado del template |
| `display_name` | String | ✓ | Copiado del template |
| `zone_type` | ZoneType | ✓ | Copiado |
| `reward_hint` | String | ✓ | "800–1800 cr" — mostrado al jugador |
| `actual_reward` | int | ✗ | Resuelto dentro del rango; revelado solo al completar |
| `duration_weeks` | int | ✓ | Copiado del template |
| `risk_tags` | Array[String] | ✓ | Copiado (1–2 items) |
| `actual_difficulty` | float | ✗ | base + varianza — consumido por Risk Calculation |
| `actual_damage_chance` | float | ✗ | base + modificador de zona + varianza |
| `actual_collateral_chance` | float | ✗ | base + modificador de zona + varianza |
| `preferred_mecha_type` | MechaType | ✓ | Copiado |
| `status` | MissionStatus | ✓ | AVAILABLE / ASSIGNED / IN\_PROGRESS / COMPLETED / EXPIRED |
| `assigned_pilot_id` | String | ✓ | null hasta asignación |
| `assigned_mecha_id` | String | ✓ | null hasta asignación |
| `week_generated` | int | ✗ | Semana en que fue creada |
| `week_expires` | int | ✗ | Si no se asigna antes de esta semana, expira |

### States and Transitions

| Estado | Condición de entrada | Condición de salida | Comportamiento |
|---|---|---|---|
| `AVAILABLE` | Creada por Mission Generation | Asignada o expirada | Visible en la cola de misiones, seleccionable |
| `ASSIGNED` | Jugador asigna piloto + mecha | Ciclo semanal avanza | Bloqueada para edición, piloto + mecha reservados |
| `IN_PROGRESS` | Inicio de semana (Weekly Cycle) | Mission Resolution resuelve | No editable, en ejecución automática |
| `COMPLETED` | Mission Resolution System resuelve | — | Resultado disponible; se archiva |
| `EXPIRED` | Semana avanza sin asignación | — | Removida de la cola, no disponible |

*Las transiciones de estado son escritas por otros sistemas (Assignment System, Weekly Cycle, Mission Resolution). Mission Data System define los estados posibles — no gestiona las transiciones.*

### Interactions with Other Systems

| Sistema | Dirección | Qué consume / produce |
|---|---|---|
| **Mission Generation** | Lee templates → crea instances | Lee el catálogo de MissionTemplates; crea y escribe MissionInstances |
| **Risk Calculation** | Lee instances | Consume `actual_difficulty`, `actual_damage_chance`, `actual_collateral_chance` |
| **Assignment System** | Lee + escribe instances | Lee campos visibles y `status`; escribe `assigned_pilot_id`, `assigned_mecha_id`; transiciona status |
| **Mission Resolution** | Lee instances completas | Consume todos los campos (visibles + ocultos) para resolver el outcome |
| **Mission Card UI** | Lee instances (solo visible) | Consume únicamente campos `[VISIBLE]` — nunca accede directamente a campos hidden |
| **Weekly Cycle System** | Escribe instances | Transiciona ASSIGNED→IN\_PROGRESS al inicio de semana; AVAILABLE→EXPIRED si vence |

## Formulas

### Resolución de `actual_reward`

```
actual_reward = randi_range(base_reward_min, base_reward_max)
```

| Variable | Tipo | Rango | Fuente |
|---|---|---|---|
| `base_reward_min` | int | 400 – 1500 cr | MissionTemplate |
| `base_reward_max` | int | 800 – 5000 cr | MissionTemplate |
| `actual_reward` | int | [min, max] | Resuelta en generación |

**Output range**: entre `base_reward_min` y `base_reward_max`, distribución uniforme. El jugador ve el rango como hint; el valor exacto se revela al completar.

---

### Resolución de `actual_difficulty`

```
actual_difficulty = clamp(base_difficulty + randf_range(-DIFFICULTY_VARIANCE, DIFFICULTY_VARIANCE), 0.05, 0.95)
```

| Variable | Símbolo | Rango | Fuente |
|---|---|---|---|
| `base_difficulty` | D_base | 0.05 – 0.90 | MissionTemplate |
| `DIFFICULTY_VARIANCE` | V_d | tuning knob | Game Configuration |
| `actual_difficulty` | D | 0.05 – 0.95 | Resuelta en generación |

**Output range**: 0.05 mínimo (ninguna misión trivialmente cero riesgo), 0.95 máximo (reservar margen para modificadores de piloto/mecha en Risk Calculation).

---

### Resolución de `actual_damage_chance` y `actual_collateral_chance`

```
actual_damage_chance = clamp(
    damage_chance_base * zone_damage_modifier + randf_range(-CHANCE_VARIANCE, CHANCE_VARIANCE),
    0.02, 0.90
)

actual_collateral_chance = clamp(
    collateral_chance_base * zone_collateral_modifier + randf_range(-CHANCE_VARIANCE, CHANCE_VARIANCE),
    0.01, 0.80
)
```

| Variable | Rango | Fuente |
|---|---|---|
| `damage_chance_base` | 0.03 – 0.65 | MissionTemplate |
| `collateral_chance_base` | 0.01 – 0.45 | MissionTemplate |
| `zone_damage_modifier` | 0.8 – 1.4 | Tabla de zona (abajo) |
| `zone_collateral_modifier` | 0.8 – 1.6 | Tabla de zona (abajo) |
| `CHANCE_VARIANCE` | tuning knob | Game Configuration |

### Tabla de Modificadores por Zona

| `zone_type` | `zone_damage_modifier` | `zone_collateral_modifier` | Razonamiento |
|---|---|---|---|
| URBAN\_DENSE | 1.1 | 1.5 | Muchos civiles, más daño colateral |
| INDUSTRIAL | 1.0 | 1.2 | Equipamiento pesado, algo de colateral |
| RESIDENTIAL | 0.9 | 1.3 | Menor combate, pero civiles vulnerables |
| PORT | 1.0 | 1.0 | Espacio abierto, referencia base |
| RESTRICTED | 1.3 | 0.8 | Alta seguridad (más daño al mecha), área despejada de civiles |

### Catálogo de Risk Tags — Correlación con campos ocultos

Los risk tags son el único indicio visible de los parámetros ocultos. La correlación es real pero **no 1:1** — el jugador aprende los patrones con el tiempo (maestría del Pilar 1).

| Risk tag | Campo oculto correlacionado | Fuerza de señal |
|---|---|---|
| "zona urbana densa" | `zone_collateral_modifier` alto | FUERTE |
| "actividad rival confirmada" | `actual_difficulty` y `actual_damage_chance` altos | MEDIA |
| "ruta no mapeada" | `DIFFICULTY_VARIANCE` amplificado (±0.15 extra) | DÉBIL (alta incertidumbre) |
| "zona industrial activa" | `damage_chance_base` moderado | MEDIA |
| "residuos peligrosos" | `collateral_chance_base` × 1.2 adicional | MEDIA |
| "tráfico de control" | `actual_difficulty` × 0.85 (más FÁCIL) | FUERTE pero contraintuitiva |

*"tráfico de control" suena a riesgo pero indica zona organizada y segura — los jugadores expertos aprenden a leerla como señal positiva. Esta asimetría es intencional.*

## Edge Cases

1. **`actual_reward` fuera de rango**: si `base_reward_min > base_reward_max` por error de datos, `randi_range` devuelve resultado indefinido → validar en carga de templates que `min ≤ max`. Si falla, loguear error y usar `min` como valor fijo.

2. **Misión expirada mientras está ASSIGNED**: `week_expires` llega pero la misión ya fue asignada. Una misión ASSIGNED **nunca expira** — `week_expires` solo aplica a AVAILABLE. El Weekly Cycle System ignora el campo si `status != AVAILABLE`.

3. **Sin misiones disponibles**: todas las misiones de la semana se asignaron o expiraron antes de que el jugador haga algo. La cola queda vacía. El sistema no genera emergencias — simplemente no hay misiones ese período. Es una situación válida (presión financiera sin opción de ingresos).

4. **`preferred_mecha_type = NONE`**: el template no prefiere ningún tipo. La Mission Card UI muestra "sin preferencia" o no muestra el campo. Risk Calculation no aplica el bonus de tipo.

5. **Doble asignación en UI**: el jugador intenta asignar el mismo piloto o mecha a dos misiones distintas. El Assignment System valida esto — Mission Data System solo expone `assigned_pilot_id`. Si ya tiene valor, el Assignment System rechaza la segunda asignación.

6. **`reward_hint` con rango de un solo valor** (`min == max`): se muestra como valor fijo ("1200 cr") en lugar de rango ("1200–1200 cr"). La Mission Card UI maneja este display.

7. **Template con `unlock_tier` mayor al tier actual**: Mission Generation System filtra estos templates antes de instanciarlos. Mission Data System no valida esto — es responsabilidad del generador.

## Dependencies

Mission Data System es Foundation — no depende de ningún otro sistema.

**Sistemas que dependen de este:**

| Sistema | Qué consume | Dirección |
|---|---|---|
| **Mission Generation System** | Lee `MissionTemplate` (catálogo completo) para crear `MissionInstance` | Template → Instance |
| **Risk Calculation System** | Lee `actual_difficulty`, `actual_damage_chance`, `actual_collateral_chance` de `MissionInstance` | Solo campos hidden |
| **Assignment System** | Lee `status` y campos visibles; escribe `assigned_pilot_id`, `assigned_mecha_id`; transiciona `status` | Lectura + escritura |
| **Mission Resolution System** | Lee `MissionInstance` completa (todos los campos) para resolver outcome | Acceso total |
| **Weekly Cycle System** | Transiciona `status` (ASSIGNED→IN_PROGRESS, AVAILABLE→EXPIRED) | Solo escritura de estado |
| **Mission Card UI** | Lee únicamente campos `[VISIBLE]` de `MissionInstance` | Solo visible |

**Restricción de acceso:**
Ningún sistema de UI puede acceder directamente a campos `[HIDDEN]`. Si la UI necesita mostrar algo derivado de un campo oculto (ej: un indicador de riesgo general), ese valor lo calcula Risk Calculation System y lo expone como su propio output.

## Tuning Knobs

| Knob | Dónde vive | Valor inicial sugerido | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `DIFFICULTY_VARIANCE` | Game Configuration | `0.10` | `0.0 – 0.20` | Cuánto varía `actual_difficulty` respecto al `base_difficulty` del template. Más alto = más sorpresas, más impredecible. |
| `CHANCE_VARIANCE` | Game Configuration | `0.05` | `0.0 – 0.15` | Varianza en `actual_damage_chance` y `actual_collateral_chance`. Mantener bajo para que los risk tags sean señales confiables. |
| `base_difficulty` por template | Archivo de templates | Ver catálogo | `0.05 – 0.90` | Dificultad base de cada tipo de misión. El knob de balance más directo del juego. |
| `base_reward_min / max` por template | Archivo de templates | Ver catálogo | — | Define el rango de pago. Subir ambos si el jugador siempre está en quiebra; bajar si el juego es demasiado fácil económicamente. |
| `zone_damage_modifier` por zona | Tabla de zona | Ver tabla de modificadores | `0.7 – 1.5` | Ajusta cuánto daña cada zona a los mechas. |
| `zone_collateral_modifier` por zona | Tabla de zona | Ver tabla de modificadores | `0.7 – 1.8` | Ajusta el riesgo colateral por zona. Tocar con cuidado — afecta reputación y penalizaciones. |

**Notas de tuning:**
- `DIFFICULTY_VARIANCE` y `CHANCE_VARIANCE` son los primeros knobs a tocar si el juego se siente "demasiado predecible" o "demasiado caótico".
- Los `base_difficulty` de los templates son el balance más impactante — una misión de transporte en 0.15 vs 0.25 cambia completamente la curva de dificultad temprana.
- Los modificadores de zona se balancean en conjunto: si URBAN\_DENSE es demasiado punitivo, bajar `zone_collateral_modifier` antes de tocar las misiones individuales.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Un `MissionTemplate` cargado desde archivo tiene todos los campos requeridos con valores dentro de rango | Test unitario: cargar catálogo, assert campos presentes y `min ≤ max` | Lógica |
| AC-2 | `actual_difficulty` generado siempre cae entre 0.05 y 0.95 | Test unitario: generar 1000 instancias, assert ningún valor fuera de rango | Lógica |
| AC-3 | `actual_damage_chance` y `actual_collateral_chance` siempre dentro de sus rangos (`[0.02, 0.90]` y `[0.01, 0.80]`) | Test unitario: generar 1000 instancias, assert rangos | Lógica |
| AC-4 | `MissionInstance` en estado ASSIGNED no transiciona a EXPIRED aunque `week_expires` pase | Test unitario: simular avance de semanas con instancia ASSIGNED | Lógica |
| AC-5 | La Mission Card UI no puede acceder a ningún campo `[HIDDEN]` de `MissionInstance` | Code review: la UI solo llama a métodos/propiedades marcadas como visibles | Integración |
| AC-6 | Una misión con `preferred_mecha_type = NONE` se genera y muestra sin errores | Test manual: crear template con NONE, verificar que la card no muestra campo de preferencia | Visual |
| AC-7 | El catálogo inicial contiene al menos 1 template de cada tipo (TRANSPORT, COMBAT, SALVAGE) | Test unitario: assert catálogo tiene ≥ 1 template por MissionType | Lógica |
| AC-8 | `reward_hint` con `min == max` se muestra como valor único, no como rango | Test manual: crear template con valores iguales, verificar display en Mission Card | Visual |

