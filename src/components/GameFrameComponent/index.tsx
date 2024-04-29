import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";
import ProgressBarComponent from "../ProgressBarComponent";

import {WORDS} from "./helpArray";



interface GameFrameProps {
    onFinishGameFrame?:(any);
    settings: {
        showingFrame: any,
        time: any,
        hardLevel: any,
        teams: any,
        wordsToFinish: any
    }
}

interface GameFrameState {
    timer: any
    progress: number,
    arrayWords:any
    gameProcess:{
        team: any;
        listWords:{};
    },
    currentWord: string


}

class GameFrameComponent extends React.PureComponent <GameFrameProps, GameFrameState> {
    constructor(props:any) {
        super(props);

        this.state = {
            timer: this.props.settings.time,
            progress: 100,
            // @ts-ignore
            arrayWords: WORDS[this.props.settings.hardLevel],
            gameProcess:{
                team: localStorage.getItem('currentTeam'),
                listWords:{}
            },
            currentWord: ''
        }
    }

   async componentDidMount() {
        this.startTimer()
        // @ts-ignore
        this.setState({currentWord: await this.getNewWord()})
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

    startTimer = () =>{
        let interval = setInterval((()=>{
            this.setState({timer: this.state.timer - 1, progress:((this.state.timer - 1)  * 100) /this.props.settings.time})
            if(this.state.timer === 0){
                clearInterval(interval)
                this.props.onFinishGameFrame(this.state.gameProcess)
            }
        }), 1000)
        this.props.settings.time
    }

    getNewWord = async() => {
        // return "TEST WORDS"
       const {arrayWords} = this.state

        let arrayForMutation = arrayWords
        let randomIndex = await this.getRandomInt(0, arrayWords.length-1)
        let currentWord = arrayForMutation[randomIndex]

        return currentWord

    }

    setAnswerWord = async (argument:boolean) => {
        let obj:any = this.state.gameProcess.listWords
        obj[this.state.currentWord] = argument

        let gameProcess = {
            team: this.state.gameProcess.team,
            listWords: obj
        }
        let currentWord = await this.getNewWord()
        this.setState({gameProcess: gameProcess, currentWord:currentWord})
    }

    render() {
        const {currentWord} = this.state
        return(
            <div>
                <div className={'timer'}>
                    <h1 style={{color:"white", fontSize: '6em', marginBottom: '-95px', position:"relative", zIndex:1000}}>{this.state.timer}</h1>
                    <ProgressBarComponent progress={this.state.progress} onFinishProgressBar={this.timeIsDone}></ProgressBarComponent>
                </div>
                <div className={'words'}>
                    <h1>{currentWord}</h1>
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

