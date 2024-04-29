import React from "react";
import '../App.css';
import './HeaderComponent.css';

interface HeaderComponentProps {

}

interface HeaderComponentState {
}

class HeaderComponent extends React.Component <HeaderComponentProps, HeaderComponentState> {
    constructor(props:any) {
        super(props);

        this.state = {
        }

    }

    state = {
    }

    componentDidUpdate(prevProps: Readonly<HeaderComponentProps>, prevState: Readonly<HeaderComponentState>, snapshot?: any) {

    }

    render() {
        return (
            <header className={``}>

            </header>
        );
    }
}

export default HeaderComponent;