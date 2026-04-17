import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";
import ProgressBarComponent from "../ProgressBarComponent";

import {playSound} from "../utils";

import {EXPAT_DECK} from "./helpArray";

type ExpatCategory =
    | 'Bureaucracy'
    | 'Work'
    | 'German Language'
    | 'Transport'
    | 'Social Life'
    | 'Stereotypes'
    | 'Expat Life'
    | 'Cringe Situations'
    | 'IT / Tech'
    | 'Absurd / Meme'



interface GameFrameProps {
    onFinishGameFrame?:(any);
    settings: {
        showingFrame: any,
        time: any,
        hardLevel: any,
        teams: any,
        categories?: ExpatCategory[],
        wordsToFinish: any
    }
}

interface GameFrameState {
    timer: any
    progress: number,
    deck: Array<{ category: ExpatCategory, text: string }>,
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
            deck: this.buildDeck(this.props.settings.categories),
            gameProcess:{
                team: localStorage.getItem('currentTeam'),
                listWords:{}
            },
            currentWord: '',
            currentCategory: undefined
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

    getRandomInt(min:number, max:number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    buildDeck = (selected?: ExpatCategory[]) => {
        const categories = (selected && selected.length > 0 ? selected : (Object.keys(EXPAT_DECK) as ExpatCategory[]))
        const deck: Array<{ category: ExpatCategory, text: string }> = []
        categories.forEach((cat) => {
            EXPAT_DECK[cat].forEach((text) => deck.push({ category: cat, text }))
        })
        return deck
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
        const {deck} = this.state
        if (!deck || deck.length < 1) {
            const fallback = this.buildDeck()
            const idx = this.getRandomInt(0, fallback.length)
            return fallback[idx]
        }

        const randomIndex = this.getRandomInt(0, deck.length)
        return deck[randomIndex]
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

