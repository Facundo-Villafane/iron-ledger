# Systems Index: Iron Ledger

> **Status**: Approved
> **Created**: 2026-05-11
> **Last Updated**: 2026-05-11
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

Iron Ledger es un management sim donde el jugador dirige un gremio de mechas asignando pilotos y máquinas a misiones automáticas bajo presión financiera constante. Los sistemas del juego se organizan alrededor del core loop de 30 segundos (asignar → esperar → consecuencias) y el loop semanal (misiones disponibles → asignaciones → resolución → cierre financiero).

La mayoría de los sistemas son relativamente pequeños — el juego es intencionalmente de bajo scope para un MVP en semanas. El riesgo de diseño está concentrado en el Risk Calculation System (balance de probabilidades), la Mission Card UI (información parcial deliberada), y el Main Hangar Screen UI (pantalla de gestión más compleja). Estos tres deben prototipase temprano.

---

## Systems Enumeration

| # | Sistema | Categoría | Tier | Estado | Doc | Depende De |
|---|---------|-----------|------|--------|-----|------------|
| 1 | Mission Data System | Core | MVP | Approved | design/gdd/mission-data.md | — |
| 2 | Game Configuration System | Core | MVP | Not Started | — | — |
| 3 | Pilot Entity System | Core | MVP | Not Started | — | — |
| 4 | Mecha Entity System | Core | MVP | Not Started | — | — |
| 5 | Risk Calculation System | Gameplay | MVP | Not Started | — | Pilot Entity, Mecha Entity, Mission Data |
| 6 | Financial Ledger System | Economy | MVP | Not Started | — | Game Configuration |
| 7 | Mission Generation System | Gameplay | MVP | Not Started | — | Mission Data, Game Configuration |
| 8 | Game State Manager | Core | MVP | Not Started | — | Game Configuration |
| 9 | Assignment System | Gameplay | MVP | Not Started | — | Pilot Entity, Mecha Entity, Mission Generation |
| 10 | Mission Resolution System | Gameplay | MVP | Not Started | — | Assignment, Risk Calculation, Mission Data |
| 11 | Damage System | Gameplay | MVP | Not Started | — | Mission Resolution, Mecha Entity, Pilot Entity |
| 12 | Repair System | Gameplay | MVP | Not Started | — | Damage System, Financial Ledger |
| 13 | Weekly Cycle System | Gameplay | MVP | Not Started | — | Mission Generation, Assignment, Mission Resolution, Damage, Financial Ledger |
| 14 | Win/Lose Detection | Gameplay | MVP | Not Started | — | Financial Ledger, Weekly Cycle |
| 15 | Main Hangar Screen UI | UI | MVP | Not Started | — | Pilot Entity, Mecha Entity, Mission Generation |
| 16 | Mission Card UI | UI | MVP | Not Started | — | Mission Data, Risk Calculation |
| 17 | Assignment UI | UI | MVP | Not Started | — | Assignment System, Pilot Entity, Mecha Entity |
| 18 | Result Report UI | UI | MVP | Not Started | — | Mission Resolution, Damage System |
| 19 | Save/Load System | Persistence | VS | Not Started | — | Game State Manager, todos los entity systems |
| 20 | Weekly Ledger UI | UI | VS | Not Started | — | Financial Ledger, Weekly Cycle |
| 21 | Notification System | UI | VS | Not Started | — | Mission Resolution, Damage System, Financial Ledger |
| 22 | Main Menu UI | UI | VS | Not Started | — | Save/Load System, Game State Manager |

*(Sistemas 1-4 son datos puros — no tienen dependencias. Sistemas marcados como "inferred" en texto de análisis: 7, 8, 11-14, 19-22.)*

---

## Categories

