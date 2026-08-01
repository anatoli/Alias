import React from "react";
import '../App.css';
import './BodyComponent.css';
import SettingGameComponent from "./SettingGameComponent";
import BeforeStartFrameComponent from "./BeforeStartFrameComponent";
import TimerComponent from "./TimerComponent";
import GameFrameComponent from "./GameFrameComponent";
import ListWordsComponent from "./ListWordsComponent";
import CurrentGameResultComponent from "./CurrentGameResultComponent";
import {playSound} from "./utils";
import ButtonComponent from "./ButtonComponent";
import {resetSessionWordDeck} from "./GameFrameComponent/sessionWordDeck";
import {resetSessionCardDeck} from "./GameFrameComponent/sessionCardDeck";
import {ensureDeckCollectionInStorage} from "../decks/deckStorage";

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
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeOffOutlinedIcon from '@material-ui/icons/VolumeOffOutlined'
import SettingsIcon from '@material-ui/icons/Settings';

import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MusicOffIcon from '@material-ui/icons/MusicOff';
import {Button, Menu, MenuItem} from '@material-ui/core';
// @ts-ignore
import bgMusicSrc from "../res/audio/bg_sound.mp3"



interface BodyComponentProps {
}

interface BodyComponentState {

    showingFrame: string | undefined,
    menuSettingsIsOpen: boolean,
    sound:boolean,
    bgMusic: boolean,
    anchorEl: undefined,
    stateSettings: {
        showingFrame: undefined,
        time: number,
        hardLevel: string,
        teams: any[],
        categories: ExpatCategory[],
        language: 'ru' | 'en' | 'de',
        wordsToFinish: 30
    }

}

class BodyComponent extends React.PureComponent <BodyComponentProps, BodyComponentState> {
    constructor(props:any) {
        super(props);

        this.state = {
            showingFrame: undefined,
            menuSettingsIsOpen: false,
            sound:true,
            bgMusic: true,
            anchorEl: undefined,
            stateSettings: {
                showingFrame: undefined,
                time: 30,
                hardLevel: 'NORMAL',
                teams: [{name: 'Player 1'}, {name: 'Player 2'} ],
                categories: [
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
                ],
                language: 'ru',
                wordsToFinish: 30
            }
        }
    }

    playSound = playSound

    componentDidMount() {
        // Generate / load multi-language categorized decks once per install.
        // Stored locally so it can later be exported and sent via API.
        try {
            ensureDeckCollectionInStorage()
        } catch {
            // ignore; game will fall back to built-in words if storage is unavailable
        }
        // initialize persisted toggles with safe defaults
        if (localStorage.getItem('sound-effect') === null) {
            localStorage.setItem('sound-effect', 'true')
        }
        if (localStorage.getItem('bg-music') === null) {
            localStorage.setItem('bg-music', 'true')
        }

        const bgEnabled = localStorage.getItem('bg-music') === 'true'
        this.setState({ bgMusic: bgEnabled })
    }

    setType = (type: string) =>{
        this.playSound('click');
        this.setState({showingFrame: type})
    }

    componentDidUpdate(prevProps: Readonly<BodyComponentProps>, prevState: Readonly<BodyComponentState>, snapshot?: any) {

    }

    safeParseJSON = <T,>(raw: string | null, fallback: T): T => {
        if (raw == null) return fallback
        try {
            return JSON.parse(raw) as T
        } catch {
            return fallback
        }
    }

    beforeStartGame = (stateSettings:any) => {
        // New game => reshuffle words for this app run
        resetSessionWordDeck()
        resetSessionCardDeck()
        this.setState({stateSettings:stateSettings})
        this.setType('Start')
    }

    onBackToSettings = () => {
        this.setType('Settings')
    }

    newLap = () => {
        const teamsActiveList: Record<string, boolean> = this.safeParseJSON(localStorage.getItem('teamsActiveList'), {})
        Object.keys(teamsActiveList).forEach((el) => (teamsActiveList[el] = false))
        localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
        this.onPlayGame()
    }


