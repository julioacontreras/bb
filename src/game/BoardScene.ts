import Phaser from 'phaser'
import { color, font, hex } from '../ui/tokens'
import { scaledPoints } from './shapes'
import { drawMascot } from './mascots'
import { emit } from './bus'
import {
  sfxApplause,
  sfxMatch,
  sfxMiss,
  sfxPick,
  sfxTap,
  sfxWin,
  say,
  unlockAudio,
} from './audio'
import type { Hole, LevelDef, Piece, Visual } from '../levels/types'
import { BOARD_SIZE } from '../levels/types'

export const CANVAS_W = 350
export const HELP_H = 34
export const TRAY_H = 104
export const CANVAS_H = BOARD_SIZE + HELP_H + TRAY_H

interface HoleView {
  hole: Hole
  container: Phaser.GameObjects.Container
  filled: boolean
}

interface PieceView {
  piece: Piece
  container: Phaser.GameObjects.Container
  home: { x: number; y: number }
  placed: boolean
  moved: boolean
  pickedAt: number
}

export class BoardScene extends Phaser.Scene {
  private level!: LevelDef
  private holes: HoleView[] = []
  private pieces: PieceView[] = []
  private misses = 0
  private hints = 0
  private startedAt = 0
  private lastMatchAt = 0
  private finished = false
  private highlighted: HoleView | null = null

  constructor() {
    super('board')
  }

  init(data: { level: LevelDef }) {
    this.level = data.level
    this.holes = []
    this.pieces = []
    this.misses = 0
    this.hints = 0
    this.finished = false
    this.highlighted = null
  }

