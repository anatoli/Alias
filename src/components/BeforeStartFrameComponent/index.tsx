import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";



interface BeforeStartFrameProps {
    settings:{
        time: number,
        hardLevel: string,
        teams: any[],
        wordsToFinish: number
    }
    onBackToSettings:(any)
    onPlayGame:(any)
}

interface BeforeStartFrameState {

}

class BeforeStartFrameComponent extends React.PureComponent <BeforeStartFrameProps, BeforeStartFrameState> {
    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<BeforeStartFrameProps>, prevState: Readonly<BeforeStartFrameState>, snapshot?: any) {

    }

    back = () => {
        this.props.onBackToSettings()
    }

    play = () => {
        this.props.onPlayGame()
    }

    render() {
        const {teams} = this.props.settings
        return(
            <div className="before-start">
                <div className={'team-list'}>
                    {teams.map((el, i)=> (
                        <TeamListItemComponent name={el.name} index={i}/>
                    ))}
                </div>
                <div className="before-start-actions">
                    <div onClick={this.play} className={'settings-block btn-start'}>
                        <h1>Play</h1>
                    </div>
                    <div onClick={this.back} className={'settings-block btn-start'}>
                        <h1>Back</h1>
                    </div>
                </div>
            </div>
        )
    }
}

export default BeforeStartFrameComponent;
