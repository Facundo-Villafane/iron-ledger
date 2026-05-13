# Game Configuration System

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: —

## Summary

Recurso centralizado de valores de balance. Ningún número de gameplay vive en el código — todo vive aquí.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `None`

## Overview

Game Configuration System es un `Resource` de Godot (`.tres`) que actúa como la única fuente de verdad para todos los valores de balance del juego. No contiene lógica — solo datos. Se carga una vez al inicio como Autoload (`GameConfig`) y todos los sistemas lo consultan directamente cuando necesitan una constante.

El principio rector es absoluto: **ningún número de gameplay puede estar hardcodeado en código GDScript**. Si un valor puede necesitar ajuste de balance — un costo, una probabilidad base, una cantidad inicial — vive en este recurso. Esto permite rebalancear el juego editando un solo archivo sin tocar código, y hace que todos los valores de diseño sean visibles en un lugar.

Los valores se organizan en cinco categorías: **Financial** (costos fijos, capital inicial), **Mission** (varianzas de dificultad, expiración), **Pilot** (stats base, recuperación), **Mecha** (costos de reparación, slots de hangar), y **Progression** (condiciones de victoria/derrota).

## Player Fantasy

Sistema de infraestructura invisible. El jugador nunca interactúa con él directamente ni sabe que existe.

Lo que habilita: la sensación de que el juego está **calibrado**. Los costos de reparación duelen pero no son arbitrarios. El alquiler del hangar crea presión constante pero no aplasta. Las misiones de transporte pagan menos que las de combate, y eso tiene sentido. Esa coherencia no aparece sola — aparece porque todos los valores provienen de una sola fuente diseñada en conjunto.

Para el equipo de desarrollo, este sistema es el tablero de control del balance. Rebalancear el juego es editar este archivo y ver los efectos en tiempo real, sin buscar números dispersos en el código.

## Detailed Design

### Implementación en Godot

```gdscript
# game_configuration.gd
class_name GameConfiguration
extends Resource
```

Se exporta cada valor con `@export` para que sea editable desde el Inspector. El archivo `.tres` se versiona en el repo — cada cambio de balance queda en el historial de git.

Se accede globalmente via Autoload:
```gdscript
# En cualquier sistema:
var costo = GameConfig.HANGAR_WEEKLY_RENT
```

---

### Valores — Categoría Financial

| Constante | Valor inicial | Descripción |
|---|---|---|
| `STARTING_CREDITS` | `8000` | Capital inicial del gremio |
| `HANGAR_WEEKLY_RENT` | `1200` | Costo fijo por semana, siempre se paga |
| `PILOT_WEEKLY_SALARY` | `300` | Por piloto activo, siempre se paga |
| `BANKRUPTCY_THRESHOLD` | `0` | Si créditos ≤ este valor al cierre de semana → game over |

---

### Valores — Categoría Mission

| Constante | Valor inicial | Descripción |
|---|---|---|
| `DIFFICULTY_VARIANCE` | `0.10` | Varianza de `actual_difficulty` (±) |
| `CHANCE_VARIANCE` | `0.05` | Varianza de damage/collateral chance (±) |
| `MISSIONS_PER_WEEK_MIN` | `3` | Mínimo de misiones disponibles por semana |
| `MISSIONS_PER_WEEK_MAX` | `5` | Máximo de misiones disponibles por semana |
| `MISSION_EXPIRY_WEEKS` | `1` | Semanas hasta que una misión AVAILABLE expira |

---

### Valores — Categoría Pilot

| Constante | Valor inicial | Descripción |
|---|---|---|
| `PILOT_RECOVERY_WEEKS` | `2` | Semanas de recuperación tras lesión leve |
| `PILOT_INJURY_SEVERE_WEEKS` | `4` | Semanas de recuperación tras lesión grave |
| `STARTING_PILOTS` | `3` | Pilotos con los que empieza el gremio |

---

### Valores — Categoría Mecha

