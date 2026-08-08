/**
 * `component/Leon Puzzle` del .pen (nivel 07 · Puzzle): leoncito cartoon sobre un
 * lienzo cuadrado de 200×200, pensado para partirse en cuatro cuadrantes de 100.
 *
 * Las coordenadas están calcadas del componente de Pencil. Ojo con las elipses:
 * en Pencil se definen por su caja (x, y, ancho, alto) y en SVG por centro y
 * radios, así que aquí van ya convertidas.
 */

export const LEON_SIZE = 200
/** Lado de cada trozo del puzzle: el león se parte en 2×2. */
export const LEON_TROZO = LEON_SIZE / 2

const PIEL = '#F7D9A0'
const PIEL_BORDE = '#D8A96F'
const CARA = '#FBDCB0'
const MELENA = '#C9873C'
const MELENA_BORDE = '#A96F2E'
const TINTA = '#2B2118'

/** El dibujo suelto, para incrustarlo dentro de otro `svg` ya posicionado. */
export function LeonDibujo({ id = 'leon' }: { id?: string }) {
  const melena = `${id}-melena`
  return (
    <g>
      <defs>
        <linearGradient id={melena} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E5A85B" />
          <stop offset="1" stopColor={MELENA} />
        </linearGradient>
      </defs>

      <path
        d="M132 162C150 166 166 158 172 142"
        fill="none"
        stroke={MELENA_BORDE}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={180} cy={150} r={12} fill={MELENA} stroke={MELENA_BORDE} strokeWidth={3} />

      <ellipse cx={100} cy={151} rx={50} ry={47} fill={PIEL} stroke={PIEL_BORDE} strokeWidth={4} />
      <ellipse cx={73} cy={183} rx={19} ry={15} fill={PIEL} stroke={PIEL_BORDE} strokeWidth={4} />
      <ellipse cx={127} cy={183} rx={19} ry={15} fill={PIEL} stroke={PIEL_BORDE} strokeWidth={4} />

      <circle cx={100} cy={70} r={62} fill={`url(#${melena})`} stroke={MELENA_BORDE} strokeWidth={5} />
      <circle cx={49} cy={49} r={17} fill={MELENA} stroke={MELENA_BORDE} strokeWidth={4} />
      <circle cx={151} cy={49} r={17} fill={MELENA} stroke={MELENA_BORDE} strokeWidth={4} />

      <ellipse cx={100} cy={72} rx={46} ry={42} fill={CARA} stroke={PIEL_BORDE} strokeWidth={4} />
      <ellipse cx={82} cy={65} rx={8} ry={9} fill="#FFFFFF" />
      <ellipse cx={118} cy={65} rx={8} ry={9} fill="#FFFFFF" />
      <circle cx={82.5} cy={65.5} r={4.5} fill={TINTA} />
      <circle cx={118.5} cy={65.5} r={4.5} fill={TINTA} />
      <ellipse cx={68} cy={82.5} rx={8} ry={4.5} fill="#FF9EB5" />
      <ellipse cx={132} cy={82.5} rx={8} ry={4.5} fill="#FF9EB5" />

      <ellipse cx={100} cy={91} rx={16} ry={11} fill="#FFF8EC" stroke={PIEL_BORDE} strokeWidth={3} />
      <path d="M93 84h14l-7 9z" fill={TINTA} strokeLinejoin="round" stroke={TINTA} strokeWidth={2} />
      <path
        d="M87 95c0 9 11 9 13 2c2 7 13 7 13-2"
        fill="none"
        stroke={TINTA}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

/** El león completo como imagen independiente (mapa, reportes, pantalla de éxito). */
export function Leon({ width = LEON_SIZE }: { width?: number }) {
  return (
    <svg
      width={width}
      height={width}
      viewBox={`0 0 ${LEON_SIZE} ${LEON_SIZE}`}
      role="img"
      aria-label="Leoncito"
    >
      <LeonDibujo />
    </svg>
  )
}
