# Game Concept: Iron Ledger

*Created: 2026-05-11*
*Status: Draft*

---

## Elevator Pitch

> Dirigís un gremio de chatarreros mechas sobreviviendo semana a semana — asignás
> pilotos, mandás mechas a misiones automáticas, y rezás que los costos de
> reparación no te hundan antes de pagar el alquiler del hangar.
>
> Es un management sim donde la misión ya salió, no podés intervenir — solo
> prepararte para lo que traiga de vuelta.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Management Sim / Resource Management |
| **Platform** | PC (Steam / itch.io) |
| **Target Audience** | Jugadores mid-core de sims y roguelikes, 18-35 |
| **Player Count** | Single-player |
| **Session Length** | 30-60 minutos por sesión |
| **Monetization** | Premium (itch.io primero) |
| **Estimated Scope** | Grande (6-12 meses, solo) — MVP alcanzable en 2-4 semanas |
| **Comparable Titles** | BattleTech (HBS), Darkest Dungeon, FTL: Faster Than Light |

---

## Core Fantasy

Sos el manager frío y calculador de un gremio mecha que nadie apostaba que
sobreviviría. Tomás decisiones bajo presión con información incompleta, leés
patrones de riesgo que nadie más ve, y mantener todo a flote cuando el caos
amenaza con hundirte. Con el tiempo, lo que era sobrevivir se convierte en
dominar — pero el riesgo nunca desaparece del todo.

---

## Unique Hook

Como FTL pero de gestión: la misión ya salió, no podés intervenir, solo
prepararte para lo que traiga de vuelta. La incertidumbre es el producto,
no el bug. A diferencia de BattleTech, el foco no está en ganar combates
— está en tomar las decisiones correctas *antes* de que el combate ocurra,
y en pagar las consecuencias *después*.

---

## Visual Identity Anchor

**Dirección**: "Industrial Ledger"

**Regla visual**: Todo debe verse como el tablero de control de una operación
que funciona al límite — funcional, desgastado, cargado de información.

**Principios visuales:**
1. **Información sobre decoración** — cada elemento visual en la UI lleva datos.
   Si un ícono no te dice algo útil, no está.
   *Design test*: Si podés quitar un elemento y el jugador no pierde información,
   hay que quitarlo.
2. **Contraste burocrático/industrial** — la UI tiene estética de "libro de
   contabilidad" (líneas, tablas, tipografía funcional) mientras los mechas
   y pilotos tienen peso y personalidad visual propia (siluetas distintivas,
   retratos con carácter).
   *Design test*: ¿Los mechas se ven distintos entre sí de un vistazo? ¿La UI
   se lee como una planilla real pero con personalidad?
3. **Semáforo de estado** — colores reservados para datos: ámbar/naranja para
   alertas, azul frío para estado normal, rojo para daño/pérdida, verde para
   ganancia. Sin color decorativo puro.
   *Design test*: ¿Un nuevo jugador puede leer el estado del gremio en 10
   segundos solo por los colores?

**Filosofía de color**: Paleta funcional industrial. Fondos oscuros metálicos,
acentos de color reservados para información crítica. Retratos de pilotos son
el único lugar donde el color puede ser expresivo.

---

## Player Experience Analysis (MDA Framework)

### Target Aesthetics (What the player FEELS)

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Challenge** (mastery, obstacle course) | 1 | Presión financiera constante, riesgo oculto en misiones, balance frágil |
| **Submission** (relaxation, flow) | 2 | Loop rítmico y predecible una vez dominado — el jugador experto "flota" |
| **Discovery** (exploration, systems) | 3 | Aprender qué combinaciones funcionan, qué riesgos esconde cada misión |
| **Expression** (creativity, self-expression) | 4 | Construir el gremio con identidad propia — nombre, reputación, composición |
| **Fantasy** (role-play, make-believe) | 5 | Ser el manager de un gremio mecha en un mundo industrializado |
| **Sensation** (sensory pleasure) | N/A | No es el foco — UI funcional sobre experiencia sensorial |
| **Narrative** (drama, story arc) | N/A | Narrativa emergente (accidental), no estructurada |
| **Fellowship** (social connection) | N/A | Single-player |

