import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";
import {playSound} from "../utils";

import addIcon from '../../img/btn/add_btn.png'
import settingsIcon from '../../img/btn/settings_btn.png'
import ModalSettingsComponent from "./Modal-Settings-Window";


interface SettingGameProps {
    onStartGame: (any);
    settings: {
        time: number,
        hardLevel: string,
        teams: any[],
        categories: any[],
        wordsToFinish: number
        showingFrame: string | undefined,
    }
}

interface SettingGameState {
    time: number,
    hardLevel: string,
    teams: any[],
    categories: any[],
    wordsToFinish: number
    modalSettingsIsOpen: boolean
    showingFrame: string | undefined,

}

class SettingGameComponent extends React.PureComponent <SettingGameProps, SettingGameState> {
    constructor(props: any) {
        super(props);

        this.state = {
            showingFrame: this.props.settings.showingFrame,
            time: this.props.settings.time,
            hardLevel: this.props.settings.hardLevel,
            teams: this.props.settings.teams,
            categories: this.props.settings.categories,
            wordsToFinish: this.props.settings.wordsToFinish,
            modalSettingsIsOpen: false
        }


    }

    playSound = playSound

    componentDidMount() {
    }

    start = () => {
        this.props.onStartGame(this.state)
    }

    componentDidUpdate(prevProps: Readonly<SettingGameProps>, prevState: Readonly<SettingGameState>, snapshot?: any) {

    }

    addTeam = () => {
        this.playSound('click');
        if (this.state.teams.length < 10) {
            const array = new Array()
            this.state.teams.map(el => array.push(el))
            array.push({name: "Player " + (array.length + 1)})
            this.setState({teams: array})
        }
    }

    openModalSettings = () => {
        this.setState({modalSettingsIsOpen:true})
    }
    closeModalSettings = (settings:any) => {
        this.setState({modalSettingsIsOpen:false, ...settings})
    }

    removeTeam = (i: number) => {
        this.playSound('click');
        const array = new Array()
        this.state.teams.map(el => array.push(el))
        this.cleanStorage(array[i].name)
        array.splice(i, 1)
        this.setState({teams: array})
    }

    changeNameOfTeam = (newName: any, i: number) => {
        const array = new Array()
        this.state.teams.map(el => array.push(el))
        this.cleanStorage(array[i].name)
        array[i].name = newName
    }

    cleanStorage(key: string) {
        localStorage.removeItem(key)
    }


    render() {
        const {teams} = this.state
        return (
            <>
                <div className={'setting'}>
                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h2 className='title'>Teams:</h2>
                            <div className={'setting-game-play-btn add-team'}>
                                <p onClick={this.addTeam}><img src={addIcon}/></p>
                                <p onClick={this.openModalSettings}><img src={settingsIcon}/></p>
                            </div>

                        </div>
                        <div className={'team-list'}>
                            {teams.map((el, i) => (
                                <TeamListItemComponent name={el.name} index={i} delete={this.removeTeam} deleteAvailable={teams.length > 2}
                                                       onChange={this.changeNameOfTeam}/>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <div onClick={this.start} className={'settings-block btn-start'}>
                        <h2>Start</h2>
                    </div>
                </div>
                <ModalSettingsComponent settings={this.props.settings} open={this.state.modalSettingsIsOpen} onFinishModalWindow={this.closeModalSettings}/>
            </>


        );
    }
}

export default SettingGameComponent;
