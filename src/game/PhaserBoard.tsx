import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { BoardScene, CANVAS_H, CANVAS_W } from './BoardScene'
import type { LevelDef } from '../levels/types'

/**
 * Phaser se monta solo en el área de juego (tablero + bandeja). El resto de la
 * pantalla —barra superior, consigna, textos— lo dibuja React.
 */
export function PhaserBoard({ level }: { level: LevelDef }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let game: Phaser.Game | null = null
    let cancelled = false

    // El arranque se aplaza un frame: así el doble montaje de StrictMode no deja
    // dos juegos vivos (y el canvas visible perteneciendo al ya destruido).
    const frame = requestAnimationFrame(() => {
      if (cancelled || !host.current) return
      host.current.replaceChildren()
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width: CANVAS_W,
        height: CANVAS_H,
        transparent: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
        scene: [BoardScene],
        audio: { noAudio: true },
        banner: false,
      })
      game.scene.start('board', { level })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      game?.destroy(true)
    }
  }, [level])

  return (
    <div
      ref={host}
      className="board-host"
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    />
  )
}
