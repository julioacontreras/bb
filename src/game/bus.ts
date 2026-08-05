/** Bus mínimo entre React (interfaz) y Phaser (tablero). */

export interface GameEvents {
  piecePicked: { key: string; metric: string }
  shapeTapped: { key: string; metric: string; color: string; spoke: boolean }
  pieceDropped: { key: string; metric: string; on: string | null }
  pieceMatched: { key: string; metric: string; ms: number; placed: number; total: number }
  hintShown: { key: string; metric: string }
  levelCompleted: { ms: number; stars: number; hints: number }
}

type Handler<K extends keyof GameEvents> = (payload: GameEvents[K]) => void

const handlers = new Map<keyof GameEvents, Set<(p: never) => void>>()

export function on<K extends keyof GameEvents>(type: K, fn: Handler<K>): () => void {
  let set = handlers.get(type)
  if (!set) handlers.set(type, (set = new Set()))
  set.add(fn as (p: never) => void)
  return () => {
    set.delete(fn as (p: never) => void)
  }
}

export function emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
  const set = handlers.get(type) as Set<Handler<K>> | undefined
  set?.forEach((fn) => fn(payload))
}
