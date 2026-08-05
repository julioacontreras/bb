import { color } from '../ui/tokens'
import { SHAPE_NAMES, shapeLabel, type ShapeName } from '../game/shapes'
import { shapeHole, shapePiece } from '../levels/levels'
import type { Hole, LevelDef } from '../levels/types'
import { BOARD_SIZE } from '../levels/types'
import type { ProgressState } from './progress'
import type { ReportData } from './reports'

export type Direction = 'sube' | 'baja' | 'mantiene'

/**
 * Reglas a la vista, no escondidas en el código (§ 6):
 * ↑ sube con >85 % de acierto dos niveles seguidos y sin pistas
 * ↓ baja con <50 % de acierto o más de dos pistas
 */
export function decideDirection(report: ReportData, hints: number): Direction {
  if (!report.hasData) return 'mantiene'
  const last = report.sessions.slice(0, 2)
  const strong = last.length >= 2 && last.every((s) => s.accuracy > 0.85) && hints === 0
  if (strong) return 'sube'
  if (report.accuracy < 0.5 || hints > 2) return 'baja'
  return 'mantiene'
}

const MASCOTS = [
  { mascot: 'tortuga', emoji: '🐢', avatarColor: color.green },
  { mascot: 'leon', emoji: '🦁', avatarColor: color.sun },
  { mascot: 'manzana', emoji: '🍎', avatarColor: color.red },
  { mascot: 'arbol', emoji: '🌳', avatarColor: color.green },
] as const

/** Rejilla centrada en el tablero: 3 por fila como mucho. */
function gridPositions(n: number, size: number): { x: number; y: number }[] {
  const perRow = n <= 2 ? n : n <= 4 ? 2 : 3
  const rows = Math.ceil(n / perRow)
  const gap = 18
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow)
    const inRow = Math.min(perRow, n - row * perRow)
    const col = i - row * perRow
    const rowWidth = inRow * size + (inRow - 1) * gap
    const startX = BOARD_SIZE / 2 - rowWidth / 2 + size / 2
    const colHeight = rows * size + (rows - 1) * gap
    const startY = BOARD_SIZE / 2 - colHeight / 2 + size / 2 + 8
    out.push({ x: startX + col * (size + gap), y: startY + row * (size + gap) })
  }
  return out
}

export interface Proposal {
  level: LevelDef
  direction: Direction
  /** Forma que se estrena en este ejercicio. */
  nuevo: ShapeName | null
}

/**
 * La app propone, el padre aprueba. Devuelve `null` si no hay nada que proponer
 * (todavía sin datos, o el adulto ha fijado la dificultad a mano).
 */
export function propose(
  report: ReportData,
  state: ProgressState,
  hints = 0,
): Proposal | null {
  if (state.difficulty !== 'auto') return null
  if (!report.hasData) return null

  const direction = decideDirection(report, hints)

  const known = new Set(report.shapes.map((s) => s.key))
  const dominadas = report.shapes
    .filter((s) => s.group === 'domina' && SHAPE_NAMES.includes(s.key as ShapeName))
    .map((s) => s.key as ShapeName)
  const menosPracticada =
    SHAPE_NAMES.find((s) => !known.has(s)) ??
    (report.shapes.at(-1)?.key as ShapeName | undefined) ??
    'pentagono'

  const base = direction === 'sube' ? 5 : direction === 'baja' ? 3 : 4
  const holeSize = direction === 'sube' ? 58 : direction === 'baja' ? 76 : 66
  const magnet = direction === 'baja' ? 60 : direction === 'sube' ? 34 : 44

  const nuevo = dominadas.includes(menosPracticada) ? null : menosPracticada
  const pool: ShapeName[] = []
  if (nuevo) pool.push(nuevo)
  for (const s of dominadas) if (pool.length < base && !pool.includes(s)) pool.push(s)
  for (const s of SHAPE_NAMES) if (pool.length < base && !pool.includes(s)) pool.push(s)

  const positions = gridPositions(pool.length, holeSize)
  const holes: Hole[] = pool.map((s, i) =>
    shapeHole(s, positions[i]!.x, positions[i]!.y, holeSize),
  )

  const skin = MASCOTS[state.generatedCount % MASCOTS.length]!
  const number = 6 + state.generatedCount

  const dominadasTxt = dominadas.slice(0, 2).map((s) => shapeLabel[s]).join(' y ')
  const rationale =
    direction === 'sube'
      ? `Ya domina ${dominadasTxt || 'las formas practicadas'} con más del 85 %.` +
        (nuevo
          ? ` Añadimos ${shapeLabel[nuevo]}, que es la forma que menos ha practicado.`
          : ' Subimos a más piezas y huecos más pequeños.')
      : direction === 'baja'
        ? `Últimamente acierta el ${Math.round(report.accuracy * 100)} %. Bajamos a ${base} piezas, con huecos más grandes y un imán más generoso.`
        : `Va bien con el ${Math.round(report.accuracy * 100)} % de acierto. Repetimos el nivel de dificultad` +
          (nuevo ? ` y estrenamos ${shapeLabel[nuevo]}.` : '.')

  const level: LevelDef = {
    id: `generado-${number}`,
    number,
    title: 'Tu reto',
    mascot: skin.mascot,
    emoji: skin.emoji,
    avatarColor: skin.avatarColor,
    mode: 'formas',
    prompt: 'Pon cada forma en su hueco',
    help: nuevo ? `Hoy practicamos ${shapeLabel[nuevo]}` : 'Un ejercicio hecho para ti',
    bg: ['#EDE3FF', color.bgCream],
    magnet,
    hintAfter: direction === 'baja' ? 10 : 15,
    holes,
    pieces: pool.map((s) => shapePiece(s, holeSize - 6)),
    generated: true,
    rationale,
  }

  return { level, direction, nuevo }
}
