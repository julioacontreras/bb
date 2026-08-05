/**
 * Tokens exportados del `.pen` (docs/screens.pen).
 * Fuente de verdad única: cualquier color usado en React o en Phaser sale de aquí.
 */

export const color = {
  sun: '#FFC93C',
  pink: '#FF6FA5',
  blue: '#3FB0F5',
  green: '#6FCF6B',
  purple: '#A66DD4',
  red: '#FF5C5C',
  orange: '#FF9F45',
  ink: '#4A3728',
  inkSoft: '#8C7A66',
  white: '#FFFFFF',
  bgCream: '#FFF7E8',
  bgSky: '#CDEEFF',
} as const

/** Pasos oscuros para marcas de datos (§ 6: los del juego son demasiado claros). */
export const chartColor = {
  blue: '#1668A8',
  amber: '#B87A0E',
  good: '#2F8A3C',
  alert: '#C0392B',
  track: '#E8DFD1',
} as const

export const font = {
  round: '"Baloo 2", system-ui, sans-serif',
} as const

export const radius = {
  pill: 999,
  card: 26,
  piece: 18,
} as const

export const padScreen = 20

/** Mismo hex pero como número, que es lo que consume Phaser. */
export const hex = (c: string): number => parseInt(c.slice(1), 16)

export type ColorName = keyof typeof color