| Categoría | Descripción | Sistemas en Iron Ledger |
|-----------|-------------|------------------------|
| **Core** | Sistemas de datos y orquestación fundamentales | Mission Data, Game Config, Pilot Entity, Mecha Entity, Game State Manager |
| **Gameplay** | Los sistemas que hacen el juego divertido | Risk Calc, Mission Generation, Assignment, Mission Resolution, Damage, Repair, Weekly Cycle, Win/Lose |
| **Economy** | Flujo de recursos | Financial Ledger |
| **Persistence** | Estado y continuidad | Save/Load |
| **UI** | Información al jugador | Main Hangar, Mission Card, Assignment UI, Result Report, Weekly Ledger, Notifications, Main Menu |

---

## Priority Tiers

| Tier | Definición | Milestone | Urgencia |
|------|-----------|-----------|----------|
| **MVP** | Requerido para que el core loop funcione y pueda testearse | Primera versión jugable (2-4 semanas) | Diseñar PRIMERO |
| **VS** | Requerido para una experiencia completa cross-session | Vertical Slice (4-8 semanas) | Diseñar SEGUNDO |
| **Alpha** | Todas las features en forma rough (upgrades, facciones, entrenamiento) | Alpha (3-6 meses) | Diseñar TERCERO |
| **Full Vision** | Polish, contenido completo, tech tree, narrativa | Beta/Release (6-12 meses) | Diseñar cuando llegue |

---

## Dependency Map

### Foundation Layer (sin dependencias — diseñar primero)

1. **Mission Data System** — define los tipos de misión, parámetros, y niveles de riesgo. Todo lo que depende de "qué misiones hay" comienza aquí.
2. **Game Configuration System** — valores de balance centralizados. El design-first principle dice: ningún número hardcodeado, todos los valores aquí.
3. **Pilot Entity System** — modelo de datos del piloto (stats, rasgos, estado). Seis sistemas distintos lo consumen.
4. **Mecha Entity System** — modelo de datos del mecha (stats, rol, estado de daño). El asset más referenciado del juego.

### Core Layer (dependen de Foundation)

1. **Risk Calculation System** — depende de: Pilot Entity, Mecha Entity, Mission Data. Toma los tres elementos y produce una probabilidad de éxito.
2. **Financial Ledger System** — depende de: Game Configuration. Gestiona el balance de créditos con valores iniciales y costos fijos desde config.
3. **Mission Generation System** — depende de: Mission Data, Game Configuration. Crea las misiones disponibles por período usando los templates y parámetros.
4. **Game State Manager** — depende de: Game Configuration. Máquina de estados simple (MENU → PLAYING → GAME_OVER / VICTORY). Escucha señales de Win/Lose.

### Feature Layer (dependen de Core)

1. **Assignment System** — depende de: Pilot Entity, Mecha Entity, Mission Generation. Valida y registra qué piloto + mecha va a qué misión.
2. **Mission Resolution System** — depende de: Assignment, Risk Calculation, Mission Data. Toma la asignación, calcula el resultado usando las probabilidades, produce el outcome.
3. **Damage System** — depende de: Mission Resolution, Mecha Entity, Pilot Entity. Aplica los outcomes de daño a los entities.
4. **Repair System** — depende de: Damage System, Financial Ledger. Gestiona el tiempo y costo de reparación de mechas y recuperación de pilotos.
5. **Weekly Cycle System** — depende de: Mission Generation, Assignment, Mission Resolution, Damage, Financial Ledger. Orquesta la secuencia completa de una semana.
6. **Win/Lose Detection** — depende de: Financial Ledger, Weekly Cycle. Comprueba condiciones al final de cada semana y emite señal al Game State Manager.
7. **Save/Load System** (VS) — depende de: Game State Manager, todos los entity systems. Serializa y deserializa el estado completo del gremio.

### Presentation Layer (dependen de Feature)

1. **Main Hangar Screen UI** — depende de: Pilot Entity, Mecha Entity, Mission Generation. La pantalla principal — estado de bahías, roster, misiones disponibles.
2. **Mission Card UI** — depende de: Mission Data, Risk Calculation. Muestra info parcial deliberada — diseñado para crear incertidumbre (Pilar 1).
3. **Assignment UI** — depende de: Assignment System, Pilot Entity, Mecha Entity. El flujo de selección y confirmación de asignación.
4. **Result Report UI** — depende de: Mission Resolution, Damage System. El reporte de resultado de misión — éxito, daño, ganancias.
5. **Weekly Ledger UI** (VS) — depende de: Financial Ledger, Weekly Cycle. Resumen financiero del cierre de semana.
6. **Notification System** (VS) — depende de: Mission Resolution, Damage System, Financial Ledger. Alertas de eventos importantes.
7. **Main Menu UI** (VS) — depende de: Save/Load, Game State Manager. Pantalla inicial.

