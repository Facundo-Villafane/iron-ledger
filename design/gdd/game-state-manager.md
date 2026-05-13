# Game State Manager

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-12
> **Implements Pillar**: —

## Summary

Máquina de estados de alto nivel que orquesta las fases del juego: MENU → PLAYING → GAME_OVER / VICTORY.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Game Configuration`

## Overview

El Game State Manager es la máquina de estados de alto nivel del juego. Mantiene el estado global de la sesión (en qué fase está el juego), controla las transiciones entre fases, y valida la configuración al inicio. No tiene lógica de gameplay — es el árbitro que decide si el juego está corriendo, terminó en victoria, o terminó en derrota.

Los estados posibles son: `MENU` (pantalla inicial), `PLAYING` (partida en curso), `GAME_OVER` (quiebra o condición de derrota), y `VICTORY` (el gremio sobrevivió las semanas requeridas con el capital mínimo). Las transiciones son unidireccionales — una partida no puede volver de GAME_OVER a PLAYING sin reiniciar.

Al entrar en `PLAYING`, valida que `GameConfig` esté cargado y sus valores críticos sean válidos. Mantiene `current_week` como referencia de semana global que todos los sistemas pueden consultar.

## Player Fantasy

Infraestructura invisible. El jugador nunca ve este sistema directamente — lo que siente es la transición a la pantalla de GAME_OVER cuando se queda sin créditos, o la pantalla de VICTORY cuando sobrevive la semana 12.

Esos dos momentos son los únicos en que el Game State Manager es perceptible: el corte abrupto al game over (sin drama, solo el ledger en rojo — como dice el art bible), y el reconocimiento sobrio de la victoria. El sistema garantiza que esos momentos ocurran exactamente cuando deben, ni antes ni después.

## Detailed Design

### Estados

```gdscript
enum GameState { MENU, PLAYING, GAME_OVER, VICTORY }
```

| Estado | Descripción |
|---|---|
| `MENU` | Estado inicial. Pantalla de inicio. Ningún sistema de gameplay activo |
| `PLAYING` | Partida en curso. Weekly Cycle corre, pilotos y mechas son gestionables |
| `GAME_OVER` | Quiebra o derrota. Gameplay bloqueado. Solo opciones: reiniciar o volver al menú |
| `VICTORY` | Semana 12 completada con capital ≥ `VICTORY_MIN_CREDITS`. Igual que GAME_OVER en comportamiento |

---

### Transiciones válidas

| Desde | Hacia | Quién la dispara |
|---|---|---|
| `MENU` | `PLAYING` | Main Menu UI (botón "Nueva partida") |
| `PLAYING` | `GAME_OVER` | Win/Lose Detection (señal `game_over_triggered`) |
| `PLAYING` | `VICTORY` | Win/Lose Detection (señal `victory_triggered`) |
| `GAME_OVER` | `MENU` | Result Screen UI (botón "Volver al menú") |
| `VICTORY` | `MENU` | Result Screen UI (botón "Volver al menú") |

*Ninguna otra transición es válida. GAME_OVER → PLAYING sin pasar por MENU no existe.*

---

### Campos de estado

| Campo | Tipo | Descripción |
|---|---|---|
| `current_state` | GameState | Estado actual de la sesión |
| `current_week` | int | Semana actual de la partida. 0 en MENU |
| `guild_tier` | int | Tier actual del gremio. 0 en MVP (sin progresión de tier en MVP) |

---

### Señales

| Señal | Cuándo se emite |
|---|---|
| `state_changed(new_state: GameState)` | En cada transición de estado |
| `week_advanced(week: int)` | Cuando `current_week` se incrementa |

---

### Validación al iniciar partida

Al transicionar MENU → PLAYING, valida:
- `GameConfig` cargado sin errores
- `VICTORY_WEEKS > 0`
- `MISSIONS_PER_WEEK_MIN ≤ MISSIONS_PER_WEEK_MAX`
- Catálogo de templates no vacío

Si alguna validación falla: log de error, no transiciona.

> **Nota de diseño — MVP vs futuro**: las condiciones de victoria (`VICTORY_WEEKS`, `VICTORY_MIN_CREDITS`) son específicas del modo campaña. Un futuro modo infinito redefiniría o eliminaría estas condiciones sin cambiar la estructura de estados de este sistema.

## Formulas

No aplica — este sistema no tiene fórmulas matemáticas. Es una máquina de estados pura.

## Edge Cases

1. **Transición inválida (ej: GAME_OVER → PLAYING)**: el sistema loguea el intento y lo ignora. El estado no cambia.
2. **`state_changed` llamado dos veces con el mismo estado**: si ya está en PLAYING y algo intenta transicionar a PLAYING, se ignora silenciosamente.
3. **Validación falla al iniciar**: el juego permanece en MENU con un mensaje de error en el Output. No crashea.
4. **`current_week` supera `VICTORY_WEEKS` sin que Win/Lose Detection lo detecte**: no puede ocurrir — Win/Lose Detection verifica al final de cada semana antes de que `current_week` avance.

## Dependencies

| Sistema | Relación |
|---|---|
| **Game Configuration** | Lee `VICTORY_WEEKS`, `VICTORY_MIN_CREDITS` — valida al inicio |
| **Win/Lose Detection** | Escucha sus señales `game_over_triggered` y `victory_triggered` |
| **Weekly Cycle System** | Incrementa `current_week` a través de `week_advanced` |
| **Main Menu UI** | Dispara la transición MENU → PLAYING |
| **Todos los sistemas de gameplay** | Consultan `current_state` y `current_week` para saber si deben correr |

## Tuning Knobs

Ninguno. Este sistema no tiene valores ajustables — es estructura pura. Los valores de victoria (`VICTORY_WEEKS`, `VICTORY_MIN_CREDITS`) viven en Game Configuration.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | MENU → PLAYING solo ocurre si la validación de GameConfig pasa | Test unitario: config inválida, assert estado sigue en MENU | Lógica |
| AC-2 | PLAYING → GAME_OVER al recibir `game_over_triggered` | Test unitario: emitir señal, assert estado == GAME_OVER | Lógica |
| AC-3 | PLAYING → VICTORY al recibir `victory_triggered` | Test unitario: emitir señal, assert estado == VICTORY | Lógica |
| AC-4 | GAME_OVER → PLAYING es ignorado | Test unitario: intentar transición inválida, assert estado no cambia | Lógica |
| AC-5 | `state_changed` se emite en cada transición válida | Test unitario: conectar señal, assert emitida con estado correcto | Lógica |
| AC-6 | `current_week` inicia en 0 y se incrementa con cada `week_advanced` | Test unitario: simular 3 avances de semana, assert current_week == 3 | Lógica |
