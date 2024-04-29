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
        return(
            <div>


                <div className="container">
                    <input type="radio" className="radio" name="progress" value="five" id="five" checked={progress <6  && progress > 0 }/>

                    <input type="radio" className="radio" name="progress" value="twentyfive" id="twentyfive"  checked={progress <26  && progress > 5 }/>


                    <input type="radio" className="radio" name="progress" value="fifty" id="fifty" checked={progress <51  && progress > 25 }/>


                    <input type="radio" className="radio" name="progress" value="seventyfive" id="seventyfive" checked={progress <76  && progress > 50 } />


                    <input type="radio" className="radio" name="progress" value="onehundred" id="onehundred" checked={progress >75 && progress<101 }/>
                    <div className="progress">
                        <div className="progress-bar" style={{width: progress+'%'}}></div>
                    </div>
                </div>


            </div>
        )
    }
}

export default ProgressBarComponent;

