import { useCallback, useEffect, useRef, useState } from 'react'
import { emit } from './bus'
import { say, sfxApplause, sfxMatch, sfxMiss, sfxPick, sfxWin, unlockAudio } from './audio'
import { PUZZLE, celda, ranura, trozoNombre } from '../levels/puzzle'
import { LeonDibujo, LEON_TROZO } from '../ui/components/Leon'
import { color } from '../ui/tokens'
import type { Hole, LevelDef, Piece } from '../levels/types'

/**
 * Tablero del nivel de puzzle. Es SVG puro (no Phaser): cada pieza es un
 * recorte del mismo dibujo del león, así que los trozos encajan al píxel y el
 * dibujo se puede cambiar sin retocar el tablero. Emite los mismos eventos de
 * bus que `BoardScene`, de modo que estrellas y reportes funcionan igual.
 */

const SOMBRA = 'rgba(74, 55, 40, 0.10)'
const BORDE_HUECO = '#D9CBB4'

const cuadrante = (v: Piece['visual']) =>
  v.kind === 'trozo' ? { fila: v.fila, col: v.col } : { fila: 0, col: 0 }

/**
 * Un cuadrante del león, recortado y escalado al lado del tablero. El `svg`
 * anidado hace el recorte duro (su viewport corta lo que sobra) y el
 * `clip-path` sólo redondea las esquinas.
 */
function Trozo({ id, fila, col }: { id: string; fila: number; col: number }) {
  return (
    <g clipPath="url(#puzzle-trozo)">
      <svg
        width={PUZZLE.lado}
        height={PUZZLE.lado}
        viewBox={`${col * LEON_TROZO} ${fila * LEON_TROZO} ${LEON_TROZO} ${LEON_TROZO}`}
      >
        <LeonDibujo id={id} />
      </svg>
    </g>
  )
}

