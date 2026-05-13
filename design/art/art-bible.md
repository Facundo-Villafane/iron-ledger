# Art Bible: Iron Ledger

*Created: 2026-05-11*
*Status: Approved*
*AD-ART-BIBLE: Lean mode — skipped*
*Engine: Godot 4.6.2 (2D)*
*Style: Pixel Art — Paleta cerrada de 42 colores*

---

## Section 1: Visual Identity Statement

**Regla visual maestra:**
*"Pixel art limpio con lectura de libro de contabilidad: cada píxel comunica, cada color tiene rol, cada silueta se lee al primer vistazo."*

### Principios de Soporte

**P1 — Legibilidad es ley**
El juego se juega en una UI de management. Si un mecha, piloto, o estado de misión no se lee al 30% de su tamaño, falla. Silueta + color de rol + forma distintiva deben identificar el elemento sin texto de apoyo.
*Design test: Si recortás el sprite y lo ponés sobre fondo negro en 32x32, ¿sabés qué es? Si no, rediseñar.*

**P2 — Pixel art estructurado, no fotorrealístico**
Clusters claros, bordes definidos, cel shading de 3-4 niveles (sombra profunda, base, luz, highlight opcional). Sin anti-aliasing suave ni gradientes pintados. La estructura geométrica del píxel ES el estilo.
*Design test: Si hay más de 4 valores de luminosidad en una sola área, simplificar.*

**P3 — La paleta maestra es el contrato**
42 colores, sin excepciones. Cada color tiene rol asignado. No se inventan colores nuevos. La limitación es la identidad visual — coherencia total entre mechas, pilotos, UI, y entornos.
*Design test: Si un asset requiere un color fuera de la paleta, el problema es el diseño del asset, no la paleta.*

### Pilares Visuales del Proyecto (Extended Visual Laws)

1. **Legibilidad primero** — Silueta, colores principales y acentos deben identificar rápidamente el rol del personaje o mecha incluso en tamaño reducido.
2. **Pixel art limpio** — Clusters claros, bordes definidos, pocas formas innecesarias. Sin ruido visual, exceso de textura o detalle demasiado fino.
3. **Cel shading básico** — Sombra profunda / color base / luz principal / highlight opcional. Sin pintura realista ni render suave.
4. **Consistencia de universo** — Todos los pilotos y mechas comparten el mismo lenguaje visual: trajes segmentados, paneles tecnológicos, líneas de energía, piezas de armadura, headsets/visores/módulos de interfaz, acentos de color por rol o facción.
5. **Paleta cerrada** — Todo construido sobre la paleta maestra de 42 colores. Sin excepciones salvo pedido explícito.
6. **Atractivo estilizado, no explícito** — Personajes pueden ser atractivos, elegantes o sugerentes (adultos). Se permite ropa ajustada, escote moderado o diseño sensual si se pide, siempre dentro de estética videojuego.

---

## Section 2: Mood & Atmosphere

