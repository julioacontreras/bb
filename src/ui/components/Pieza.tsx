import { svgPoints, type ShapeName } from '../../game/shapes'
import { shapeColor } from '../../levels/levels'
import { color } from '../tokens'

/** `component/Pieza` del .pen: ficha tipo sticker con borde blanco de 5 px. */
export function Pieza({
  shape,
  size = 52,
  fill,
  rotation = 0,
}: {
  shape: ShapeName
  size?: number
  fill?: string
  rotation?: number
}) {
  const c = fill ?? shapeColor[shape]
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined, overflow: 'visible' }}
      aria-hidden
    >
      {shape === 'circulo' ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 3}
          fill={c}
          stroke={color.white}
          strokeWidth={5}
        />
      ) : (
        <polygon
          points={svgPoints(shape, size - 6)}
          transform={`translate(3 3)`}
          fill={c}
          stroke={color.white}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