export function PuzzleBoard({ level }: { level: LevelDef }) {
  const piezas = level.pieces
  const huecos = level.holes

  /** id de pieza → id de hueco. */
  const [colocadas, setColocadas] = useState<Record<string, string>>({})
  const [elegida, setElegida] = useState<string | null>(null)
  const [punta, setPunta] = useState<{ x: number; y: number } | null>(null)
  const [pista, setPista] = useState<string | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const marca = useRef({ fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() })
  const arrastrado = useRef(false)

  useEffect(() => {
    setColocadas({})
    setElegida(null)
    setPunta(null)
    setPista(null)
    setFallo(null)
    marca.current = { fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() }
  }, [level])

  // Tras `hintAfter` segundos sin acierto, se resalta el hueco que toca.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const pendientes = piezas.filter((p) => !colocadas[p.id])
      if (!pendientes.length) return
      if (Date.now() - marca.current.tomada < level.hintAfter * 1000) return
      const pieza = pendientes[0]!
      const hueco = huecos.find((h) => h.key === pieza.key)
      if (!hueco) return
      marca.current.pistas++
      marca.current.tomada = Date.now()
      setPista(hueco.id)
      emit('hintShown', { key: pieza.key, metric: pieza.metric })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [level.hintAfter, piezas, huecos, colocadas])

  const estrellas = () => {
    const { fallos, pistas } = marca.current
    if (fallos <= 1 && pistas === 0) return 3
    if (fallos <= 4 && pistas <= 1) return 2
    return 1
  }

  /** De píxeles de pantalla a las coordenadas del viewBox. */
  const enTablero = (e: { clientX: number; clientY: number }) => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r || !r.width) return null
    return {
      x: ((e.clientX - r.left) / r.width) * PUZZLE.width,
      y: ((e.clientY - r.top) / r.height) * PUZZLE.height,
    }
  }

  const tomar = (pieza: Piece, e: React.PointerEvent) => {
    if (colocadas[pieza.id]) return
    unlockAudio()
    sfxPick()
    arrastrado.current = false
    marca.current.tomada = Date.now()
    setElegida(pieza.id)
    setPista(null)
    setPunta(enTablero(e))
    emit('piecePicked', { key: pieza.key, metric: pieza.metric })
  }

  const resolver = useCallback(
    (hueco: Hole) => {
      const pieza = piezas.find((p) => p.id === elegida)
      if (!pieza) return
      setPunta(null)

      const ocupado = Object.values(colocadas).includes(hueco.id)
      if (!ocupado && hueco.key === pieza.key) {
        const hechas = { ...colocadas, [pieza.id]: hueco.id }
        setColocadas(hechas)
        setElegida(null)
        setPista(null)
        sfxMatch()
        say(pieza.say)
        emit('pieceMatched', {
          key: pieza.key,
          metric: pieza.metric,
          ms: Date.now() - marca.current.tomada,
          placed: Object.keys(hechas).length,
          total: piezas.length,
        })
        marca.current.tomada = Date.now()

        if (Object.keys(hechas).length === piezas.length) {
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

      marca.current.fallos++
      setElegida(null)
      setFallo(hueco.id)
      window.setTimeout(() => setFallo(null), 420)
      sfxMiss()
      emit('pieceDropped', { key: pieza.key, metric: pieza.metric, on: hueco.id })
    },
    [elegida, piezas, colocadas],
  )

  const mover = (e: React.PointerEvent) => {
    if (!elegida) return
    arrastrado.current = true
    setPunta(enTablero(e))
  }

  /** El hueco libre más cercano al dedo, dentro del radio del imán. */
  const huecoCercano = (p: { x: number; y: number }): Hole | undefined => {
    let mejor: Hole | undefined
    let dist = level.magnet
    for (const h of huecos) {
      if (Object.values(colocadas).includes(h.id)) continue
      const d = Math.hypot(h.x - p.x, h.y - p.y)
      if (d <= dist) {
        dist = d
        mejor = h
      }
    }
    return mejor
  }

  const soltar = (e: React.PointerEvent) => {
    if (!elegida) return
    const bajo = document.elementFromPoint(e.clientX, e.clientY)
    const id = bajo?.closest('[data-hueco]')?.getAttribute('data-hueco')
    const punto = enTablero(e)
    const hueco = id ? huecos.find((h) => h.id === id) : punto ? huecoCercano(punto) : undefined
    if (hueco) {
      resolver(hueco)
      return
    }
    setPunta(null)
    // Un toque sin arrastrar deja la pieza elegida: se completa tocando el hueco.
    if (arrastrado.current) setElegida(null)
    else {
      const pieza = piezas.find((p) => p.id === elegida)
      if (pieza) {
        const sonó = say(pieza.say)
        emit('shapeTapped', {
          key: pieza.key,
          metric: pieza.metric,
          color: pieza.color,
          spoke: sonó,
        })
      }
    }
  }

  const puestas = Object.keys(colocadas).length

  return (
    <div className="puzzle-host">
      <svg
        ref={svgRef}
        className="puzzle"
        viewBox={`0 0 ${PUZZLE.width} ${PUZZLE.height}`}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={() => {
          setElegida(null)
          setPunta(null)
        }}
        aria-label={`Puzzle del león: ${puestas} de ${piezas.length} piezas`}
      >
        <defs>
          <clipPath id="puzzle-trozo">
            <rect width={PUZZLE.lado} height={PUZZLE.lado} rx={22} />
          </clipPath>
        </defs>

        {huecos.map((hueco) => {
          const { fila, col } = cuadrante(hueco.visual)
          const { x, y } = celda(fila, col)
          const puesta = Object.values(colocadas).includes(hueco.id)
          return (
            <g
              key={hueco.id}
              data-hueco={hueco.id}
              className={`puzzle__hueco${fallo === hueco.id ? ' puzzle__hueco--fallo' : ''}`}
              transform={`translate(${x} ${y})`}
              onPointerDown={() => elegida && resolver(hueco)}
              role="button"
              tabIndex={0}
              aria-label={`Hueco de ${trozoNombre[hueco.key] ?? hueco.key}${puesta ? ', ya puesto' : ''}`}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && elegida) {
                  e.preventDefault()
                  resolver(hueco)
                }
              }}
            >
              <rect
                width={PUZZLE.lado}
                height={PUZZLE.lado}
                rx={22}
                fill={puesta ? color.white : 'rgba(255, 255, 255, 0.72)'}
              />
              <g opacity={puesta ? 1 : 0.16} pointerEvents="none">
                <Trozo id={`hueco-${hueco.id}`} fila={fila} col={col} />
              </g>
              <rect
                width={PUZZLE.lado}
                height={PUZZLE.lado}
                rx={22}
                fill="none"
                stroke={puesta ? color.sun : BORDE_HUECO}
                strokeWidth={4}
                strokeDasharray={puesta ? undefined : '10 9'}
                className={pista === hueco.id ? 'puzzle__pista' : undefined}
              />
            </g>
          )
        })}

        <rect
          x={PUZZLE.bandeja.x}
          y={PUZZLE.bandeja.y}
          width={PUZZLE.bandeja.w}
          height={PUZZLE.bandeja.h}
          rx={PUZZLE.bandeja.r}
          fill={color.white}
        />

        {/* La pieza en la mano se pinta la última: así viaja por encima del resto. */}
        {piezas
          .map((pieza, i) => ({ pieza, i }))
          .sort((a, b) => Number(a.pieza.id === elegida) - Number(b.pieza.id === elegida))
          .map(({ pieza, i }) => {
          if (colocadas[pieza.id]) return null
          const { fila, col } = cuadrante(pieza.visual)
          const { x, y } = ranura(i)
          const activa = elegida === pieza.id
          const arrastrando = activa && punta !== null
          const px = arrastrando ? punta!.x - PUZZLE.lado / 2 : x
          const py = arrastrando ? punta!.y - PUZZLE.lado / 2 : y
          return (
            <g
              key={pieza.id}
              className="puzzle__pieza"
              transform={`translate(${px} ${py})`}
              onPointerDown={(e) => tomar(pieza, e)}
              pointerEvents={arrastrando ? 'none' : undefined}
              role="button"
              tabIndex={0}
              aria-label={`Pieza: ${trozoNombre[pieza.key] ?? pieza.key}`}
              aria-pressed={activa}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setElegida(activa ? null : pieza.id)
                }
              }}
            >
              <rect
                y={5}
                width={PUZZLE.lado}
                height={PUZZLE.lado}
                rx={22}
                fill={SOMBRA}
              />
              <rect width={PUZZLE.lado} height={PUZZLE.lado} rx={22} fill={color.white} />
              <Trozo id={`pieza-${pieza.id}`} fila={fila} col={col} />
              <rect
                width={PUZZLE.lado}
                height={PUZZLE.lado}
                rx={22}
                fill="none"
                stroke={activa ? color.sun : color.white}
                strokeWidth={5}
              />
            </g>
          )
          })}
      </svg>
    </div>
  )
}
