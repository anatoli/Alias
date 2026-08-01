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
}

class GameFrameComponent extends React.PureComponent <GameFrameProps, GameFrameState> {
    private intervalId?: number;

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
        }
    }

    playSound = playSound

   async componentDidMount() {
        this.startTimer()
        const next = await this.getNewCard()
        this.setState({currentWord: next.text, currentCategory: next.category})
    }

    componentWillUnmount() {
        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }


    componentDidUpdate(prevProps: Readonly<GameFrameProps>, prevState: Readonly<GameFrameState>, snapshot?: any) {

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
        const {currentWord, currentCategory} = this.state
        return(
            <div>
                <div className={'timer'}>
                    <h1 style={{color:"white", fontSize: '4em', marginBottom: '-95px', position:"relative", zIndex:1000}}>{this.state.timer}</h1>
                    <ProgressBarComponent progress={this.state.progress} onFinishProgressBar={this.timeIsDone}></ProgressBarComponent>
                </div>
                <div className={'words'}>
                    <div>
                        {currentCategory && <div className={'word-category'}>{currentCategory}</div>}
                        <p>{currentWord}</p>
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

