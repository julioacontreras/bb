import { BotonGrande, Segmentado, StatTile, Switch, Tarjeta } from '../components/base'
import { chartColor, color } from '../tokens'
import { setSettings, totalStars, useProgress } from '../../data/progress'
import { useReport } from '../../data/useReport'
import type { Nav } from '../../app/routes'

const sonidos = [
  { key: 'musica', label: 'Música de fondo' },
  { key: 'voces', label: 'Voces de los personajes' },
  { key: 'efectos', label: 'Efectos' },
  { key: 'aplausos', label: 'Aplausos' },
] as const

/** 09 · Zona de padres */
export function ZonaPadres({ nav }: { nav: Nav }) {
  const progress = useProgress()
  const report = useReport([])
  const hoy = report?.minutesByWeekday ?? []
  const minutosHoy = report ? (hoy[(new Date().getDay() + 6) % 7]?.minutes ?? 0) : 0
  const nivelesHoy = report?.sessions.filter((s) => esHoy(s.ts)).reduce((a, s) => a + s.levels, 0) ?? 0
  const propuestaPendiente = !!progress.proposal && !progress.proposalSeen

  return (
    <div className="screen screen--scroll adulto">
      <div className="fila">
        <h1 className="adulto__titulo">Zona de padres</h1>
        <button className="enlace-suave" onClick={() => nav({ name: 'inicio' })}>
          ✕
        </button>
      </div>

      <Tarjeta titulo="Evolución de Mia">
        <button className="fila" onClick={() => nav({ name: 'reporte', tab: 'resumen' })}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>📈 Ver reportes</span>
          <span aria-hidden>›</span>
        </button>
        <button className="fila" onClick={() => nav({ name: 'ejercicio' })}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>
            ✨ Ejercicio recomendado{' '}
            {propuestaPendiente && <span className="aviso-nuevo">nuevo</span>}
          </span>
          <span aria-hidden>›</span>
        </button>
      </Tarjeta>

      <Tarjeta titulo="Sonido">
        {sonidos.map((s) => (
          <div className="fila" key={s.key}>
            <span>{s.label}</span>
            <Switch
              label={s.label}
              on={progress.settings[s.key]}
              onToggle={() => setSettings({ [s.key]: !progress.settings[s.key] })}
            />
          </div>
        ))}
      </Tarjeta>

      <Tarjeta titulo="Tiempo de juego">
        <Segmentado
          value={progress.settings.limiteMin}
          options={[
            { value: 10, label: '10 min' },
            { value: 20, label: '20 min' },
            { value: 30, label: '30 min' },
          ]}
          onChange={(v) => setSettings({ limiteMin: v })}
        />
        <p className="aviso" style={{ margin: 0 }}>
          Al llegar al límite, el juego vuelve a la portada.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Progreso de hoy">
        <div className="stats">
          <StatTile valor={nivelesHoy} etiqueta="niveles" tono={chartColor.good} />
          <StatTile valor={totalStars(progress)} etiqueta="estrellas" tono={chartColor.amber} />
          <StatTile valor={minutosHoy} etiqueta="minutos" tono={chartColor.blue} />
        </div>
      </Tarjeta>

      <BotonGrande bg={color.green} onClick={() => nav({ name: 'mapa' })} small>
        VOLVER AL JUEGO
      </BotonGrande>
    </div>
  )
}

function esHoy(ts: number): boolean {
  const d = new Date(ts)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}
