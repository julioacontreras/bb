import { BotonGrande } from '../components/base'
import { Pieza } from '../components/Pieza'
import { color } from '../tokens'
import type { Nav } from '../../app/routes'
import { startMusic, unlockAudio } from '../../game/audio'

const flotantes = [
  { shape: 'estrella', top: '14%', left: '8%', rot: -14 },
  { shape: 'triangulo', top: '20%', right: '9%', rot: 12 },
  { shape: 'circulo', top: '60%', left: '6%', rot: 0 },
  { shape: 'corazon', top: '66%', right: '8%', rot: -8 },
] as const

/** 01 · Inicio */
export function Inicio({ nav }: { nav: Nav }) {
  const jugar = () => {
    unlockAudio()
    startMusic()
    nav({ name: 'mapa' })
  }

  return (
    <div className="screen inicio">
      <div className="inicio__flotantes">
        {flotantes.map((f, i) => (
          <span
            key={i}
            className="inicio__flotante"
            style={
              {
                top: f.top,
                left: 'left' in f ? f.left : undefined,
                right: 'right' in f ? f.right : undefined,
                '--rot': `${f.rot}deg`,
                animationDelay: `${i * 0.6}s`,
              } as React.CSSProperties
            }
          >
            <Pieza shape={f.shape} size={58} />
          </span>
        ))}
      </div>

      <h1 className="inicio__titulo">
        FORMAS
        <span>Divertidas</span>
      </h1>

      <div className="inicio__halo" aria-hidden>
        🐢
      </div>

      <BotonGrande onClick={jugar} bg={color.sun} style={{ width: 230, marginTop: 8 }}>
        JUGAR
      </BotonGrande>

      <button
        className="enlace-suave"
        onClick={() => {
          unlockAudio()
          nav({ name: 'padres' })
        }}
        style={{ marginTop: 6 }}
      >
        <span aria-hidden>🔒</span> Zona de padres
      </button>
    </div>
  )
}
