import { color } from '../ui/tokens'
import { shapeLabel, type ShapeName } from '../game/shapes'
import { nivelContar, numeroNombre } from './contar'
import { nivelPuzzle, trozoNombre } from './puzzle'
import type { Hole, LevelDef, Piece } from './types'

/** Color canónico de cada forma (§ 2 del plan). */
export const shapeColor: Record<ShapeName, string> = {
  estrella: color.sun,
  triangulo: color.pink,
  circulo: color.blue,
  pentagono: color.green,
  cuadrado: color.purple,
  corazon: color.red,
  rectangulo: color.orange,
}

/** Una pieza de forma geométrica: la key es la propia forma. */
export function shapePiece(shape: ShapeName, size = 62): Piece {
  return {
    id: shape,
    key: shape,
    size,
    color: shapeColor[shape],
    visual: { kind: 'shape', shape },
    say: `¡${shapeLabel[shape]}!`,
    metric: shape,
  }
}

export function shapeHole(shape: ShapeName, x: number, y: number, size = 66): Hole {
  return { id: `h-${shape}`, key: shape, x, y, size, visual: { kind: 'shape', shape } }
}

const nivel1: LevelDef = {
  id: 'tortuga',
  number: 1,
  title: 'Tortuga',
  mascot: 'tortuga',
  emoji: '🐢',
  avatarColor: color.green,
  mode: 'formas',
  prompt: 'Pon cada forma en su hueco',
  help: 'Arrastra las piezas al caparazón',
  bg: [color.bgSky, color.bgCream],
  magnet: 44,
  hintAfter: 15,
  holes: [
    shapeHole('estrella', 98, 130),
    shapeHole('triangulo', 175, 118),
    shapeHole('circulo', 252, 130),
    shapeHole('cuadrado', 136, 212),
    shapeHole('corazon', 214, 212),
  ],
  pieces: (['estrella', 'triangulo', 'circulo', 'cuadrado', 'corazon'] as ShapeName[]).map(
    (s) => shapePiece(s),
  ),
}

const nivel2: LevelDef = {
  id: 'leon',
  number: 2,
  title: 'León',
  mascot: 'leon',
  emoji: '🦁',
  avatarColor: color.sun,
  mode: 'formas',
  prompt: 'Ayuda al león con sus formas',
  help: 'Cuatro piezas para su carita',
  bg: ['#FFE7B8', color.bgCream],
  magnet: 44,
  hintAfter: 15,
  holes: [
    shapeHole('triangulo', 136, 132),
    shapeHole('pentagono', 214, 132),
    shapeHole('circulo', 136, 212),
    shapeHole('cuadrado', 214, 212),
  ],
  pieces: (['triangulo', 'pentagono', 'circulo', 'cuadrado'] as ShapeName[]).map((s) =>
    shapePiece(s),
  ),
}

const nivel3: LevelDef = {
  id: 'manzana',
  number: 3,
  title: 'Manzana',
  mascot: 'manzana',
  emoji: '🍎',
  avatarColor: color.red,
  mode: 'formas',
  prompt: 'Llena la manzana de formas',
  help: '¡Hoy conocemos el rectángulo!',
  bg: ['#FFD9D9', color.bgCream],
  magnet: 44,
  hintAfter: 15,
  holes: [
    shapeHole('cuadrado', 134, 146),
    shapeHole('circulo', 216, 146),
    shapeHole('triangulo', 134, 224),
    shapeHole('rectangulo', 216, 224),
  ],
  pieces: (['cuadrado', 'circulo', 'triangulo', 'rectangulo'] as ShapeName[]).map((s) =>
    shapePiece(s),
  ),
}

const frutas: { key: string; emoji: string; nombre: string; color: string }[] = [
  { key: 'pina', emoji: '🍍', nombre: 'piña', color: color.sun },
  { key: 'platano', emoji: '🍌', nombre: 'plátano', color: '#FFE066' },
  { key: 'naranja', emoji: '🍊', nombre: 'naranja', color: color.orange },
  { key: 'fresa', emoji: '🍓', nombre: 'fresa', color: color.red },
  { key: 'sandia', emoji: '🍉', nombre: 'sandía', color: color.pink },
  { key: 'uvas', emoji: '🍇', nombre: 'uvas', color: color.purple },
]

