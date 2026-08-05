# Formas Divertidas — Plan de producto

Juego web mobile-first para bebés de 2 años. El niño arrastra formas y colores en la
pantalla del móvil. Al tocar cada forma suena un efecto divertido y se dispara una
animación. Todo con botones grandes, colores brillantes y cero texto que haya que leer.

- **Público:** 2–3 años (con un adulto cerca)
- **Plataforma:** web app mobile-first, 390 px de ancho de referencia
- **Idioma:** español
- **Diseño:** `~/.pencil/documents/ae7433e4-d4a0-4ae9-b6d0-3dd2b21101ac/pencil-new.pen`
- **Referencias visuales:** `docs/level-1.jpg` … `docs/level-5.jpg`

## Requisitos técnicos

- **Vite + React + TypeScript** como base del proyecto
- **Phaser.js** para las animaciones y los sonidos del juego
- Interfaz simple, botones grandes, colores brillantes
- Arrastrar y soltar para mover las formas por la pantalla
- Guardar la evolución del bebé y generar **reportes de progreso**
- La dificultad se adapta según el progreso: más ejercicios o niveles más difíciles

---

## 1. Principios de diseño

Reglas aplicadas en todas las pantallas y que deben respetarse al implementar:

| Principio | Cómo se aplica |
|---|---|
| Un objetivo por pantalla | Cada nivel pide una sola cosa: llevar piezas a huecos |
| Objetivos táctiles enormes | Piezas 52–70 px, botones redondos 54 px, botón principal 85 px de alto |
| Sin lectura obligatoria | El texto es para el adulto; el niño se guía por forma, color y voz |
| Voz siempre disponible | Icono de altavoz en cada nivel repite la consigna hablada |
| Acción en la mitad inferior | La bandeja de piezas está abajo: se arrastra hacia arriba, con una mano |
| Sin penalización | No hay fallo ni tiempo; un error solo devuelve la pieza a la bandeja |
| Salida protegida | Ajustes, reportes y salida viven detrás de la "Zona de padres" |

---

## 2. Sistema de diseño

### Tokens (variables del `.pen`)

**Color**

| Token | Hex | Uso |
|---|---|---|
| `$sun` | `#FFC93C` | Acción primaria, estrellas, forma "estrella" |
| `$pink` | `#FF6FA5` | Forma "triángulo", acentos |
| `$blue` | `#3FB0F5` | Forma "círculo" |
| `$green` | `#6FCF6B` | Éxito, progreso, forma "pentágono" |
| `$purple` | `#A66DD4` | Forma "cuadrado" |
| `$red` | `#FF5C5C` | Forma "corazón", manzanas |
| `$orange` | `#FF9F45` | Acento cálido |
| `$ink` | `#4A3728` | Texto principal (marrón cálido, no negro) |
| `$ink-soft` | `#8C7A66` | Texto secundario e iconos inactivos |
| `$white` | `#FFFFFF` | Tarjetas, bordes tipo sticker |
| `$bg-cream` | `#FFF7E8` | Fondo cálido |
| `$bg-sky` | `#CDEEFF` | Fondo frío |

**Tipografía** — `$font-round` = **Baloo 2** (Google Fonts), redondeada y amable.

| Rol | Tamaño | Peso |
|---|---|---|
| Título de portada | 52 / 44 | 800 / 700 |
| Título de pantalla | 30–34 | 800 |
| Consigna del nivel | 19 | 600 |
| Etiqueta de botón | 22–28 | 800 |
| Texto de ayuda | 17 | 500 |

**Otros** — `$r-pill` = 999 (cápsula), `$pad-screen` = 20 (padding lateral único por pantalla).

### Componentes reutilizables

Viven en la parte superior del canvas de Pencil. Editarlos propaga a todas las instancias.

| Componente | Descripción | Variantes por instancia |
|---|---|---|
| `component/Pieza` | Ficha arrastrable tipo sticker: borde blanco 5 px, esquinas redondeadas, sombra | Tamaño, color de fondo y forma interior |
| `component/Hueco` | Destino de la pieza: fondo blanco, silueta interior gris al 9 % | Tamaño y silueta |
| `component/Boton Grande` | Botón cápsula con icono + etiqueta y borde inferior sólido (efecto 3D) | Ancho, color, icono, texto |
| `component/Tarjeta Nivel` | Tarjeta del mapa: avatar circular, badge numerado, título y 3 estrellas | Emoji, número, título, color del avatar, estrellas ganadas |
| `component/Tarjeta` | Contenedor de las pantallas del adulto: título + hueco de contenido | Título y contenido (se reemplaza el hueco) |
| `component/Stat Tile` | Métrica: valor grande + etiqueta | Valor, etiqueta y color del valor |
| `component/Fila Forma` | Fila de reporte: ficha + nombre + barra + porcentaje | Forma, nombre, longitud de barra y % |

