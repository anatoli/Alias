import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";

interface TimerProps {
    onFinishTimer:(any)
}

interface TimerState {
    time: number
}

class TimerComponent extends React.PureComponent <TimerProps, TimerState> {
    constructor(props:any) {
        super(props);

        this.state = {
            time: 5
        }
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<TimerProps>, prevState: Readonly<TimerState>, snapshot?: any) {

    }

    startTimer = () =>{
        let timer = setInterval(()=>{
            if(this.state.time > 1){
                this.setState({time: this.state.time - 1})
            } else {
                this.props.onFinishTimer()
                clearInterval(timer)
            }
        }, 1000)

    }

    render() {
        const {time} = this.state
        if(time === 5){
            this.startTimer()
        }
        return(
            <div className={'timer'}>
                <h1 className={'team-name'}>{localStorage.getItem('currentTeam')}</h1>
                <h1>{time}</h1>
            </div>
        )
    }
}

export default TimerComponent;

