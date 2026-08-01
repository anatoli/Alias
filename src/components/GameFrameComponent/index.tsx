import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import ProgressBarComponent from "../ProgressBarComponent";

import {playSound} from "../utils";

import {WORDS} from "./helpArray";
import {drawNextWord} from "./sessionWordDeck";

type HardLevel = 'EASY' | 'NORMAL' | 'HARD'


interface GameFrameProps {
    onFinishGameFrame?:(any);
    settings: {
        showingFrame: any,
        time: any,
        hardLevel: any,
        teams: any,
        categories?: any[],
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
        }
    }

    playSound = playSound

   async componentDidMount() {
        this.startTimer()
        const next = await this.getNewWord()
        this.setState({currentWord: next})
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
    getNewWord = async() => {
        const hardLevel: HardLevel = this.props.settings.hardLevel || 'NORMAL'
        const source = (WORDS as any)[hardLevel] || (WORDS as any).NORMAL || []
        return drawNextWord(hardLevel, source)
    }

    setAnswerWord = async (argument:boolean) => {
        let obj:any = this.state.gameProcess.listWords
        obj[this.state.currentWord] = argument

        this.playSound(argument ? 'confirm' : 'error')
        let gameProcess = {
            team: this.state.gameProcess.team,
            listWords: obj
        }
        const next = await this.getNewWord()
        this.setState({gameProcess: gameProcess, currentWord: next})
        // finishing is handled by the timer tick; avoid double-calling here
    }

    render() {
        const {currentWord} = this.state
        return(
            <div>
                <div className={'timer'}>
                    <h1 style={{color:"white", fontSize: '4em', marginBottom: '-95px', position:"relative", zIndex:1000}}>{this.state.timer}</h1>
                    <ProgressBarComponent progress={this.state.progress} onFinishProgressBar={this.timeIsDone}></ProgressBarComponent>
                </div>
                <div className={'words'}>
                    <div>
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