| Constante | Valor inicial | Descripción |
|---|---|---|
| `HANGAR_SLOTS` | `3` | Bahías disponibles en el hangar |
| `REPAIR_COST_LIGHT` | `400` | Costo de reparación de daño leve |
| `REPAIR_COST_HEAVY` | `900` | Costo de reparación de daño grave |
| `REPAIR_WEEKS_LIGHT` | `1` | Semanas fuera de servicio por daño leve |
| `REPAIR_WEEKS_HEAVY` | `3` | Semanas fuera de servicio por daño grave |

---

### Valores — Categoría Progression

| Constante | Valor inicial | Descripción |
|---|---|---|
| `VICTORY_WEEKS` | `12` | Semanas que hay que sobrevivir para ganar |
| `VICTORY_MIN_CREDITS` | `5000` | Créditos mínimos al llegar a semana 12 para victoria |
| `DEBT_CEILING` | `-3000` | Piso de deuda — si el balance cae por debajo, quiebra inmediata |
| `MAX_DEBT_WEEKS` | `3` | Semanas consecutivas en rojo permitidas antes de quiebra |

## Formulas

Este sistema no define fórmulas propias — es una fuente de datos que otras fórmulas consumen. Lo que sí define es cómo se calculan los costos fijos semanales que el Financial Ledger System aplica cada cierre:

**Costo fijo semanal:**
```
weekly_fixed_cost = HANGAR_WEEKLY_RENT + (active_pilot_count × PILOT_WEEKLY_SALARY)
```

| Variable | Fuente |
|---|---|
| `HANGAR_WEEKLY_RENT` | GameConfig |
| `PILOT_WEEKLY_SALARY` | GameConfig |
| `active_pilot_count` | Pilot Entity System (pilotos no lesionados) |

**Capital inicial:**
```
starting_balance = STARTING_CREDITS
```

Sin fórmula adicional — es un valor directo. El Financial Ledger System lo usa para inicializar el balance en semana 1.

## Edge Cases

1. **Valor fuera de rango por edición manual**: si alguien edita el `.tres` directamente y pone `HANGAR_SLOTS = 0` o `VICTORY_WEEKS = -1`, los sistemas consumidores pueden comportarse de forma indefinida. El Game State Manager valida los valores críticos al cargar — si encuentra un valor inválido, loguea un error y usa el valor por defecto hardcodeado como fallback de emergencia.

2. **`MISSIONS_PER_WEEK_MIN > MISSIONS_PER_WEEK_MAX`**: Mission Generation System valida este par al iniciar. Si `MIN > MAX`, usa `MIN` como valor fijo y loguea el error.

3. **`BANKRUPTCY_THRESHOLD` negativo**: válido intencionalmente — permite un margen de deuda antes del game over. El Financial Ledger System lo trata como un número normal.

4. **`VICTORY_MIN_CREDITS = 0`**: condición de victoria solo por tiempo, sin requisito de créditos. Es un modo válido para testing — no bloquearlo.

5. **Archivo `.tres` faltante o corrupto**: si el Resource no puede cargarse al inicio, el juego no puede correr. El Game State Manager debe fallar con un error claro ("GameConfig no encontrado") en lugar de crashear silenciosamente.

## Dependencies

Game Configuration System es Foundation — no depende de ningún otro sistema.

**Sistemas que dependen de este:**

| Sistema | Qué consume |
|---|---|
| **Financial Ledger System** | `STARTING_CREDITS`, `HANGAR_WEEKLY_RENT`, `PILOT_WEEKLY_SALARY`, `BANKRUPTCY_THRESHOLD` |
| **Mission Generation System** | `MISSIONS_PER_WEEK_MIN/MAX`, `MISSION_EXPIRY_WEEKS`, `DIFFICULTY_VARIANCE`, `CHANCE_VARIANCE` |
| **Mission Data System** | `DIFFICULTY_VARIANCE`, `CHANCE_VARIANCE` (referenciados en sus fórmulas) |
| **Damage System** | `REPAIR_COST_LIGHT/HEAVY`, `REPAIR_WEEKS_LIGHT/HEAVY` |
| **Pilot Entity System** | `PILOT_RECOVERY_WEEKS`, `PILOT_INJURY_SEVERE_WEEKS`, `STARTING_PILOTS` |
| **Mecha Entity System** | `HANGAR_SLOTS` |
| **Game State Manager** | `VICTORY_WEEKS`, `VICTORY_MIN_CREDITS` — valida el archivo al cargar |
| **Win/Lose Detection** | `BANKRUPTCY_THRESHOLD`, `VICTORY_WEEKS`, `VICTORY_MIN_CREDITS` |

