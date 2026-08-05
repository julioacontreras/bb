import { allEvents, type StoredEvent } from './events'
import { metricLabel } from '../levels/levels'

const DAY = 86400000

const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export interface ShapeMastery {
  key: string
  label: string
  matched: number
  attempts: number
  accuracy: number
  avgMs: number
  taps: number
  group: 'domina' | 'progreso' | 'cuesta'
}

export interface SessionRow {
  id: string
  ts: number
  minutes: number
  levels: number
  accuracy: number
}

export interface ReportData {
  hasData: boolean
  /** Minutos jugados por día, de lunes a domingo de la semana en curso. */
  minutesByWeekday: { day: string; minutes: number }[]
  weekMinutes: number
  totalStars: number
  streak: number
  accuracy: number
  shapes: ShapeMastery[]
  /** Segundos medios hasta encajar, por semana (más viejo → más nuevo). */
  speedByWeek: { label: string; seconds: number }[]
  accuracyByWeek: { label: string; accuracy: number }[]
  monthDeltaSeconds: number
  sessions: SessionRow[]
}

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export async function buildReport(): Promise<ReportData> {
  const events = await allEvents().catch(() => [] as StoredEvent[])
  return aggregate(events)
}

export function aggregate(events: StoredEvent[]): ReportData {
  const now = Date.now()

  const bySession = new Map<string, StoredEvent[]>()
  for (const e of events) {
    const list = bySession.get(e.sessionId)
    if (list) list.push(e)
    else bySession.set(e.sessionId, [e])
  }

  const sessions: SessionRow[] = []
  const minutesPerDay = new Map<string, number>()

  for (const [id, evs] of bySession) {
    const ts = Math.min(...evs.map((e) => e.ts))
    const end = Math.max(...evs.map((e) => e.ts))
    const ended = evs.find((e) => e.type === 'session_ended')
    const ms = ended && 'durationMs' in ended ? ended.durationMs : end - ts
    const minutes = Math.round((ms / 60000) * 10) / 10
    const matched = evs.filter((e) => e.type === 'piece_matched').length
    const missed = evs.filter((e) => e.type === 'piece_missed').length
    sessions.push({
      id,
      ts,
      minutes,
      levels: evs.filter((e) => e.type === 'level_completed').length,
      accuracy: matched + missed ? matched / (matched + missed) : 0,
    })
    minutesPerDay.set(dayKey(ts), (minutesPerDay.get(dayKey(ts)) ?? 0) + minutes)
  }
  sessions.sort((a, b) => b.ts - a.ts)

  // Semana en curso, empezando en lunes.
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const monday = today.getTime() - ((today.getDay() + 6) % 7) * DAY
  const minutesByWeekday = DIAS.map((day, i) => ({
    day,
    minutes: Math.round(minutesPerDay.get(dayKey(monday + i * DAY)) ?? 0),
  }))
  const weekMinutes = minutesByWeekday.reduce((a, b) => a + b.minutes, 0)

  // Racha: días consecutivos con juego, contando desde hoy hacia atrás.
  let streak = 0
  for (let i = 0; ; i++) {
    const key = dayKey(today.getTime() - i * DAY)
    if ((minutesPerDay.get(key) ?? 0) > 0) streak++
    else if (i > 0 || (minutesPerDay.get(dayKey(today.getTime())) ?? 0) === 0) break
  }

  const matchedAll = events.filter((e) => e.type === 'piece_matched')
  const missedAll = events.filter((e) => e.type === 'piece_missed')
  const accuracy = matchedAll.length + missedAll.length
    ? matchedAll.length / (matchedAll.length + missedAll.length)
    : 0

  const keys = new Set<string>()
  for (const e of events) {
    if (e.type === 'piece_matched' || e.type === 'piece_missed' || e.type === 'shape_tapped') {
      keys.add('shape' in e ? e.shape : '')
    }
  }
  keys.delete('')

  const shapes: ShapeMastery[] = [...keys]
    .map((key) => {
      const m = matchedAll.filter((e) => 'shape' in e && e.shape === key)
      const f = missedAll.filter((e) => 'shape' in e && e.shape === key)
      const taps = events.filter((e) => e.type === 'shape_tapped' && e.shape === key).length
      const attempts = m.length + f.length
      const acc = attempts ? m.length / attempts : 0
      const avgMs = m.length
        ? m.reduce((a, e) => a + ('ms' in e ? e.ms : 0), 0) / m.length
        : 0
      return {
        key,
        label: metricLabel[key] ?? key,
        matched: m.length,
        attempts,
        accuracy: acc,
        avgMs,
        taps,
        group: acc >= 0.8 ? 'domina' : acc >= 0.5 ? 'progreso' : 'cuesta',
      } as ShapeMastery
    })
    .sort((a, b) => b.accuracy - a.accuracy)

  // Cuatro semanas hacia atrás para velocidad y precisión.
  const weeks = [3, 2, 1, 0].map((back) => {
    const from = monday - back * 7 * DAY
    const to = from + 7 * DAY
    const inWeek = events.filter((e) => e.ts >= from && e.ts < to)
    const m = inWeek.filter((e) => e.type === 'piece_matched')
    const f = inWeek.filter((e) => e.type === 'piece_missed')
    return {
      label: back === 0 ? 'Esta' : `-${back}`,
      seconds: m.length
        ? Math.round((m.reduce((a, e) => a + ('ms' in e ? e.ms : 0), 0) / m.length / 1000) * 10) / 10
        : 0,
      accuracy: m.length + f.length ? m.length / (m.length + f.length) : 0,
    }
  })

  const withData = weeks.filter((w) => w.seconds > 0)
  const monthDeltaSeconds =
    withData.length >= 2
      ? Math.round((withData[withData.length - 1]!.seconds - withData[0]!.seconds) * 10) / 10
      : 0

  return {
    hasData: events.length > 0,
    minutesByWeekday,
    weekMinutes,
    totalStars: events
      .filter((e) => e.type === 'level_completed')
      .reduce((a, e) => a + ('stars' in e ? e.stars : 0), 0),
    streak,
    accuracy,
    shapes,
    speedByWeek: weeks.map(({ label, seconds }) => ({ label, seconds })),
    accuracyByWeek: weeks.map(({ label, accuracy: a }) => ({ label, accuracy: a })),
    monthDeltaSeconds,
    sessions: sessions.slice(0, 8),
  }
}

/** Exporta el historial completo a un archivo JSON descargable. */
export async function exportReport(): Promise<void> {
  const events = await allEvents()
  const blob = new Blob([JSON.stringify({ exportedAt: Date.now(), events }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `formas-divertidas-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
