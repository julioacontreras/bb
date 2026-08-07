import { useCallback, useEffect, useRef, useState } from 'react'
import { emit } from './bus'
import { say, sfxApplause, sfxMatch, sfxMiss, sfxPick, sfxWin, unlockAudio } from './audio'
import { CONTAR, numeroColor, rowCenterY, rowY } from '../levels/contar'
import { ManoDibujo } from '../ui/components/Mano'
import { color } from '../ui/tokens'
import type { Hole, LevelDef, Piece } from '../levels/types'

/**
 * Tablero del nivel de contar. Es SVG puro (no Phaser): así las tarjetas y las
 * líneas de unión comparten sistema de coordenadas y encajan al píxel a
 * cualquier ancho. Emite los mismos eventos de bus que `BoardScene`, de modo
 * que la pantalla de nivel, los reportes y las estrellas funcionan igual.
 */

const SOMBRA = 'rgba(74, 55, 40, 0.10)'

const dedosDe = (p: Piece): number => (p.visual.kind === 'mano' ? p.visual.dedos : 0)
const cifraDe = (h: Hole): number => (h.visual.kind === 'numero' ? h.visual.n : 0)

export function ContarBoard({ level }: { level: LevelDef }) {
  const manos = level.pieces
  const numeros = level.holes

  /** id de mano → id de número. */
  const [uniones, setUniones] = useState<Record<string, string>>({})
  const [elegida, setElegida] = useState<string | null>(null)
  const [punta, setPunta] = useState<{ x: number; y: number } | null>(null)
  const [pista, setPista] = useState<string | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const marca = useRef({ fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() })
  const arrastrado = useRef(false)

  useEffect(() => {
    setUniones({})
    setElegida(null)
    setPunta(null)
    setPista(null)
    setFallo(null)
    marca.current = { fallos: 0, pistas: 0, inicio: Date.now(), tomada: Date.now() }
  }, [level])

  // Tras `hintAfter` segundos sin acierto, se resalta el número que toca.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const pendientes = manos.filter((p) => !uniones[p.id])
      if (!pendientes.length) return
      if (Date.now() - marca.current.tomada < level.hintAfter * 1000) return
      const mano = pendientes[0]!
      const numero = numeros.find((h) => h.key === mano.key)
      if (!numero) return
      marca.current.pistas++
      marca.current.tomada = Date.now()
      setPista(numero.id)
      emit('hintShown', { key: mano.key, metric: mano.metric })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [level.hintAfter, manos, numeros, uniones])

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
      x: ((e.clientX - r.left) / r.width) * CONTAR.width,
      y: ((e.clientY - r.top) / r.height) * CONTAR.height,
    }
  }

  const tomar = (mano: Piece, e: React.PointerEvent) => {
    if (uniones[mano.id]) return
    unlockAudio()
    sfxPick()
    arrastrado.current = false
    marca.current.tomada = Date.now()
    setElegida(mano.id)
    setPista(null)
    setPunta(enTablero(e))
    emit('piecePicked', { key: mano.key, metric: mano.metric })
  }

  const resolver = useCallback(
    (numero: Hole) => {
      const mano = manos.find((p) => p.id === elegida)
      if (!mano) return
      setPunta(null)

      const ocupado = Object.values(uniones).includes(numero.id)
      if (!ocupado && numero.key === mano.key) {
        const hechas = { ...uniones, [mano.id]: numero.id }
        setUniones(hechas)
        setElegida(null)
        setPista(null)
        sfxMatch()
        say(mano.say)
        emit('pieceMatched', {
          key: mano.key,
          metric: mano.metric,
          ms: Date.now() - marca.current.tomada,
          placed: Object.keys(hechas).length,
          total: manos.length,
        })
        marca.current.tomada = Date.now()

        if (Object.keys(hechas).length === manos.length) {
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
      setFallo(numero.id)
      window.setTimeout(() => setFallo(null), 420)
      sfxMiss()
      emit('pieceDropped', { key: mano.key, metric: mano.metric, on: numero.id })
    },
    [elegida, manos, uniones],
  )

  const mover = (e: React.PointerEvent) => {
    if (!elegida) return
    arrastrado.current = true
    setPunta(enTablero(e))
  }

  const soltar = (e: React.PointerEvent) => {
    if (!elegida) return
    const bajo = document.elementFromPoint(e.clientX, e.clientY)
    const id = bajo?.closest('[data-numero]')?.getAttribute('data-numero')
    const numero = id ? numeros.find((h) => h.id === id) : undefined
    if (numero) {
      resolver(numero)
      return
    }
    setPunta(null)
    // Un toque sin arrastrar deja la mano elegida: se completa tocando la cifra.
    if (arrastrado.current) setElegida(null)
    else {
      const mano = manos.find((p) => p.id === elegida)
      if (mano) {
        const sonó = say(mano.say)
        emit('shapeTapped', {
          key: mano.key,
          metric: mano.metric,
          color: mano.color,
          spoke: sonó,
        })
      }
    }
  }

  const centroMano = (i: number) => ({ x: CONTAR.puntoMano, y: rowCenterY(i) })
  const centroNumero = (i: number) => ({ x: CONTAR.puntoNumero, y: rowCenterY(i) })

  const manoElegida = manos.find((p) => p.id === elegida)

  return (
    <div className="contar-host">
      <svg
        ref={svgRef}
        className="contar"
        viewBox={`0 0 ${CONTAR.width} ${CONTAR.height}`}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={() => {
          setElegida(null)
          setPunta(null)
        }}
      >
        <defs>
          <clipPath id="contar-tarjeta">
            <rect width={CONTAR.cardW} height={CONTAR.cardH} rx={26} />
          </clipPath>
        </defs>

        {manos.map((mano, i) => {
          const unida = Boolean(uniones[mano.id])
          const activa = elegida === mano.id
          return (
            <g
              key={mano.id}
              className="contar__tarjeta"
              transform={`translate(${CONTAR.manoX} ${rowY(i)})`}
              onPointerDown={(e) => tomar(mano, e)}
              role="button"
              tabIndex={0}
              aria-label={`Mano con ${dedosDe(mano)} ${dedosDe(mano) === 1 ? 'dedo' : 'dedos'}${unida ? ', ya unida' : ''}`}
              aria-pressed={activa}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setElegida(unida ? null : mano.id)
                }
              }}
            >
              <rect
                y={5}
                width={CONTAR.cardW}
                height={CONTAR.cardH}
                rx={26}
                fill={SOMBRA}
              />
              <rect
                width={CONTAR.cardW}
                height={CONTAR.cardH}
                rx={26}
                fill={color.white}
                stroke={activa ? mano.color : 'transparent'}
                strokeWidth={4}
                opacity={unida ? 0.75 : 1}
              />
              <g clipPath="url(#contar-tarjeta)" opacity={unida ? 0.6 : 1}>
                <ManoDibujo dedos={dedosDe(mano)} />
              </g>
            </g>
          )
        })}

        {numeros.map((numero, i) => {
          const cifra = cifraDe(numero)
          const unido = Object.values(uniones).includes(numero.id)
          return (
            <g
              key={numero.id}
              data-numero={numero.id}
              className={`contar__tarjeta${fallo === numero.id ? ' contar__tarjeta--fallo' : ''}`}
              transform={`translate(${CONTAR.numeroX} ${rowY(i)})`}
              onPointerDown={() => elegida && resolver(numero)}
              role="button"
              tabIndex={0}
              aria-label={`Número ${cifra}${unido ? ', ya unido' : ''}`}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && elegida) {
                  e.preventDefault()
                  resolver(numero)
                }
              }}
            >
              <rect
                y={5}
                width={CONTAR.cardW}
                height={CONTAR.cardH}
                rx={26}
                fill={SOMBRA}
              />
              <rect
                width={CONTAR.cardW}
                height={CONTAR.cardH}
                rx={26}
                fill={color.white}
                stroke={pista === numero.id ? numeroColor[cifra] : 'transparent'}
                strokeWidth={4}
                className={pista === numero.id ? 'contar__pista' : undefined}
              />
              <text
                x={CONTAR.cardW / 2}
                y={CONTAR.cardH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={50}
                fontWeight={800}
                fill={numeroColor[cifra]}
              >
                {cifra}
              </text>
            </g>
          )
        })}

        {Object.entries(uniones).map(([manoId, numeroId]) => {
          const i = manos.findIndex((p) => p.id === manoId)
          const j = numeros.findIndex((h) => h.id === numeroId)
          if (i < 0 || j < 0) return null
          const a = centroMano(i)
          const b = centroNumero(j)
          return (
            <line
              key={manoId}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={manos[i]!.color}
              strokeWidth={7}
              strokeLinecap="round"
            />
          )
        })}

        {manos.map((mano, i) => {
          const unida = Boolean(uniones[mano.id])
          const a = centroMano(i)
          return (
            <circle
              key={mano.id}
              cx={a.x}
              cy={a.y}
              r={CONTAR.puntoR}
              fill={unida || elegida === mano.id ? mano.color : '#DCD3C6'}
            />
          )
        })}

        {numeros.map((numero, i) => {
          const b = centroNumero(i)
          const unido = Object.values(uniones).includes(numero.id)
          return (
            <circle
              key={numero.id}
              cx={b.x}
              cy={b.y}
              r={CONTAR.puntoR}
              fill={unido ? numeroColor[cifraDe(numero)]! : '#DCD3C6'}
            />
          )
        })}

        {manoElegida && punta && (
          <line
            x1={centroMano(manos.indexOf(manoElegida)).x}
            y1={centroMano(manos.indexOf(manoElegida)).y}
            x2={punta.x}
            y2={punta.y}
            stroke={manoElegida.color}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.6}
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  )
}
