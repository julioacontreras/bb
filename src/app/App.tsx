import { useCallback, useEffect, useState } from 'react'
import { Inicio } from '../ui/screens/Inicio'
import { Mapa } from '../ui/screens/Mapa'
import { Nivel } from '../ui/screens/Nivel'
import { Exito } from '../ui/screens/Exito'
import { ZonaPadres } from '../ui/screens/ZonaPadres'
import { Reportes } from '../ui/screens/Reportes'
import { Ejercicio } from '../ui/screens/Ejercicio'
import { levelById } from '../levels/levels'
import { getProgress, loadProgress, setProgress, useProgress } from '../data/progress'
import { endSession, sessionElapsedMs, startSession } from '../data/events'
import { buildReport } from '../data/reports'
import { propose } from '../data/adaptive'
import { on } from '../game/bus'
import { stopMusic } from '../game/audio'
import type { Route } from './routes'

export function App() {
  const [route, setRoute] = useState<Route>({ name: 'inicio' })
  const [ready, setReady] = useState(false)
  const progress = useProgress()

  const nav = useCallback((r: Route) => setRoute(r), [])

  useEffect(() => {
    void loadProgress().then(() => setReady(true))
    startSession()
    const bye = () => endSession()
    window.addEventListener('pagehide', bye)
    return () => {
      window.removeEventListener('pagehide', bye)
      bye()
    }
  }, [])

  // Límite de sesión: al cumplirse, el juego vuelve a la portada.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (sessionElapsedMs() > progress.settings.limiteMin * 60000) {
        stopMusic()
        setRoute({ name: 'inicio' })
      }
    }, 20000)
    return () => window.clearInterval(timer)
  }, [progress.settings.limiteMin])

  // Al terminar un nivel, la app prepara (que no activa) la siguiente propuesta.
  useEffect(
    () =>
      on('levelCompleted', () => {
        window.setTimeout(() => {
          void buildReport().then((report) => {
            const state = getProgress()
            const p = propose(report, state, 0)
            if (p) setProgress({ proposal: p.level, proposalSeen: false })
          })
        }, 500)
      }),
    [],
  )

  if (!ready) return <div className="phone" />

  const findLevel = (id: string) =>
    levelById(id) ?? (progress.generated?.id === id ? progress.generated : undefined)

  let screen
  switch (route.name) {
    case 'inicio':
      screen = <Inicio nav={nav} />
      break
    case 'mapa':
      screen = <Mapa nav={nav} />
      break
    case 'nivel': {
      const level = findLevel(route.levelId)
      screen = level ? <Nivel level={level} nav={nav} /> : <Mapa nav={nav} />
      break
    }
    case 'exito': {
      const level = findLevel(route.levelId)
      screen = level ? (
        <Exito level={level} stars={route.stars} nav={nav} />
      ) : (
        <Mapa nav={nav} />
      )
      break
    }
    case 'padres':
      screen = <ZonaPadres nav={nav} />
      break
    case 'reporte':
      screen = <Reportes tab={route.tab} nav={nav} />
      break
    case 'ejercicio':
      screen = <Ejercicio nav={nav} />
      break
  }

  return <div className="phone">{screen}</div>
}
