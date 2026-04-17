import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'

import {playSound} from "../utils";



interface ButtonProps {
    onClick:(any),
    label?: string,
    className?: string
}

interface ButtonState {

}

class ButtonComponent extends React.PureComponent <ButtonProps, ButtonState> {
    constructor(props:any) {
        super(props);

        this.state = {

        }
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<ButtonProps>, prevState: Readonly<ButtonState>, snapshot?: any) {

    }

    click = () => {
        playSound('click')
        this.props.onClick('');
    }

    render() {
        const {label, className} = this.props
        return(
            <button className={className} onClick={this.click}>{label}</button>
        )
    }
}

export default ButtonComponent;

