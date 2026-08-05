import Phaser from 'phaser'
import { color, hex } from '../ui/tokens'
import type { MascotName } from '../levels/types'

/**
 * Las mascotas se dibujan con primitivas de Phaser: no hay assets que descargar y
 * el juego arranca al instante. Sustituibles por ilustraciones propias más adelante
 * (§ 8 · siguiente paso 2).
 */
export function drawMascot(
  scene: Phaser.Scene,
  name: MascotName,
  size: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics()
  const s = size / 350
  g.setScale(s)
  const draw = {
    tortuga: drawTortuga,
    leon: drawLeon,
    manzana: drawManzana,
    cesta: drawCesta,
    arbol: drawArbol,
  }[name]
  draw(g)
  return g
}

const shade = (c: string, amount: number): number => {
  const n = parseInt(c.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v * amount))),
  )
  return (ch[0]! << 16) | (ch[1]! << 8) | ch[2]!
}

function drawTortuga(g: Phaser.GameObjects.Graphics) {
  const shell = hex(color.green)
  g.fillStyle(shade(color.green, 0.82))
  ;[
    [78, 268],
    [272, 268],
    [70, 118],
    [280, 118],
  ].forEach(([x, y]) => g.fillCircle(x!, y!, 34))
  g.fillStyle(shade(color.green, 0.9))
  g.fillCircle(175, 34, 40)
  g.fillStyle(0x4a3728)
  g.fillCircle(163, 28, 5)
  g.fillCircle(187, 28, 5)
  g.fillStyle(shell)
  g.fillEllipse(175, 176, 296, 260)
  g.lineStyle(9, shade(color.green, 0.78))
  g.strokeEllipse(175, 176, 296, 260)
}

function drawLeon(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(shade(color.orange, 0.95))
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    g.fillCircle(175 + Math.cos(a) * 138, 178 + Math.sin(a) * 138, 32)
  }
  g.fillStyle(shade(color.sun, 0.92))
  ;[
    [96, 84],
    [254, 84],
  ].forEach(([x, y]) => g.fillCircle(x!, y!, 30))
  g.fillStyle(hex(color.sun))
  g.fillCircle(175, 178, 132)
  g.fillStyle(hex(color.orange))
  g.fillTriangle(140, 46, 175, 6, 210, 46)
  g.fillStyle(0x4a3728)
  g.fillCircle(140, 138, 7)
  g.fillCircle(210, 138, 7)
}

function drawManzana(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(shade('#7A4A22', 1))
  g.fillRect(169, 18, 12, 46)
  g.fillStyle(hex(color.green))
  g.fillEllipse(214, 40, 74, 40)
  g.fillStyle(hex(color.red))
  g.fillCircle(118, 190, 108)
  g.fillCircle(232, 190, 108)
  g.fillRect(118, 82, 114, 216)
  g.fillCircle(118, 262, 76)
  g.fillCircle(232, 262, 76)
  g.fillStyle(0xffffff, 0.35)
  g.fillEllipse(112, 122, 46, 30)
}

function drawCesta(g: Phaser.GameObjects.Graphics) {
  g.lineStyle(14, shade(color.orange, 0.8))
  g.beginPath()
  g.arc(175, 118, 92, Math.PI, 0)
  g.strokePath()
  g.fillStyle(shade(color.orange, 0.92))
  g.fillRoundedRect(38, 96, 274, 216, 34)
  g.fillStyle(shade(color.orange, 0.78))
  g.fillRoundedRect(38, 96, 274, 26, 13)
  g.lineStyle(6, shade(color.orange, 0.72), 0.7)
  for (let x = 66; x < 312; x += 34) {
    g.lineBetween(x, 128, x, 306)
  }
}

function drawArbol(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(shade('#7A4A22', 1))
  g.fillRoundedRect(154, 210, 42, 128, 12)
  g.fillStyle(shade(color.green, 0.86))
  ;[
    [104, 152, 84],
    [246, 152, 84],
    [175, 100, 96],
    [136, 208, 72],
    [216, 208, 72],
  ].forEach(([x, y, r]) => g.fillCircle(x!, y!, r!))
  g.fillStyle(hex(color.green))
  g.fillCircle(175, 158, 112)
}
