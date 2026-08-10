import { color } from '../ui/tokens'
import { fruitName, fruitPlural, type FruitName } from '../ui/components/Fruits'
import { CONTAR, numeroColor, numeroNombre, rowCenterY } from './contar'
import type { LevelDef } from './types'

/**
 * Level 08 · Cuenta las frutas. Same board as level 06 (`ContarBoard`): fruit
 * cards on the left, digits on the right, one dot between them. Counting a
 * group scattered over two rows is harder than counting fingers in a line, so
 * this level comes after the hands.
 *
 * Geometry is shared with level 06 through `CONTAR`.
 */

/** Which fruit stands for each amount: one shape per digit, easy to name. */
const GROUPS: { fruit: FruitName; count: number }[] = [
  { fruit: 'naranja', count: 1 },
  { fruit: 'manzana', count: 2 },
  { fruit: 'platano', count: 3 },
  { fruit: 'sandia', count: 4 },
  { fruit: 'fresa', count: 5 },
]

export const fruitByCount: Record<number, FruitName> = Object.fromEntries(
  GROUPS.map((g) => [g.count, g.fruit]),
)

const NUMBERS = [1, 2, 3, 4, 5]

/** Card order: no group sits in front of its own digit (like the .pen). */
const ORDER = [2, 5, 3, 1, 4]

export const levelFruitCount: LevelDef = {
  id: 'frutas-numero',
  number: 8,
  title: 'Cuenta frutas',
  mascot: null,
  emoji: '🍓',
  avatarColor: color.red,
  mode: 'contar',
  prompt: 'Une las frutas con su número',
  help: 'Cuenta las frutas y arrastra hasta el número',
  bg: ['#FFE0E0', color.bgCream],
  magnet: 0,
  hintAfter: 18,
  rationale:
    'Contar frutas repartidas en dos filas obliga a llevar la cuenta sin apoyarse en el orden, el paso siguiente a contar dedos.',
  holes: NUMBERS.map((n, i) => ({
    id: `fruta-num-${n}`,
    key: `f${n}`,
    x: CONTAR.puntoNumero,
    y: rowCenterY(i),
    size: CONTAR.cardH,
    visual: { kind: 'numero', n } as const,
  })),
  pieces: ORDER.map((count) => {
    const fruit = fruitByCount[count]!
    return {
      id: `frutas-${count}`,
      key: `f${count}`,
      size: CONTAR.cardH,
      color: numeroColor[count]!,
      visual: { kind: 'fruits', fruit, count } as const,
      say:
        count === 1
          ? `¡una ${fruitName[fruit]}!`
          : `¡${numeroNombre[count]} ${fruitPlural[fruit]}!`,
      metric: `frutas-${count}`,
    }
  }),
}
