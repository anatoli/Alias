import React from "react";
import '../App.css';
import './BodyComponent.css';
import SettingGameComponent from "./SettingGameComponent";
import BeforeStartFrameComponent from "./BeforeStartFrameComponent";
import TimerComponent from "./TimerComponent";
import GameFrameComponent from "./GameFrameComponent";
import ListWordsComponent from "./ListWordsComponent";
import CurrentGameResultComponent from "./CurrentGameResultComponent";



interface BodyComponentProps {
}

interface BodyComponentState {

    showingFrame: string | undefined,
    stateSettings: {
        showingFrame: undefined,
        time: number,
        hardLevel: string,
        teams: any[],
        wordsToFinish: 30
    }

}

class BodyComponent extends React.PureComponent <BodyComponentProps, BodyComponentState> {
    constructor(props:any) {
        super(props);

        this.state = {
            showingFrame: undefined,
            stateSettings: {
                showingFrame: undefined,
                time: 30,
                hardLevel: 'NORMAL',
                teams: [{name: 'Player 1'}, {name: 'Player 2'} ],
                wordsToFinish: 30
            }
        }


    }

    componentDidMount() {
    }

    setType = (type: string) =>{
        this.setState({showingFrame: type})
    }

    componentDidUpdate(prevProps: Readonly<BodyComponentProps>, prevState: Readonly<BodyComponentState>, snapshot?: any) {

    }

    beforeStartGame = (stateSettings:any) => {
        this.setState({stateSettings:stateSettings})
        this.setType('Start')
    }

    onBackToSettings = () => {
        this.setType('Settings')
    }

    newLap = () => {
        // @ts-ignore    }
        let teamsActiveList:any = JSON.parse(localStorage.getItem('teamsActiveList'))
        Object.keys(teamsActiveList).map(el => teamsActiveList[el] = false)
        localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
        this.onPlayGame()
    }


    onPlayGame = () =>{
        const {teams} = this.state.stateSettings
        let iteration = 0
        // @ts-ignore
        let teamsActiveList:any = JSON.parse(localStorage.getItem('teamsActiveList')) || {}

        if(Object.keys(teamsActiveList).length < 1){
            teams.map((el:string)=> {
                // @ts-ignore
                teamsActiveList[el.name] = false
            })
            localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
        }

        let randomIndex:any = undefined
        let count:number = 0
        Object.keys(teamsActiveList).map((key, i)=>{
            if(!teamsActiveList[key] && count < 1){
                randomIndex = i
                count = count + 1
                teamsActiveList[key] = true
                localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
            }
            if(i == Object.keys(teamsActiveList).length-1 && randomIndex === undefined){
                this.newLap();
            }

        })
        localStorage.setItem('currentTeam', teams[randomIndex].name)
        this.setType('Timer')
    }

    onFinishTimer = () =>{
        this.setType('PlayGame')
    }

    showResults = () =>{
        this.setType('CurrentGameResult')
    }

    onFinishGameFrame = (wordList:any) =>{
        localStorage.setItem(wordList.team, JSON.stringify(wordList))
        this.setType('ListOfGuessedWords')
    }

    sweatchTeam = () =>{
        this.onPlayGame()
    }

    restart = () => {
        localStorage.removeItem('teamsActiveList')
        localStorage.removeItem('currentTeam')
        localStorage.removeItem('results')
        this.state.stateSettings.teams.map(el=>{
            localStorage.removeItem(el.name)
        })
        this.onBackToSettings()
    }

    getComponent = (toSchow='Category') => {
        switch (toSchow) {
            case 'Rules': {
                return <div><h2>Rules</h2></div>
            }
            case 'Settings': {
                return <SettingGameComponent onStartGame={this.beforeStartGame} settings={this.state.stateSettings}/>
            }
            case 'Start': {
                return <BeforeStartFrameComponent onPlayGame={this.onPlayGame} onBackToSettings={this.onBackToSettings} settings={this.state.stateSettings}/>
            }
            case 'Timer': {
                return <TimerComponent onFinishTimer={this.onFinishTimer}/>
            }
            case 'PlayGame': {
                return <GameFrameComponent settings={this.state.stateSettings} onFinishGameFrame={this.onFinishGameFrame}></GameFrameComponent>
            }
            case 'ListOfGuessedWords': {
                return <ListWordsComponent onNext={this.showResults} teamInfo={[]} />
            }
            case 'CurrentGameResult': {
                return <CurrentGameResultComponent onRestart={this.restart} wordsToFinish={this.state.stateSettings.wordsToFinish} onNext={this.sweatchTeam} teamInfo={[]} />
            }
        }
    }


    render() {
        return (
            <div className={'body-wrapper'}>
                    {!this.state.showingFrame &&
                    <>
                        <div>
                            <button className={'btn-custom'} onClick={(node) =>this.setType('Settings')}>Start</button>
                            <button className={'btn-custom'}  onClick={(node) => this.setType('Rules')}>Rules</button>
                        </div>
                    </>
                    }

                    {this.state.showingFrame &&
                    <div>
                        {this.getComponent(this.state.showingFrame)}
                    </div>
                    }

            </div>
        );
    }
}

export default BodyComponent;
