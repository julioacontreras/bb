import type { ReactNode } from 'react'
import { color } from '../tokens'

/** `component/Boton Grande`: cápsula con icono + etiqueta y borde inferior 3D. */
export function BotonGrande({
  children,
  icon,
  onClick,
  bg = color.sun,
  small = false,
  style,
}: {
  children: ReactNode
  icon?: string
  onClick?: () => void
  bg?: string
  small?: boolean
  style?: React.CSSProperties
}) {
  return (
    <button
      className={`boton-grande${small ? ' boton-grande--sm' : ''}`}
      style={{ background: bg, ...style }}
      onClick={onClick}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  )
}

export function BotonRedondo({
  icon,
  onClick,
  label,
}: {
  icon: string
  onClick?: () => void
  label: string
}) {
  return (
    <button className="boton-redondo" onClick={onClick} aria-label={label}>
      <span aria-hidden>{icon}</span>
    </button>
  )
}

/** `component/Tarjeta`: contenedor de las pantallas del adulto. */
export function Tarjeta({
  titulo,
  children,
  aside,
  onClick,
}: {
  titulo?: string
  children?: ReactNode
  aside?: ReactNode
  onClick?: () => void
}) {
  const inner = (
    <>
      {(titulo || aside) && (
        <div className="fila">
          {titulo && <h2 className="tarjeta__titulo">{titulo}</h2>}
          {aside}
        </div>
      )}
      {children}
    </>
  )
  return onClick ? (
    <button className="tarjeta" onClick={onClick} style={{ textAlign: 'left' }}>
      {inner}
    </button>
  ) : (
    <section className="tarjeta">{inner}</section>
  )
}

/** `component/Stat Tile`: métrica con valor grande y etiqueta. */
export function StatTile({
  valor,
  etiqueta,
  tono = color.ink,
}: {
  valor: string | number
  etiqueta: string
  tono?: string
}) {
  return (
    <div className="stat">
      <div className="stat__valor" style={{ color: tono }}>
        {valor}
      </div>
      <div className="stat__etiqueta">{etiqueta}</div>
    </div>
  )
}

export function Switch({
  on,
  onToggle,
  label,
}: {
  on: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      className="switch"
      data-on={on}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
    />
  )
}

export function Segmentado<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="segmentado">
      {options.map((o) => (
        <button
          key={String(o.value)}
          data-on={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Estrellas({ n, total = 3 }: { n: number; total?: number }) {
  return (
    <div className="estrellas" aria-label={`${n} de ${total} estrellas`}>
      {'★'.repeat(n)}
      <span style={{ opacity: 0.22 }}>{'★'.repeat(Math.max(0, total - n))}</span>
    </div>
  )
}

export function Confeti({ n = 26 }: { n?: number }) {
  const tonos = [color.sun, color.pink, color.blue, color.green, color.purple, color.orange]
  return (
    <div className="confeti" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 97) % 100}%`,
            background: tonos[i % tonos.length],
            animationDelay: `${(i % 9) * 0.28}s`,
            animationDuration: `${2.2 + (i % 5) * 0.35}s`,
          }}
        />
      ))}
    </div>
  )
}
