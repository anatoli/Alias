// @ts-ignore
import click from "../res/audio/click.mp3"
// @ts-ignore
import error from "../res/audio/error.mp3"
// @ts-ignore
import confirm from "../res/audio/confirm.mp3"
// @ts-ignore
import victory from "../res/audio/pobeda.mp3"
// @ts-ignore
import tick from "../res/audio/tick.mp3"

type SoundEvent = 'click' | 'error' | 'confirm' | 'victory' | 'tick'

const SOUND_KEY = 'sound-effect'
const SOUND_EVENTS: SoundEvent[] = ['click', 'error', 'confirm', 'victory', 'tick']

let audioUnlocked = false
let unlockListenerAttached = false
let soundsWarmed = false

const audioCache: Partial<Record<SoundEvent, HTMLAudioElement>> = {}
const lastPlayedAt: Partial<Record<SoundEvent, number>> = {}

const soundSrcMap: Record<SoundEvent, string> = {
    click,
    error,
    confirm,
    victory,
    tick,
}

function soundEnabled(): boolean {
    const raw = localStorage.getItem(SOUND_KEY)
    if (raw === null) {
        // default: enabled
        localStorage.setItem(SOUND_KEY, 'true')
        return true
    }
    return raw === 'true'
}

function getOrCreateAudio(event: SoundEvent): HTMLAudioElement | null {
    const sound_src = soundSrcMap[event]
    if (!sound_src) return null

    let audio = audioCache[event]
    if (!audio) {
        audio = new Audio(sound_src)
        audio.preload = 'auto'
        audioCache[event] = audio
    } else if (audio.src !== sound_src) {
        audio.src = sound_src
    }
    return audio
}

/**
 * After first user gesture: create players, load buffers, and silently prime play().
 * Cuts first-play latency on Android WebView / mobile browsers.
 */
async function warmupSounds() {
    if (soundsWarmed) return
    soundsWarmed = true

    await Promise.all(
        SOUND_EVENTS.map(async (event) => {
            const audio = getOrCreateAudio(event)
            if (!audio) return
            try {
                audio.load()
            } catch {
                // ignore
            }
            try {
                const prevVol = audio.volume
                audio.volume = 0
                const p = audio.play()
                if (p && typeof (p as any).then === 'function') {
                    await p
                }
                audio.pause()
                audio.currentTime = 0
                audio.volume = prevVol > 0 ? prevVol : 1
            } catch {
                try {
                    audio.volume = 1
                    audio.currentTime = 0
                } catch {
                    // ignore
                }
            }
        })
    )
}

function attachUnlockOnce() {
    if (unlockListenerAttached) return
    unlockListenerAttached = true

    const unlock = async () => {
        if (audioUnlocked) return
        audioUnlocked = true

        // Best-effort unlock for mobile browsers (iOS/Android) that block audio until user gesture
        try {
            // @ts-ignore
            const Ctx = window.AudioContext || window.webkitAudioContext
            if (Ctx) {
                const ctx = new Ctx()
                if (ctx.state === 'suspended') await ctx.resume()
                // Some browsers require a short sound; keep it silent.
                const oscillator = ctx.createOscillator()
                const gain = ctx.createGain()
                gain.gain.value = 0
                oscillator.connect(gain)
                gain.connect(ctx.destination)
                oscillator.start(0)
                oscillator.stop(0.01)
            }
        } catch {
            // ignore
        }

        try {
            await warmupSounds()
        } catch {
            // ignore
        } finally {
            window.removeEventListener('pointerdown', unlock)
            window.removeEventListener('touchend', unlock)
            window.removeEventListener('keydown', unlock)
        }
    }

    window.addEventListener('pointerdown', unlock, { once: true } as any)
    window.addEventListener('touchend', unlock, { once: true } as any)
    window.addEventListener('keydown', unlock, { once: true } as any)
}

export const playSound = (event:string) =>{
    attachUnlockOnce()
    if (!soundEnabled()) return

    const e = event as SoundEvent
    if (!soundSrcMap[e]) return

    const now = Date.now()
    // Prevent rapid double-fire (e.g., click handler bubbling / repeated renders)
    const minGapMs = e === 'tick' ? 350 : 80
    const last = (lastPlayedAt[e] !== undefined ? lastPlayedAt[e] : 0) as number
    if (now - last < minGapMs) return
    lastPlayedAt[e] = now

    // Reuse one Audio element per sound to avoid piling up <audio> nodes and echo/pings.
    const audio = getOrCreateAudio(e)
    if (!audio) return

    try {
        // Avoid overlap / echo. Restart from beginning.
        if (!audio.paused) audio.pause()
        audio.currentTime = 0
    } catch {
        // Some WebViews can throw on currentTime if not yet loaded; ignore.
    }

    const p = audio.play()
    if (p && typeof (p as any).catch === 'function') {
        ;(p as any).catch(() => {
            // Autoplay/user-gesture restrictions: ignore (will work after first interaction)
        })
    }
}

/** Light haptic feedback (Android WebView / supported browsers). */
export function haptic(pattern: number | number[] = 10) {
    try {
        if (typeof navigator !== 'undefined' && typeof (navigator as any).vibrate === 'function') {
            ;(navigator as any).vibrate(pattern)
        }
    } catch {
        // ignore
    }
}
