import { LEVELS } from '../../levels/levels'
import { totalStars, useProgress } from '../../data/progress'
import { TarjetaNivel } from '../components/TarjetaNivel'
import { chartColor, color } from '../tokens'
import type { Nav } from '../../app/routes'

/** 02 · Mapa de niveles */
export function Mapa({ nav }: { nav: Nav }) {
  const progress = useProgress()
  const generado = progress.generated
  const jugado = generado ? (progress.stars[generado.id] ?? 0) > 0 : false

  return (
    <div className="screen screen--scroll">
      <div className="fila">
        <h1 className="mapa__saludo">
          ¡Hola!
          <span>Elige un juego</span>
        </h1>
        <div className="stat" style={{ flex: 'none', padding: '10px 14px' }}>
          <div className="stat__valor" style={{ color: color.sun }}>
            ★ {totalStars(progress)}
          </div>
        </div>
      </div>

      <div className="mapa__rejilla">
        {LEVELS.map((level) => (
          <TarjetaNivel
            key={level.id}
            numero={level.number}
            emoji={level.emoji}
            titulo={level.title}
            avatarColor={level.avatarColor}
            estrellas={progress.stars[level.id] ?? 0}
            onClick={() => nav({ name: 'nivel', levelId: level.id })}
          />
        ))}

        {generado ? (
          <TarjetaNivel
            numero={generado.number}
            emoji={generado.emoji}
            titulo={generado.title}
            avatarColor={generado.avatarColor}
            estrellas={progress.stars[generado.id] ?? 0}
            paraTi={!jugado}
            onClick={() => nav({ name: 'nivel', levelId: generado.id })}
          />
        ) : (
          <div className="tarjeta-nivel" style={{ opacity: 0.5 }} aria-disabled>
            <span className="tarjeta-nivel__badge tarjeta-nivel__badge--nuevo">✨</span>
            <span
              className="tarjeta-nivel__avatar"
              style={{ background: chartColor.track }}
              aria-hidden
            >
              🎁
            </span>
            <span className="tarjeta-nivel__titulo">Próximo</span>
            <span className="para-ti" style={{ color: color.inkSoft }}>
              Pronto
            </span>
          </div>
        )}
      </div>

      <button className="enlace-suave" onClick={() => nav({ name: 'inicio' })}>
        <span aria-hidden>←</span> Volver
      </button>
    </div>
  )
}