### Key Dynamics (Emergent player behaviors)

- Los jugadores experimentarán combinaciones de pilotos y mechas para encontrar
  sinergias ("este piloto con este mecha tiene mejor ratio de éxito en combate")
- Los jugadores desarrollarán aversión al riesgo que luego tendrán que romper para
  crecer — el momento de "tengo que mandar mi mejor equipo a esta misión arriesgada"
  es el corazón emocional del juego
- Los jugadores personalizarán mentalmente a sus pilotos con historias y apodos
  ("Ortega nunca falla transportes") aunque el juego no lo pida explícitamente

### Core Mechanics (Systems we build)

1. **Sistema de asignación** — Pilotos + mechas + misiones. El jugador revisa
   ofertas de misión con info parcial y asigna recursos.
2. **Sistema de misiones automáticas** — Las misiones se resuelven con probabilidades
   basadas en stats de piloto/mecha vs. dificultad de misión. El jugador no controla
   la ejecución.
3. **Sistema financiero semanal** — Ingresos por misiones completadas, costos fijos
   (mantenimiento del gremio, salarios de pilotos), costos variables (reparaciones
   por daño colateral).
4. **Sistema de daño probabilístico** — Misiones de combate pueden dañar mechas y
   herir pilotos. Daño colateral en zonas urbanas añade multas o costos adicionales.
5. **Progresión de activos** — Con el tiempo: comprar mejores mechas, contratar/
   entrenar pilotos, mejorar la reputación del gremio para acceder a mejores contratos.

---

## Player Motivation Profile

### Primary Psychological Needs Served

| Need | How This Game Satisfies It | Strength |
| ---- | ---- | ---- |
| **Autonomy** | Cada decisión de asignación es del jugador, no hay respuesta "correcta" obvia. El gremio es tuyo — su nombre, su composición, su estrategia. | Core |
| **Competence** | El jugador aprende a leer riesgos ocultos con el tiempo. La maestría se siente en la diferencia entre el turno 1 ("¿mando a quién?") y el turno 20 ("sé exactamente qué equipo va a esta misión"). | Core |
| **Relatedness** | Pilotos con nombres y rasgos generan vínculos. Perder un mecha duele más cuando tenés apego al piloto que lo manejaba. | Supporting |

### Player Type Appeal (Bartle Taxonomy)

- [x] **Achievers** — Progresión del gremio: mejores mechas, mejores contratos, mayor reputación. — *Cómo*: sistema de upgrades y tier de misiones disponibles
- [x] **Explorers** — El sistema de riesgos ocultos invita a experimentar. ¿Qué pasa si mando mi peor piloto a la misión más difícil? ¿Qué combinaciones tienen mejor ratio? — *Cómo*: probabilidades no visibles que el jugador infiere
- [ ] **Socializers** — No es el foco. Single-player sin componente social estructurado.
- [ ] **Killers/Competitors** — No hay PvP ni competencia directa. Leaderboards opcionales en futuras versiones.

### Flow State Design

- **Onboarding curve**: Los primeros turnos presentan misiones simples (transporte, bajo riesgo) con info completa para que el jugador entienda el loop. El riesgo oculto se introduce gradualmente en semana 2-3.
- **Difficulty scaling**: Las misiones disponibles escalan en dificultad y recompensa con la reputación del gremio. El jugador puede autoregular el riesgo eligiendo qué misiones acepta.
- **Feedback clarity**: Cada misión regresa con un reporte claro — qué salió bien, qué daño ocurrió, cuánto costó, cuánto se ganó. El balance semanal hace visible el impacto acumulado.
- **Recovery from failure**: Perder un mecha es caro pero no fatal en el MVP. La quiebra es la única condición de derrota — hay espacio para cometer errores y aprender.

---

## Core Loop

### Momento a Momento (30 segundos)
Revisás las misiones disponibles del período. Cada misión muestra: tipo, recompensa
base, dificultad estimada, y una advertencia de riesgo vaga ("zona urbana densa",
"facción rival activa", "ruta no mapeada"). Evaluás qué combinación de mecha y
piloto minimiza el riesgo dado tu info parcial. Confirmás la asignación y el equipo
parte — sin posibilidad de intervenir.

