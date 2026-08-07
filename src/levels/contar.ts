import { color } from '../ui/tokens'
import { MANO_H, MANO_W } from '../ui/components/Mano'
import type { LevelDef } from './types'

/**
 * Nivel 06 · Cuenta y une. Dos columnas: manos a la izquierda, cifras a la
 * derecha, y un punto entre ambas. El niño une cada mano con su número.
 *
 * La geometría vive aquí porque la comparten los datos del nivel (posición de
 * cada hueco) y el tablero que los pinta (`ContarBoard`).
 */
export const CONTAR = {
  width: 350,
  height: 510,
  cardW: MANO_W,
  cardH: MANO_H,
  /** Distancia vertical entre los bordes superiores de dos tarjetas. */
  pitch: 100,
  top: 12,
  manoX: 10,
  numeroX: 230,
  /** Centro X de los puntos de unión. */
  puntoMano: 143,
  puntoNumero: 207,
  puntoR: 7,
} as const

/** Borde superior de la fila `i`. */
export const rowY = (i: number): number => CONTAR.top + i * CONTAR.pitch

/** Centro vertical de la fila `i`: donde caen el punto y la línea. */
export const rowCenterY = (i: number): number => rowY(i) + CONTAR.cardH / 2

/** Cada cifra tiene su color, y la línea de unión lo hereda. */
export const numeroColor: Record<number, string> = {
  1: color.red,
  2: color.blue,
  3: color.green,
  4: color.pink,
  5: color.purple,
}

export const numeroNombre: Record<number, string> = {
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
}

const NUMEROS = [1, 2, 3, 4, 5]

/** Orden de las manos: ninguna queda enfrente de su propia cifra. */
const MANOS = [3, 5, 4, 1, 2]

export const nivelContar: LevelDef = {
  id: 'contar',
  number: 6,
  title: 'Contar',
  mascot: null,
  emoji: '✋',
  avatarColor: color.purple,
  mode: 'contar',
  prompt: 'Une cada mano con su número',
  help: 'Cuenta los dedos y arrastra hasta el número',
  bg: ['#FFE7F0', color.bgCream],
  magnet: 0,
  hintAfter: 18,
  holes: NUMEROS.map((n, i) => ({
    id: `num-${n}`,
    key: `n${n}`,
    x: CONTAR.puntoNumero,
    y: rowCenterY(i),
    size: CONTAR.cardH,
    visual: { kind: 'numero', n } as const,
  })),
  pieces: MANOS.map((dedos) => ({
    id: `mano-${dedos}`,
    key: `n${dedos}`,
    size: CONTAR.cardH,
    color: numeroColor[dedos]!,
    visual: { kind: 'mano', dedos } as const,
    say: `¡${numeroNombre[dedos]}!`,
    metric: `numero-${dedos}`,
  })),
}
