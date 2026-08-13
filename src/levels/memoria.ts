import { color } from '../ui/tokens'
import type { LevelDef } from './types'

/**
 * Nivel 09 · Memoria: 6 cartas boca abajo (3 parejas) en una rejilla de 2×3.
 * Se tocan dos cartas; si muestran el mismo dibujo se quedan a la vista.
 * No usa tablero de Phaser: lo pinta `MemoriaBoard` con HTML/CSS.
 */

export const MEM_PAIRS = [
  { key: 'manzana', emoji: '🍎', nombre: 'manzana', color: color.red },
  { key: 'estrella', emoji: '⭐', nombre: 'estrella', color: color.sun },
  { key: 'rana', emoji: '🐸', nombre: 'rana', color: color.green },
] as const

export const nivelMemoria: LevelDef = {
  id: 'memoria',
  number: 9,
  title: 'Memoria',
  mascot: null,
  emoji: '🎴',
  avatarColor: color.purple,
  mode: 'memoria',
  prompt: '¡Encuentra las parejas!',
  help: 'Toca dos cartas: si son iguales, se quedan a la vista',
  bg: ['#DCE9FF', color.bgCream],
  magnet: 0,
  hintAfter: 18,
  rationale:
    'Recordar dónde estaba cada dibujo mientras voltea cartas ejercita la memoria de trabajo, un paso más allá de emparejar formas que están siempre a la vista.',
  holes: [],
  // Una "pieza" por pareja: los puntos de progreso marcan parejas encontradas.
  pieces: MEM_PAIRS.map((p) => ({
    id: p.key,
    key: p.key,
    size: 64,
    color: p.color,
    visual: { kind: 'emoji', emoji: p.emoji } as const,
    say: `¡${p.nombre}!`,
    metric: `memoria-${p.key}`,
  })),
}
