# Assignment UI

> **Status**: Approved
> **Author**: Design session
> **Last Updated**: 2026-05-13
> **Implements Pillar**: P1 / P2 — El momento de la decisión

## Summary

Interfaz de selección de piloto y mecha para una misión. Filtra a los disponibles, actualiza el indicador de riesgo en tiempo real, y confirma la asignación.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` · Key deps: `Assignment System, Pilot Entity, Mecha Entity`

## Overview

La Assignment UI es el panel de selección que se abre desde la Mission Card cuando el jugador presiona "Asignar". Muestra dos listas filtradas: pilotos AVAILABLE y mechas AVAILABLE. El jugador selecciona uno de cada lista y confirma.

Mientras el jugador explora las combinaciones — cambiando de piloto o de mecha — el indicador de riesgo en la Mission Card se actualiza en tiempo real mostrando cómo cambia la etiqueta LOW/MEDIUM/HIGH/CRITICAL con cada combinación. Esto permite al jugador comparar opciones sin commitear.

Al confirmar, llama a `Assignment System.assign()`. Si la validación falla (aunque no debería dado que la UI solo muestra opciones válidas), muestra el error. Al cancelar, vuelve a la Mission Card sin cambios.

## Player Fantasy

El jugador abre la Assignment UI para una misión de SALVAGE. Ve tres opciones de piloto: García (skill 4, SPECIALIST), Reyes (skill 2, CAUTIOUS), Torres (skill 3, VETERAN). Ve dos mechas disponibles: uno de SALVAGE, uno de TRANSPORT.

Selecciona García + mecha SALVAGE. El indicador en la Mission Card cambia a LOW RISK. Lógico — SPECIALIST + tipo correcto. Cambia a Torres + mecha TRANSPORT. El indicador sube a MEDIUM. Confirma con García.

La UI tiene que ser lo suficientemente rápida para que esa exploración de combinaciones no se sienta tediosa. La fricción debe estar en la decisión, no en la interfaz.

## Detailed Design

### Layout del panel

```
┌─────────────────────────────────────────┐
│  MISIÓN: [nombre] — [indicador de riesgo actualizado]  │
├─────────────────┬───────────────────────┤
│  PILOTOS        │  MECHAS               │
│  ○ García       │  ○ Titán-3 (COMBAT)   │
│    skill 4 ★★★★ │    durabilidad 3      │
│    SPECIALIST   │    INTACT             │
│  ○ Reyes        │  ○ Carro-7 (TRANSPORT)│
│    skill 2 ★★   │    durabilidad 1      │
│    CAUTIOUS     │    LIGHT_DAMAGE ⚠     │
│  ○ Torres       │                       │
│    skill 3 ★★★  │                       │
│    VETERAN      │                       │
├─────────────────┴───────────────────────┤
│         [Cancelar]   [Confirmar →]      │
└─────────────────────────────────────────┘
```

---

### Reglas de filtrado

**Pilotos**: solo `status == AVAILABLE`. RECOVERING y ASSIGNED no aparecen.

**Mechas**: solo `status == AVAILABLE`. BROKEN, UNDER_REPAIR y ASSIGNED no aparecen. LIGHT_DAMAGE aparece con badge ⚠.

---

### Interacciones

| Acción | Efecto |
|---|---|
| Seleccionar piloto | Marcado visualmente. Si hay mecha, actualiza indicador de riesgo en Mission Card |
| Seleccionar mecha | Marcado visualmente. Si hay piloto, actualiza indicador de riesgo en Mission Card |
| Click "Confirmar" | Activo solo con piloto Y mecha seleccionados. Llama `Assignment.assign()` → cierra |
| Click "Cancelar" | Cierra sin cambios, vuelve a Mission Card |

---

### Información por tarjeta de piloto

| Elemento | Fuente |
|---|---|
| Nombre | `pilot.pilot_name` |
| Skill | `pilot.skill_level` |
| Especialización | `pilot.specialization` |
| Rasgo | `pilot.trait` |

### Información por tarjeta de mecha

| Elemento | Fuente |
|---|---|
| Nombre | `mecha.mecha_name` |
| Tipo | `mecha.mecha_type` |
| Durabilidad | `mecha.durability` |
| Estado de daño | `mecha.damage_state` (badge ⚠ si LIGHT_DAMAGE) |

## Formulas

No aplica — la UI llama a Risk Calculation para actualizar el indicador. No realiza cálculos propios.

## Edge Cases

1. **Sin pilotos AVAILABLE**: la lista de pilotos está vacía. El botón "Confirmar" permanece deshabilitado. La UI muestra "Sin pilotos disponibles".
2. **Sin mechas AVAILABLE**: igual — lista vacía, "Sin mechas disponibles", confirmación imposible.
3. **Solo un piloto o un mecha disponible**: se muestra solo esa opción. El jugador no tiene elección de ese lado, pero sí puede decidir si asigna o no.
4. **`Assignment.assign()` falla por validación**: no debería ocurrir si la UI filtra correctamente. Si ocurre, muestra el mensaje de error sin cerrar el panel.
5. **Jugador cambia de idea después de seleccionar**: puede re-seleccionar otra opción en cualquier lista sin restricciones — la selección anterior se deselecciona automáticamente.

## Dependencies

| Sistema | Qué consume |
|---|---|
| **Pilot Entity System** | Lee todos los pilotos AVAILABLE para mostrar en lista |
| **Mecha Entity System** | Lee todos los mechas AVAILABLE para mostrar en lista |
| **Assignment System** | Llama `assign(pilot_id, mecha_id, mission_id)` al confirmar |
| **Risk Calculation System** | Llama `calculate_risk` en cada cambio de selección para actualizar indicador |
| **Mission Card UI** | Le notifica la combinación seleccionada para actualizar el indicador de riesgo |

## Tuning Knobs

Ninguno — la Assignment UI es lógica de presentación pura.

## Acceptance Criteria

| # | Criterio | Cómo verificar | Tipo |
|---|---|---|---|
| AC-1 | Solo pilotos AVAILABLE aparecen en la lista | Test manual: piloto RECOVERING, verificar ausencia en lista | Visual |
| AC-2 | Solo mechas AVAILABLE aparecen en la lista — BROKEN y UNDER_REPAIR excluidos | Test manual: mecha BROKEN, verificar ausencia | Visual |
| AC-3 | Mecha con LIGHT_DAMAGE aparece con badge ⚠ | Test manual: mecha LIGHT_DAMAGE, verificar badge | Visual |
| AC-4 | El indicador de riesgo en Mission Card se actualiza al cambiar selección | Test manual: alternar pilotos, verificar que etiqueta cambia | Integración |
| AC-5 | Botón "Confirmar" deshabilitado sin piloto Y mecha seleccionados | Test manual: seleccionar solo piloto, verificar botón deshabilitado | Visual |
| AC-6 | Al confirmar, la asignación queda registrada y ambas listas se actualizan | Test manual: confirmar, verificar estado en Main Hangar | Integración |
| AC-7 | Lista de pilotos vacía muestra mensaje "Sin pilotos disponibles" | Test manual: todos los pilotos RECOVERING, verificar mensaje | Visual |
