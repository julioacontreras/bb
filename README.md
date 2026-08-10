# Formas Divertidas

Juego web mobile-first de formas y colores para bebés de 2 años, implementado a partir de
[docs/plan.md](docs/plan.md) y del diseño [docs/screens.pen](docs/screens.pen).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + bundle de producción
```

Pensado para 390 px de ancho. En pantallas grandes el juego se centra en un marco de móvil.

## Cómo está montado

```
src/
├─ app/            Router de pantallas y shell (sesión, límite de tiempo, propuestas)
├─ ui/
│  ├─ components/  Pieza, Hueco, BotonGrande, TarjetaNivel, Tarjeta, StatTile, FilaForma
│  ├─ screens/     Las 13 pantallas del plan
│  ├─ tokens.ts    Colores, tipografía y radios exportados del .pen
│  └─ styles.css
├─ game/           Phaser
│  ├─ BoardScene   Arrastre, imán al hueco, encaje, partículas, pistas y fin de nivel
│  ├─ shapes.ts    Geometría de las formas, compartida por React (SVG) y Phaser
│  ├─ mascots.ts   Tortuga, león, manzana, cesta y árbol con primitivas
│  ├─ audio.ts     Efectos sintetizados (WebAudio) y voz en español
│  └─ bus.ts       Bus mínimo React ↔ Phaser
├─ data/           IndexedDB, eventos, progreso, reportes y dificultad adaptativa
└─ levels/         Definición declarativa de los ocho niveles
```

Añadir un nivel es escribir un objeto en [src/levels/levels.ts](src/levels/levels.ts):
mascota, lista de huecos con su posición y lista de piezas. No hace falta código nuevo.

Las tres mecánicas del tablero de Phaser (forma geométrica, objeto→sombra y seriación por
tamaño) usan el mismo motor: cada pieza y cada hueco llevan una `key` y encajan cuando
coinciden.

Los niveles con tablero propio en SVG —*Cuenta y une*, *Cuenta frutas* y el *Puzzle* del
leoncito— siguen esa misma regla de `key` y emiten los mismos eventos de bus, así que
estrellas, pistas y reportes funcionan sin tocar nada. En el puzzle las cuatro piezas son
recortes del mismo dibujo ([src/ui/components/Leon.tsx](src/ui/components/Leon.tsx)): cambiar
el león por otro animal es cambiar ese archivo.

*Cuenta y une* (06) y *Cuenta frutas* (08) comparten tablero (`ContarBoard`) y geometría
(`CONTAR`): sólo cambia el dibujo de la tarjeta izquierda, la mano
([Mano.tsx](src/ui/components/Mano.tsx)) o el grupo de frutas
([Fruits.tsx](src/ui/components/Fruits.tsx)).

## Lo que registra y cómo se adapta

Todo se guarda en IndexedDB, en el dispositivo: sin cuentas, sin servidor y sin datos
personales. La Zona de padres exporta el historial a JSON y lo borra por completo.

Los eventos (`piece_matched`, `piece_missed`, `hint_shown`, `shape_tapped`…) alimentan las
tres pantallas de reportes y la propuesta de ejercicio. Las reglas están en
[src/data/adaptive.ts](src/data/adaptive.ts) y a la vista del adulto en la pantalla 13:
sube con más del 85 % de acierto dos veces seguidas y sin pistas; baja con menos del 50 %
o más de dos pistas. La app propone, el adulto aprueba; el nivel aprobado ocupa la tarjeta
**Próximo** del mapa.

## Decisiones que se apartan del plan

- **Phaser cubre tablero, texto de ayuda y bandeja**, no solo el tablero. Arrastrar de una
  bandeja en DOM a un tablero en canvas obliga a sincronizar dos sistemas de coordenadas y
  de eventos táctiles; con todo el área de juego en el canvas el arrastre es un solo gesto.
  El resto de la pantalla (barra superior, consigna y las demás pantallas) sigue en React.
- **Mascotas y formas dibujadas con primitivas**, no con ilustraciones: el juego arranca sin
  descargar assets. Es el paso 2 de § 8 cuando existan las ilustraciones propias.
- **Sonido sintetizado con WebAudio y voz del navegador** (`speechSynthesis`, es-ES) en vez
  de locuciones grabadas. Es el paso 4 de § 8; `src/game/audio.ts` es el único punto a
  cambiar cuando estén los archivos.
- **La tarjeta "Próximo" aparece atenuada con la etiqueta *Pronto*** mientras el adulto no
  haya activado ningún ejercicio. El plan la describe ya poblada; sin propuesta aprobada no
  hay nivel que abrir.
- **El nivel generado se titula "Tu reto"** y lleva la etiqueta *Para ti*, para que título y
  etiqueta no digan lo mismo en la misma tarjeta.
- **Sin PWA todavía**: § 7 la sitúa después ("se envuelve después como PWA").

## Verificado

Recorrido completo en Chromium a 390×844: portada, mapa, los cinco niveles, nivel 1 jugado
hasta el final con tres estrellas, pantalla de éxito, Zona de padres, los tres reportes con
datos reales, propuesta de ejercicio, activación y partida del nivel generado. Sin errores
de consola.
