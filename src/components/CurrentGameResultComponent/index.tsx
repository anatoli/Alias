import React from "react";
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
    WINNER: boolean
}

class CurrentGameResultComponent extends React.PureComponent <CurrentGameResultProps, CurrentGameResultState> {
    constructor(props:any) {
        super(props);

        this.state = {
            teams : {},
            WINNER: false
        }
    }

    componentDidMount() {
        // @ts-ignore
        let teams = JSON.parse(localStorage.getItem('results'))
        Object.values(teams).map((el:any)=>{
            if(el.trues >= this.props.wordsToFinish){
                this.setState({WINNER: true})
                alert(el.name + "is WINNER!!!")
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

    render() {
        const {teams, WINNER}= this.state
        return(
            <div className={'results'}>
                <div className={'results-wrapper'}>
                    <div className={'word-row header'}>
                        <h1 className={'word'}>Name</h1>
                        <div className={'buttons-wrapper'}>
                            <div className={'buttons'}>
                                <h3>True</h3>
                            </div>
                            <div className={'buttons'}>
                                <h3>Wrong</h3>
                            </div>
                        </div>

                    </div>
                    {Object.values(teams).map((el:any)=>
                        <div className={'word-row'}>
                            <h1 className={'word'}>{el.name}</h1>
                            <div className={'buttons-wrapper'}>
                                <div className={'buttons'}>
                                        <h3>{el.trues}</h3>
                                </div>
                                <div className={'buttons'}>
                                        <h3>{el.wrong}</h3>
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

