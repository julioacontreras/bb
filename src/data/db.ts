/**
 * IndexedDB mínimo, sin dependencias. Todo vive en el dispositivo (§ 6 · Privacidad):
 * sin cuentas, sin servidor y sin datos personales del niño.
 */

const DB_NAME = 'formas-divertidas'
const DB_VERSION = 1
export const STORE_EVENTS = 'events'
export const STORE_KV = 'kv'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        const store = db.createObjectStore(STORE_EVENTS, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('ts', 'ts')
      }
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode)
        const req = fn(tx.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export const dbAdd = <T>(store: string, value: T) => run(store, 'readwrite', (s) => s.add(value as never))
export const dbPut = <T>(store: string, value: T) => run(store, 'readwrite', (s) => s.put(value as never))
export const dbGet = <T>(store: string, key: IDBValidKey) =>
  run<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>)
export const dbGetAll = <T>(store: string) =>
  run<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)
export const dbClear = (store: string) => run(store, 'readwrite', (s) => s.clear())

/** Borra todo el historial: eventos y estado de progreso. */
export async function wipeAll(): Promise<void> {
  await dbClear(STORE_EVENTS)
  await dbClear(STORE_KV)
}
