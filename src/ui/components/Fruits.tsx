import type { ReactElement } from 'react'

/**
 * Fruit groups for level 08 · Cuenta las frutas.
 *
 * Every fruit is traced from `16 Nivel 8 - Frutas y Numeros` in the .pen, on the
 * same 110×86 canvas the hand of level 06 uses, so both share the card geometry
 * in `CONTAR`. Pencil rotations are counter-clockwise and SVG ones clockwise,
 * so the sign is flipped here.
 */

export const FRUIT_W = 110
export const FRUIT_H = 86

export type FruitName = 'manzana' | 'fresa' | 'platano' | 'naranja' | 'sandia'

/** Spoken and written name, always singular. */
export const fruitName: Record<FruitName, string> = {
  manzana: 'manzana',
  fresa: 'fresa',
  platano: 'plátano',
  naranja: 'naranja',
  sandia: 'sandía',
}

export const fruitPlural: Record<FruitName, string> = {
  manzana: 'manzanas',
  fresa: 'fresas',
  platano: 'plátanos',
  naranja: 'naranjas',
  sandia: 'sandías',
}

export const fruitEmoji: Record<FruitName, string> = {
  manzana: '🍎',
  fresa: '🍓',
  platano: '🍌',
  naranja: '🍊',
  sandia: '🍉',
}

const LEAF = '#3FA34D'
const LEAF_LIGHT = '#4CAF50'
const FLESH = '#E8433F'
const SHINE = 'rgba(255, 255, 255, 0.5)'

/** Tile size and horizontal gap of each fruit, in canvas units. */
const TILE: Record<FruitName, { w: number; h: number; gap: number }> = {
  manzana: { w: 26, h: 28, gap: 10 },
  fresa: { w: 24, h: 28, gap: 6 },
  platano: { w: 27, h: 24, gap: 3 },
  naranja: { w: 34, h: 36, gap: 0 },
  sandia: { w: 28, h: 20, gap: 8 },
}

const ROW_GAP = 6

/** How many fruits go on each row: never a lone one hanging below. */
const ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
}

const Apple = () => (
  <g>
    <rect x={12} y={0} width={3} height={8} rx={1.5} fill="#7A4B2A" />
    <g transform="rotate(20 14 1)">
      <ellipse cx={19.5} cy={4.5} rx={5.5} ry={3.5} fill={LEAF} />
    </g>
    <ellipse cx={13} cy={17.5} rx={12} ry={10.5} fill={FLESH} />
    <ellipse cx={9} cy={13} rx={3} ry={2} fill={SHINE} />
  </g>
)

const Strawberry = () => (
  <g>
    <path
      d="M12 4c7 0 11 5 10 11-1 7-6 13-10 13S3 22 2 15C1 9 5 4 12 4Z"
      fill={FLESH}
    />
    <g fill="#FFE7A3">
      <ellipse cx={8.25} cy={13.75} rx={1.25} ry={1.75} />
      <ellipse cx={15.25} cy={14.75} rx={1.25} ry={1.75} />
      <ellipse cx={11.25} cy={20.75} rx={1.25} ry={1.75} />
    </g>
    <path d="M12 0 21 9H3Z" fill={LEAF_LIGHT} />
  </g>
)

const Banana = () => (
  <g transform="scale(0.9 1)">
    <path
      d="M3 3C2 15 12 23 27 20 15 19 9 12 9 3 7 1 4 1 3 3Z"
      fill="#FFD84D"
      stroke="#E0A320"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </g>
)

const Orange = () => (
  <g>
    <g transform="rotate(15 18 0)">
      <ellipse cx={25} cy={4} rx={7} ry={4} fill={LEAF} />
    </g>
    <ellipse cx={17} cy={21} rx={15} ry={15} fill="#FF9E2C" />
    <ellipse cx={11.5} cy={14.5} rx={3.5} ry={2.5} fill={SHINE} />
  </g>
)

const Watermelon = () => (
  <g>
    <path d="M0 2c0 11 6 18 14 18s14-7 14-18Z" fill={LEAF} />
    <path d="M3 4c0 9 5 13 11 13s11-4 11-13Z" fill={FLESH} />
    <g fill="#2B2118">
      <ellipse cx={9.25} cy={8.75} rx={1.25} ry={1.75} />
      <ellipse cx={18.25} cy={8.75} rx={1.25} ry={1.75} />
      <ellipse cx={13.75} cy={12.75} rx={1.25} ry={1.75} />
    </g>
  </g>
)

const DRAWING: Record<FruitName, () => ReactElement> = {
  manzana: Apple,
  fresa: Strawberry,
  platano: Banana,
  naranja: Orange,
  sandia: Watermelon,
}

/** Loose drawing, to embed inside an already positioned `svg`. */
export function FruitGroupDrawing({ fruit, count }: { fruit: FruitName; count: number }) {
  const tile = TILE[fruit]
  const rows = ROWS[Math.min(5, Math.max(1, Math.round(count)))]!
  const Fruit = DRAWING[fruit]

  const blockH = rows.length * tile.h + (rows.length - 1) * ROW_GAP
  const top = (FRUIT_H - blockH) / 2

  return (
    <g>
      {rows.map((cols, row) => {
        const rowW = cols * tile.w + (cols - 1) * tile.gap
        const left = (FRUIT_W - rowW) / 2
        const y = top + row * (tile.h + ROW_GAP)
        return (
          <g key={row}>
            {Array.from({ length: cols }, (_, col) => (
              <g key={col} transform={`translate(${left + col * (tile.w + tile.gap)} ${y})`}>
                <Fruit />
              </g>
            ))}
          </g>
        )
      })}
    </g>
  )
}

/** The group as a standalone image (map, reports…). */
export function FruitGroup({
  fruit,
  count,
  width = FRUIT_W,
}: {
  fruit: FruitName
  count: number
  width?: number
}) {
  return (
    <svg
      width={width}
      height={(width * FRUIT_H) / FRUIT_W}
      viewBox={`0 0 ${FRUIT_W} ${FRUIT_H}`}
      role="img"
      aria-label={`${count} ${count === 1 ? fruitName[fruit] : fruitPlural[fruit]}`}
    >
      <FruitGroupDrawing fruit={fruit} count={count} />
    </svg>
  )
}
