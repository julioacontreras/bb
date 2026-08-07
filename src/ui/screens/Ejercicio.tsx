import { useEffect, useMemo } from 'react'
import { BotonGrande, Segmentado, Tarjeta } from '../components/base'
import { Pieza } from '../components/Pieza'
import { Mano } from '../components/Mano'
import { chartColor, color } from '../tokens'
import { setProgress, useProgress, type Difficulty } from '../../data/progress'
import { useReport } from '../../data/useReport'
import { propose } from '../../data/adaptive'
import { metricLabel } from '../../levels/levels'
import type { Nav } from '../../app/routes'

/** 13 · Ejercicio recomendado — la app propone, el padre aprueba. */
export function Ejercicio({ nav }: { nav: Nav }) {
  const progress = useProgress()
  const report = useReport([])

  const propuesta = useMemo(
    () =>
      report ? (progress.proposal ?? propose(report, progress)?.level ?? null) : null,
    [report, progress],
  )

  /** Es "nuevo" lo que todavía no ha practicado nunca. */
  const practicadas = useMemo(
    () => new Set((report?.shapes ?? []).filter((s) => s.attempts > 0).map((s) => s.key)),
    [report],
  )

  // Abrir la pantalla cuenta como revisar el aviso.
  useEffect(() => {
    if (!progress.proposalSeen) setProgress({ proposalSeen: true })
  }, [progress.proposalSeen])

  const level = propuesta

  const activar = () => {
    if (!level) return
    setProgress({
      generated: level,
      generatedCount: progress.generatedCount + 1,
      proposal: null,
      proposalSeen: true,
    })
    nav({ name: 'mapa' })
  }

  return (
    <div className="screen screen--scroll adulto">
      <button className="enlace-suave" onClick={() => nav({ name: 'padres' })}>
        <span aria-hidden>←</span> Zona de padres
      </button>
      <h1 className="adulto__titulo">Ejercicio recomendado</h1>

      <Tarjeta titulo="Dificultad">
        <Segmentado
          value={progress.difficulty}
          options={[
            { value: 'facil' as Difficulty, label: 'Fácil' },
            { value: 'auto' as Difficulty, label: 'Automático' },
            { value: 'dificil' as Difficulty, label: 'Difícil' },
          ]}
          onChange={(d) => setProgress({ difficulty: d })}
        />
        {progress.difficulty !== 'auto' && (
          <p className="aviso" style={{ margin: 0 }}>
            Con la dificultad fijada a mano, la app deja de proponer ejercicios.
          </p>
        )}
      </Tarjeta>

      {!level ? (
        <p className="vacio">
          Todavía no hay propuesta.
          {progress.difficulty === 'auto'
            ? ' Juega un par de niveles y la app preparará uno a medida.'
            : ' Cambia la dificultad a Automático para recibir propuestas.'}
        </p>
      ) : (
        <>
          <Tarjeta titulo="La propuesta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                className="tarjeta-nivel__avatar"
                style={{ background: level.avatarColor }}
                aria-hidden
              >
                {level.emoji}
              </span>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{level.title}</div>
                <div style={{ fontSize: 15, color: color.inkSoft, fontWeight: 600 }}>
                  {level.pieces.length} piezas · huecos de {level.holes[0]?.size ?? 0} px
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {level.pieces.map((p) => (
                <div
                  key={p.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  {p.visual.kind === 'shape' ? (
                    <Pieza shape={p.visual.shape} size={44} />
                  ) : p.visual.kind === 'emoji' ? (
                    <span style={{ fontSize: 34 }}>{p.visual.emoji}</span>
                  ) : p.visual.kind === 'mano' ? (
                    <Mano dedos={p.visual.dedos} width={56} />
                  ) : (
                    <span style={{ fontSize: 34, fontWeight: 800 }}>{p.visual.n}</span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700, color: color.inkSoft }}>
                    {metricLabel[p.metric] ?? p.metric}
                  </span>
                  {!practicadas.has(p.metric) && (
                    <span
                      className="aviso-nuevo"
                      style={{ background: chartColor.good, fontSize: 12 }}
                    >
                      nuevo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Tarjeta>

          <Tarjeta titulo="Por qué">
            <p style={{ fontSize: 17, lineHeight: 1.45, margin: 0 }}>{level.rationale}</p>
            <p className="aviso" style={{ margin: 0 }}>
              Sube con más del 85 % de acierto dos veces seguidas y sin pistas. Baja con menos
              del 50 % o más de dos pistas.
            </p>
          </Tarjeta>

          <BotonGrande bg={chartColor.good} onClick={activar} small>
            ACTIVAR EJERCICIO
          </BotonGrande>
          <button
            className="enlace-suave"
            onClick={() => {
              setProgress({ proposal: null, proposalSeen: true })
              nav({ name: 'padres' })
            }}
            style={{ alignSelf: 'center' }}
          >
            Ahora no
          </button>
        </>
      )}
    </div>
  )
}
