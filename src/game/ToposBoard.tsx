import { useEffect, useRef, useState } from 'react'
import { emit } from './bus'
import { say, sfxApplause, sfxMatch, sfxMiss, sfxWin, unlockAudio } from './audio'
import { TOPOS_HOYOS, TOPOS_META } from '../levels/topos'
import type { LevelDef } from '../levels/types'

/**
 * Tablero del nivel de topos (10): 6 agujeros en 2×3 y un ratón que asoma por
 * uno al azar durante un momento. Tocarlo suma un punto; tocar un agujero
 * vacío cuenta como fallo. Con `TOPOS_META` puntos el nivel termina. Emite los
 * mismos eventos de bus que los demás tableros, de modo que la pantalla de
 * nivel, los reportes y las estrellas funcionan igual.
 */

/** Tono pastel de cada agujero, como en el diseño (rojo/verde/azul). */
const TONOS = ['rojo', 'verde', 'azul', 'verde', 'azul', 'rojo'] as const

/** Cuánto tiempo asoma el ratón antes de esconderse. */
const VENTANA_MS = 1500
/** Pausa aleatoria entre una aparición y la siguiente. */
const PAUSA_MIN_MS = 450
const PAUSA_MAX_MS = 1000

export function ToposBoard({ level }: { level: LevelDef }) {
  const [puntos, setPuntos] = useState(0)
  /** Índice del agujero por el que asoma el ratón, o null si está escondido. */
  const [activo, setActivo] = useState<number | null>(null)
  /** Agujero donde se acaba de acertar: enseña el "+1" un momento. */
  const [golpe, setGolpe] = useState<number | null>(null)
  /** Agujero vacío que se acaba de tocar: tiembla un momento. */
  const [fallo, setFallo] = useState<number | null>(null)

  const ultimo = useRef(-1)
  const marca = useRef({ fallos: 0, inicio: Date.now(), salio: Date.now() })
  const raton = level.pieces[0]!
  const terminado = puntos >= TOPOS_META

  useEffect(() => {
    setPuntos(0)
    setActivo(null)
    setGolpe(null)
    setFallo(null)
    ultimo.current = -1
    marca.current = { fallos: 0, inicio: Date.now(), salio: Date.now() }
  }, [level])

  // El ratón alterna entre escondido (pausa aleatoria) y asomado (ventana fija).
  useEffect(() => {
    if (terminado) return
    if (activo === null) {
      const pausa = PAUSA_MIN_MS + Math.random() * (PAUSA_MAX_MS - PAUSA_MIN_MS)
      const t = window.setTimeout(() => {
        let hoyo = Math.floor(Math.random() * TOPOS_HOYOS)
        if (hoyo === ultimo.current) hoyo = (hoyo + 1) % TOPOS_HOYOS
        ultimo.current = hoyo
        marca.current.salio = Date.now()
        setActivo(hoyo)
      }, pausa)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setActivo(null), VENTANA_MS)
    return () => window.clearTimeout(t)
  }, [activo, terminado])

  const estrellas = () => {
    const { fallos } = marca.current
    if (fallos <= 2) return 3
    if (fallos <= 6) return 2
    return 1
  }

  const tocar = (hoyo: number) => {
    if (terminado) return
    unlockAudio()

    if (activo !== hoyo) {
      // Agujero vacío: fallo suave, sin restar puntos.
      marca.current.fallos++
      sfxMiss()
      setFallo(hoyo)
      window.setTimeout(() => setFallo(null), 400)
      emit('pieceDropped', { key: raton.key, metric: raton.metric, on: null })
      return
    }

    const ahora = puntos + 1
    setPuntos(ahora)
    setActivo(null)
    setGolpe(hoyo)
    window.setTimeout(() => setGolpe(null), 550)
    sfxMatch()
    if (ahora < TOPOS_META && ahora % 5 === 0) say(`¡${ahora} puntos!`)
    emit('pieceMatched', {
      key: raton.key,
      metric: raton.metric,
      ms: Date.now() - marca.current.salio,
      placed: ahora,
      total: TOPOS_META,
    })

    if (ahora >= TOPOS_META) {
      sfxWin()
      sfxApplause()
      window.setTimeout(
        () =>
          emit('levelCompleted', {
            ms: Date.now() - marca.current.inicio,
            stars: estrellas(),
            hints: 0,
          }),
        900,
      )
    }
  }

  return (
    <div className="topos-host">
      <div className="topos">
        {TONOS.map((tono, i) => (
          <button
            key={i}
            className={`topos__hoyo topos__hoyo--${tono}${fallo === i ? ' topos__hoyo--fallo' : ''}`}
            onClick={() => tocar(i)}
            aria-label={activo === i ? '¡El ratón! Tócalo' : 'Agujero vacío'}
          >
            {(activo === i || golpe === i) && (
              <span
                className={`topos__raton${golpe === i ? ' topos__raton--golpe' : ''}`}
                aria-hidden
              >
                🐭
              </span>
            )}
            {golpe === i && (
              <span className="topos__mas" aria-hidden>
                +1
              </span>
            )}
            <span className="topos__hueco" aria-hidden />
          </button>
        ))}
      </div>
      <div className="topos__marcador" aria-live="polite">
        <span aria-hidden>⭐</span> Puntos: {puntos} de {TOPOS_META}
      </div>
    </div>
  )
}
