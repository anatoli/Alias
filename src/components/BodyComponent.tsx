import React from "react";
import '../App.css';
import './BodyComponent.css';
import SettingGameComponent from "./SettingGameComponent";
import BeforeStartFrameComponent from "./BeforeStartFrameComponent";
import TimerComponent from "./TimerComponent";
import GameFrameComponent, {resetSessionDeck} from "./GameFrameComponent";
import ListWordsComponent from "./ListWordsComponent";
import CurrentGameResultComponent from "./CurrentGameResultComponent";
import RulesComponent from "./RulesComponent";
import {playSound} from "./utils";
import ButtonComponent from "./ButtonComponent";
import NoAdsModalComponent from "./NoAdsModalComponent";
import {startWordBankSync} from "../services/wordSync";
import {initAds, showInterstitialAfterRound} from "../services/ads";
import {canShowNoAdsOffer, hasNoAdsSubscription, markNoAdsOfferShown} from "../services/subscription";
import {loadGameSettings, saveGameSettings} from "../services/gameSettings";
import {ExpatCategory, WordPack} from "./GameFrameComponent/helpArray";
import {ensureDeckCollectionInStorage} from "../decks/deckStorage";
import {GameLanguage} from "../decks/types";
import {t} from "../i18n";
// @ts-ignore
import bgMusicSrc from "../res/audio/bg_sound.mp3"



interface BodyComponentProps {
}

interface BodyComponentState {

    showingFrame: string | undefined,
    bgMusic: boolean,
    showNoAdsModal: boolean,
    stateSettings: {
        showingFrame: undefined,
        time: number,
        hardLevel: string,
        teams: any[],
        categories: ExpatCategory[],
        wordPack: WordPack,
        customPackId: string,
        language: GameLanguage,
        wordsToFinish: number
    }

}

class BodyComponent extends React.PureComponent <BodyComponentProps, BodyComponentState> {
    constructor(props:any) {
        super(props);

        const saved = loadGameSettings()
        this.state = {
            showingFrame: undefined,
            bgMusic: true,
            showNoAdsModal: false,
            stateSettings: {
                showingFrame: undefined,
                ...saved,
            }
        }
    }

    playSound = playSound

    componentDidMount() {
        // initialize persisted toggles with safe defaults
        if (localStorage.getItem('sound-effect') === null) {
            localStorage.setItem('sound-effect', 'true')
        }
        if (localStorage.getItem('bg-music') === null) {
            localStorage.setItem('bg-music', 'true')
        }

        const bgEnabled = localStorage.getItem('bg-music') === 'true'
        this.setState({ bgMusic: bgEnabled })

        // Local word bank immediately; remote updates in background
        startWordBankSync()
        // Multi-language categorized expat decks (generated once per install)
        try {
            ensureDeckCollectionInStorage()
        } catch (e) {
            // optional — classic pack still works
        }
        // Preload interstitial when Cordova/AdMob is ready
        void initAds()
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

    /** Clears match progress only — keeps teams/settings (alias.gameSettings). */
    clearMatchProgress = () => {
        const teams = (this.state.stateSettings && this.state.stateSettings.teams) || []
        localStorage.removeItem('teamsActiveList')
        localStorage.removeItem('currentTeam')
        localStorage.removeItem('results')
        resetSessionDeck()
        teams.forEach((el: any) => {
            if (el && el.name) localStorage.removeItem(String(el.name))
        })
    }

    beforeStartGame = (stateSettings:any) => {
        // New match always starts 0–0 (settings/teams stay persisted)
        this.clearMatchProgress()
        const persisted = saveGameSettings({
            time: stateSettings.time,
            hardLevel: stateSettings.hardLevel,
            teams: stateSettings.teams,
            categories: stateSettings.categories,
            wordPack: stateSettings.wordPack,
            customPackId: stateSettings.customPackId,
            language: stateSettings.language,
            wordsToFinish: stateSettings.wordsToFinish,
        })
        this.setState({
            stateSettings: {
                showingFrame: undefined,
                ...persisted,
            },
        })
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

    showResults = async () => {
        const adResult = await showInterstitialAfterRound()
        this.setType('CurrentGameResult')
        // Offer subscription after a real ad — at most once per hour
        if (adResult === 'shown' && canShowNoAdsOffer()) {
            window.setTimeout(() => {
                if (!canShowNoAdsOffer()) return
                markNoAdsOfferShown()
                this.setState({ showNoAdsModal: true })
            }, 300)
        }
    }

    onFinishGameFrame = (wordList:any) =>{
        localStorage.setItem(wordList.team, JSON.stringify(wordList))
        this.setType('ListOfGuessedWords')
    }

    sweatchTeam = () =>{
        this.onPlayGame()
    }

    restart = () => {
        this.clearMatchProgress()
        this.onBackToSettings()
    }

    getComponent = (toSchow='Category') => {
        switch (toSchow) {
            case 'Rules': {
                return <RulesComponent onBack={() => this.setState({showingFrame: undefined})} />
            }
            case 'Settings': {
                const soundEnabled = localStorage.getItem('sound-effect') !== 'false'
                return (
                    <SettingGameComponent
                        onStartGame={this.beforeStartGame}
                        settings={this.state.stateSettings}
                        soundEnabled={soundEnabled}
                        bgMusicEnabled={this.state.bgMusic}
                        onToggleSound={(enabled) => {
                            localStorage.setItem('sound-effect', enabled ? 'true' : 'false')
                            this.forceUpdate()
                        }}
                        onToggleBgMusic={(enabled) => {
                            localStorage.setItem('bg-music', enabled ? 'true' : 'false')
                            this.setState({ bgMusic: enabled })
                        }}
                    />
                )
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

    bgMusicOff =() =>{
        localStorage.setItem('bg-music', 'false')
        this.setState({bgMusic: false})
    }

    bgMusicOn =() =>{
        localStorage.setItem('bg-music', 'true')
        this.setState({bgMusic: true})
    }


    /** Menu screens only — silence BGM during an active match. */
    shouldPlayBgMusic = () => {
        if (!this.state.bgMusic) return false
        const frame = this.state.showingFrame
        return !frame || frame === 'Settings' || frame === 'Rules'
    }

    render() {
        const playBgMusic = this.shouldPlayBgMusic()
        return (
            <div className={'body-wrapper'}>
                {playBgMusic &&
                // @ts-ignore
                    <audio key="bg-music" src={bgMusicSrc} autoPlay loop></audio>
                }
                    {!this.state.showingFrame &&
                    <>
                        <div className="home-screen">
                            <button className={'btn-custom'} onClick={(node) =>this.setType('Settings')}>{t('home.start')}</button>
                            <button className={'btn-custom'}  onClick={(node) => this.setType('Rules')}>{t('home.rules')}</button>
                        </div>
                    </>
                    }

                    {this.state.showingFrame &&
                    <div className="body-wrapper__screen">
                        {this.getComponent(this.state.showingFrame)}
                    </div>
                    }

                <NoAdsModalComponent
                    open={this.state.showNoAdsModal}
                    onClose={() => this.setState({ showNoAdsModal: false })}
                    onSubscribed={() => this.setState({ showNoAdsModal: false })}
                />

            </div>
        );
    }
}

export default BodyComponent;