  create() {
    this.startedAt = this.time.now
    this.lastMatchAt = this.time.now

    this.makeSparkTexture()

    if (this.level.mascot) {
      const mascot = drawMascot(this, this.level.mascot, BOARD_SIZE)
      mascot.setDepth(0)
    }

    for (const hole of this.level.holes) this.holes.push(this.createHole(hole))

    this.add
      .text(CANVAS_W / 2, BOARD_SIZE + HELP_H / 2, this.level.help, {
        fontFamily: font.round,
        fontSize: '17px',
        fontStyle: '500',
        color: color.inkSoft,
      })
      .setOrigin(0.5)

    this.createTray()

    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) =>
      this.onDragStart(obj),
    )
    this.input.on(
      'drag',
      (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) =>
        this.onDrag(obj, x, y),
    )
    this.input.on('dragend', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) =>
      this.onDragEnd(obj),
    )

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.maybeHint() })
    this.idlePulse()
  }

  // ---------------------------------------------------------------- dibujo

  private makeSparkTexture() {
    if (this.textures.exists('spark')) return
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0xffffff)
    g.fillCircle(6, 6, 6)
    g.generateTexture('spark', 12, 12)
    g.destroy()
  }

  private drawVisual(
    g: Phaser.GameObjects.Graphics,
    visual: Visual,
    size: number,
    fill: number,
    stroke?: { width: number; color: number },
  ) {
    if (visual.kind !== 'shape') return
    if (visual.shape === 'circulo') {
      g.fillStyle(fill)
      g.fillCircle(0, 0, size / 2)
      if (stroke) {
        g.lineStyle(stroke.width, stroke.color)
        g.strokeCircle(0, 0, size / 2)
      }
      return
    }
    const pts = scaledPoints(visual.shape, size)
    g.fillStyle(fill)
    g.fillPoints(pts, true)
    if (stroke) {
      g.lineStyle(stroke.width, stroke.color)
      g.strokePoints(pts, true, true)
    }
  }

  private createHole(hole: Hole): HoleView {
    const c = this.add.container(hole.x, hole.y).setDepth(1)
    const card = this.add.graphics()
    card.fillStyle(hex(color.white), 0.96)
    const s = hole.size + 6
    card.fillRoundedRect(-s / 2, -s / 2, s, s, 18)
    c.add(card)

    if (hole.visual.kind === 'shape') {
      const sil = this.add.graphics()
      this.drawVisual(sil, hole.visual, hole.size * 0.78, hex(color.ink))
      sil.setAlpha(0.09)
      c.add(sil)
    } else if (hole.visual.kind === 'emoji') {
      const sil = this.add
        .text(0, 0, hole.visual.emoji, { fontSize: `${Math.round(hole.size * 0.62)}px` })
        .setOrigin(0.5)
      sil.setTintFill(hex(color.ink))
      sil.setAlpha(0.18)
      c.add(sil)
    }
    return { hole, container: c, filled: false }
  }

  private createPiece(piece: Piece, x: number, y: number): PieceView {
    const c = this.add.container(x, y).setDepth(5)
    const g = this.add.graphics()

    if (piece.visual.kind === 'shape') {
      this.drawVisual(g, piece.visual, piece.size, hex(piece.color), {
        width: 5,
        color: hex(color.white),
      })
      c.add(g)
    } else if (piece.visual.kind === 'emoji') {
      const s = piece.size + 10
      g.fillStyle(hex(color.white))
      g.fillRoundedRect(-s / 2, -s / 2, s, s, 16)
      g.fillStyle(hex(piece.color), 0.55)
      g.fillRoundedRect(-s / 2 + 5, -s / 2 + 5, s - 10, s - 10, 12)
      c.add(g)
      c.add(
        this.add
          .text(0, 0, piece.visual.emoji, { fontSize: `${Math.round(piece.size * 0.66)}px` })
          .setOrigin(0.5),
      )
    }

    // Phaser ya centra el área táctil de un contenedor sobre su origen: basta con
    // darle tamaño. Pasar un rectángulo centrado a mano la desplazaría media pieza.
    const hit = piece.size + 14
    c.setSize(hit, hit)
    c.setInteractive({ draggable: true })

    const view: PieceView = {
      piece,
      container: c,
      home: { x, y },
      placed: false,
      moved: false,
      pickedAt: 0,
    }
    c.setData('view', view)
    return view
  }

  private createTray() {
    const trayY = BOARD_SIZE + HELP_H
    const tray = this.add.graphics().setDepth(2)
    tray.fillStyle(hex(color.white), 0.85)
    tray.fillRoundedRect(6, trayY + 4, CANVAS_W - 12, TRAY_H - 10, 26)

    // Reparto proporcional al ancho de cada pieza: en el nivel de tamaños no
    // todas miden lo mismo y una rejilla regular las solaparía.
    const pad = 18
    const inner = CANVAS_W - pad * 2
    const widths = this.level.pieces.map((p) => p.size + 10)
    const total = widths.reduce((a, w) => a + w, 0)
    const n = widths.length
    const gap = n > 1 ? (inner - total) / (n - 1) : 0
    const y = trayY + TRAY_H / 2 - 2

    if (gap >= 2) {
      let x = pad + (inner - (total + gap * (n - 1))) / 2
      this.level.pieces.forEach((piece, i) => {
        this.pieces.push(this.createPiece(piece, x + widths[i]! / 2, y))
        x += widths[i]! + gap
      })
    } else {
      // No caben con aire: se reparten proporcionalmente y se tocan un poco.
      let acc = 0
      this.level.pieces.forEach((piece, i) => {
        const cx = pad + (inner * (acc + widths[i]! / 2)) / total
        acc += widths[i]!
        this.pieces.push(this.createPiece(piece, cx, y))
      })
    }
  }

  // ------------------------------------------------------------ interacción

  private viewOf(obj: Phaser.GameObjects.Container): PieceView {
    return obj.getData('view') as PieceView
  }

  private onDragStart(obj: Phaser.GameObjects.Container) {
    const v = this.viewOf(obj)
    if (!v || v.placed) return
    unlockAudio()
    v.moved = false
    v.pickedAt = this.time.now
    obj.setDepth(20)
    this.tweens.add({ targets: obj, scale: 1.1, duration: 120, ease: 'Back.out' })
    sfxPick()
    emit('piecePicked', { key: v.piece.key, metric: v.piece.metric })
  }

  private onDrag(obj: Phaser.GameObjects.Container, x: number, y: number) {
    const v = this.viewOf(obj)
    if (!v || v.placed) return
    if (Math.hypot(x - v.home.x, y - v.home.y) > 8) v.moved = true
    obj.x = x
    obj.y = y
    obj.rotation = Phaser.Math.Clamp((x - v.home.x) * 0.0016, -0.12, 0.12)

    const target = this.targetFor(v)
    const near =
      target && Phaser.Math.Distance.Between(x, y, target.hole.x, target.hole.y) < this.level.magnet
        ? target
        : null
    if (near !== this.highlighted) {
      if (this.highlighted) this.setHighlight(this.highlighted, false)
      if (near) this.setHighlight(near, true)
      this.highlighted = near
    }
  }

  private onDragEnd(obj: Phaser.GameObjects.Container) {
    const v = this.viewOf(obj)
    if (!v || v.placed) return
    this.tweens.add({ targets: obj, scale: 1, duration: 120 })
    obj.rotation = 0

    if (!v.moved) {
      this.tapPiece(v)
      obj.setDepth(5)
      return
    }

    const target = this.targetFor(v)
    const hit =
      target &&
      Phaser.Math.Distance.Between(obj.x, obj.y, target.hole.x, target.hole.y) <
        this.level.magnet
    if (this.highlighted) {
      this.setHighlight(this.highlighted, false)
      this.highlighted = null
    }

    if (hit && target) this.matchPiece(v, target)
    else this.returnPiece(v)
  }

  private targetFor(v: PieceView): HoleView | undefined {
    return this.holes.find((h) => !h.filled && h.hole.key === v.piece.key)
  }

  private holeUnder(x: number, y: number): HoleView | undefined {
    return this.holes.find(
      (h) => Phaser.Math.Distance.Between(x, y, h.hole.x, h.hole.y) < h.hole.size * 0.7,
    )
  }

  private setHighlight(h: HoleView, on: boolean) {
    this.tweens.add({
      targets: h.container,
      scale: on ? 1.12 : 1,
      duration: 140,
      ease: 'Sine.out',
    })
  }

  private tapPiece(v: PieceView) {
    sfxTap()
    const spoke = say(v.piece.say)
    this.tweens.add({
      targets: v.container,
      scale: { from: 1, to: 1.18 },
      duration: 130,
      yoyo: true,
      ease: 'Sine.inOut',
    })
    emit('shapeTapped', {
      key: v.piece.key,
      metric: v.piece.metric,
      color: v.piece.color,
      spoke,
    })
  }

  private matchPiece(v: PieceView, target: HoleView) {
    v.placed = true
    target.filled = true
    this.lastMatchAt = this.time.now
    v.container.disableInteractive()

    this.tweens.add({
      targets: v.container,
      x: target.hole.x,
      y: target.hole.y,
      scale: { from: 1.1, to: 1 },
      duration: 260,
      ease: 'Back.out',
      onComplete: () => v.container.setDepth(6),
    })
    this.burst(target.hole.x, target.hole.y, hex(v.piece.color))
    sfxMatch()

    const placed = this.pieces.filter((p) => p.placed).length
    emit('pieceMatched', {
      key: v.piece.key,
      metric: v.piece.metric,
      ms: Math.max(0, Math.round(this.time.now - v.pickedAt)),
      placed,
      total: this.pieces.length,
    })

    if (placed === this.pieces.length) this.time.delayedCall(400, () => this.finish())
  }

  private returnPiece(v: PieceView) {
    this.misses++
    const on = this.holeUnder(v.container.x, v.container.y)
    sfxMiss()
    emit('pieceDropped', {
      key: v.piece.key,
      metric: v.piece.metric,
      on: on ? on.hole.key : null,
    })
    this.tweens.add({
      targets: v.container,
      x: v.home.x,
      y: v.home.y,
      duration: 340,
      ease: 'Back.out',
      onComplete: () => v.container.setDepth(5),
    })
  }

  private burst(x: number, y: number, tint: number) {
    const p = this.add.particles(x, y, 'spark', {
      speed: { min: 60, max: 170 },
      lifespan: 520,
      quantity: 14,
      scale: { start: 0.9, end: 0 },
      tint: [tint, hex(color.white), hex(color.sun)],
      emitting: false,
      blendMode: 'NORMAL',
    })
    p.setDepth(30)
    p.explode(14)
    this.time.delayedCall(900, () => p.destroy())
  }

  /** Latido suave de invitación al toque; nunca por encima de 3 Hz (§ 4). */
  private idlePulse() {
    this.time.addEvent({
      delay: 3200,
      loop: true,
      callback: () => {
        const free = this.pieces.filter((p) => !p.placed)
        const target = free[Math.floor(Math.random() * free.length)]
        if (!target) return
        this.tweens.add({
          targets: target.container,
          scale: { from: 1, to: 1.08 },
          duration: 420,
          yoyo: true,
          ease: 'Sine.inOut',
        })
      },
    })
  }

  /** Tras `hintAfter` segundos sin acierto, se resalta el hueco correcto. */
  private maybeHint() {
    if (this.finished) return
    if (this.time.now - this.lastMatchAt < this.level.hintAfter * 1000) return
    const pending = this.pieces.find((p) => !p.placed)
    if (!pending) return
    const target = this.targetFor(pending)
    if (!target) return
    this.lastMatchAt = this.time.now
    this.hints++
    this.tweens.add({
      targets: target.container,
      scale: { from: 1, to: 1.16 },
      duration: 420,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.inOut',
    })
    emit('hintShown', { key: pending.piece.key, metric: pending.piece.metric })
  }

  private stars(): number {
    if (this.misses <= 1 && this.hints === 0) return 3
    if (this.misses <= 4 && this.hints <= 1) return 2
    return 1
  }

  private finish() {
    if (this.finished) return
    this.finished = true
    sfxWin()
    sfxApplause()

    this.pieces.forEach((p, i) => {
      this.time.delayedCall(i * 120, () => {
        this.tweens.add({
          targets: p.container,
          y: p.container.y - 18,
          duration: 200,
          yoyo: true,
          ease: 'Sine.out',
        })
        this.burst(p.container.x, p.container.y, hex(p.piece.color))
      })
    })

    this.time.delayedCall(this.pieces.length * 120 + 700, () =>
      emit('levelCompleted', {
        ms: Math.round(this.time.now - this.startedAt),
        stars: this.stars(),
        hints: this.hints,
      }),
    )
  }
}
