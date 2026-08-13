import { useEffect, useRef, useState } from 'react'
import { emit } from './bus'
import { say, sfxApplause, sfxMatch, sfxMiss, sfxPick, sfxWin, unlockAudio } from './audio'
import type { LevelDef, Piece } from '../levels/types'

/**
 * Tablero del nivel de memoria (09): 6 cartas boca abajo en 2×3, dos de cada
 * dibujo. Al tocar dos cartas iguales la pareja se queda a la vista. Emite los
 * mismos eventos de bus que los demás tableros, de modo que la pantalla de
 * nivel, los reportes y las estrellas funcionan igual.
 */

interface Carta {
  uid: string
  pieza: Piece
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

const emojiDe = (p: Piece): string => (p.visual.kind === 'emoji' ? p.visual.emoji : '❓')

const repartir = (level: LevelDef): Carta[] =>
  barajar(level.pieces.flatMap((p) => [{ uid: `${p.id}-a`, pieza: p }, { uid: `${p.id}-b`, pieza: p }]))

export function MemoriaBoard({ level }: { level: LevelDef }) {
  const [cartas, setCartas] = useState<Carta[]>(() => repartir(level))
  /** uids boca arriba aún sin emparejar (0, 1 o 2). */
  const [levantadas, setLevantadas] = useState<string[]>([])
  /** keys de las parejas ya encontradas. */
  const [parejas, setParejas] = useState<string[]>([])
  /** key de la pareja que la pista enseña un momento. */
  const [pista, setPista] = useState<string | null>(null)
  const [fallo, setFallo] = useState(false)

  const bloqueo = useRef(false)
  const marca = useRef({ fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() })

  useEffect(() => {
    setCartas(repartir(level))
    setLevantadas([])
    setParejas([])
    setPista(null)
    setFallo(false)
    bloqueo.current = false
    marca.current = { fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() }
  }, [level])

  // Tras `hintAfter` segundos sin acierto, se enseña un momento una pareja.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (parejas.length === level.pieces.length) return
      if (levantadas.length || bloqueo.current || pista) return
      if (Date.now() - marca.current.tomada < level.hintAfter * 1000) return
      const pendiente = level.pieces.find((p) => !parejas.includes(p.key))
      if (!pendiente) return
      marca.current.pistas++
      marca.current.tomada = Date.now()
      setPista(pendiente.key)
      emit('hintShown', { key: pendiente.key, metric: pendiente.metric })
      window.setTimeout(() => setPista(null), 1100)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [level, levantadas, parejas, pista])

  const estrellas = () => {
    const { fallos, pistas } = marca.current
    if (fallos <= 1 && pistas === 0) return 3
    if (fallos <= 4 && pistas <= 1) return 2
    return 1
  }

  const tocar = (carta: Carta) => {
    if (bloqueo.current || pista) return
    if (parejas.includes(carta.pieza.key) || levantadas.includes(carta.uid)) return
    unlockAudio()
    sfxPick()
    emit('piecePicked', { key: carta.pieza.key, metric: carta.pieza.metric })

    const ahora = [...levantadas, carta.uid]
    setLevantadas(ahora)
    if (ahora.length < 2) return

    const [a, b] = ahora.map((uid) => cartas.find((c) => c.uid === uid)!)
    if (a!.pieza.key === b!.pieza.key) {
      const hechas = [...parejas, carta.pieza.key]
      setParejas(hechas)
      setLevantadas([])
      sfxMatch()
      say(carta.pieza.say)
      emit('pieceMatched', {
        key: carta.pieza.key,
        metric: carta.pieza.metric,
        ms: Date.now() - marca.current.tomada,
        placed: hechas.length,
        total: level.pieces.length,
      })
      marca.current.tomada = Date.now()

      if (hechas.length === level.pieces.length) {
        sfxWin()
        sfxApplause()
        window.setTimeout(
          () =>
            emit('levelCompleted', {
              ms: Date.now() - marca.current.inicio,
              stars: estrellas(),
              hints: marca.current.pistas,
            }),
          900,
        )
      }
      return
    }

    // No son iguales: se ven un momento y se vuelven a tapar.
    marca.current.fallos++
    sfxMiss()
    emit('pieceDropped', { key: carta.pieza.key, metric: carta.pieza.metric, on: a!.pieza.key })
    bloqueo.current = true
    setFallo(true)
    window.setTimeout(() => {
      setLevantadas([])
      setFallo(false)
      bloqueo.current = false
    }, 850)
  }

  return (
    <div className="memoria-host">
      <div className="memoria">
        {cartas.map((carta) => {
          const emparejada = parejas.includes(carta.pieza.key)
          const arriba =
            emparejada || levantadas.includes(carta.uid) || pista === carta.pieza.key
          const tiembla = fallo && levantadas.includes(carta.uid)
          return (
            <button
              key={carta.uid}
              className={`memoria__carta${tiembla ? ' memoria__carta--fallo' : ''}`}
              onClick={() => tocar(carta)}
              aria-label={
                emparejada
                  ? `Pareja de ${carta.pieza.say.replace(/[¡!]/g, '')} encontrada`
                  : arriba
                    ? carta.pieza.say.replace(/[¡!]/g, '')
                    : 'Carta boca abajo'
              }
              aria-pressed={arriba}
            >
              <span className={`memoria__giro${arriba ? ' memoria__giro--arriba' : ''}`}>
                <span className="memoria__cara memoria__cara--dorso" aria-hidden>
                  ?
                </span>
                <span
                  className="memoria__cara memoria__cara--frente"
                  style={{ borderColor: carta.pieza.color }}
                  aria-hidden
                >
                  {emojiDe(carta.pieza)}
                  {emparejada && <span className="memoria__check">✓</span>}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
