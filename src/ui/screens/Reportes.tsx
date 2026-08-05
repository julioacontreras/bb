import { useState } from 'react'
import { Segmentado, StatTile, Tarjeta } from '../components/base'
import { FilaForma } from '../components/FilaForma'
import { chartColor, color } from '../tokens'
import { exportReport, type ReportData, type ShapeMastery } from '../../data/reports'
import { useReport } from '../../data/useReport'
import { resetEverything } from '../../data/progress'
import { metricEmoji } from '../../levels/levels'
import type { Nav, ReportTab } from '../../app/routes'

/** 10 · 11 · 12 — territorio del adulto: fondo beige y tipografía más pequeña. */
export function Reportes({ tab, nav }: { tab: ReportTab; nav: Nav }) {
  const [version, setVersion] = useState(0)
  const report = useReport([version])

  return (
    <div className="screen screen--scroll adulto">
      <div className="fila">
        <button className="enlace-suave" onClick={() => nav({ name: 'padres' })}>
          <span aria-hidden>←</span> Zona de padres
        </button>
      </div>
      <h1 className="adulto__titulo">Evolución de Mia</h1>

      <Segmentado
        value={tab}
        options={[
          { value: 'resumen' as ReportTab, label: 'Resumen' },
          { value: 'formas' as ReportTab, label: 'Formas' },
          { value: 'progreso' as ReportTab, label: 'Progreso' },
        ]}
        onChange={(t) => nav({ name: 'reporte', tab: t })}
      />

      {!report ? (
        <p className="vacio">Cargando…</p>
      ) : !report.hasData ? (
        <p className="vacio">
          Todavía no hay datos.
          <br />
          Juega una partida y vuelve por aquí.
        </p>
      ) : tab === 'resumen' ? (
        <Resumen report={report} onWipe={() => void resetEverything().then(() => setVersion((v) => v + 1))} />
      ) : tab === 'formas' ? (
        <Formas report={report} />
      ) : (
        <Progreso report={report} />
      )}
    </div>
  )
}

// ------------------------------------------------------------------ 10

function Resumen({ report, onWipe }: { report: ReportData; onWipe: () => void }) {
  const max = Math.max(1, ...report.minutesByWeekday.map((d) => d.minutes))
  const pct = Math.round(report.accuracy * 100)

  return (
    <>
      <div className="stats">
        <StatTile valor={report.weekMinutes} etiqueta="min esta semana" tono={chartColor.blue} />
        <StatTile valor={report.totalStars} etiqueta="estrellas" tono={chartColor.amber} />
        <StatTile valor={report.streak} etiqueta="días seguidos" tono={chartColor.good} />
      </div>

      <Tarjeta titulo="Minutos por día">
        <div className="barras-v">
          {report.minutesByWeekday.map((d) => (
            <div key={d.day}>
              {d.minutes === max && d.minutes > 0 && <small>{d.minutes}</small>}
              <b
                style={{
                  height: `${(d.minutes / max) * 88}%`,
                  background: d.minutes ? chartColor.blue : chartColor.track,
                }}
              />
            </div>
          ))}
        </div>
        <div className="eje-x">
          {report.minutesByWeekday.map((d) => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Precisión general">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Donut pct={report.accuracy} />
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: chartColor.blue }}>{pct}%</div>
            <div style={{ fontSize: 15, color: color.inkSoft, fontWeight: 600 }}>
              de las piezas encajan a la primera
            </div>
          </div>
        </div>
      </Tarjeta>

      <p className="aviso">
        Los datos se guardan solo en este dispositivo. Sin cuentas ni servidor.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="boton-grande boton-grande--sm"
          style={{ background: chartColor.blue, flex: 1, fontSize: 19, padding: '0 14px' }}
          onClick={() => void exportReport()}
        >
          Exportar
        </button>
        <button
          className="boton-grande boton-grande--sm"
          style={{ background: chartColor.alert, flex: 1, fontSize: 19, padding: '0 14px' }}
          onClick={() => {
            if (confirm('¿Borrar todo el historial de Mia? No se puede deshacer.')) onWipe()
          }}
        >
          Borrar historial
        </button>
      </div>
    </>
  )
}

function Donut({ pct }: { pct: number }) {
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <svg width={110} height={110} viewBox="0 0 110 110" aria-hidden>
      <circle cx={55} cy={55} r={r} fill="none" stroke={chartColor.track} strokeWidth={16} />
      <circle
        cx={55}
        cy={55}
        r={r}
        fill="none"
        stroke={chartColor.blue}
        strokeWidth={16}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 55 55)"
      />
    </svg>
  )
}

