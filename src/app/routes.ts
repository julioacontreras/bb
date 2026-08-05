export type ReportTab = 'resumen' | 'formas' | 'progreso'

export type Route =
  | { name: 'inicio' }
  | { name: 'mapa' }
  | { name: 'nivel'; levelId: string }
  | { name: 'exito'; levelId: string; stars: number }
  | { name: 'padres' }
  | { name: 'reporte'; tab: ReportTab }
  | { name: 'ejercicio' }

export type Nav = (route: Route) => void
