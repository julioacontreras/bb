import { color } from '../ui/tokens'
import type { LevelDef } from './types'

/**
 * Nivel 10 · Atrapa al ratón: 6 agujeros en una rejilla de 2×3 y un ratón que
 * asoma por uno al azar. Tocarlo a tiempo suma un punto; con 20 puntos se
 * completa el nivel. No usa tablero de Phaser: lo pinta `ToposBoard`.
 */

/** Puntos necesarios para completar el nivel. */
export const TOPOS_META = 20

/** Cuántos agujeros tiene el tablero (rejilla de 2×3). */
export const TOPOS_HOYOS = 6

export const nivelTopos: LevelDef = {
  id: 'topos',
  number: 10,
  title: 'Atrapa al ratón',
  mascot: null,
  emoji: '🐭',
  avatarColor: color.blue,
  mode: 'topos',
  prompt: '¡Toca al ratón cuando aparezca!',
  help: 'El ratón sale de un agujero al azar: ¡tócalo rápido!',
  bg: ['#DFF5C8', color.bgCream],
  magnet: 0,
  hintAfter: 18,
  rationale:
    'Tocar al ratón justo cuando asoma entrena la atención sostenida y la velocidad de reacción: hay que mirar los seis agujeros a la vez y responder en el momento oportuno.',
  holes: [],
  // Una sola "pieza": cada golpe acertado cuenta como un acierto de esta métrica.
  pieces: [
    {
      id: 'raton',
      key: 'raton',
      size: 64,
      color: color.sun,
      visual: { kind: 'emoji', emoji: '🐭' } as const,
      say: '¡Ratón!',
      metric: 'topo-raton',
    },
  ],
}
