import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";



interface SettingGameProps {
    onStartGame:(any);
    settings:{
        time: number,
        hardLevel: string,
        teams: any[],
        wordsToFinish: number
        showingFrame: string | undefined,
    }
}

interface SettingGameState {
    time: number,
    hardLevel: string,
    teams: any[],
    wordsToFinish: number
    showingFrame: string | undefined,

}

class SettingGameComponent extends React.PureComponent <SettingGameProps, SettingGameState> {
    constructor(props:any) {
        super(props);

        this.state = {
            showingFrame: this.props.settings.showingFrame,
            time: this.props.settings.time,
            hardLevel: this.props.settings.hardLevel,
            teams: this.props.settings.teams,
            wordsToFinish: this.props.settings.wordsToFinish
        }


    }

    componentDidMount() {
    }

    start = () => {
        this.props.onStartGame(this.state)
    }

    componentDidUpdate(prevProps: Readonly<SettingGameProps>, prevState: Readonly<SettingGameState>, snapshot?: any) {

    }

    changeTime(param:number){
        this.setState({time:param})
    }

    changeWordsToFinish(param:number){
        this.setState({wordsToFinish:param})
    }

    changeHardLevel(param:string){
        this.setState({hardLevel:param})
    }
    addTeam = () => {
        if(this.state.teams.length < 10){
            const array = new Array()
            this.state.teams.map(el => array.push(el))
            array.push({name: "Player " + (array.length+1)})
            this.setState({teams: array})
        }
    }

    removeTeam = (i:number) => {
        const array = new Array()
        this.state.teams.map(el => array.push(el))
        this.cleanStorage(array[i].name)
        array.splice(i,1)
        this.setState({teams: array})
    }

    changeNameOfTeam = (newName:any, i:number) => {
        const array = new Array()
        this.state.teams.map(el => array.push(el))
        this.cleanStorage(array[i].name)
        array[i].name = newName
    }

    cleanStorage(key:string){
        localStorage.removeItem(key)
    }


    render() {
        const {teams} = this.state
        return (
            <>
                <div className={'setting'}>
                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h1 className='title'>Teams:</h1>
                            <h1 className={'add-team'} onClick={this.addTeam}>+</h1>
                        </div>
                        <div className={'team-list'}>
                            {teams.map((el, i)=> (
                                <TeamListItemComponent name={el.name} index={i} delete={this.removeTeam} onChange={this.changeNameOfTeam}/>
                            ))}
                        </div>
                    </div>
                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h1 className='title'>Time</h1>
                        </div>
                        <div className={'info-block'}>
                            <h1 className={`${this.state.time == 10 ? 'active' : ''}`} onClick={(node)=> this.changeTime(10)}>30s</h1>
                            <h1 className={`${this.state.time == 60 ? 'active' : ''}`} onClick={(node)=> this.changeTime(60)}>60s</h1>
                            <h1 className={`${this.state.time == 90 ? 'active' : ''}`} onClick={(node)=> this.changeTime(90)}>90s</h1>
                        </div>

                    </div>
                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h1 className='title'>Level</h1>
                        </div>
                        <div className={'info-block'}>
                            <h1 className={`${this.state.hardLevel == 'EASY' ? 'active' : ''}`} onClick={(node)=> this.changeHardLevel('EASY')}>Easy</h1>
                            <h1 className={`${this.state.hardLevel == 'NORMAL' ? 'active' : ''}`} onClick={(node)=> this.changeHardLevel('NORMAL')}>Normal</h1>
                            <h1 className={`${this.state.hardLevel == 'HARD' ? 'active' : ''}`} onClick={(node)=> this.changeHardLevel('HARD')}>Hard</h1>
                        </div>

                    </div>
                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h1 className='title'>Words</h1>
                        </div>
                        <div className={'info-block'}>
                            <h1 className={`${this.state.wordsToFinish == 30 ? 'active' : ''}`} onClick={(node)=> this.changeWordsToFinish(30)}>30</h1>
                            <h1 className={`${this.state.wordsToFinish == 60 ? 'active' : ''}`} onClick={(node)=> this.changeWordsToFinish(60)}>60</h1>
                            <h1 className={`${this.state.wordsToFinish == 90 ? 'active' : ''}`} onClick={(node)=> this.changeWordsToFinish(90)}>90</h1>
                        </div>

                    </div>
                </div>
                <div>
                    <div className={'settings-block btn-start'}>
                        <h1 onClick={this.start}>Start</h1>
                    </div>
                </div>

            </>


        );
    }
}

export default SettingGameComponent;
