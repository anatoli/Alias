import React from "react";
import {playSound} from "../utils";
import ModalWindowComponent from "../ModalWindowComponent";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import { t } from '../../i18n'


interface CurrentGameResultProps {
    teamInfo: any[],
    onNext: any,
    onRestart: any,
    wordsToFinish: number
}

type EndPhase = 'playing' | 'catchup' | 'overtime' | 'winner'

interface CurrentGameResultState {
    teams : {},
    WINNER: boolean,
    openWinnerModal: boolean,
    teamWinner:string,
    endPhase: EndPhase
}

class CurrentGameResultComponent extends React.PureComponent <CurrentGameResultProps, CurrentGameResultState> {
    constructor(props:any) {
        super(props);

        this.state = {
            teams : {},
            WINNER: false,
            openWinnerModal: false,
            teamWinner: '',
            endPhase: 'playing'
        }
    }

    playSound = playSound

    teamScore = (el: any) => {
        if (el && typeof el.score === 'number') return el.score
        return (el.trues || 0) + (el.bonus || 0)
    }

    safeParse = <T,>(raw: string | null, fallback: T): T => {
        try {
            return raw ? JSON.parse(raw) as T : fallback
        } catch {
            return fallback
        }
    }

    /** Round is finished when every configured team has taken a turn this lap. */
    isRoundComplete = (teamNames: string[]) => {
        const teamsActiveList = this.safeParse<Record<string, boolean>>(
            localStorage.getItem('teamsActiveList'),
            {}
        )
        if (teamNames.length === 0) return false
        return teamNames.every((name) => teamsActiveList[name] === true)
    }

    /**
     * Alias endgame:
     * - Someone reaches target → finish the current round (equal turns).
     * - Then highest score wins.
     * - On a tie at/above target → keep playing until one team leads.
     */
    resolveEndGame = (teams: Record<string, any>, wordsToFinish: number): {
        phase: EndPhase
        winnerName?: string
    } => {
        const teamsActiveList = this.safeParse<Record<string, boolean>>(
            localStorage.getItem('teamsActiveList'),
            {}
        )
        const teamNames = Object.keys(teamsActiveList).length > 0
            ? Object.keys(teamsActiveList)
            : Object.keys(teams)

        const scores = teamNames.map((name) => ({
            name,
            score: teams[name] ? this.teamScore(teams[name]) : 0
        }))

        const anyoneAtTarget = scores.some((s) => s.score >= wordsToFinish)
        if (!anyoneAtTarget) {
            return { phase: 'playing' }
        }

        if (!this.isRoundComplete(teamNames)) {
            return { phase: 'catchup' }
        }

        const maxScore = Math.max(...scores.map((s) => s.score), 0)
        const leaders = scores.filter((s) => s.score === maxScore)

        if (leaders.length === 1 && maxScore >= wordsToFinish) {
            return { phase: 'winner', winnerName: leaders[0].name }
        }

        return { phase: 'overtime' }
    }

    componentDidMount() {
        const teams = this.safeParse<Record<string, any>>(localStorage.getItem('results'), {})
        const { phase, winnerName } = this.resolveEndGame(teams, this.props.wordsToFinish)

        if (phase === 'winner' && winnerName) {
            this.setState({
                teams,
                WINNER: true,
                teamWinner: winnerName,
                openWinnerModal: true,
                endPhase: 'winner'
            })
            this.playSound('victory')
            return
        }

        this.setState({ teams, endPhase: phase, WINNER: false })
    }

    onNext = () => {
        if (this.state.WINNER) return
        this.props.onNext()
    }

    onRestart = () => {
        this.props.onRestart()
    }

    winnerModalClose = () => {
        this.setState({openWinnerModal:false});
    };

    endPhaseMessage = () => {
        const { endPhase } = this.state
        const target = this.props.wordsToFinish
        if (endPhase === 'catchup') {
            return t('results.catchup', { n: target })
        }
        if (endPhase === 'overtime') {
            return t('results.overtime')
        }
        return null
    }

    render() {
        const {teams, WINNER, teamWinner, openWinnerModal, endPhase}= this.state
        const statusMessage = this.endPhaseMessage()
        return(
            <div className={'results'}>
                <div>
                    <ModalWindowComponent open={openWinnerModal} title={t('results.winner')} message={teamWinner} onFinishModalWindow={this.winnerModalClose}/>
                </div>
                <div className={'results-wrapper'}>
                    <div className={'word-row header'}>
                        <h1 className={'word'}>{t('results.name')}</h1>
                        <div className={'buttons-wrapper'}>
                            <div className={'buttons'}>
                                <h1>{t('results.score')}</h1>
                            </div>
                            <div className={'buttons'}>
                                <h1>{t('results.true')}</h1>
                            </div>
                            <div className={'buttons'}>
                                <h1>{t('results.bonus')}</h1>
                            </div>
                            <div className={'buttons'}>
                                <h1>{t('results.wrong')}</h1>
                            </div>
                        </div>

                    </div>
                    {Object.values(teams).map((el:any)=>
                        <div className={'word-row'} key={el.name}>
                            <h1 className={'word'} title={el.name}>{el.name}</h1>
                            <div className={'buttons-wrapper'}>
                                <div className={'buttons'}>
                                        <h1>{this.teamScore(el)}</h1>
                                </div>
                                <div className={'buttons'}>
                                        <h1>{el.trues}</h1>
                                </div>
                                <div className={'buttons'}>
                                        <h1>{el.bonus || 0}</h1>
                                </div>
                                <div className={'buttons'}>
                                        <h1>{el.wrong}</h1>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {statusMessage && (
                    <p className={`results-status results-status--${endPhase}`}>{statusMessage}</p>
                )}
                <div className={'footer'}>
                    <div className={'btn'} onClick={this.onRestart}><h1>{t('common.restart')}</h1></div>
                    {!WINNER &&
                        <div className={'btn'} onClick={this.onNext}><h1>{t('common.next')}</h1></div>
                    }
                </div>
    </div>
        )
    }
}

export default CurrentGameResultComponent;
