import { color } from '../ui/tokens'
import type { LevelDef } from './types'

/**
 * Nivel 07 · Puzzle del leoncito. Arriba la rejilla de 2×2 con la silueta de
 * cada trozo; abajo la bandeja con las piezas desordenadas.
 *
 * La geometría vive aquí porque la comparten los datos del nivel (centro de
 * cada hueco) y el tablero que los pinta (`PuzzleBoard`).
 */
export const PUZZLE = {
  width: 350,
  height: 500,
  /** Lado de un trozo, tanto en la rejilla como en la bandeja. */
  lado: 104,
  gap: 8,
  /** Esquina superior izquierda de la rejilla. */
  rejillaX: 67,
  rejillaY: 6,
  /** Caja blanca de la bandeja. */
  bandeja: { x: 12, y: 252, w: 326, h: 244, r: 34 },
  bandejaX: 65,
  bandejaY: 268,
  bandejaGap: 12,
} as const

/** Esquina superior izquierda del hueco de la fila `f`, columna `c`. */
export const celda = (f: number, c: number) => ({
  x: PUZZLE.rejillaX + c * (PUZZLE.lado + PUZZLE.gap),
  y: PUZZLE.rejillaY + f * (PUZZLE.lado + PUZZLE.gap),
})

/** Esquina superior izquierda de la ranura `i` de la bandeja (2×2). */
export const ranura = (i: number) => ({
  x: PUZZLE.bandejaX + (i % 2) * (PUZZLE.lado + PUZZLE.bandejaGap),
  y: PUZZLE.bandejaY + Math.floor(i / 2) * (PUZZLE.lado + PUZZLE.bandejaGap),
})

/** Cada trozo se nombra por lo que se ve en él, no por su posición. */
const TROZOS = [
  { key: 'carita', fila: 0, col: 0, nombre: 'la carita' },
  { key: 'melena', fila: 0, col: 1, nombre: 'la melena' },
  { key: 'patitas', fila: 1, col: 0, nombre: 'las patitas' },
  { key: 'colita', fila: 1, col: 1, nombre: 'la colita' },
] as const

export const trozoNombre: Record<string, string> = Object.fromEntries(
  TROZOS.map((t) => [t.key, t.nombre]),
)

/** Orden de la bandeja: ninguna pieza cae en la ranura que imita a su hueco. */
const ORDEN = ['colita', 'carita', 'melena', 'patitas']

export const nivelPuzzle: LevelDef = {
  id: 'puzzle',
  number: 7,
  title: 'Puzzle',
  mascot: null,
  emoji: '🧩',
  avatarColor: color.orange,
  mode: 'puzzle',
  prompt: 'Arma el puzzle del leoncito',
  help: 'Arrastra cada trocito hasta su hueco',
  bg: ['#D9F0F7', color.bgCream],
  magnet: 56,
  hintAfter: 15,
  holes: TROZOS.map((t) => {
    const { x, y } = celda(t.fila, t.col)
    return {
      id: `h-${t.key}`,
      key: t.key,
      x: x + PUZZLE.lado / 2,
      y: y + PUZZLE.lado / 2,
      size: PUZZLE.lado,
      visual: { kind: 'trozo', fila: t.fila, col: t.col } as const,
    }
  }),
  pieces: ORDEN.map((key) => {
    const t = TROZOS.find((x) => x.key === key)!
    return {
      id: `p-${t.key}`,
      key: t.key,
      size: PUZZLE.lado,
      color: color.orange,
      visual: { kind: 'trozo', fila: t.fila, col: t.col } as const,
      say: `¡${t.nombre}!`,
      metric: `puzzle-${t.key}`,
    }
  }),
}
