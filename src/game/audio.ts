/**
 * Audio del juego. Los efectos se sintetizan con WebAudio (nada que descargar) y
 * las voces usan la síntesis de voz del navegador en español.
 * El contexto se desbloquea con la primera interacción del usuario (§ 7).
 */

import { getProgress } from '../data/progress'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicStop: (() => void) | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  return ctx
}

/** Llamar en el primer toque real del usuario. */
export function unlockAudio(): void {
  const c = ac()
  if (c && c.state === 'suspended') void c.resume()
}

type Wave = OscillatorType

function blip(freq: number, at: number, dur: number, gain = 0.22, type: Wave = 'sine') {
  const c = ac()
  if (!c || !master) return
  if (c.state === 'suspended') {
    // En móvil el contexto arranca suspendido y resume() es asíncrono:
    // programamos el sonido cuando termine para no perder el primer toque.
    void c.resume().then(() => blip(freq, at, dur, gain, type))
    return
  }
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + at)
  g.gain.setValueAtTime(0.0001, c.currentTime + at)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + at + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur)
  osc.connect(g).connect(master)
  osc.start(c.currentTime + at)
  osc.stop(c.currentTime + at + dur + 0.02)
}

function noise(at: number, dur: number, gain = 0.14) {
  const c = ac()
  if (!c || !master) return
  const frames = Math.floor(c.sampleRate * dur)
  const buffer = c.createBuffer(1, frames, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = c.createBufferSource()
  src.buffer = buffer
  const g = c.createGain()
  g.gain.value = gain
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1800
  src.connect(filter).connect(g).connect(master)
  src.start(c.currentTime + at)
}

const fx = () => getProgress().settings.efectos

/** Al levantar una pieza. */
export function sfxPick(): void {
  if (!fx()) return
  blip(660, 0, 0.12, 0.16, 'triangle')
}

/** Encaje correcto: campanilla ascendente. */
export function sfxMatch(): void {
  if (!fx()) return
  ;[784, 988, 1319].forEach((f, i) => blip(f, i * 0.07, 0.22, 0.2, 'sine'))
}

/** Fallo: nunca suena a castigo, solo un plop suave y descendente. */
export function sfxMiss(): void {
  if (!fx()) return
  blip(320, 0, 0.16, 0.1, 'sine')
  blip(240, 0.06, 0.16, 0.08, 'sine')
}

/** Toque sin arrastrar. */
export function sfxTap(): void {
  if (!fx()) return
  blip(520, 0, 0.1, 0.12, 'triangle')
}

/**
 * Nota del piano (nivel 11): tono con un armónico suave. No se apaga con el
 * ajuste de `efectos` porque el sonido es el contenido del propio nivel.
 */
export function sfxNota(freq: number): void {
  blip(freq, 0, 0.7, 0.24, 'triangle')
  blip(freq * 2, 0, 0.35, 0.07, 'sine')
}

/** Aplauso de fin de nivel. */
export function sfxApplause(): void {
  if (!getProgress().settings.aplausos) return
  for (let i = 0; i < 18; i++) noise(Math.random() * 0.9, 0.09, 0.08)
}

export function sfxWin(): void {
  if (!fx()) return
  ;[523, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.12, 0.32, 0.22, 'sine'))
}

/** Melodía de fondo muy suave, en bucle. */
export function startMusic(): void {
  if (musicStop || !getProgress().settings.musica) return
  const c = ac()
  if (!c || !master) return
  const notes = [523, 587, 659, 784, 659, 587]
  let i = 0
  const timer = window.setInterval(() => {
    if (!getProgress().settings.musica) return
    blip(notes[i % notes.length]!, 0, 0.5, 0.05, 'sine')
    i++
  }, 900)
  musicStop = () => window.clearInterval(timer)
}

export function stopMusic(): void {
  musicStop?.()
  musicStop = null
}

let voice: SpeechSynthesisVoice | null = null

function pickVoice(): SpeechSynthesisVoice | null {
  if (voice) return voice
  if (typeof speechSynthesis === 'undefined') return null
  const all = speechSynthesis.getVoices()
  voice = all.find((v) => v.lang.startsWith('es')) ?? null
  return voice
}

/** Voz en español. Devuelve true si realmente sonó. */
export function say(text: string): boolean {
  if (!getProgress().settings.voces) return false
  if (typeof speechSynthesis === 'undefined') return false
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = 0.9
  u.pitch = 1.35
  const v = pickVoice()
  if (v) u.voice = v
  speechSynthesis.speak(u)
  return true
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => {
    voice = null
    pickVoice()
  }
}
