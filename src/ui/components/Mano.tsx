/**
 * `Mano` del .pen (nivel 06 · Cuenta y une): puño cartoon con contorno grueso
 * del que asoman tantos dedos como haya que contar.
 *
 * Las poses están calcadas de `14 Nivel 6 - Cuenta y Une`, con las mismas
 * coordenadas sobre un lienzo de 110×86. Ojo con los giros: en Pencil son
 * antihorarios y en SVG horarios, así que el signo va invertido.
 */

const SKIN = '#FFE0BE'
const INK = '#3A2A1C'
const CUFF = '#FFC98F'

/** Alturas por dedo, de índice a meñique: nunca todos iguales. */
const ALTO = [34, 38, 36, 32, 28]

export const MANO_W = 110
export const MANO_H = 86

/** El pulgar recogido sobre el puño. */
const PULGAR_RECOGIDO = { x: 20, y: 54, giro: 8 }

/** El pulgar estirado hacia fuera: es el quinto dedo de la mano de 5. */
const PULGAR_ESTIRADO = { x: 26.93, y: 72.33, giro: -136.48 }

interface Pose {
  /** x del primer dedo levantado. */
  x0: number
  /** Cuántos dedos se dibujan arriba (el pulgar va aparte). */
  dedos: number
  pulgar: typeof PULGAR_RECOGIDO
}

const POSES: Record<number, Pose> = {
  1: { x0: 33, dedos: 1, pulgar: PULGAR_RECOGIDO },
  2: { x0: 43, dedos: 2, pulgar: PULGAR_RECOGIDO },
  3: { x0: 36.5, dedos: 3, pulgar: PULGAR_RECOGIDO },
  4: { x0: 30, dedos: 4, pulgar: PULGAR_RECOGIDO },
  5: { x0: 26.5, dedos: 4, pulgar: PULGAR_ESTIRADO },
}

/** El dibujo suelto, para incrustarlo dentro de otro `svg` ya posicionado. */
export function ManoDibujo({ dedos }: { dedos: number }) {
  const pose = POSES[Math.min(5, Math.max(1, Math.round(dedos)))]!

  return (
    <g>
      <g fill={SKIN} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
        {ALTO.slice(0, pose.dedos).map((alto, i) => (
          <rect key={i} x={pose.x0 + i * 13} y={46 - alto} width={11} height={alto} rx={6} />
        ))}
        <rect x={40} y={72} width={34} height={18} rx={7} fill={CUFF} />
        <rect x={23} y={40} width={64} height={40} rx={19} />
        <rect
          x={pose.pulgar.x}
          y={pose.pulgar.y}
          width={33}
          height={16}
          rx={8}
          transform={`rotate(${pose.pulgar.giro} ${pose.pulgar.x} ${pose.pulgar.y})`}
        />
      </g>
      <path
        d="M64 48q6 8 0 16m12-14q5 7 0 13"
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  )
}

/** La mano como imagen independiente (mapa, reportes…). */
export function Mano({ dedos, width = MANO_W }: { dedos: number; width?: number }) {
  return (
    <svg
      width={width}
      height={(width * MANO_H) / MANO_W}
      viewBox={`0 0 ${MANO_W} ${MANO_H}`}
      role="img"
      aria-label={`Mano con ${dedos} ${dedos === 1 ? 'dedo' : 'dedos'}`}
    >
      <ManoDibujo dedos={dedos} />
    </svg>
  )
}
