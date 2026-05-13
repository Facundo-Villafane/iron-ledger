# Mission Generation System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: P1 — Decisiones bajo incertidumbre

## Summary

Genera el pool de misiones disponibles al inicio de cada semana seleccionando templates y creando instancias con valores randomizados.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Mission Data, Game Configuration`

## Overview

El Mission Generation System crea el pool de misiones disponibles al comienzo de cada semana. Lee el catálogo de `MissionTemplate` del Mission Data System, selecciona entre 3 y 5 templates según las reglas de distribución y el tier actual del gremio, los instancia como `MissionInstance` con valores randomizados (dificultad, reward, chances de daño), y los entrega al Weekly Cycle System para que estén disponibles durante esa semana.

El sistema no tiene estado propio entre semanas — cada vez que corre produce un pool fresco. Su única responsabilidad es garantizar que el pool tenga variedad de tipos (COMBAT / TRANSPORT / SALVAGE), que la dificultad promedio escale suavemente con el número de semana, y que ningún template con `unlock_tier` mayor al nivel actual del gremio aparezca.

La aleatoriedad controlada es intencional: el jugador no sabe exactamente qué misiones va a ver la semana siguiente, pero sí puede anticipar la distribución aproximada. Esa anticipación parcial es parte del Pilar 1.

## Player Fantasy

El jugador abre la semana y ve el tablero de misiones disponibles. Tres, cuatro, tal vez cinco cartas. Algunas son seguras y pagan poco. Una es arriesgada y paga bien. Tiene que decidir cuáles tomar y cuáles ignorar — sabiendo que las que no tome van a expirar.

La fantasy no es la generación en sí — es la **sensación de oportunidad limitada**. El pool semanal crea escasez deliberada: no todas las misiones son buenas, no todos los slots del hangar se van a llenar, y hay semanas en que el pool es malo y el jugador tiene que conformarse con lo que hay. Esa varianza semana a semana es lo que hace que cada semana se sienta distinta sin necesitar contenido narrativo nuevo.

La escala de dificultad gradual asegura que las semanas tempranas sean relativamente manejables y las tardías pongan al gremio contra la pared — sin que el jugador sienta que el juego lo está trampeando.

## Detailed Design

### Proceso de generación (ejecutado por Weekly Cycle System al inicio de semana)

```
generate_weekly_pool(week_number: int, guild_tier: int) -> Array[MissionInstance]
```

**Pasos en orden:**

1. **Filtrar templates disponibles**: excluir templates con `unlock_tier > guild_tier`
2. **Determinar cantidad**: `pool_size = randi_range(MISSIONS_PER_WEEK_MIN, MISSIONS_PER_WEEK_MAX)`
3. **Garantizar distribución mínima**: reservar 1 slot para cada tipo (COMBAT, TRANSPORT, SALVAGE) si hay templates disponibles de ese tipo
4. **Llenar slots restantes**: seleccionar templates aleatoriamente del pool filtrado para los slots restantes
5. **Instanciar cada template**: crear `MissionInstance` con valores randomizados aplicando las fórmulas de Mission Data System
6. **Aplicar escala de dificultad semanal**: ajustar `actual_difficulty` según `week_number`
7. **Asignar expiración**: `week_expires = week_number + MISSION_EXPIRY_WEEKS`
8. **Devolver pool**: las instancias se entregan al Weekly Cycle System con `status = AVAILABLE`

---

### Escala de dificultad por semana

La dificultad base de los templates se ajusta con un modificador semanal:

| Semanas | Modificador de dificultad |
|---|---|
| 1 – 3 | ×0.80 (intro — más fácil) |
| 4 – 7 | ×1.00 (referencia) |
| 8 – 10 | ×1.15 (presión alta) |
| 11 – 12 | ×1.25 (final — máxima presión) |

El modificador se aplica sobre `actual_difficulty` ya randomizado, con clamp final a [0.05, 0.95].

---

### Distribución garantizada de tipos

Para asegurar que el jugador siempre tenga opciones de los tres tipos:

- Si `pool_size ≥ 3`: garantizar al menos 1 COMBAT, 1 TRANSPORT, 1 SALVAGE
- Si `pool_size == 2`: garantizar al menos 1 TRANSPORT (el más seguro) + 1 aleatorio
- Si `pool_size == 1`: 1 TRANSPORT (caso de emergencia, no debería ocurrir con MIN=3)

## Formulas

**Cantidad de misiones del pool:**
```
pool_size = randi_range(MISSIONS_PER_WEEK_MIN, MISSIONS_PER_WEEK_MAX)
```

**Modificador de dificultad semanal:**
```
difficulty_scale = 0.80   si week_number ≤ 3
difficulty_scale = 1.00   si 4 ≤ week_number ≤ 7
difficulty_scale = 1.15   si 8 ≤ week_number ≤ 10
difficulty_scale = 1.25   si week_number ≥ 11

actual_difficulty = clamp(base_actual_difficulty × difficulty_scale, 0.05, 0.95)
```

**Fecha de expiración:**
```
week_expires = week_number + MISSION_EXPIRY_WEEKS
```

Con `MISSION_EXPIRY_WEEKS = 1`, una misión generada en semana 3 expira si no se asigna antes del fin de la semana 3 (cuando el jugador avanza al turno 4).

**Ejemplo — semana 9, pool de 4 misiones:**
```
pool_size = 4
difficulty_scale = 1.15
Templates seleccionados: 1 COMBAT (base_diff 0.55), 1 TRANSPORT (0.20), 1 SALVAGE (0.35), 1 COMBAT extra

