import { useSyncExternalStore } from 'react'
import { dbGet, dbPut, STORE_KV, wipeAll } from './db'
import type { LevelDef } from '../levels/types'

export type Difficulty = 'facil' | 'auto' | 'dificil'

export interface Settings {
  musica: boolean
  voces: boolean
  efectos: boolean
  aplausos: boolean
  /** Límite de sesión en minutos. */
  limiteMin: 10 | 20 | 30
}

export interface ProgressState {
  /** Estrellas ganadas por nivel (0–3). */
  stars: Record<string, number>
  difficulty: Difficulty
  settings: Settings
  /** Propuesta de la app pendiente de que el adulto la apruebe (pantalla 13). */
  proposal: LevelDef | null
  /** false mientras el adulto no haya abierto la propuesta: dispara el aviso. */
  proposalSeen: boolean
  /** Nivel generado ya activado, ocupa la tarjeta "Próximo" del mapa. */
  generated: LevelDef | null
  /** Cuántos ejercicios generados se han activado ya, para numerarlos. */
  generatedCount: number
}

const initial: ProgressState = {
  stars: {},
  difficulty: 'auto',
  settings: { musica: true, voces: true, efectos: true, aplausos: true, limiteMin: 20 },
  proposal: null,
  proposalSeen: true,
  generated: null,
  generatedCount: 0,
}

const KEY = 'progress'

let state: ProgressState = initial
let loaded = false
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export async function loadProgress(): Promise<void> {
  if (loaded) return
  loaded = true
  const row = await dbGet<{ key: string; value: ProgressState }>(STORE_KV, KEY).catch(
    () => undefined,
  )
  if (row?.value) {
    state = { ...initial, ...row.value, settings: { ...initial.settings, ...row.value.settings } }
    emit()
  }
}

export function setProgress(patch: Partial<ProgressState>): void {
  state = { ...state, ...patch }
  emit()
  void dbPut(STORE_KV, { key: KEY, value: state }).catch(() => {})
}

export const getProgress = (): ProgressState => state

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    getProgress,
  )
}

export function setSettings(patch: Partial<Settings>): void {
  setProgress({ settings: { ...state.settings, ...patch } })
}

/** Guarda las estrellas si mejoran lo anterior. */
export function recordStars(levelId: string, stars: number): void {
  const best = Math.max(state.stars[levelId] ?? 0, stars)
  setProgress({ stars: { ...state.stars, [levelId]: best } })
}

export const totalStars = (s: ProgressState = state): number =>
  Object.values(s.stars).reduce((a, b) => a + b, 0)

export const isCompleted = (levelId: string, s: ProgressState = state): boolean =>
  (s.stars[levelId] ?? 0) > 0

export async function resetEverything(): Promise<void> {
  await wipeAll()
  state = initial
  emit()
}
