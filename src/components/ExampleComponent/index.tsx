import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import TeamListItemComponent from "../TeamListItemComponent";



interface ExampleProps {onFinishExample:(any)
}

interface ExampleState {

}

class ExampleComponent extends React.PureComponent <ExampleProps, ExampleState> {
    constructor(props:any) {
        super(props);

        this.state = {

        }
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<ExampleProps>, prevState: Readonly<ExampleState>, snapshot?: any) {

    }

    render() {

        return(
            <div>
                <h1>Example</h1>
            </div>
        )
    }
}

export default ExampleComponent;

