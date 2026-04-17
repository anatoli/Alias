import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'



interface TeamListItemProps {
    name: string,
    index: number
    delete?: any
    deleteAvailable?: boolean
    onChange?: any
}

interface TeamListItemState {

}

class TeamListItemComponent extends React.PureComponent <TeamListItemProps, TeamListItemState> {
    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<TeamListItemProps>, prevState: Readonly<TeamListItemState>, snapshot?: any) {

    }

    changeNameOfTeam = (node:any, i:number) => {
            this.props.onChange(node.target.value, i)
    }

    removeTeam = (i:number) =>{
        this.props.delete(i)
    }

    render() {
        const { name, index, deleteAvailable } = this.props
        return (
            <div className={'team-list-items-wrapper'} key={name + index}>
                <input maxLength={13} readOnly={!this.props.onChange} className={'global-fonts'} type="text" defaultValue={name} onChange={(node)=>{
                    this.changeNameOfTeam(node, index)
                }}/>
                {(!!this.props.delete && deleteAvailable) &&
                    <h1 onClick={(node)=> this.removeTeam(index)}>-</h1>
                }
            </div>

        );
    }
}

export default TeamListItemComponent;