// ------------------------------------------------------------------ 11

const GRUPOS: { key: ShapeMastery['group']; titulo: string; tono: string }[] = [
  { key: 'domina', titulo: 'Domina', tono: chartColor.good },
  { key: 'progreso', titulo: 'En progreso', tono: chartColor.amber },
  { key: 'cuesta', titulo: 'Le cuesta', tono: chartColor.alert },
]

function Formas({ report }: { report: ReportData }) {
  const sonidos = report.shapes.filter((s) => s.taps > 0).sort((a, b) => b.taps - a.taps)
  const maxTaps = Math.max(1, ...sonidos.map((s) => s.taps))

  return (
    <>
      <Tarjeta titulo="Dominio por forma">
        {GRUPOS.map((g) => {
          const filas = report.shapes.filter((s) => s.group === g.key && s.attempts > 0)
          if (!filas.length) return null
          return (
            <div key={g.key}>
              <div className="grupo-titulo" style={{ color: g.tono }}>
                {g.titulo}
              </div>
              {filas.map((s) => (
                <FilaForma
                  key={s.key}
                  clave={s.key}
                  nombre={s.label}
                  pct={s.accuracy}
                  emoji={metricEmoji[s.key]}
                />
              ))}
            </div>
          )
        })}
      </Tarjeta>

      <Tarjeta titulo="Sonidos escuchados">
        <p className="aviso" style={{ margin: 0 }}>
          Cuántas veces toca cada forma solo por el gusto de oírla.
        </p>
        {sonidos.length === 0 ? (
          <p className="aviso" style={{ margin: 0 }}>
            Todavía ninguna.
          </p>
        ) : (
          sonidos.map((s) => (
            <FilaForma
              key={s.key}
              clave={s.key}
              nombre={s.label}
              pct={s.taps / maxTaps}
              emoji={metricEmoji[s.key]}
            />
          ))
        )}
      </Tarjeta>
    </>
  )
}

// ------------------------------------------------------------------ 12

function Progreso({ report }: { report: ReportData }) {
  const delta = report.monthDeltaSeconds
  const maxSeg = Math.max(1, ...report.speedByWeek.map((w) => w.seconds))

  return (
    <>
      <Tarjeta titulo="Este mes">
        <p style={{ fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1.35 }}>
          {delta < 0
            ? `Encaja las piezas ${Math.abs(delta)} s más rápido que hace un mes.`
            : delta > 0
              ? `Tarda ${delta} s más que hace un mes.`
              : 'Todavía no hay suficiente historial para comparar meses.'}
        </p>
      </Tarjeta>

      <Tarjeta titulo="Segundos hasta encajar">
        <div className="barras-v">
          {report.speedByWeek.map((w, i) => (
            <div key={w.label}>
              {(i === 0 || i === report.speedByWeek.length - 1) && w.seconds > 0 && (
                <small>{w.seconds}s</small>
              )}
              <b
                style={{
                  height: `${(w.seconds / maxSeg) * 88}%`,
                  background: w.seconds ? chartColor.amber : chartColor.track,
                }}
              />
            </div>
          ))}
        </div>
        <div className="eje-x">
          {report.speedByWeek.map((w) => (
            <span key={w.label}>{w.label}</span>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Precisión por semana">
        <div className="barras-v">
          {report.accuracyByWeek.map((w, i) => (
            <div key={w.label}>
              {(i === 0 || i === report.accuracyByWeek.length - 1) && w.accuracy > 0 && (
                <small>{Math.round(w.accuracy * 100)}%</small>
              )}
              <b
                style={{
                  height: `${w.accuracy * 88}%`,
                  background: w.accuracy ? chartColor.blue : chartColor.track,
                }}
              />
            </div>
          ))}
        </div>
        <div className="eje-x">
          {report.accuracyByWeek.map((w) => (
            <span key={w.label}>{w.label}</span>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Últimas sesiones">
        <div className="tabla">
          <div className="tabla__fila tabla__fila--cabecera">
            <span className="tabla__celda">Día</span>
            <span className="tabla__celda">Min</span>
            <span className="tabla__celda">Niveles</span>
            <span className="tabla__celda">Acierto</span>
          </div>
          {report.sessions.map((s) => (
            <div className="tabla__fila" key={s.id}>
              <span className="tabla__celda">
                {new Date(s.ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </span>
              <span className="tabla__celda">{s.minutes}</span>
              <span className="tabla__celda">{s.levels}</span>
              <span className="tabla__celda">{Math.round(s.accuracy * 100)}%</span>
            </div>
          ))}
        </div>
      </Tarjeta>
    </>
  )
}