### Corto Plazo (5-15 minutos)
Mientras un equipo está en misión, gestionás el resto del hangar: reparás lo que
volvió dañado, revisás nuevas ofertas de misión, pagás costos inmediatos. La
tensión central: ¿mandás tu segundo equipo a otra misión (más ingresos, más riesgo)
o lo guardás como backup por si el primero vuelve destruido?

### Nivel de Sesión (30-60 minutos)
Una "semana" del gremio: llegan X misiones disponibles, asignás los equipos que
podés/querés, esperás resultados, pagás costos semanales fijos, ves el balance.
El stopping point natural es el cierre de semana — ver el estado del gremio.
El hook para volver: "la semana que viene llega ese contrato grande que puede
salvarme... o hundirme."

### Progresión a Largo Plazo
El jugador crece en dos ejes paralelos:
- **Activos**: mejores mechas (más durables, más especializados), pilotos entrenados
  (stats más altos, rasgos especiales), acceso a misiones de mayor tier.
- **Conocimiento**: aprender los patrones ocultos — qué advertencias de misión
  predicen qué riesgos, qué combinaciones de piloto/mecha funcionan mejor para
  cada tipo. Este segundo eje no tiene número visible — es maestría pura.

### Retention Hooks
- **Curiosidad**: ¿Qué contratos grandes aparecen la próxima semana? ¿Qué pasa
  si mi gremio sube al siguiente tier de reputación?
- **Inversión**: Los pilotos desarrollan historial. El mecha reparado tres veces
  tiene una historia. No querés perderlos.
- **Maestría**: Siempre hay una combinación mejor que no encontraste todavía.
  ¿Qué ratio de éxito tiene realmente una misión de combate en zona urbana con
  piloto especializado?

---

## Game Pillars

### Pilar 1: Decisiones bajo incertidumbre
Cada asignación importante debe tener riesgo genuino. Si el jugador puede
siempre calcular el resultado perfecto, el juego pierde su tensión central.

*Design test*: Si estamos debatiendo si mostrar más información sobre una misión,
este pilar dice NO — la incertidumbre es el producto, no un problema a resolver.

### Pilar 2: Consecuencias que duelen pero no matan
El daño colateral, las reparaciones, los pilotos fuera de combate deben ser
costosos y visibles, pero recuperables. El jugador aprende de errores, no colapsa
por ellos.

*Design test*: Si el jugador pierde un mecha y piensa "fue mi culpa, pero puedo
recuperarme", el pilar cumple. Si piensa "eso fue injusto y no lo veo cómo superar",
hay que ajustar las consecuencias o los recursos de recuperación.

### Pilar 3: El gremio como personaje
El gremio tiene identidad: nombre propio, reputación ganada, pilotos con rasgos.
No es una spreadsheet — es una organización con historia que el jugador construye.

*Design test*: Si podemos reemplazar un piloto con otro idéntico sin que ninguno
importe, el pilar falla. Cada elemento del gremio debe sentirse único y reemplazable
solo con pérdida.

### Pilar 4: Loop rítmico y legible
El estado del gremio siempre debe ser claro de un vistazo. El jugador nunca
debería sentirse perdido en la UI o sin saber qué puede hacer.

*Design test*: Si alguien que nunca jugó puede entender "qué está pasando" en
10 segundos de mirar la pantalla principal, el pilar está cumplido.

### Anti-Pillars (What This Game Is NOT)

- **NO combate en tiempo real**: las misiones son automáticas — el loop es de
  *preparación*, no de *ejecución*. Agregar control directo de mechas destruiría
  el Pilar 1 (la incertidumbre desaparecería si podés intervenir).
- **NO roguelike de permadeath total**: perder un mecha debe doler, no terminar
  la campaña. La permadeath completa es un concepto separado (ver "Scrap Run"
  como posible futuro spinoff).
- **NO simulación técnica profunda (en MVP)**: sin mantenimiento de piezas,
  upgrades de 50 variables, ni árboles de tecnología complejos en el MVP. La
  profundidad viene de las *decisiones de asignación*, no de la cantidad de sliders.
  El árbol de tecnología y el mantenimiento avanzado son features de Alpha/Full Vision.

