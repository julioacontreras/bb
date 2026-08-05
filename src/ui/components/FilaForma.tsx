import { SHAPE_NAMES, type ShapeName } from '../../game/shapes'
import { chartColor } from '../tokens'
import { Pieza } from './Pieza'

/**
 * `component/Fila Forma`: ficha + nombre + barra + porcentaje.
 * La identidad la lleva la ficha, no el color de la barra: todas las barras usan
 * el mismo tono (§ 6 · reglas de gráfico).
 */
export function FilaForma({
  clave,
  nombre,
  pct,
  emoji,
}: {
  clave: string
  nombre: string
  /** 0–1 */
  pct: number
  emoji?: string
}) {
  const esForma = SHAPE_NAMES.includes(clave as ShapeName)
  return (
    <div className="fila-forma">
      {esForma ? (
        <Pieza shape={clave as ShapeName} size={30} />
      ) : (
        <span style={{ width: 30, fontSize: 24, textAlign: 'center' }} aria-hidden>
          {emoji ?? '⬤'}
        </span>
      )}
      <span className="fila-forma__nombre">{nombre}</span>
      <span className="fila-forma__pista">
        <span
          className="fila-forma__valor"
          style={{ width: `${Math.round(pct * 100)}%`, background: chartColor.blue }}
        />
      </span>
      <span className="fila-forma__pct">{Math.round(pct * 100)}%</span>
    </div>
  )
}
