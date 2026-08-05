import { Estrellas } from './base'

/** `component/Tarjeta Nivel`: avatar, badge numerado, título y estrellas. */
export function TarjetaNivel({
  numero,
  emoji,
  titulo,
  avatarColor,
  estrellas,
  paraTi = false,
  onClick,
}: {
  numero: number | string
  emoji: string
  titulo: string
  avatarColor: string
  estrellas: number
  /** Nivel propuesto por la app: destello ✨ y etiqueta "Para ti" en vez de estrellas. */
  paraTi?: boolean
  onClick: () => void
}) {
  return (
    <button className="tarjeta-nivel" onClick={onClick}>
      <span className={`tarjeta-nivel__badge${paraTi ? ' tarjeta-nivel__badge--nuevo' : ''}`}>
        {paraTi ? '✨' : numero}
      </span>
      <span className="tarjeta-nivel__avatar" style={{ background: avatarColor }} aria-hidden>
        {emoji}
      </span>
      <span className="tarjeta-nivel__titulo">{titulo}</span>
      {paraTi ? <span className="para-ti">Para ti</span> : <Estrellas n={estrellas} />}
    </button>
  )
}