## Tuning Knobs

Este sistema ES el repositorio de tuning knobs del juego. Los valores más impactantes para el balance en orden de prioridad:

| Prioridad | Constante | Por qué es crítica |
|---|---|---|
| 🔴 Alta | `HANGAR_WEEKLY_RENT` | Define la presión financiera base — demasiado alto mata al jugador, demasiado bajo elimina la tensión |
| 🔴 Alta | `STARTING_CREDITS` | Determina cuánto margen de error tiene el jugador al inicio |
| 🔴 Alta | `VICTORY_WEEKS` | Controla la duración percibida del juego completo |
| 🟡 Media | `PILOT_WEEKLY_SALARY` | Penaliza tener muchos pilotos — afecta la estrategia de roster |
| 🟡 Media | `REPAIR_COST_HEAVY` | Si es muy alto, los jugadores evitan misiones de combate |
| 🟡 Media | `MISSIONS_PER_WEEK_MIN/MAX` | Controla cuántas opciones tiene el jugador por semana |
| 🟢 Baja | `DIFFICULTY_VARIANCE` | Ajustar solo si el juego se siente muy predecible o muy caótico |
| 🟢 Baja | `VICTORY_MIN_CREDITS` | Secondary win condition — ajustar en playtesting tardío |

**Rangos seguros de ajuste:**

| Constante | Mínimo seguro | Máximo seguro | Efecto de ir al extremo |
|---|---|---|---|
| `STARTING_CREDITS` | `4000` | `15000` | < 4000: inicio frustrante / > 15000: sin tensión temprana |
| `HANGAR_WEEKLY_RENT` | `600` | `2000` | > 2000: economía imposible con 3 pilotos |
| `PILOT_WEEKLY_SALARY` | `100` | `600` | > 600: hace inviable tener el roster completo |
| `VICTORY_WEEKS` | `8` | `20` | < 8: muy corto / > 20: fatiga de sesión |

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | El archivo `.tres` carga sin errores al iniciar el juego | Arrancar el juego, verificar Output sin errores de Resource | Lógica |
| AC-2 | Todos los sistemas acceden a `GameConfig` sin instanciarlo localmente | Code review: ningún sistema crea una instancia de `GameConfiguration` — todos usan el Autoload | Integración |
| AC-3 | Ningún valor de balance está hardcodeado en código GDScript | Code review: búsqueda de literales numéricos de gameplay en `src/` — ninguno encontrado | Integración |
| AC-4 | Modificar `HANGAR_WEEKLY_RENT` en el `.tres` se refleja en el cálculo del cierre semanal sin recompilar | Test manual: cambiar valor, correr una semana, verificar descuento correcto | Lógica |
| AC-5 | Con `MISSIONS_PER_WEEK_MIN > MISSIONS_PER_WEEK_MAX`, el juego loguea el error y no crashea | Test unitario: setear MIN > MAX, iniciar Mission Generation, assert log de error + fallback | Lógica |
| AC-6 | Con archivo `.tres` faltante, el juego falla con mensaje de error claro en lugar de crash silencioso | Test manual: renombrar el archivo, iniciar el juego, verificar mensaje en Output | Lógica |
| AC-7 | `BANKRUPTCY_THRESHOLD` negativo es aceptado y el Financial Ledger lo usa correctamente | Test unitario: setear threshold en -500, verificar que el game over se dispara solo cuando créditos < -500 | Lógica |
