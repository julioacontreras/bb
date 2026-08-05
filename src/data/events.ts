import { dbAdd, dbGetAll, STORE_EVENTS } from './db'

/** Los eventos de § 6 · Qué se registra. Todos llevan ts, sessionId y nivel. */
export type GameEvent =
  | Ev<'session_started', {}>
  | Ev<'session_ended', { durationMs: number }>
  | Ev<'level_started', {}>
  | Ev<'level_completed', { durationMs: number; stars: number }>
  | Ev<'shape_tapped', { shape: string; color: string; spoke: boolean }>
  | Ev<'piece_matched', { shape: string; ms: number }>
  | Ev<'piece_missed', { shape: string; droppedOn: string | null }>
  | Ev<'hint_shown', { shape: string }>

type Ev<T extends string, P> = { type: T; ts: number; sessionId: string; level: string | null } & P

export type StoredEvent = GameEvent & { id?: number }

let sessionId = ''
let sessionStart = 0

export function startSession(): string {
  sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  sessionStart = Date.now()
  log({ type: 'session_started', level: null })
  return sessionId
}

export function endSession(): void {
  if (!sessionId) return
  log({ type: 'session_ended', level: null, durationMs: Date.now() - sessionStart })
}

export const sessionElapsedMs = () => (sessionStart ? Date.now() - sessionStart : 0)

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
type LogInput = DistributiveOmit<GameEvent, 'ts' | 'sessionId'>

/** Escribe sin bloquear la interacción: un fallo de disco no puede cortar el juego. */
export function log(event: LogInput): void {
  const full = { ...event, ts: Date.now(), sessionId } as GameEvent
  void dbAdd(STORE_EVENTS, full).catch(() => {})
}

export const allEvents = () => dbGetAll<StoredEvent>(STORE_EVENTS)
