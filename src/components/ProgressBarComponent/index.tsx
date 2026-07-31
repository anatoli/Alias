import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";



interface ProgressBarProps {onFinishProgressBar:(any)
    progress: number
}

interface ProgressBarState {

}

class ProgressBarComponent extends React.PureComponent <ProgressBarProps, ProgressBarState> {
    constructor(props:any) {
        super(props);

        this.state = {

        }
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<ProgressBarProps>, prevState: Readonly<ProgressBarState>, snapshot?: any) {

    }

    render() {
        const {progress} = this.props
        const safe = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0
        return(
            <div className="container">
                <div className="progress">
                    <div
                        className="progress-bar"
                        style={{
                            width: safe + '%',
                            minWidth: safe > 0 ? 2 : 0,
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default ProgressBarComponent;

