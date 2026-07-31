import React from "react";
import '../../App.css';
import '../BodyComponent.css';
import './index.css'
import ProgressBarComponent from "../ProgressBarComponent";
import SkipNextIcon from '@material-ui/icons/SkipNext';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import BlockIcon from '@material-ui/icons/Block';

import {playSound, haptic} from "../utils";
import {EXPAT_DECK, HardLevel, ExpatCategory, WordPack} from "./helpArray";
import {getWordsForLevel} from "../../services/wordSync";
import {getCustomPack} from "../../services/customPacks";

type Card = { category?: ExpatCategory, text: string }

const SESSION_DECK_KEY = 'alias.sessionDeck'
const SESSION_PACK_KEY = 'alias.sessionPackMeta'

interface GameFrameProps {
    onFinishGameFrame?:(any);
    settings: {
        showingFrame: any,
        time: any,
        hardLevel: any,
        teams: any,
        categories?: ExpatCategory[],
        wordPack?: WordPack,
        customPackId?: string,
        wordsToFinish: any
    }
}

interface GameFrameState {
    timer: any
    progress: number,
    /** Remaining cards (no repeats until empty, then reshuffle fresh) */
    deck: Card[],
    streak: number,
    streakBonus: number,
    gameProcess:{
        team: any;
        listWords:{};
        streakBonus: number;
    },
    currentWord: string
    currentCategory?: ExpatCategory
}

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    return a
}

/** Clear remaining session deck (call on Restart / new game). */
export function resetSessionDeck() {
    localStorage.removeItem(SESSION_DECK_KEY)
    localStorage.removeItem(SESSION_PACK_KEY)
}

class GameFrameComponent extends React.PureComponent <GameFrameProps, GameFrameState> {
    private intervalId?: number;
    private resizeTimer?: number;
    private wordTextRef = React.createRef<HTMLParagraphElement>();

    constructor(props:any) {
        super(props);

        const deck = this.loadOrBuildDeck()
        this.state = {
            timer: this.props.settings.time,
            progress: 100,
            deck,
            streak: 0,
            streakBonus: 0,
            gameProcess:{
                team: localStorage.getItem('currentTeam'),
                listWords:{},
                streakBonus: 0,
            },
            currentWord: '',
            currentCategory: undefined
        }
    }

    playSound = playSound

    packMeta = () => {
        const pack = (this.props.settings.wordPack || 'classic') as WordPack
        const level = String(this.props.settings.hardLevel || 'NORMAL').toUpperCase()
        const cats = (this.props.settings.categories || []).slice().sort().join('|')
        const customId = this.props.settings.customPackId || ''
        return `${pack}|${level}|${cats}|${customId}`
    }

    loadOrBuildDeck = (): Card[] => {
        const meta = this.packMeta()
        try {
            const savedMeta = localStorage.getItem(SESSION_PACK_KEY)
            const raw = localStorage.getItem(SESSION_DECK_KEY)
            if (savedMeta === meta && raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed as Card[]
            }
        } catch {
            // fall through
        }
        const fresh = shuffle(this.buildDeckSource())
        this.persistDeck(fresh, meta)
        return fresh
    }

    persistDeck = (deck: Card[], meta?: string) => {
        localStorage.setItem(SESSION_DECK_KEY, JSON.stringify(deck))
        localStorage.setItem(SESSION_PACK_KEY, meta || this.packMeta())
    }

    buildDeckSource = (): Card[] => {
        const pack = (this.props.settings.wordPack || 'classic') as WordPack
        if (pack === 'custom') {
            const custom = getCustomPack(String(this.props.settings.customPackId || ''))
            const words = custom && custom.words.length > 0 ? custom.words : ['Add words in Settings']
            return words.map((text) => ({ text }))
        }
        if (pack === 'expat') {
            const selected = this.props.settings.categories
            const categories = (selected && selected.length > 0 ? selected : (Object.keys(EXPAT_DECK) as ExpatCategory[]))
            const deck: Card[] = []
            categories.forEach((cat) => {
                EXPAT_DECK[cat].forEach((text) => deck.push({ category: cat, text }))
            })
            return deck
        }
        const level = (String(this.props.settings.hardLevel || 'NORMAL').toUpperCase() as HardLevel)
        return getWordsForLevel(level).map((text) => ({ text }))
    }

   async componentDidMount() {
        this.startTimer()
        window.addEventListener('resize', this.scheduleAdjustWordTypography, { passive: true } as any)
        const next = this.drawCard()
        if (next) {
            this.setState({currentWord: next.text, currentCategory: next.category, deck: next.remaining})
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.scheduleAdjustWordTypography as any)
        if (this.resizeTimer !== undefined) {
            window.clearTimeout(this.resizeTimer)
            this.resizeTimer = undefined
        }
        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }

    scheduleAdjustWordTypography = () => {
        if (this.resizeTimer !== undefined) {
            window.clearTimeout(this.resizeTimer)
        }
        this.resizeTimer = window.setTimeout(() => {
            this.resizeTimer = undefined
            this.adjustWordTypography()
        }, 120)
    }

    componentDidUpdate(prevProps: Readonly<GameFrameProps>, prevState: Readonly<GameFrameState>) {
        if (prevState.currentWord !== this.state.currentWord || prevState.currentCategory !== this.state.currentCategory) {
            window.requestAnimationFrame(() => this.adjustWordTypography())
        }
    }

    getWordDisplayParts = (raw: string): string[] => {
        if (!raw || typeof raw !== 'string') return []
        const parts = raw.trim().split(/\s+/).filter((p) => p.length > 0)
        return parts.slice(0, 3)
    }

