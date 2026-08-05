/**
 * Geometría de las formas del juego, definida una sola vez y consumida por
 * React (como `points` de un `<polygon>` SVG) y por Phaser (como `fillPoints`).
 *
 * Todas las formas viven en un espacio unitario centrado: x e y en [-0.5, 0.5].
 */

export type ShapeName =
  | 'circulo'
  | 'cuadrado'
  | 'rectangulo'
  | 'triangulo'
  | 'pentagono'
  | 'estrella'
  | 'corazon'

export const SHAPE_NAMES: ShapeName[] = [
  'circulo',
  'cuadrado',
  'triangulo',
  'rectangulo',
  'pentagono',
  'estrella',
  'corazon',
]

/** Cómo lo dice la voz y cómo se etiqueta en los reportes del adulto. */
export const shapeLabel: Record<ShapeName, string> = {
  circulo: 'círculo',
  cuadrado: 'cuadrado',
  rectangulo: 'rectángulo',
  triangulo: 'triángulo',
  pentagono: 'pentágono',
  estrella: 'estrella',
  corazon: 'corazón',
}

export type Point = { x: number; y: number }

const regular = (sides: number, radius = 0.5, rotation = -Math.PI / 2): Point[] =>
  Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i * 2 * Math.PI) / sides
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius }
  })

const star = (points = 5, outer = 0.5, inner = 0.21): Point[] =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / points
    return { x: Math.cos(a) * r, y: Math.sin(a) * r }
  })

const heart = (steps = 48): Point[] => {
  const pts: Point[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y =
      -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    pts.push({ x: x / 34, y: y / 30 })
  }
  return pts
}

const rounded = (w: number, h: number): Point[] => [
  { x: -w / 2, y: -h / 2 },
  { x: w / 2, y: -h / 2 },
  { x: w / 2, y: h / 2 },
  { x: -w / 2, y: h / 2 },
]

const CACHE = new Map<ShapeName, Point[] | null>()

/** `null` significa "es un círculo": se dibuja como elipse, no como polígono. */
export function unitPoints(shape: ShapeName): Point[] | null {
  if (!CACHE.has(shape)) {
    CACHE.set(
      shape,
      shape === 'circulo'
        ? null
        : shape === 'cuadrado'
          ? rounded(0.94, 0.94)
          : shape === 'rectangulo'
            ? rounded(1, 0.62)
            : shape === 'triangulo'
              ? regular(3, 0.54)
              : shape === 'pentagono'
                ? regular(5, 0.52)
                : shape === 'estrella'
                  ? star()
                  : heart(),
    )
  }
  return CACHE.get(shape) ?? null
}

/** Puntos escalados a un tamaño en píxeles, centrados en (cx, cy). */
export function scaledPoints(shape: ShapeName, size: number, cx = 0, cy = 0): Point[] {
  const pts = unitPoints(shape)
  if (!pts) return []
  return pts.map((p) => ({ x: cx + p.x * size, y: cy + p.y * size }))
}

/** Atributo `points` de un `<polygon>` SVG dentro de un viewBox 0 0 size size. */
export function svgPoints(shape: ShapeName, size: number): string {
  return scaledPoints(shape, size, size / 2, size / 2)
    .map((p) => `${round(p.x)},${round(p.y)}`)
    .join(' ')
}

const round = (n: number) => Math.round(n * 100) / 100
