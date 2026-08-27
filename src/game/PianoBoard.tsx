import { useEffect, useRef, useState } from 'react'
import { emit } from './bus'
import { say, sfxApplause, sfxNota, sfxWin, unlockAudio } from './audio'
import { PIANO_NOTAS, type NotaPiano } from '../levels/piano'
import type { LevelDef } from '../levels/types'

/**
 * Tablero del nivel de piano (11): 6 teclas de colores, cada una con una nota
 * (do–la) sintetizada con WebAudio. Se toca libremente y sin límite de tiempo;
 * la primera vez que suena cada nota cuenta como acierto y con las 6 se
 * celebra, pero el piano sigue abierto: el nivel solo termina al pulsar el
 * botón «¡Terminar!». Emite los mismos eventos de bus que los demás tableros.
 */

export function PianoBoard({ level }: { level: LevelDef }) {
  /** Notas que ya sonaron al menos una vez. */
  const [tocadas, setTocadas] = useState<ReadonlySet<string>>(new Set())
  /** Tecla que se acaba de pulsar: se hunde un momento. */
  const [activa, setActiva] = useState<string | null>(null)

  const marca = useRef({ inicio: Date.now(), ultima: Date.now() })
  const timerActiva = useRef(0)
  const total = PIANO_NOTAS.length
  const terminado = tocadas.size >= total

  useEffect(() => {
    setTocadas(new Set())
    setActiva(null)
    marca.current = { inicio: Date.now(), ultima: Date.now() }
  }, [level])

  const tocar = (nota: NotaPiano) => {
    unlockAudio()
    sfxNota(nota.freq)
    setActiva(nota.key)
    window.clearTimeout(timerActiva.current)
    timerActiva.current = window.setTimeout(() => setActiva(null), 260)

    const pieza = level.pieces.find((p) => p.key === nota.key)!
    if (tocadas.has(nota.key)) {
      emit('shapeTapped', { key: nota.key, metric: pieza.metric, color: nota.color, spoke: false })
      return
    }

    // Aquí no se anuncia la nota con voz: el tono es el protagonista del nivel.
    const ahora = new Set(tocadas)
    ahora.add(nota.key)
    setTocadas(ahora)
    emit('pieceMatched', {
      key: nota.key,
      metric: pieza.metric,
      ms: Date.now() - marca.current.ultima,
      placed: ahora.size,
      total,
    })
    marca.current.ultima = Date.now()

    if (ahora.size >= total) {
      sfxWin()
      sfxApplause()
      window.setTimeout(() => say('¡Bien hecho! Sigue tocando si quieres'), 700)
    }
  }

  const terminar = () => {
    // No hay forma de fallar: explorar las 6 notas siempre vale 3 estrellas.
    emit('levelCompleted', {
      ms: Date.now() - marca.current.inicio,
      stars: 3,
      hints: 0,
    })
  }

  return (
    <div className="piano-host">
      <div className="piano">
        {PIANO_NOTAS.map((nota) => (
          <button
            key={nota.key}
            className={`piano__tecla${activa === nota.key ? ' piano__tecla--activa' : ''}`}
            style={{ background: nota.color }}
            onClick={() => tocar(nota)}
            aria-label={`Tecla ${nota.nombre}`}
          >
            <span className="piano__icono" aria-hidden>
              ♪
            </span>
            <span
              className={`piano__etiqueta${tocadas.has(nota.key) ? ' piano__etiqueta--on' : ''}`}
              aria-hidden
            >
              {nota.nombre}
            </span>
          </button>
        ))}
      </div>
      {terminado ? (
        <button className="piano__marcador piano__marcador--boton" onClick={terminar}>
          <span aria-hidden>⭐</span> ¡Terminar!
        </button>
      ) : (
        <div className="piano__marcador" aria-live="polite">
          <span aria-hidden>🎵</span> Notas: {tocadas.size} de {total}
        </div>
      )}
    </div>
  )
}