---

## Recommended Design Order

| Orden | Sistema | Tier | Capa | Esfuerzo |
|-------|---------|------|------|----------|
| 1 | Mission Data System | MVP | Foundation | S |
| 2 | Game Configuration System | MVP | Foundation | S |
| 3 | Pilot Entity System | MVP | Foundation | S |
| 4 | Mecha Entity System | MVP | Foundation | S |
| 5 | Risk Calculation System | MVP | Core | M |
| 6 | Financial Ledger System | MVP | Core | M |
| 7 | Mission Generation System | MVP | Core | S |
| 8 | Game State Manager | MVP | Core | S |
| 9 | Assignment System | MVP | Feature | M |
| 10 | Mission Resolution System | MVP | Feature | M |
| 11 | Damage System | MVP | Feature | S |
| 12 | Repair System | MVP | Feature | S |
| 13 | Weekly Cycle System | MVP | Feature | M |
| 14 | Win/Lose Detection | MVP | Feature | S |
| 15 | Main Hangar Screen UI | MVP | Presentation | L |
| 16 | Mission Card UI | MVP | Presentation | M |
| 17 | Assignment UI | MVP | Presentation | M |
| 18 | Result Report UI | MVP | Presentation | S |
| 19 | Save/Load System | VS | Feature | M |
| 20 | Weekly Ledger UI | VS | Presentation | M |
| 21 | Notification System | VS | Presentation | S |
| 22 | Main Menu UI | VS | Presentation | S |

*Esfuerzo: S = 1 sesión de diseño / M = 2-3 sesiones / L = 4+ sesiones*

---

## Circular Dependencies

Ninguna detectada.

**Nota**: Win/Lose Detection emite señales (`game_over_triggered`, `victory_triggered`) que Game State Manager escucha — no hay llamada inversa estructural. En GDScript esto es el patrón nativo con `signal`.

---

## High-Risk Systems

| Sistema | Tipo de Riesgo | Descripción | Mitigación |
|---------|---------------|-------------|------------|
| Risk Calculation System | Diseño | El balance de probabilidades es lo más frágil del juego. Demasiado punitivo = frustrante. Demasiado suave = trivial. | Prototipar con valores visibles en debug antes de pulir. Testear con 50+ misiones simuladas. |
| Mission Card UI | Diseño | Mostrar deliberadamente información incompleta sin frustrar al jugador es un problema de diseño no trivial. | Testear con usuarios qué nivel de información es "tenso" vs "injusto". |
| Main Hangar Screen UI | Scope | La pantalla más compleja del juego. Mayor riesgo de tiempo para un primer dev. | Empezar con layout de texto placeholder. El arte viene después de que el layout funcione. |

---

## Progress Tracker

| Métrica | Cantidad |
|---------|---------|
| Total sistemas identificados | 22 |
| Docs de diseño iniciados | 0 |
| Docs de diseño en revisión | 0 |
| Docs de diseño aprobados | 1 |
| Sistemas MVP diseñados | 1 / 18 |
| Sistemas VS diseñados | 0 / 4 |

---

## Next Steps

- [ ] Diseñar sistema 1: Mission Data System — `/design-system mission-data`
- [ ] Diseñar sistema 2: Game Configuration System — `/design-system game-configuration`
- [ ] Diseñar sistema 3: Pilot Entity System — `/design-system pilot-entity`
- [ ] Diseñar sistema 4: Mecha Entity System — `/design-system mecha-entity`
- [ ] Prototipar Risk Calculation System temprano — `/prototype risk-calculation`
- [ ] Correr `/gate-check pre-production` cuando todos los GDDs de MVP estén aprobados