    onPlayGame = () =>{
        const {teams} = this.state.stateSettings
        let teamsActiveList: Record<string, boolean> = this.safeParseJSON(localStorage.getItem('teamsActiveList'), {})

        if(Object.keys(teamsActiveList).length < 1){
            teams.forEach((el:any) => {
                teamsActiveList[String(el.name)] = false
            })
            localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
        }

        // Ensure all current teams exist in the active map (handles renamed/added teams)
        teams.forEach((el:any) => {
            const name = String(el.name)
            if (teamsActiveList[name] === undefined) teamsActiveList[name] = false
        })

        const eligibleTeams = teams.map((t:any) => String(t.name)).filter((name) => teamsActiveList[name] !== undefined)
        const allWereActive = eligibleTeams.length > 0 && eligibleTeams.every((name) => teamsActiveList[name] === true)
        if (allWereActive) {
            eligibleTeams.forEach((name) => (teamsActiveList[name] = false))
        }

        const nextTeamName = eligibleTeams.find((name) => !teamsActiveList[name])
        if (!nextTeamName) {
            // No teams configured; back to settings
            this.onBackToSettings()
            return
        }

        teamsActiveList[nextTeamName] = true
        localStorage.setItem('teamsActiveList', JSON.stringify(teamsActiveList))
        localStorage.setItem('currentTeam', nextTeamName)
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
        // Full restart => clear persisted state and reset word deck
        resetSessionWordDeck()
        resetSessionCardDeck()
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

    openMenuSettings = (event: any) => {
        this.setState({menuSettingsIsOpen: true, anchorEl: event.currentTarget})
    }
    closeMenuSettings =() =>{
        this.setState({menuSettingsIsOpen: false})
    }
    soundOff =() =>{
        localStorage.setItem('sound-effect', 'false')
        this.setState({sound: false})
    }

    soundOn =() =>{
        localStorage.setItem('sound-effect', 'true')
        this.setState({sound: true})
    }

    bgMusicOff =() =>{
        localStorage.setItem('bg-music', 'false')
        this.setState({bgMusic: false})
    }

    bgMusicOn =() =>{
        localStorage.setItem('bg-music', 'true')
        this.setState({bgMusic: true})
    }


    render() {
        const {menuSettingsIsOpen, anchorEl} = this.state;
        return (
            <div className={'body-wrapper'}>
                {this.state.bgMusic &&
                // @ts-ignore
                    <audio src={bgMusicSrc} autoPlay loop></audio>
                }
                <div className={'button-bar left'}>
                    {!Boolean(menuSettingsIsOpen) &&
                    <div className="" onClick={this.openMenuSettings}>
                        <SettingsIcon style={{color: "#fff"}}> </SettingsIcon>
                    </div>
                    }
                    {Boolean(menuSettingsIsOpen) &&
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(menuSettingsIsOpen)}
                        onClose={this.closeMenuSettings}
                    >
                        <MenuItem onClick={this.closeMenuSettings}>
                            {this.state.sound &&
                            <div className="" onClick={this.soundOff}>
                                <VolumeMuteIcon style={{color: "#fff"}}>Off</VolumeMuteIcon>
                            </div>
                            }
                            {!this.state.sound &&
                            <div className="" onClick={this.soundOn}>
                                <VolumeOffOutlinedIcon style={{color: "#fff"}}>On</VolumeOffOutlinedIcon>
                            </div>
                            }
                        </MenuItem>
                        <MenuItem onClick={this.closeMenuSettings}>
                            {this.state.bgMusic &&
                            <div className="" onClick={this.bgMusicOff}>
                                <MusicNoteIcon style={{color: "#fff"}}>Off</MusicNoteIcon>
                            </div>
                            }
                            {!this.state.bgMusic &&
                            <div className="" onClick={this.bgMusicOn}>
                                <MusicOffIcon style={{color: "#fff"}}>On</MusicOffIcon>
                            </div>
                            }
                        </MenuItem>
                    </Menu>
                    }
                </div>
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
