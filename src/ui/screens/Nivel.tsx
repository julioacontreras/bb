import { useEffect, useState } from 'react'
import { PhaserBoard } from '../../game/PhaserBoard'
import { ContarBoard } from '../../game/ContarBoard'
import { on } from '../../game/bus'
import { say } from '../../game/audio'
import { log } from '../../data/events'
import { recordStars } from '../../data/progress'
import { BotonRedondo } from '../components/base'
import type { LevelDef } from '../../levels/types'
import type { Nav } from '../../app/routes'

/** 03–07 · Pantalla de nivel. Un solo componente parametrizado por `LevelDef`. */
export function Nivel({ level, nav }: { level: LevelDef; nav: Nav }) {
  const [placed, setPlaced] = useState(0)

  useEffect(() => {
    setPlaced(0)
    log({ type: 'level_started', level: level.id })
    say(level.prompt)

    const off = [
      on('shapeTapped', (e) =>
        log({
          type: 'shape_tapped',
          level: level.id,
          shape: e.metric,
          color: e.color,
          spoke: e.spoke,
        }),
      ),
      on('pieceMatched', (e) => {
        setPlaced(e.placed)
        log({ type: 'piece_matched', level: level.id, shape: e.metric, ms: e.ms })
      }),
      on('pieceDropped', (e) =>
        log({ type: 'piece_missed', level: level.id, shape: e.metric, droppedOn: e.on }),
      ),
      on('hintShown', (e) => log({ type: 'hint_shown', level: level.id, shape: e.metric })),
      on('levelCompleted', (e) => {
        log({
          type: 'level_completed',
          level: level.id,
          durationMs: e.ms,
          stars: e.stars,
        })
        recordStars(level.id, e.stars)
        nav({ name: 'exito', levelId: level.id, stars: e.stars })
      }),
    ]
    return () => off.forEach((fn) => fn())
  }, [level, nav])

  return (
    <div
      className="screen nivel"
      style={{ background: `linear-gradient(180deg, ${level.bg[0]} 0%, ${level.bg[1]} 55%)` }}
    >
      <div className="nivel__barra">
        <BotonRedondo icon="←" label="Volver al mapa" onClick={() => nav({ name: 'mapa' })} />
        <div className="nivel__puntos" aria-label={`${placed} de ${level.pieces.length}`}>
          {level.pieces.map((p, i) => (
            <span key={p.id} className={`punto${i < placed ? ' punto--on' : ''}`} />
          ))}
        </div>
        <BotonRedondo icon="🔊" label="Repetir la consigna" onClick={() => say(level.prompt)} />
      </div>

      <button className="consigna" onClick={() => say(level.prompt)}>
        <span aria-hidden>🗣️</span>
        {level.prompt}
      </button>

      {level.mode === 'contar' ? (
        <>
          <ContarBoard level={level} />
          <p className="nivel__ayuda">{level.help}</p>
        </>
      ) : (
        <PhaserBoard level={level} />
      )}
    </div>
  )
}