| Estado de juego | Emoción target | Temperatura de color | Atmósfera | Energía |
|---|---|---|---|---|
| **Hangar / Hub** | Operacional, en control | Fría-neutral (fondos oscuros + acentos ámbar) | Como una sala de control de noche: todo en orden, todo bajo monitoreo | Medida |
| **Misión en curso** | Anticipación tensa | Sin cambio base, highlights activos en color de facción del equipo | El hangar sigue igual pero hay "slots activos" pulsando suavemente | Contenida |
| **Resolución — éxito** | Alivio + satisfacción | Flash cálido (dorados #f3a833/#dab163) brevísimo, luego vuelve a neutral | El ledger se actualiza, números en verde | Baja → spike → baja |
| **Resolución — daño** | Tensión + costo | Rojo sobre el ámbar (#ec273f sobre #e98537) en los indicadores de daño | Reporte de daño en pantalla, el mecha vuelve roto | Alta y negativa |
| **Cierre semanal** | Clínico, como auditoría | Neutral-frío. Números verdes o rojos. Sin drama visual extra | Ledger review: balance positivo = verde, negativo = rojo. Sin adornos | Baja, deliberada |
| **Estado de crisis** | Presión acumulada | Más rojo/naranja visible en UI (#ac2847, #de5d3a en warnings) | El mismo hangar pero los warnings dominan la pantalla | Alta y negativa |
| **Victoria** | Triunfo merecido | Dorado cálido (#f3a833, #ce9248) como flush breve sobre toda la UI | Breve, no ruidoso. El gremio sobrevivió | Spike positivo → reposo |
| **Derrota / Quiebra** | Frialdad de cierre | Paleta más oscura y azul-fría (#3e3b65, #10121c dominantes) | Pantalla de game over sobria. Sin drama, solo el ledger en rojo | Plana |
| **Menú principal** | Atmósfera, invitación | Silhouette del hangar, oscuro con luces ámbar | El gremio en reposo. Establece el mundo antes de empezar | Contemplativa |

**Regla de atmósfera global**: El estado emocional del gremio se comunica primero por los **acentos de color en la UI**, no por cambios de fondo. El background permanece oscuro y estable — solo los datos de estado cambian de color.

---

## Section 3: Shape Language

**Filosofía de silueta de mechas**
Los mechas deben ser legibles como siluetas sólidas. Cada uno tiene **una forma primaria dominante** que define su rol:
- Mechas pesados/tanque: rectangulares, amplios, con hombros exagerados
- Mechas velocidad/scout: triangulares, verticales, aerodinámicos
- Mechas equilibrados: forma hexagonal/trapezoidal, proporciones medias

*Design test: La silueta en negro sobre blanco, sin detalles, debe comunicar el rol antes de ver el sprite completo.*

**Filosofía de silueta de pilotos**
Proporciones estilizadas (cabeza ligeramente mayor, 5-6 cabezas de altura). Cada piloto tiene **un elemento visual único** que lo identifica a thumbnail size: color de cabello dominante, tipo de headset, o detalle de traje. No hay dos pilotos con la misma silueta de cabeza.

**Geometría de entornos**
Principalmente **rectangular e industrial** — líneas rectas, ángulos de 90°, estructuras de acero y concreto. Las curvas son excepciones que señalan tecnología especial o naturaleza intrusiva. El hangar es una caja funcional, no una estructura orgánica.

**Gramática de UI**
La UI hereda el lenguaje industrial: **rectángulos con esquinas ligeramente recortadas** (0-2px), marcos de 1-2px de grosor, separadores de línea. Sin bordes redondeados suaves — el UI se siente como una terminal de computadora industrial, no como una app moderna. Los paneles de datos son rectangulares; los alertas tienen ícono triangular de advertencia.

**Hero shapes vs. background shapes**
- **Hero shapes** (mechas activos, piloto seleccionado, misión disponible): colores de acento saturados de la paleta, outlines de 1-2px en color contrastante
- **Supporting shapes** (fondos de hangar, mechas inactivos/dañados, UI estática): colores apagados de la paleta (#4d3533, #2c1e31, #3e3b65), sin outlines saturados

**Regla de energía/acento**
Las líneas de energía, visores activos, y paneles de estado usan colores de la familia teal/blue (#36c5f4, #6dead6, #008b8b) para indicar operacional, y rojo (#ec273f, #ac2847) para indicar daño/crítico.

---

## Section 4: Color System

### La Paleta Maestra (42 colores)

**Descarga de la paleta .gpl** [LOSPEC500](https://lospec.com/palette-list/lospec500.gpl)

![lospec500](https://lospec.com/palette-list/lospec500-32x.png)

Formato `#RRGGBB` (convertido desde ARGB; alpha siempre FF — sin transparencias en la paleta base):

| Familia | Colores | Rol semántico |
|---|---|---|
| **Oscuros / Fondos** | `#10121c` `#2c1e31` | Backgrounds principales y secundarios. El mundo vive en la oscuridad. |
| **Rojo / Daño** | `#6b2643` `#ac2847` `#ec273f` | Daño crítico, emergencias, pérdidas en el ledger. #ec273f = alerta máxima. |
| **Naranja / Warning** | `#94493a` `#de5d3a` `#e98537` `#f3a833` | Advertencias, estados de caución, ingresos activos. #f3a833 = crédito entrante. |
| **Tierra / Metal desgastado** | `#4d3533` `#6e4c30` `#a26d3f` `#ce9248` `#dab163` `#e8d282` `#f7f3b7` | Texturas de metal oxidado, piso del hangar, estados neutros-cálidos. |
| **Verde / Operacional** | `#1e4044` `#006554` `#26854c` `#5ab552` `#9de64e` | Estado operacional de mechas y pilotos. #9de64e = condición óptima. |
| **Seafoam / Neutro verde** | `#008b8b` `#62a477` `#a6cb96` `#d3eed3` | Campos de energía, escudos, estados secundarios positivos. |
| **Azul / Tecnología** | `#3e3b65` `#3859b3` `#3388de` `#36c5f4` `#6dead6` | Líneas de energía, sistemas activos, tech corporativo. #36c5f4 = energía activa. |
| **Púrpura / Inactivo** | `#5e5b8c` `#8c78a5` `#b0a7b8` `#deceed` | Estados desactivados, UI secundaria, texto de baja prioridad. |
| **Rosa / Acento de rol** | `#9a4d76` `#c878af` `#cc99ff` `#fa6e79` `#ffa2ac` `#ffd1d5` | Colores de facción, acentos de piloto, alertas alternativas suaves. |
| **Neutrales claros** | `#f6e8e0` `#ffffff` | Texto principal (#ffffff), fondo de papel/ledger (#f6e8e0 para áreas de texto). |

### Roles Semánticos Fijos (no negociables)

| Color | Rol | Usado en |
|---|---|---|
| `#ec273f` | DAÑO CRÍTICO / ALERTA MÁXIMA | Damage reports, bankruptcy warning, misiones fallidas |
| `#ac2847` | DAÑO ALTO | HP de mecha en zona roja, pérdidas significativas |
| `#e98537` | WARNING ACTIVO | Advertencias de misión, presupuesto ajustado |
| `#f3a833` | INGRESO / ACTIVO | Créditos ganados, misión en progreso exitosa |
| `#9de64e` | CONDICIÓN ÓPTIMA | Mecha al 100%, piloto disponible, balance positivo alto |
| `#5ab552` | OPERACIONAL | Mecha disponible, piloto listo, balance positivo |
| `#36c5f4` | ENERGÍA ACTIVA / TECH | Líneas de energía del mecha, sistemas activos |
| `#6dead6` | ENERGÍA ESPECIAL / GLOW | Highlights de energía, efectos de tech avanzado |
| `#b0a7b8` | DESACTIVADO / DISABLED | Pilotos en recuperación, mechas en reparación |
| `#10121c` | BACKGROUND PRIMARIO | Toda la pantalla de juego |
| `#ffffff` | TEXTO PRINCIPAL | Todos los labels críticos, números de ledger |

### Paleta por Tipo de Mecha

- Mechas de **combate**: acentos en rojo/ámbar (`#ac2847`, `#e98537`)
- Mechas de **transporte**: acentos en verde (`#5ab552`, `#26854c`)
- Mechas de **salvamento**: acentos en tierra/marrón (`#a26d3f`, `#ce9248`)

### Paleta de Facciones

- El **gremio del jugador**: ámbar/naranja (`#f3a833`, `#e98537`) — los chatarreros
- Facción **corporativa** (clientes ricos): azul frío (`#3859b3`, `#3388de`)
- Facción **rival** (saboteadores enemigos): púrpura (`#9a4d76`, `#5e5b8c`)

### Accesibilidad — Colorblind Safety

Los pares rojo/verde (daño vs. operacional) son el principal riesgo para deuteranopía. Backup requerido:
- Daño: ícono triangular ⚠ + número de HP visible
- Operacional: ícono de check ✓ + número visible
- **Regla**: nunca comunicar estado crítico solo por color en el ledger. Siempre acompañar con forma o número.

---

## Section 5: Character Design Direction

### Pilotos — La Cara del Gremio

Los pilotos se ven principalmente como **retratos de busto** en la UI de management. El diseño de retrato tiene prioridad sobre el sprite completo.

**Proporciones**: 5-6 cabezas de altura. Cabeza ligeramente mayor que proporción real — facilita la lectura del retrato a pixel scale.

**Elemento identificador único**: Cada piloto tiene UN rasgo que lo identifica a thumbnail size:
- Color de cabello dominante (varía entre colores de paleta)
- Tipo de headset o visor (forma de equipo, no solo color)
- Detalle de traje que ningún otro tiene

*Design test: Dos retratos de piloto en 32x32 — ¿podés distinguirlos sin leer el nombre? Si no, rediseñar uno de los dos.*

**Paleta de retrato**: Piel usando la familia tierra/cálida (`#ce9248`, `#dab163`, `#a26d3f` + variantes). Pelo y acentos de traje desde colores asignados al rol/facción del piloto.

**Expresiones requeridas**: Neutral / Concentrado / Herido / Agotado. Las 4 para feedback visual del estado del piloto.

**Atractivo estilizado (Pillar 6)**: Pilotos pueden ser atractivos, con trajes ajustados o diseños sugerentes. Siempre adultos, dentro de estética de videojuego. Ropa ajustada OK, escote moderado OK si se pide explícitamente. No explícito.

### Mechas — Activos de Trabajo

Los mechas se ven como sprites en el hangar y como íconos en el panel de misión.

**Forma primaria por rol** (derivado de Shape Language):
- Tanque/Pesado: rectangular ancho, hombros exagerados, blindaje pesado visible
- Scout/Velocidad: triangular vertical, aerodinámico, extremidades largas
- Equilibrado: hexagonal/trapezoidal, proporciones medias

**Cel shading**: 4 niveles máximo — sombra profunda / color base / luz / highlight. Superficie de metal industrial, no plástico.

**Acentos de energía**: Líneas en `#36c5f4` o `#6dead6` en articulaciones, visores, y paneles. Siempre presentes en mechas operacionales.

**Estados de daño** (4 niveles, visualmente distintos):

| Estado | Visual | Colores clave |
|---|---|---|
| Intacto | Acento de energía brillante, sin marcas | Base normal + `#36c5f4` activo |
| Daño leve | Marcas de impacto, energía ligeramente opacada | `#94493a` en marcas |
| Daño severo | Partes deformadas/faltantes, energía en rojo | `#ac2847` en energía |
| Destruido | Ícono de wreck, sin energía, metal muerto | `#4d3533` dominante |

---

## Section 6: Environment Design Language

En Iron Ledger, el entorno principal es el **hangar del gremio**. Las locaciones de misión aparecen como íconos o fondos de carta — no como niveles explorables.

### El Hangar — Pantalla Principal

**Estilo arquitectónico**: Industrial funcional. Concreto, metal, vigas expuestas, tuberías a la vista. Sin decoración que no sirva una función. El hangar es un lugar de trabajo, no una sala de exposición.

**Iluminación ambiental**: Luces de trabajo en ámbar-cálido (`#e98537`, `#f3a833`). Paneles de tech en azul-frío (`#36c5f4`). Sombras profundas (`#10121c`, `#2c1e31`). Sin luz cenital suave — es una nave industrial.

**Prop density**: Esparso-Medio. Cada elemento visible tiene propósito: bahías de mecha, terminal de computadora, tablero de misiones, área de herramientas. El espacio vacío entre mechas refleja bahías disponibles.

**Environmental storytelling**:
- Estado del gremio legible: mechas dañados visibles en bahías, equipo de reparación desplegado cuando hay trabajo pendiente
- Detalles humanizadores a pixel scale: taza de café en el escritorio, mapa de la ciudad en la pared, fotos de pilotos
- Sin texto de lore en paredes — la historia está en los datos del ledger

**Regla de legibilidad**: Todo elemento del fondo en valores de color más oscuros que la UI y los sprites. El fondo no compite con los datos.

### Íconos de Locaciones de Misión

| Tipo de zona | Visual | Colores clave |
|---|---|---|
| Urbana densa | Silueta de edificios altos, noche | `#3e3b65`, `#3859b3` |
| Industrial | Humo + estructuras de metal | `#4d3533`, `#6e4c30` |
| Residencial | Techos bajos, vegetación | `#26854c`, `#a6cb96` |
| Portuaria | Agua + grúas | `#1e4044`, `#008b8b` |
| Zona restringida | Ícono de acceso + rojo | `#ac2847`, `#ec273f` |

---

## Section 7: UI/HUD Visual Direction

La UI de Iron Ledger IS el juego. No es una overlay sobre acción — es la pantalla principal donde todo pasa.

### Filosofía

**Diegético vs. Screen-space**: Screen-space HUD. La UI es una terminal de gestión, no un visor dentro del mundo. UI diegética reduciría la legibilidad sin beneficio narrativo para este tipo de juego.

**Tipografía**: Pixel font monospace para números y datos del ledger (alineación facilita comparación). Pixel font proporcional para labels y nombres. Sin fuentes vectoriales suaves.
- Tamaño mínimo: 7x7px por carácter para texto secundario, 9x9px para datos críticos

**Iconografía**: Flat / outlined pixel icons. Cada ícono con marco rectangular de 1px. Íconos de estado legibles en 16x16px.

**Animación de UI**: Mínima y funcional:
- Cambio de estado de mecha: sustitución de color, sin tweening complejo
- Notificación de resultado: flash de color (1-3 frames) + ícono de resultado
- Regla: el movimiento de UI siempre comunica un cambio de dato. Sin animaciones decorativas.

### Layout de Pantalla Principal

```
┌────────────────────────────────────────────┐
│ GUILD NAME       Week: 12    Credits: ████  │  ← Header / Ledger
├──────────────┬─────────────────────────────┤
│ HANGAR VIEW  │ MISSION QUEUE               │  ← Zona central
│ [Mecha bay]  │ [Mission card] [Mission card]│
│ [Mecha bay]  │ [Mission card]              │
│ [Mecha bay]  │                             │
├──────────────┴─────────────────────────────┤
│ PILOT ROSTER: [P1] [P2] [P3] [P4]          │  ← Footer / Pilotos
└────────────────────────────────────────────┘
```

*Design test: El jugador puede ver el estado de todos sus mechas Y pilotos Y misiones disponibles sin hacer scroll. Si requiere scroll para el estado básico, el layout falla.*

### Colores de UI

| Elemento | Color |
|---|---|
| Panel backgrounds | `#2c1e31` / `#3e3b65` |
| Borders inactivos | `#5e5b8c` |
| Borders activos | `#8c78a5` |
| Focused / selected | `#f3a833` (outline 2px) |
| Texto primario | `#ffffff` |
| Texto secundario | `#b0a7b8` |
| Ledger paper (áreas de datos financieros) | fondo `#f6e8e0`, texto `#10121c` |

### Accesibilidad

- Todos los elementos interactivos alcanzables por teclado
- Sin hover-only states — todos los estados visibles deben tener equivalente keyboard-focused
- Tamaño mínimo de click target: 32x32px

---

## Section 8: Asset Standards

*Engine: Godot 4.6.2 — 2D Pixel Art*

### Formatos y Filtrado

- **Formato**: PNG lossless para todos los sprites y UI. Sin JPEG (artefactos en pixel art). Sin WebP por defecto.
- **Filtrado**: NEAREST NEIGHBOR siempre. En Godot: Project Settings → Rendering → Textures → Default Texture Filter = `Nearest`.
- **Escala en engine**: Resolución base 320×180px (o 384×216px), escalada sin interpolación. Stretch mode: `canvas_items`, texture filter: `Nearest`.

### Resoluciones Target

| Asset type | Resolución canvas | Notas |
|---|---|---|
| Retrato de piloto | 48×48px | Thumbnail en roster |
| Sprite de mecha (hangar) | 64×96px | Visible en bahías |
| Ícono de mecha (carta de misión) | 32×32px | Derivado del sprite principal |
| Ícono de piloto (roster compacto) | 24×24px | Derivado del retrato |
| Íconos de UI | 16×16px | Estado, tipo de misión, rol |
| Carta de misión completa | 80×120px | Ícono + datos |
| Background del hangar | 320×180px | Resolución base, escala a pantalla |
| Tilesets (si se usan) | 16×16px por tile | — |

### Naming Convention

Todos los nombres en snake_case, en inglés:
- `pilot_[name]_portrait_[state].png` → `pilot_ortega_portrait_neutral.png`
- `mech_[role]_[name]_[state].png` → `mech_tank_ironclad_intact.png`
- `ui_icon_[type]_[variant].png` → `ui_icon_mission_combat.png`
- `bg_hangar_[layer].png` → `bg_hangar_back.png`

### Paleta Enforcement

Todos los assets importados deben usar solo los 42 colores de la paleta maestra. Paso de revisión de paleta requerido antes de importar cualquier asset.

### Sprite Structure

Sprites individuales por estado (no sprite sheets animados en el MVP). Godot maneja sprites individuales eficientemente para un management sim sin animaciones complejas.

### Memory & Performance Budget

| Budget | Límite | Notas |
|---|---|---|
| Textures total (MVP) | 50MB importados | Revisitar en Alpha |
| Draw calls | ≤200/frame | Batchar elementos UI donde sea posible |
| RAM total | 512MB | Holgado para 2D pixel art |

---

## Section 9: Reference Direction

### Pilotos

**13 Sentinels: Aegis Rim (Vanillaware)**

![13 Sentinels: Aegis Rim (Vanillaware)](https://static0.gamerantimages.com/wordpress/wp-content/uploads/2022/06/13-Sentinels-Meta-Chips-Feature-Image.jpg)
- *Qué tomar*: Claridad de identidad por personaje — cada piloto tiene UN elemento visual dominante reconocible en silueta. Equilibrio entre traje funcional y diseño estilizado atractivo. El nivel de detalle que funciona en pixel: sugerido, no ilustrado.
- *Qué evitar*: La escala de producción y el airbrushing. Nuestra versión usa clusters de pixel art, no gradientes.

**Ghost in the Shell (Masamune Shirow / Oshii)**

![Ghost in the Shell (Masamune Shirow / Oshii)](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9nB_hpGYVJVNYHECivynlZL1fcrwRvBPOxw&s)
- *Qué tomar*: El traje funcional que se ve ingenierizado. Los acentos de tech que parecen útiles. La paleta restringida — mucho color base, pocos acentos.
- *Qué evitar*: El nivel de fanservice del manga original. Nuestra interpretación es "atractivo estilizado moderado."

**Anime sci-fi gacha (nivel Arknights / Punishing Gray Raven)**

![Punishing Gray Raven](https://preview.redd.it/punishing-gray-raven-was-the-gacha-game-i-needed-v0-dpruyf088fag1.jpeg?auto=webp&s=4dde6c56810457a9caf041b7a1b98deff105621d)
- *Qué tomar*: Diferenciación de rol a primera vista. Acentos de color como marcador de facción/rol. El atractivo sin ser explícito.
- *Qué evitar*: El overdesign gacha — 47 correas, 12 capas, 8 accesorios. Pillar 2 (pixel art limpio) cancela el overdesign.

---

### Mechas

**Patlabor (Masami Yuuki)**

![Patlabor (Masami Yuuki)](https://i.pinimg.com/736x/a1/1a/72/a11a727e8b339eca88a2c887804a0398.jpg)
- *Qué tomar*: Los Labors son **herramientas de trabajo**, no armas de dios. Parecen maquinaria pesada con torso de robot. El gremio de Iron Ledger tiene exactamente este tipo de mechas — gastados, prácticos, con personalidad de máquina vieja que todavía funciona. **Referencia más importante para la escala de poder del mundo.**
- *Qué evitar*: La lentitud y torpeza visual intencional de Patlabor — nuestros mechas necesitan siluetas cool aunque sean trabajadores.

**Armored Core (FromSoftware)**

![Armored Core (FromSoftware)]([https://i.pinimg.com/736x/a1/1a/72/a11a727e8b339eca88a2c887804a0398.jpg](https://preview.redd.it/armored-core-3-ac-concept-design-by-shoji-kawamori-bipeds-v0-wnftdg296vcf1.jpeg?auto=webp&s=12b2b1085d28c86e6f5d8785a4f7e7cf12354db5))
- *Qué tomar*: La filosofía modular — se nota que son ensamblajes de piezas. Los detalles de ingeniería: ductos, paneles de acceso, articulaciones expuestas. La variedad dentro del mismo vocabulario visual.
- *Qué evitar*: El nivel de detalle de AC6 en pixel art — imposible en 64×96px. Tomar el *lenguaje* de las formas, no la complejidad.

**Zone of the Enders (Yoji Shinkawa)**

![Zone of the Enders (Yoji Shinkawa)](https://i.pinimg.com/736x/b5/de/17/b5de17c8e7fc3f5aed3924546140203e.jpg)
- *Qué tomar*: La silueta como primer lenguaje — Jehuty reconocible en 16px. Los acentos de energía como parte del diseño base. La sensación de vida dentro de la máquina.
- *Qué evitar*: El registro de "super robot" de alto poder. Iron Ledger tiene mechas de chatarreros, no los Frames de ZoE.

---

### UI

**Citizen Sleeper (Jump Over the Age)**

![Citizen Sleeper (Jump Over the Age)](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1578650/ss_9db68bf85c1d9e44331f5a8dd4134aae8a744076.1920x1080.jpg?t=1755218068)
- *Qué tomar*: "La burocracia corporativa como estética de gameplay." El ledger, las cartas, los formularios — la paperwork IS el juego. La UI que te recuerda que sos un recurso del sistema. **Referencia más directa para Iron Ledger.**
- *Qué evitar*: La tipografía vectorial y la paleta desaturada — Iron Ledger usa pixel font y colores semánticos expresivos.

**TRON Legacy (Kosinski)**

![TRON Legacy (Kosinski)](https://i0.wp.com/ilikeinterfaces.com/wp-content/uploads/2015/03/00_11_1700060.png?fit=1440%2C810&ssl=1)
- *Qué tomar*: Fondos muy oscuros con acentos de líneas luminosas saturadas. El contraste entre información y vacío. La UI como el único elemento iluminado en la oscuridad.
- *Qué evitar*: Las líneas de neón literales y el monocolorismo. Iron Ledger usa múltiples colores semánticos.

**Minority Report (Spielberg / McDowell)**

![Minority Report (Spielberg / McDowell)](https://freight.cargo.site/t/original/i/ed688c3f4f39c8cd294c03cf4c203c3f8be7f6506dd984ac680fc9ca75fc38ea/MinorityReportType_06.jpg)
- *Qué tomar*: El concepto de capas de información con jerarquía clara. Datos primarios en primer plano, contexto en segundo. Legibilidad a pesar de la densidad.
- *Qué evitar*: Los efectos 3D, holográficos y gestuales. Somos 2D pixel — tomar el concepto, no la ejecución.

---

### Pixel Art

**Into the Breach (Subset Games)**

![Into the Breach (Subset Games)](https://miro.medium.com/1*p9S7AdEuCPhfUbE7cKuKzQ.gif)
- *Qué tomar*: El estándar de legibilidad — cada sprite comunica su rol y estado en el menor número de píxeles posible. Sin elemento visual que compita con la información de gameplay. **Barra de calidad mínima de legibilidad para Iron Ledger.**
- *Qué evitar*: El estilo frío-minimalista. Iron Ledger tiene más personalidad y calor. Into the Breach es el piso de legibilidad, no el techo de diseño.

**Hyper Light Drifter (Heart Machine)**

![Hyper Light Drifter (Heart Machine)](https://i.blogs.es/ea7b49/140416-hld-review/1366_2000.jpg)
- *Qué tomar*: El uso masterful de paleta limitada para crear atmósfera. Profundidad con oscuridad y luz sin usar 3D. Los momentos de color saturado que "pop" sobre fondo oscuro.
- *Qué evitar*: La abstracción del mundo — Iron Ledger necesita elementos reconocibles. HLD es referencia de *atmósfera*, no de *legibilidad*.

**Metal Slug (SNK)**

![Metal Slug (SNK)](https://pbs.twimg.com/media/GQcerg5W0AABatg.png)
- *Qué tomar*: La expresividad y personalidad de los personajes a escala pequeña. El nivel de detalle que hace que los sprites "vivan". El satisfying visual feedback de cada acción.
- *Qué evitar*: El nivel de animación (30-60 frames por acción). Iron Ledger MVP usa sprites estáticos o de 2-4 frames.

---

### Mundo / Setting

**Syd Mead (diseñador visual — Blade Runner, TRON, Aliens)**

![Syd Mead (diseñador visual — Blade Runner, TRON, Aliens)](https://www.cinechronicle.com/wp-content/uploads/2019/12/Syd-Mead-works-1.jpg)
- *Qué tomar*: "Diseño funcional como belleza." Las máquinas se ven como si realmente funcionaran — ductos donde tienen que ir los ductos, paneles donde tiene sentido. Guía principal para el hangar y los mechas.
- *Qué evitar*: El futurismo cromado y limpio de sus trabajos utópicos. Iron Ledger es un gremio de chatarreros — todo está usado, parcheado, y funcional-hasta-que-no.

**Blade Runner (Ridley Scott / Jordan Cronenweth)**

![Blade Runner (Ridley Scott / Jordan Cronenweth)](https://external-preview.redd.it/blade-runner-1982-dir-ridley-scott-dop-jordan-cronenweth-v0-bzBxM3ZjMm52NHZjMSY-AkqAqnKQZoJzXs2I7sGT91nCMpYy5a7vwZdJLnY1.png?width=640&crop=smart&format=pjpg&auto=webp&s=1311e0d685618c5daefb6d8fb497c41e216be0fb)
- *Qué tomar*: La ciudad industrial que nunca descansa. Contraste entre tecnología avanzada y decadencia material. El sentimiento de que el mundo tiene historia antes del primer frame.
- *Qué evitar*: El nihilismo como tono dominante — Iron Ledger es tenso, no deprimente. El registro de Blade Runner 2049 (demasiado limpio y vacío para nuestro gremio).

**Hangares industriales reales (NASA, astilleros, fábricas)**

![Hangares industriales reales (NASA, astilleros, fábricas)](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIuZWXBdw_XUgI_hnAwoAcdCmrDDppKVKFOw&s)
- *Qué tomar*: La honestidad funcional del espacio. Los cables, grúas, marcas de pintura en el piso. La escala humana de la maquinaria. La belleza accidental de la infraestructura real.
- *Qué evitar*: La frialdad estéril de un hangar vacío. Iron Ledger tiene vida — pilotos, mechas, equipo, historia acumulada en las paredes.