---

## Inspiration and References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
| ---- | ---- | ---- | ---- |
| BattleTech (HBS) | Gestión de mercenarios mecha, consecuencias financieras reales | Más accesible, sesiones más cortas, sin combate táctico | Prueba que hay audiencia para exactamente este concepto |
| Darkest Dungeon | Consecuencias que duelen + gestión de recursos bajo presión | Sin permadeath de héroe, tono menos opresivo, mechas en lugar de héroes | Valida el loop de "riesgo/recompensa + consecuencias reales" |
| FTL: Faster Than Light | Misiones automáticas, info parcial, decisiones de alto stakes | Solo gestión (sin combate en tiempo real), scope más relajado | Referente directo del "no podés intervenir" loop |

**Inspiraciones no-juego**: 
- Películas de heist (gestión de un equipo con habilidades específicas para misiones imposibles)
- Anime mecha de trabajo (Armored Core 4 Answers, Patlabor) — mechas como herramientas de trabajo, no solo armas
- Cultura de gremios medievales — organización, reputación, jerarquía

---

## Target Player Profile

| Attribute | Detail |
| ---- | ---- |
| **Age range** | 18-35 |
| **Gaming experience** | Mid-core — disfruta de sistemas complejos pero no necesita 200 horas |
| **Time availability** | 30-60 minutos por sesión, varias veces por semana |
| **Platform preference** | PC, Steam / itch.io |
| **Current games they play** | Darkest Dungeon, FTL, BattleTech, Cities Skylines, juegos indie de itch.io |
| **What they're looking for** | Un management sim con peso en las decisiones y consecuencias que importan, sin la complejidad abrumadora de BattleTech o el micromanagement de un RTS |
| **What would turn them away** | Combate en tiempo real que requiere reacciones rápidas; UI confusa con demasiadas variables; falta de consecuencias reales (todo sale bien siempre) |

---

## Technical Considerations

| Consideration | Assessment |
| ---- | ---- |
| **Recommended Engine** | Godot 4 (2D) — open source, excelente para UI de management, export nativo a itch.io y Steam. Ya es la elección del dev. |
| **Key Technical Challenges** | Sistema de probabilidades balanceado (demasiado duro = frustrante, demasiado suave = trivial); UI de management legible y extensible; sistema de estado de misiones asíncronas |
| **Art Style** | 2D flat / pixel art — Industrial Ledger (ver Visual Identity Anchor) |
| **Art Pipeline Complexity** | Bajo-Medio — íconos de mechas y pilotos, UI/HUD, sin animación de combate |
| **Audio Needs** | Minimal — música ambient industrial, SFX de UI, notificaciones de resultado |
| **Networking** | Ninguno |
| **Content Volume** | MVP: 3 mechas, 3 pilotos, 3 tipos de misión, 5-10 semanas de juego. Full: 15-20 mechas, 20+ pilotos, 8-10 tipos de misión |
| **Procedural Systems** | Probabilidades de resultado de misión (basadas en stats); generación de ofertas de misión por semana |

---

## Risks and Open Questions

### Design Risks
- **Downtime vacío**: El tiempo entre "mandé el equipo" y "volvió el resultado"
  puede sentirse muerto si no hay decisiones significativas disponibles mientras tanto.
  Mitigación: siempre hay algo que gestionar en el hangar durante ese tiempo.
- **Curva de dificultad frágil**: Si el balance de probabilidades no es exacto,
  el juego se siente injusto (demasiado duro) o trivial (demasiado fácil).
  Mitigación: playtest muy temprano del sistema de probabilidades.

### Technical Risks
- **UI de management es más compleja de implementar de lo que parece**: Para un
  primer juego, la UI con estados dinámicos (misiones en curso, mechas disponibles/
  dañados, costos variables) puede consumir tiempo inesperado.
  Mitigación: empezar con UI de texto/placeholder, no con arte final.
- **Balance del sistema probabilístico**: Difícil de calibrar sin playtest.
  Mitigación: hacer el sistema de probabilidades completamente visible en debug
  durante desarrollo.