**Formas del juego:** estrella y corazón son `path` SVG; triángulo y pentágono son
`polygon` (3 y 5 lados); círculo es `ellipse`; cuadrado y rectángulo son `rectangle`.

---

## 3. Pantallas diseñadas

Las 9 pantallas están en el `.pen` como frames de primer nivel, en orden de izquierda a derecha.

### 01 · Inicio
Título "FORMAS / Divertidas", tortuga central sobre halo blanco, cuatro piezas de
colores flotando y ligeramente rotadas alrededor, botón **JUGAR** y acceso discreto a
"Zona de padres" con candado.

### 02 · Mapa de niveles
Saludo "¡Hola! / Elige un juego", contador de estrellas totales y rejilla 2×3 de
tarjetas de nivel. Cada tarjeta muestra número, mascota, nombre y estrellas ganadas.

La sexta es **Próximo**: el nivel que la app genera sola según cómo va el bebé. No está
bloqueada — se distingue por el destello ✨, el badge verde y la etiqueta *Para ti* en
lugar de las estrellas, porque todavía no se ha jugado. Es la misma propuesta que el
adulto ve explicada y aprueba en la pantalla 13 (§ 6).

### 03 · Nivel 1 — Tortuga · *ref. `level-1.jpg`*
Tortuga con 5 huecos en el caparazón: **estrella, triángulo, círculo, cuadrado, corazón**
(fila de 3 + fila de 2). Bandeja inferior con las 5 piezas de colores.

### 04 · Nivel 2 — León · *ref. `level-2.png`*
León con melena, orejas y corona. 4 huecos en la cara en rejilla 2×2:
**triángulo, pentágono, círculo, cuadrado**.

### 05 · Nivel 3 — Manzana · *ref. `level-3.png`*
Manzana roja con tallo, hoja y brillo. 4 huecos 2×2:
**cuadrado, círculo, triángulo, rectángulo**. Introduce el rectángulo como forma nueva.

### 06 · Nivel 4 — Frutas · *ref. `level-4.jpg`*
Cambia la mecánica: ya no es forma geométrica sino **emparejar objeto con su sombra**.
Cesta tejida con asa y 6 siluetas: piña, plátano, naranja, fresa, sandía y uvas.
La bandeja tiene las 6 frutas a color.

### 07 · Nivel 5 — Tamaños · *ref. `level-5.jpg`*
Árbol con 5 huecos circulares de distinto tamaño (78 → 40 px). La bandeja tiene 5
manzanas de mayor a menor. Enseña **seriación por tamaño**, no forma ni color.

### 08 · ¡Bien hecho!
Recompensa: confeti, 3 estrellas grandes, la mascota del nivel, "¡BIEN HECHO!" y
"Completaste la tortuga". Botones **SEGUIR** (verde) y "Jugar otra vez".

### 09 · Zona de padres
Fuera del flujo de juego. Tres tarjetas:
- **Sonido** — interruptores para música de fondo, voces de los personajes, efectos y aplausos
- **Tiempo de juego** — límite de sesión: 10 / 20 / 30 min
- **Progreso de hoy** — niveles completados, estrellas y minutos jugados

Arriba del todo, la tarjeta **Evolución de Mia** lleva a los reportes (§ 6) y al
ejercicio recomendado, esta última con aviso cuando hay una propuesta sin revisar.
Cierra con **VOLVER AL JUEGO**.

### 10–12 · Reportes · 13 · Ejercicio recomendado

Pantallas para el adulto. Se detallan en § 6.

### Estructura común de un nivel

Todas las pantallas de juego comparten el mismo esqueleto vertical, así que se
implementan como un solo componente parametrizado:

```
Status bar (62 px)
└─ Contenido (padding lateral 20, gap 18)
   ├─ Barra superior     ← volver · 5 puntos de progreso · altavoz
   ├─ Consigna           ← cápsula blanca con icono de voz + texto
   ├─ Tablero (350×350)  ← mascota + huecos
   ├─ Texto de ayuda
   └─ Bandeja            ← piezas arrastrables
```

