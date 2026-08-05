import { useEffect } from 'react'
import { BotonGrande, Confeti } from '../components/base'
import { color } from '../tokens'
import { say } from '../../game/audio'
import type { LevelDef } from '../../levels/types'
import type { Nav } from '../../app/routes'

/** 08 · ¡Bien hecho! */
export function Exito({
  level,
  stars,
  nav,
}: {
  level: LevelDef
  stars: number
  nav: Nav
}) {
  useEffect(() => {
    say('¡Bien hecho!')
  }, [])

  return (
    <div className="screen exito">
      <Confeti />
      <div className="exito__estrellas" aria-label={`${stars} estrellas`}>
        {'⭐'.repeat(stars)}
      </div>
      <div style={{ fontSize: 92 }} aria-hidden>
        {level.emoji}
      </div>
      <h1 className="exito__titulo">¡BIEN HECHO!</h1>
      <p style={{ fontSize: 19, fontWeight: 600, color: color.inkSoft, margin: 0 }}>
        Completaste {level.generated ? 'tu ejercicio' : `la ${level.title.toLowerCase()}`}
      </p>

      <BotonGrande
        bg={color.green}
        onClick={() => nav({ name: 'mapa' })}
        style={{ width: 230, marginTop: 14 }}
      >
        SEGUIR
      </BotonGrande>
      <button
        className="enlace-suave"
        onClick={() => nav({ name: 'nivel', levelId: level.id })}
        style={{ marginTop: 4 }}
      >
        <span aria-hidden>↻</span> Jugar otra vez
      </button>
    </div>
  )
}