COMBAT:    actual_difficulty = clamp(0.55 × 1.15, 0.05, 0.95) = 0.63
TRANSPORT: actual_difficulty = clamp(0.20 × 1.15, 0.05, 0.95) = 0.23
SALVAGE:   actual_difficulty = clamp(0.35 × 1.15, 0.05, 0.95) = 0.40
```

## Edge Cases

1. **No hay templates de un tipo disponibles para ese tier**: si el catálogo no tiene ningún template COMBAT con `unlock_tier ≤ guild_tier`, se omite la garantía de ese tipo y se llena con otro tipo disponible. El sistema no bloquea — registra un warning en el log de desarrollo.

2. **`MISSIONS_PER_WEEK_MIN > MISSIONS_PER_WEEK_MAX`**: validado al inicio de sesión por Game State Manager. Si ocurre, se usa `MIN` como valor fijo y se loguea el error (heredado de Game Configuration edge case).

3. **Pool de semanas 11–12 con `difficulty_scale = 1.25` sobre templates de dificultad alta**: un template con `base_difficulty = 0.80` daría `0.80 × 1.25 = 1.00`, clampea a 0.95. El sistema nunca produce misiones imposibles.

4. **Misiones del turno anterior no asignadas**: el sistema no las toca — Weekly Cycle System las marca como EXPIRED antes de llamar a `generate_weekly_pool`. El generador siempre trabaja con un pool limpio.

5. **`guild_tier = 0` y todos los templates tienen `unlock_tier ≥ 1`**: no hay templates disponibles. El sistema devuelve un pool vacío y loguea error crítico. Es un error de configuración de datos, no de gameplay — el catálogo debe tener siempre templates de tier 0.

## Dependencies

**Depende de:**

| Sistema | Qué consume |
|---|---|
| **Mission Data System** | Catálogo de `MissionTemplate` para seleccionar y crear `MissionInstance` |
| **Game Configuration** | `MISSIONS_PER_WEEK_MIN/MAX`, `MISSION_EXPIRY_WEEKS`, `DIFFICULTY_VARIANCE`, `CHANCE_VARIANCE` |

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Weekly Cycle System** | Llama `generate_weekly_pool` al inicio de cada turno y gestiona el pool resultante |
| **Assignment System** | Lee el pool de misiones AVAILABLE para presentarlas al jugador |
| **Main Hangar Screen UI** | Lee el pool para mostrar las misiones disponibles de la semana |

## Tuning Knobs

| Knob | Dónde vive | Valor inicial | Rango seguro | Qué afecta |
|---|---|---|---|---|
| `MISSIONS_PER_WEEK_MIN` | Game Configuration | `3` | `2 – 4` | Mínimo de opciones por semana. Con 2: muy poco margen de elección |
| `MISSIONS_PER_WEEK_MAX` | Game Configuration | `5` | `4 – 6` | Máximo de opciones. Con 6: demasiado para procesar |
| `MISSION_EXPIRY_WEEKS` | Game Configuration | `1` | `1 – 2` | Con 2: las misiones duran dos turnos — reduce urgencia |
| `difficulty_scale` por tramo | Tabla de escala | Ver tabla | ×0.70–×1.35 | Cuánto escala la presión en cada fase del juego |

**Notas de tuning:**
- Si el juego se siente muy fácil en las primeras semanas, bajar `difficulty_scale` de semanas 1–3 a ×0.70.
- Si las semanas finales se sienten imposibles, bajar el tramo 11–12 a ×1.15.
- `MISSIONS_PER_WEEK_MIN = 3` con `HANGAR_SLOTS = 3` es intencional: siempre hay exactamente tantas misiones como mechas disponibles en el peor caso — sin misiones "de relleno" obvias.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Pool generado tiene entre `MISSIONS_PER_WEEK_MIN` y `MISSIONS_PER_WEEK_MAX` misiones | Test unitario: generar 100 pools, assert size en rango | Lógica |
| AC-2 | Pool de 3+ misiones siempre contiene al menos 1 de cada tipo | Test unitario: generar 100 pools con catálogo completo, assert distribución | Lógica |
| AC-3 | Ninguna `MissionInstance` tiene `unlock_tier > guild_tier` | Test unitario: setear guild_tier = 0, assert solo templates de tier 0 | Lógica |
| AC-4 | `actual_difficulty` en semana 12 es mayor que en semana 1 para el mismo template | Test unitario: generar misma misión en semana 1 y 12, assert diff12 > diff1 | Lógica |
| AC-5 | `actual_difficulty` siempre entre 0.05 y 0.95 con cualquier `difficulty_scale` | Test unitario: generar pools en semanas 1 y 12, assert rango | Lógica |
| AC-6 | `week_expires` de cada instancia es `week_number + MISSION_EXPIRY_WEEKS` | Test unitario: generar pool en semana 5, assert week_expires == 6 | Lógica |
| AC-7 | Pool devuelto con catálogo vacío para el tier actual es vacío y loguea error | Test unitario: catálogo sin templates tier 0, assert pool vacío + error en log | Lógica |