Lo único que cambia por nivel es el **tablero**, el **contenido de la bandeja**, los
**textos** y el **degradado de fondo**.

---

## 4. Interacción y feedback

Aún no está dibujado en el `.pen`; es lo siguiente a diseñar. Lo maneja Phaser.

**Arrastrar**
1. *Reposo* — la pieza late suavemente cada pocos segundos para invitar al toque
2. *Al tocar* — se agranda ~10 %, suena su nombre ("¡estrella!") y sube la sombra
3. *Al arrastrar* — sigue el dedo con una ligera rotación e inercia
4. *Cerca del hueco correcto* — el hueco se ilumina y crece un poco (imán a ~40 px)
5. *Acierto* — encaje con rebote, destello de partículas, campanilla y aplauso
6. *Fallo* — la pieza vuelve a su sitio con una animación suave. Sin sonido negativo

**Tocar sin arrastrar** — cualquier forma reproduce su sonido y hace un rebote corto.

**Fin de nivel** — las piezas colocadas saltan en secuencia, confeti y paso a la pantalla 08.

**Accesibilidad y comodidad**
- Nada parpadea a más de 3 Hz
- El niño no puede quedarse atascado: tras ~15 s sin acierto, el hueco correcto se resalta
- Todos los sonidos se pueden apagar desde la Zona de padres

---

## 5. Arquitectura

```
src/
├─ app/            Router y shell de la aplicación
├─ ui/             Pantallas React (portada, mapa, éxito, zona de padres, reportes)
│  ├─ components/  Pieza, Hueco, BotonGrande, TarjetaNivel — 1:1 con el .pen
│  └─ tokens.ts    Colores, tipografía y radios exportados del .pen
├─ game/           Phaser
│  ├─ scenes/      Una escena por nivel + escena base compartida
│  ├─ drag.ts      Arrastre, imán al hueco, encaje y rebote
│  └─ audio.ts     Precarga y reproducción de voces y efectos
├─ data/           Persistencia y modelo de progreso
│  ├─ events.ts    Registro de eventos de juego
│  ├─ progress.ts  Estrellas, niveles y dificultad
│  └─ reports.ts   Agregaciones para los gráficos
└─ levels/         Definición declarativa de cada nivel (formas, huecos, mascota, colores)
```

**División React / Phaser**

- **React** dibuja todo lo que es interfaz: portada, mapa de niveles, barra superior,
  consigna, bandeja, pantalla de éxito, zona de padres y reportes.
- **Phaser** se monta solo en el área del **tablero** y gobierna el arrastre, las
  animaciones, las partículas y el audio.
- Se comunican con un bus de eventos mínimo: React envía `startLevel(config)` y Phaser
  emite `piecePicked`, `pieceDropped`, `pieceMatched`, `levelCompleted`.

**Definición de nivel** — cada nivel es un objeto declarativo (mascota, lista de formas,
posición de los huecos, paleta), de modo que añadir un nivel no requiere código nuevo.

---

## 6. Reportes y evolución del bebé

### Qué se registra

Cada evento lleva marca de tiempo, id de sesión y nivel:

| Evento | Datos |
|---|---|
| `session_started` / `session_ended` | Duración total |
| `level_started` / `level_completed` | Nivel, duración, estrellas |
| `shape_tapped` | Forma, color, si sonó la voz |
| `piece_matched` | Forma, segundos desde que se levantó la pieza |
| `piece_missed` | Forma intentada vs. hueco donde se soltó |
| `hint_shown` | Cuándo hubo que resaltar el hueco correcto |

### Métricas derivadas

- **Tiempo de juego** — por día y por sesión, y racha de días seguidos
- **Precisión** — aciertos frente a intentos, por forma y por nivel
- **Velocidad** — segundos medios hasta encajar cada forma, y su tendencia
- **Dominio por forma** — qué formas ya domina y cuáles cuestan
- **Sonidos escuchados** — cuántas veces se tocó cada forma para oírla

### Pantallas de reportes (diseñadas — 10, 11 y 12)

Las tres comparten cabecera y un segmentado `Resumen · Formas · Progreso` para moverse
entre ellas. Fondo beige, tipografía más pequeña que en el juego: son territorio del adulto.

**10 · Resumen** — 3 métricas destacadas (minutos de la semana, estrellas, racha),
barras verticales de minutos por día de la semana y donut de precisión general.
Cierra con el aviso de datos locales y los botones `Exportar` y `Borrar historial`.