    adjustWordTypography = () => {
        const el = this.wordTextRef.current
        if (!el) return

        const parts = this.getWordDisplayParts(this.state.currentWord)
        if (parts.length !== 1) {
            el.style.fontSize = ''
            el.style.whiteSpace = ''
            el.style.wordBreak = ''
            el.style.removeProperty('overflow-wrap')
            el.style.lineHeight = ''
            return
        }

        const inner = el.parentElement
        if (!inner) return

        const maxPx = Math.min(160, Math.max(48, Math.floor(inner.clientWidth * 0.42)))
        let size = maxPx
        el.style.whiteSpace = 'nowrap'
        el.style.wordBreak = 'normal'
        el.style.setProperty('overflow-wrap', 'normal')
        el.style.lineHeight = '1.1'
        el.style.fontSize = size + 'px'

        const maxW = inner.clientWidth
        while (size > 12 && el.scrollWidth > maxW) {
            size -= 1
            el.style.fontSize = size + 'px'
        }

        if (size <= 12 && el.scrollWidth > maxW) {
            el.style.fontSize = '12px'
            el.style.whiteSpace = 'normal'
            el.style.setProperty('overflow-wrap', 'anywhere')
            el.style.wordBreak = 'break-word'
        }
    }

    timeIsDone =(_isPause?:boolean)=>{}

    /**
     * Draw next card without replacement. If deck empty — reshuffle full pack for this session.
     */
    drawCard = (fromDeck?: Card[]): { text: string, category?: ExpatCategory, remaining: Card[] } | null => {
        let deck = (fromDeck || this.state.deck || []).slice()
        if (deck.length < 1) {
            deck = shuffle(this.buildDeckSource())
        }
        if (deck.length < 1) return null
        const card = deck[0]
        const remaining = deck.slice(1)
        this.persistDeck(remaining)
        return { text: card.text, category: card.category, remaining }
    }

    startTimer = () =>{
        if (this.intervalId !== undefined) return

        const total = Number(this.props.settings.time) || 1
        this.intervalId = window.setInterval(() => {
            this.setState((prev) => {
                const nextTimer = Number(prev.timer) - 1
                if (nextTimer < 6) this.playSound('tick')

                if (nextTimer <= 0) {
                    if (this.intervalId !== undefined) {
                        window.clearInterval(this.intervalId)
                        this.intervalId = undefined
                    }
                    if (this.props.onFinishGameFrame) this.props.onFinishGameFrame(prev.gameProcess)
                    return { ...prev, timer: 0, progress: 0 }
                }

                return {
                    ...prev,
                    timer: nextTimer,
                    progress: (nextTimer * 100) / total,
                }
            })
        }, 1000)
    }

    /**
     * Streak bonus: from streak 3 onward each correct answer adds +1 bonus point.
     * (streak 3 → +1, 4 → +1, 5 → +1, …)
     */
    streakBonusFor = (streak: number) => (streak >= 3 ? 1 : 0)

    setAnswerWord = async (argument:boolean) => {
        haptic(argument ? 12 : 8)
        let obj:any = this.state.gameProcess.listWords
        const label = this.state.currentCategory ? `[${this.state.currentCategory}] ${this.state.currentWord}` : this.state.currentWord
        obj[label] = argument

        this.playSound(argument ? 'confirm' : 'error')
        const nextStreak = argument ? (this.state.streak + 1) : 0
        const addBonus = argument ? this.streakBonusFor(nextStreak) : 0
        const nextBonus = this.state.streakBonus + addBonus
        if (argument && nextStreak === 5) {
            this.playSound('victory')
            haptic([20, 40, 20])
        }

        const drawn = this.drawCard()
        const gameProcess = {
            team: this.state.gameProcess.team,
            listWords: obj,
            streakBonus: nextBonus,
        }
        this.setState({
            gameProcess,
            currentWord: drawn ? drawn.text : '',
            currentCategory: drawn ? drawn.category : undefined,
            deck: drawn ? drawn.remaining : [],
            streak: nextStreak,
            streakBonus: nextBonus,
        })
    }

    render() {
        const {currentWord, currentCategory, streak, streakBonus} = this.state
        const parts = this.getWordDisplayParts(currentWord)
        const displayText = parts.join(' ')
        const single = parts.length === 1
        return(
            <div className="game-frame">
                <div className={'timer'}>
                    <h1 className="game-frame__timer-value">{this.state.timer}</h1>
                    <ProgressBarComponent progress={this.state.progress} onFinishProgressBar={this.timeIsDone}></ProgressBarComponent>
                </div>
                <div className={'words'}>
                    <div className="game-frame__word-inner">
                        {streak >= 2 && (
                            <div className="streak-badge" style={{ marginBottom: 'var(--gap-sm)' }}>
                                <span className="streak-badge__dot" />
                                <span>Streak x{streak}{streakBonus > 0 ? ` · +${streakBonus} bonus` : ''}</span>
                            </div>
                        )}
                        {currentCategory && <div className={'word-category'}>{currentCategory}</div>}
                        <div key={currentWord} className="game-frame__word-anim">
                            <p
                                ref={this.wordTextRef}
                                className={'game-frame__word-text ' + (single ? 'game-frame__word-text--single' : 'game-frame__word-text--multi')}
                            >
                                {displayText}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={'navigation'}>
                    <div className={'btn btn--skip'} onClick={()=>this.setAnswerWord(false)}>
                        <BlockIcon className="btn__icon" />
                        <h1>Skip</h1>
                    </div>
                    <div className={'btn btn--next'} onClick={()=>this.setAnswerWord(true)}>
                        <CheckCircleOutlineIcon className="btn__icon" />
                        <h1>Next</h1>
                        <SkipNextIcon className="btn__icon btn__icon--trail" />
                    </div>
                </div>
            </div>
        )
    }
}

export default GameFrameComponent;
