import type { ShapeName } from '../game/shapes'

export type MascotName = 'tortuga' | 'leon' | 'manzana' | 'cesta' | 'arbol'

/** Lo que se ve dentro de una pieza o dentro de la silueta de un hueco. */
export type Visual =
  | { kind: 'shape'; shape: ShapeName }
  | { kind: 'emoji'; emoji: string }
  /** Nivel de contar: la mano con `dedos` levantados. */
  | { kind: 'mano'; dedos: number }
  /** Nivel de contar: la cifra a la que hay que unirla. */
  | { kind: 'numero'; n: number }

export interface Hole {
  id: string
  /** Encaja la pieza cuya `key` coincide. */
  key: string
  /** Centro dentro del tablero de 350×350. */
  x: number
  y: number
  size: number
  visual: Visual
}

export interface Piece {
  id: string
  key: string
  size: number
  color: string
  visual: Visual
  /** Lo que dice la voz al tocarla. */
  say: string
  /** Cómo se agrupa en los reportes: forma geométrica, fruta o tamaño. */
  metric: string
}

export type LevelMode = 'formas' | 'sombras' | 'tamanos' | 'contar'

export interface LevelDef {
  id: string
  /** Número que se pinta en el badge de la tarjeta del mapa. */
  number: number
  title: string
  /** `null` en los niveles que no usan el tablero de Phaser. */
  mascot: MascotName | null
  /** Emoji del avatar de la tarjeta de nivel. */
  emoji: string
  avatarColor: string
  mode: LevelMode
  /** Consigna hablada y escrita. */
  prompt: string
  help: string
  /** Degradado de fondo de la pantalla [arriba, abajo]. */
  bg: [string, string]
  holes: Hole[]
  pieces: Piece[]
  /** Radio del imán al hueco correcto, en px. */
  magnet: number
  /** Segundos sin acierto antes de resaltar el hueco correcto. */
  hintAfter: number
  /** true en los niveles que propone la dificultad adaptativa. */
  generated?: boolean
  /** Explicación para el adulto (pantalla 13). */
  rationale?: string
}

export const BOARD_SIZE = 350
