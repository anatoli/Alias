import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import {playSound} from "../utils";

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";

interface TimerProps {
    onFinishTimer:(any)
}

interface TimerState {
    time: number
}

class TimerComponent extends React.PureComponent <TimerProps, TimerState> {
    private intervalId?: number;

    constructor(props:any) {
        super(props);

        this.state = {
            time: 5
        }
    }

    playSound = playSound

    componentDidMount() {
        this.startTimer()
    }

    componentWillUnmount() {
        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId)
        }
    }


    componentDidUpdate(prevProps: Readonly<TimerProps>, prevState: Readonly<TimerState>, snapshot?: any) {

    }

    startTimer = () =>{
        if (this.intervalId !== undefined) return

        this.intervalId = window.setInterval(() => {
            this.setState((prev) => {
                if (prev.time > 1) {
                    this.playSound('tick')
                    return { time: prev.time - 1 }
                }

                if (this.intervalId !== undefined) {
                    window.clearInterval(this.intervalId)
                    this.intervalId = undefined
                }
                this.props.onFinishTimer()
                return prev
            })
        }, 900)

    }

    render() {
        const {time} = this.state
        return(
            <div className={'timer'}>
                <h1 className={'team-name'}>{localStorage.getItem('currentTeam')}</h1>
                <h1>{time}</h1>
            </div>
        )
    }
}

export default TimerComponent;