**11 · Dominio por forma** — barras horizontales con la precisión de cada forma
(círculo 92 % … pentágono 38 %), agrupación en *Domina / En progreso / Le cuesta* y
un bloque de sonidos escuchados, que mide qué formas toca solo por el gusto de oírlas.

**12 · Progreso en el tiempo** — titular con el cambio del mes, dos gráficos separados
(segundos hasta encajar y precisión por semana) y tabla de las últimas sesiones.

#### Reglas de gráfico

- **Nunca dos ejes.** Velocidad y precisión son magnitudes distintas → dos gráficos.
- **Una serie = un solo tono.** Ningún gráfico compara categorías, así que no hay paleta
  categórica ni leyendas.
- **La identidad no la lleva el color.** Cada fila de forma empieza con su ficha y su
  nombre; todas las barras usan el mismo tono. Esto evita el choque rosa/rojo del juego,
  indistinguible incluso con visión normal.
- **Etiquetas directas selectivas** (solo el máximo, o el primero y el último), sin un
  número sobre cada barra y sin rejilla: línea base y ya.
- Los estados siempre llevan **texto**, nunca solo color.

#### Colores de gráfico

Los colores del juego son demasiado claros para ser marcas de datos. Se usan cuatro pasos
oscuros de los mismos tonos, validados contra la superficie clara:

| Token | Hex | Uso |
|---|---|---|
| `$chart-blue` | `#1668A8` | Barras de tiempo y de precisión |
| `$chart-amber` | `#B87A0E` | Barras de velocidad |
| `$chart-good` | `#2F8A3C` | Estado "domina" |
| `$chart-alert` | `#C0392B` | Estado "le cuesta" |
| `$chart-track` | `#E8DFD1` | Pista de barra y días sin juego |

### Dificultad adaptativa — pantalla 13 · Ejercicio recomendado

La app **propone, el padre aprueba**. No hay constructor manual de niveles.

La pantalla muestra la propuesta ya armada: mascota, las piezas que entran (con la forma
nueva marcada como `nuevo`), el número de piezas y el tamaño de los huecos. Debajo, en
lenguaje llano, **por qué** se propone: *"Ya domina círculo y cuadrado con más del 85 %.
Añadimos el pentágono, que es la forma que menos ha practicado."* Se activa con
`ACTIVAR EJERCICIO` o se descarta con `Ahora no`.

Las reglas quedan a la vista, no ocultas en el código:

- ↑ **Sube** cuando acierta más del 85 % dos veces seguidas y sin pistas → más piezas,
  huecos más pequeños o formas parecidas juntas.
- ↓ **Baja** cuando acierta menos del 50 % o necesita más de dos pistas → menos piezas,
  imán más generoso y la consigna hablada se repite antes.

Un segmentado `Fácil · Automático · Difícil` permite fijar la dificultad a mano; en manual
la app deja de proponer ejercicios.

**Dónde aparece el nivel generado.** Una vez activado, ocupa la tarjeta **Próximo** del
mapa de niveles (pantalla 02), con destello ✨ y la etiqueta *Para ti*. El niño lo ve como
un juego más; el adulto es quien conoce el porqué. Cuando se completa, pasa a ser un nivel
normal con sus estrellas y la app propone el siguiente.

### Privacidad

Todo se guarda en el dispositivo (IndexedDB). Sin cuentas, sin servidor y sin datos
personales del niño. La Zona de padres permite exportar los reportes a un archivo y
borrar todo el historial.

---

## 7. Alcance técnico

- Web app mobile-first; se envuelve después como PWA para uso sin conexión
- Sin publicidad, sin compras dentro de la app, sin enlaces externos fuera de la Zona de padres
- Audio precargado; la primera interacción del usuario desbloquea el contexto de audio del navegador
- Bloqueo de orientación en vertical y protección contra zoom accidental por doble toque
- Las pantallas se pueden exportar del `.pen` a HTML/React como punto de partida

---

## 8. Siguientes pasos

1. Diseñar los estados de interacción (arrastre, acierto, error, fin de nivel)
2. Sustituir los emojis por ilustraciones propias en tarjetas de nivel y frutas
3. Añadir splash de carga con la mascota
4. Definir el guion de voces y la lista de efectos de sonido
5. Montar el proyecto Vite + React + TS y exportar los tokens y componentes del `.pen`
6. Implementar el nivel 1 con Phaser como prototipo jugable
7. Conectar el registro de eventos y levantar la pantalla 10 con datos reales
