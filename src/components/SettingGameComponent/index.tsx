import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";
import {playSound} from "../utils";

import ModalSettingsComponent from "./Modal-Settings-Window";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import TuneIcon from '@material-ui/icons/Tune';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MusicOffIcon from '@material-ui/icons/MusicOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import {WordPack} from "../GameFrameComponent/helpArray";


interface SettingGameProps {
    onStartGame: (any);
    settings: {
        time: number,
        hardLevel: string,
        teams: any[],
        categories: any[],
        wordPack?: WordPack,
        wordsToFinish: number
        showingFrame: string | undefined,
    }
    soundEnabled: boolean
    bgMusicEnabled: boolean
    onToggleSound: (enabled: boolean) => void
    onToggleBgMusic: (enabled: boolean) => void
}

interface SettingGameState {
    time: number,
    hardLevel: string,
    teams: any[],
    categories: any[],
    wordPack: WordPack,
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
            wordPack: this.props.settings.wordPack || 'classic',
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
                                <button type="button" className="icon-btn" onClick={this.addTeam} aria-label="Add team">
                                    <PersonAddIcon />
                                </button>
                                <button type="button" className="icon-btn" onClick={this.openModalSettings} aria-label="Game settings">
                                    <TuneIcon />
                                </button>
                            </div>

                        </div>
                        <div className={'team-list'}>
                            {teams.map((el, i) => (
                                <TeamListItemComponent name={el.name} index={i} delete={this.removeTeam} deleteAvailable={teams.length > 2}
                                                       onChange={this.changeNameOfTeam}/>
                            ))}
                        </div>
                    </div>

                    <div className={'settings-block'}>
                        <div className={'title-block'}>
                            <h2 className='title'>Audio:</h2>
                        </div>
                        <div className="audio-settings">
                            <div className="audio-setting-row">
                                <div className="audio-setting-label">
                                    {this.props.soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                                    <span>Sounds</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={this.props.soundEnabled}
                                        onChange={(e) => this.props.onToggleSound(e.target.checked)}
                                    />
                                    <span className="slider round" />
                                </label>
                            </div>

                            <div className="audio-setting-row">
                                <div className="audio-setting-label">
                                    {this.props.bgMusicEnabled ? <MusicNoteIcon /> : <MusicOffIcon />}
                                    <span>Music</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={this.props.bgMusicEnabled}
                                        onChange={(e) => this.props.onToggleBgMusic(e.target.checked)}
                                    />
                                    <span className="slider round" />
                                </label>
                            </div>
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
