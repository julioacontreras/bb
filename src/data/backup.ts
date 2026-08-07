/**
 * Copia de seguridad de la evolución: todo sale y entra como un único fichero
 * JSON, sin servidor ni cuentas (§ 6 · Privacidad).
 */

import { allEvents, type StoredEvent } from './events'
import { dbAdd, dbClear, STORE_EVENTS } from './db'
import { getProgress, setProgress, type ProgressState } from './progress'

export const BACKUP_VERSION = 1

export interface BackupFile {
  app: 'formas-divertidas'
  version: number
  exportedAt: string
  progress: ProgressState
  events: StoredEvent[]
}

const nombreFichero = (d: Date) =>
  `evolucion-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}.json`

/** Descarga la evolución completa (progreso + eventos) como fichero JSON. */
export async function exportEvolution(): Promise<void> {
  const events = await allEvents()
  const backup: BackupFile = {
    app: 'formas-divertidas',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: getProgress(),
    events,
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = nombreFichero(new Date())
  a.click()
  URL.revokeObjectURL(url)
}

function parseBackup(texto: string): BackupFile {
  let raw: unknown
  try {
    raw = JSON.parse(texto)
  } catch {
    throw new Error('El fichero no es un JSON válido.')
  }
  const b = raw as Partial<BackupFile>
  if (b?.app !== 'formas-divertidas') throw new Error('El fichero no es una copia de esta app.')
  if (b.version !== BACKUP_VERSION) throw new Error('La copia es de otra versión de la app.')
  if (
    !b.progress ||
    typeof b.progress !== 'object' ||
    typeof b.progress.settings !== 'object' ||
    !Array.isArray(b.events)
  ) {
    throw new Error('La copia está incompleta.')
  }
  return b as BackupFile
}

/**
 * Reemplaza la evolución actual por la del fichero. Lanza `Error` con un texto
 * legible si el fichero no sirve; en ese caso no se ha borrado nada.
 */
export async function importEvolution(file: File): Promise<void> {
  const backup = parseBackup(await file.text())

  await dbClear(STORE_EVENTS)
  for (const ev of backup.events) {
    const { id: _id, ...sinId } = ev
    await dbAdd(STORE_EVENTS, sinId)
  }
  setProgress(backup.progress)
}

/**
 * Borra el historial y las estrellas, pero conserva los ajustes del adulto
 * (sonido, límite de tiempo, dificultad).
 */
export async function clearEvolution(): Promise<void> {
  await dbClear(STORE_EVENTS)
  setProgress({
    stars: {},
    proposal: null,
    proposalSeen: true,
    generated: null,
    generatedCount: 0,
  })
}
