import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import ProgressBarComponent from "../ProgressBarComponent";

import {playSound} from "../utils";

import {getDeckCollectionFromStorage} from "../../decks/deckStorage";
import {ExpatCategory, GameLanguage} from "../../decks/types";
import {buildDeckKey, drawNextCard, DeckCard} from "./sessionCardDeck";

type HardLevel = 'EASY' | 'NORMAL' | 'HARD'


interface GameFrameProps {
    onFinishGameFrame?:(any);
    settings: {
        showingFrame: any,
        time: any,
        hardLevel: any,
        teams: any,
        categories?: ExpatCategory[],
        language?: GameLanguage,
        wordsToFinish: any
    }
}

interface GameFrameState {
    timer: any
    progress: number,
    gameProcess:{
        team: any;
        listWords:{};
    },
    currentWord: string
    currentCategory?: ExpatCategory
    wordFontPx: number
}

class GameFrameComponent extends React.PureComponent <GameFrameProps, GameFrameState> {
    private intervalId?: number;
    private wordsBoxRef = React.createRef<HTMLDivElement>();
    private wordTextRef = React.createRef<HTMLParagraphElement>();
    private fitRaf: number | null = null;

    constructor(props:any) {
        super(props);

        this.state = {
            timer: this.props.settings.time,
            progress: 100,
            gameProcess:{
                team: localStorage.getItem('currentTeam'),
                listWords:{}
            },
            currentWord: '',
            currentCategory: undefined,
            wordFontPx: 72,
        }
    }

    playSound = playSound

   async componentDidMount() {
        this.startTimer()
        const next = await this.getNewCard()
        this.setState({currentWord: next.text, currentCategory: next.category}, this.scheduleFitWord)
    }

    componentWillUnmount() {
        if (this.fitRaf !== null) {
            window.cancelAnimationFrame(this.fitRaf)
            this.fitRaf = null
        }
        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }


    componentDidUpdate(prevProps: Readonly<GameFrameProps>, prevState: Readonly<GameFrameState>, snapshot?: any) {
        if (prevState.currentWord !== this.state.currentWord || prevState.currentCategory !== this.state.currentCategory) {
            this.scheduleFitWord()
        }
    }

    timeIsDone =(isPause?:boolean)=>{

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

    scheduleFitWord = () => {
        if (this.fitRaf !== null) window.cancelAnimationFrame(this.fitRaf)
        this.fitRaf = window.requestAnimationFrame(() => {
            this.fitRaf = null
            this.fitWordToBox()
        })
    }

    fitWordToBox = () => {
        const box = this.wordsBoxRef.current
        const textEl = this.wordTextRef.current
        if (!box || !textEl) return

        const boxW = box.clientWidth
        const boxH = box.clientHeight
        if (boxW <= 0 || boxH <= 0) return

        const catEl = box.querySelector('.word-category')
        const catH = catEl ? (catEl as HTMLElement).offsetHeight + 12 : 0
        const availableH = Math.max(0, boxH - catH)

        const minPx = 18
        const maxPx = Math.max(
            minPx,
            Math.min(140, Math.floor(Math.min(boxW * 0.16, availableH * 0.60))),
        )

        const fits = (px: number) => {
            textEl.style.fontSize = px + 'px'
            const h = textEl.scrollHeight
            const w = textEl.scrollWidth
            if (h > availableH) return false
            if (w > boxW) return false
            return true
        }

        let lo = minPx
        let hi = maxPx
        for (let i = 0; i < 10 && lo < hi; i += 1) {
            const mid = Math.ceil((lo + hi) / 2)
            if (fits(mid)) lo = mid
            else hi = mid - 1
        }

        const best = lo
        if (best !== this.state.wordFontPx) {
            this.setState({ wordFontPx: best })
        } else {
            textEl.style.fontSize = best + 'px'
        }
    }

    // @ts-ignore
    getNewCard = async() => {
        const lang: GameLanguage = this.props.settings.language || 'ru'
        const categories: ExpatCategory[] = (this.props.settings.categories && this.props.settings.categories.length > 0)
            ? this.props.settings.categories
            : [
                'Bureaucracy',
                'Work',
                'German Language',
                'Transport',
                'Social Life',
                'Stereotypes',
                'Expat Life',
                'Cringe Situations',
                'IT / Tech',
                'Absurd / Meme',
            ]

        const collection = getDeckCollectionFromStorage()
        const langDeck =
            collection &&
            // @ts-ignore
            (collection as any).languages &&
            // @ts-ignore
            (collection as any).languages[lang]
        const cards: DeckCard[] = []
        if (langDeck) {
            categories.forEach((cat) => {
                const words: string[] = langDeck[cat] || []
                words.forEach((text: string) => cards.push({category: cat, text: text}))
            })
        }

        // Fallback (should be rare): show something even if storage is empty
        if (cards.length < 1) {
            cards.push({category: 'Expat Life', text: lang === 'de' ? 'Heimweh' : (lang === 'en' ? 'homesickness' : 'тоска по дому')})
        }

        const key = buildDeckKey(lang, categories)
        return drawNextCard(key, cards)
    }

    setAnswerWord = async (argument:boolean) => {
        let obj:any = this.state.gameProcess.listWords
        const label = this.state.currentCategory ? `[${this.state.currentCategory}] ${this.state.currentWord}` : this.state.currentWord
        obj[label] = argument

        this.playSound(argument ? 'confirm' : 'error')
        let gameProcess = {
            team: this.state.gameProcess.team,
            listWords: obj
        }
        const next = await this.getNewCard()
        this.setState({gameProcess: gameProcess, currentWord: next.text, currentCategory: next.category})
        // finishing is handled by the timer tick; avoid double-calling here
    }

    render() {
        const {currentWord, currentCategory, wordFontPx} = this.state
        return(
            <div>
                <div className={'timer'}>
                    <h1 style={{color:"white", fontSize: '4em', marginBottom: '-95px', position:"relative", zIndex:1000}}>{this.state.timer}</h1>
                    <ProgressBarComponent progress={this.state.progress} onFinishProgressBar={this.timeIsDone}></ProgressBarComponent>
                </div>
                <div className={'words'} ref={this.wordsBoxRef}>
                    <div className={'word-box-inner'}>
                        {currentCategory && <div className={'word-category'}>{currentCategory}</div>}
                        <p className={'word-text'} ref={this.wordTextRef} style={{fontSize: wordFontPx}}>{currentWord}</p>
                    </div>
                </div>
                <div className={'navigation'}>
                    <div className={'btn'} onClick={()=>this.setAnswerWord(false)}><h1>Skip</h1></div>
                    <div className={'btn'} onClick={()=>this.setAnswerWord(true)}><h1>Next</h1></div>
                </div>
            </div>
        )
    }
}

export default GameFrameComponent;

