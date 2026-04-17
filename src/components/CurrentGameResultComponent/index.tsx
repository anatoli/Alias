import React from "react";
import {playSound} from "../utils";
import ModalWindowComponent from "../ModalWindowComponent";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'


interface CurrentGameResultProps {
    teamInfo: any[],
    onNext: any,
    onRestart: any,
    wordsToFinish: number
}

interface CurrentGameResultState {
    teams : {},
    WINNER: boolean,
    openWinnerModal: boolean,
    teamWinner:string
}

class CurrentGameResultComponent extends React.PureComponent <CurrentGameResultProps, CurrentGameResultState> {
    constructor(props:any) {
        super(props);

        this.state = {
            teams : {},
            WINNER: false,
            openWinnerModal: false,
            teamWinner: ''
        }
    }

    playSound = playSound

    componentDidMount() {
        let teams: any = {}
        try {
            const raw = localStorage.getItem('results')
            teams = raw ? JSON.parse(raw) : {}
        } catch {
            teams = {}
        }

        Object.values(teams).forEach((el:any)=>{
            if(el.trues >= this.props.wordsToFinish){
                this.setState({WINNER: true, teamWinner: el.name, openWinnerModal:true})
                this.playSound('victory')
            }
        })
        this.setState({teams: teams})
    }


    componentDidUpdate(prevProps: Readonly<CurrentGameResultProps>, prevState: Readonly<CurrentGameResultState>, snapshot?: any) {

    }

    onNext = () => {
        this.props.onNext()
    }

    onRestart = () => {
        this.props.onRestart()
    }

    winnerModalClose = () => {
        this.setState({openWinnerModal:false});
    };

    render() {
        const {teams, WINNER, teamWinner, openWinnerModal}= this.state
        return(
            <div className={'results'}>
                <div>
                    <ModalWindowComponent open={openWinnerModal} title={'WINNER'} message={teamWinner} onFinishModalWindow={this.winnerModalClose}/>
                </div>
                <div className={'results-wrapper'}>
                    <div className={'word-row header'}>
                        <h1 className={'word'}>Name</h1>
                        <div className={'buttons-wrapper'}>
                            <div className={'buttons'}>
                                <h1>True</h1>
                            </div>
                            <div className={'buttons'}>
                                <h1>Wrong</h1>
                            </div>
                        </div>

                    </div>
                    {Object.values(teams).map((el:any)=>
                        <div className={'word-row'}>
                            <h1 className={'word'}>{el.name}</h1>
                            <div className={'buttons-wrapper'}>
                                <div className={'buttons'}>
                                        <h1>{el.trues}</h1>
                                </div>
                                <div className={'buttons'}>
                                        <h1>{el.wrong}</h1>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={'footer'}>
                    <div className={'btn'} onClick={this.onRestart}><h1>Restart</h1></div>
                    {!WINNER &&
                        <div className={'btn'} onClick={this.onNext}><h1>Next</h1></div>
                    }
                </div>
    </div>
        )
    }
}

export default CurrentGameResultComponent;

