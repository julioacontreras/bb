import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './ui/styles.css'

// Bloqueo de orientación en vertical cuando el navegador lo permite (§ 7).
const orientation = screen.orientation as ScreenOrientation & {
  lock?: (o: string) => Promise<void>
}
void orientation?.lock?.('portrait').catch(() => {})

// Segundo toque rápido: se ignora para que no haga zoom.
let lastTouch = 0
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now()
    if (now - lastTouch < 320) e.preventDefault()
    lastTouch = now
  },
  { passive: false },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