const nivel4: LevelDef = {
  id: 'frutas',
  number: 4,
  title: 'Frutas',
  mascot: 'cesta',
  emoji: '🧺',
  avatarColor: color.orange,
  mode: 'sombras',
  prompt: 'Busca la sombra de cada fruta',
  help: 'Cada fruta tiene su sombrita',
  bg: ['#E4F7D6', color.bgCream],
  magnet: 46,
  hintAfter: 15,
  holes: frutas.map((f, i) => ({
    id: `h-${f.key}`,
    key: f.key,
    x: 105 + (i % 3) * 70,
    y: 138 + Math.floor(i / 3) * 74,
    size: 62,
    visual: { kind: 'emoji', emoji: f.emoji } as const,
  })),
  pieces: frutas.map((f) => ({
    id: f.key,
    key: f.key,
    size: 42,
    color: f.color,
    visual: { kind: 'emoji', emoji: f.emoji } as const,
    say: `¡${f.nombre}!`,
    metric: f.key,
  })),
}

const tamanos = [
  { key: 'xl', size: 64, say: '¡la más grande!' },
  { key: 'l', size: 55, say: '¡grande!' },
  { key: 'm', size: 47, say: '¡mediana!' },
  { key: 's', size: 40, say: '¡pequeña!' },
  { key: 'xs', size: 34, say: '¡la más pequeña!' },
]

const nivel5: LevelDef = {
  id: 'tamanos',
  number: 5,
  title: 'Tamaños',
  mascot: 'arbol',
  emoji: '🌳',
  avatarColor: color.green,
  mode: 'tamanos',
  prompt: 'De la más grande a la más pequeña',
  help: 'Cada manzana tiene su rama',
  bg: ['#D6F0FF', color.bgCream],
  magnet: 40,
  hintAfter: 15,
  holes: tamanos.map((t, i) => ({
    id: `h-${t.key}`,
    key: t.key,
    x: [100, 192, 266, 134, 216][i],
    y: [132, 116, 142, 214, 208][i],
    size: t.size + 8,
    visual: { kind: 'shape', shape: 'circulo' } as const,
  })),
  pieces: tamanos.map((t) => ({
    id: t.key,
    key: t.key,
    size: t.size,
    color: color.red,
    visual: { kind: 'emoji', emoji: '🍎' } as const,
    say: t.say,
    metric: `tamano-${t.key}`,
  })),
}

export const LEVELS: LevelDef[] = [
  nivel1,
  nivel2,
  nivel3,
  nivel4,
  nivel5,
  nivelContar,
  nivelPuzzle,
]

/** Cómo se nombra cada métrica en los reportes del adulto. */
export const metricLabel: Record<string, string> = {
  ...shapeLabel,
  ...Object.fromEntries(frutas.map((f) => [f.key, f.nombre])),
  'tamano-xl': 'muy grande',
  'tamano-l': 'grande',
  'tamano-m': 'mediana',
  'tamano-s': 'pequeña',
  'tamano-xs': 'muy pequeña',
  ...Object.fromEntries(
    Object.entries(numeroNombre).map(([n, nombre]) => [`numero-${n}`, `número ${nombre}`]),
  ),
  ...Object.fromEntries(
    Object.entries(trozoNombre).map(([key, nombre]) => [`puzzle-${key}`, `puzzle: ${nombre}`]),
  ),
}

/** Emoji para las métricas que no son formas geométricas. */
export const metricEmoji: Record<string, string> = {
  ...Object.fromEntries(frutas.map((f) => [f.key, f.emoji])),
  'tamano-xl': '🍎',
  'tamano-l': '🍎',
  'tamano-m': '🍎',
  'tamano-s': '🍎',
  'tamano-xs': '🍎',
  ...Object.fromEntries(Object.keys(numeroNombre).map((n) => [`numero-${n}`, '✋'])),
  ...Object.fromEntries(Object.keys(trozoNombre).map((k) => [`puzzle-${k}`, '🧩'])),
}

export const levelById = (id: string): LevelDef | undefined =>
  LEVELS.find((l) => l.id === id)
