import { useEffect, useState } from 'react'
import { buildReport, type ReportData } from './reports'

/** Carga las agregaciones de eventos. `null` mientras se lee IndexedDB. */
export function useReport(deps: unknown[] = []): ReportData | null {
  const [data, setData] = useState<ReportData | null>(null)
  useEffect(() => {
    let alive = true
    void buildReport().then((r) => {
      if (alive) setData(r)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return data
}