### Market Risks
- **BattleTech existe**: Un competidor directo con mucho más contenido y años de
  refinamiento. Iron Ledger necesita una razón clara para existir.
  Mitigación: accesibilidad + loop más corto + audiencia itch.io que valora proyectos
  indie con personalidad sobre polish AAA.
- **Nicho específico**: El público de management + mecha + sin combate directo es
  específico. Puede ser demasiado pequeño para viabilidad comercial en Steam.
  Mitigación: itch.io primero, sin presión comercial en MVP.

### Scope Risks
- **Primer juego, timeline de semanas**: La UI de management puede consumir la
  mayoría del tiempo. Priorizar el loop funcional sobre el arte.
- **Feature creep clásico**: "¿Y si agregamos X?" El anti-pilar de simulación
  técnica profunda existe precisamente para bloquear esto.

### Open Questions
- **¿Es satisfactorio esperar el resultado de la misión?** — Responder con el MVP.
  Si el downtime se siente vacío, añadir una mecánica de gestión "mientras tanto".
- **¿Cuánto riesgo es suficientemente tenso sin ser frustrante?** — Necesita
  playtest con el sistema de probabilidades funcional.
- **¿Los rasgos de pilotos son suficiente para crear apego?** — Prototipar con
  3-5 rasgos básicos y testear si los jugadores "nombran" a sus pilotos.

---

## MVP Definition

**Core hypothesis**: El jugador encuentra satisfactorio tomar decisiones de
asignación con información incompleta y ver las consecuencias financieras y
operativas de esas decisiones.

**Required for MVP**:
1. Sistema de asignación: revisar misiones disponibles → asignar mecha + piloto → confirmar
2. 3 tipos de misión (transporte, combate, salvamento) con parámetros de riesgo distintos
3. Sistema financiero semanal: ingresos por misiones, costos fijos del gremio, costos de reparación
4. Sistema de daño probabilístico: misiones de combate pueden dañar mechas (porcentaje de HP), pilotos pueden quedar fuera de servicio temporalmente
5. 3 mechas con stats distintos (tanque/velocidad/equilibrado), 3 pilotos con un rasgo cada uno
6. Condición de victoria (completar contrato grande al final de N semanas) y de derrota (quiebra)

**Explícitamente fuera del MVP** (defer):
- Árbol de tecnología y upgrades avanzados
- Sistema de contratación/entrenamiento de pilotos
- Sistema de reputación con facciones
- Mantenimiento de piezas individuales
- Múltiples endings narrativos
- Arte final (placeholder funciona para validar el loop)

### Scope Tiers

| Tier | Contenido | Features | Timeline |
| ---- | ---- | ---- | ---- |
| **MVP** | 3 mechas, 3 pilotos, 3 tipos de misión | Core loop completo, finanzas semanales, daño/reparación, win/lose | 2-4 semanas (solo) |
| **Vertical Slice** | 6 mechas, 6 pilotos, 5 tipos de misión | Rasgos de pilotos expandidos, reputación básica, eventos aleatorios de misión | 4-8 semanas (solo) |
| **Alpha** | Contenido completo (placeholder) | Contratar/entrenar pilotos, upgrades de mechas, sistema de facciones básico | 3-6 meses (solo) |
| **Visión completa** | Todo pulido | Árbol de tecnología, mantenimiento de piezas, narrativa con eventos, múltiples endings | 6-12 meses (solo) |

---

## Next Steps

- [ ] Configurar el engine con `/setup-engine` — Godot 4, PC target
- [ ] Crear la identidad visual con `/art-bible` — antes de cualquier GDD
- [ ] Validar el concept doc con `/design-review design/gdd/game-concept.md`
- [ ] Descomponer el concepto en sistemas con `/map-systems`
- [ ] Crear GDD por sistema con `/design-system` (en orden de dependencia)
- [ ] Documentar decisiones de arquitectura con `/architecture-decision`
- [ ] Prototipar el core loop con `/prototype assignment-system`
- [ ] Validar el prototipo con `/playtest-report`
- [ ] Planificar el primer sprint con `/sprint-plan new`
