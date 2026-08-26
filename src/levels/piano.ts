import { color } from '../ui/tokens'
import type { LevelDef } from './types'

/**
 * Nivel 11 · Piano: 6 teclas de colores, cada una con una nota musical
 * distinta (do–la). Tocar una tecla hace sonar su tono; el nivel se completa
 * al haber tocado las 6 notas. No usa tablero de Phaser: lo pinta `PianoBoard`.
 */

export interface NotaPiano {
  key: string
  nombre: string
  /** Frecuencia del tono en Hz (octava 5, la misma zona que la música de fondo). */
  freq: number
  color: string
}

export const PIANO_NOTAS: NotaPiano[] = [
  { key: 'do', nombre: 'do', freq: 523.25, color: '#FF8A80' },
  { key: 're', nombre: 're', freq: 587.33, color: '#FFB74D' },
  { key: 'mi', nombre: 'mi', freq: 659.25, color: '#FFD54F' },
  { key: 'fa', nombre: 'fa', freq: 698.46, color: '#AED581' },
  { key: 'sol', nombre: 'sol', freq: 783.99, color: '#64B5F6' },
  { key: 'la', nombre: 'la', freq: 880.0, color: '#B39DDB' },
]

export const nivelPiano: LevelDef = {
  id: 'piano',
  number: 11,
  title: 'Piano',
  mascot: null,
  emoji: '🎹',
  avatarColor: color.purple,
  mode: 'piano',
  prompt: '¡Toca las teclas del piano!',
  help: 'Cada tecla suena con una nota distinta',
  bg: ['#E3E9FF', color.bgCream],
  magnet: 0,
  hintAfter: 18,
  rationale:
    'Explorar las teclas asocia cada color con un sonido distinto: se entrena la discriminación auditiva y la relación causa-efecto, y de paso se descubren los nombres de las notas.',
  holes: [],
  pieces: PIANO_NOTAS.map((n) => ({
    id: n.key,
    key: n.key,
    size: 56,
    color: n.color,
    visual: { kind: 'emoji', emoji: '🎵' } as const,
    say: `¡${n.nombre}!`,
    metric: `piano-${n.key}`,
  })),
}
