import React from "react";
import '../../../App.css';
import '../../BodyComponent.css';

import './index.css'
import Dialog from "@material-ui/core/Dialog";
import {playSound} from "../../utils";
import SpeedIcon from '@material-ui/icons/Speed';
import {ExpatCategory, WordPack} from "../../GameFrameComponent/helpArray";

interface ModalSettingsProps {
    onFinishModalWindow?:(any),
    open: boolean,
    settings: {
        time: number,
        hardLevel: string,
        categories?: ExpatCategory[],
        wordPack?: WordPack,
        wordsToFinish: number
    }
}

interface ModalSettingsState {
    isOpen: boolean,
    time: number,
    hardLevel: string,
    categories: ExpatCategory[],
    wordPack: WordPack,
    wordsToFinish: number
}

const ALL_CATEGORIES: ExpatCategory[] = [
    'Bureaucracy',
    'Work',
    'German Language',
    'Transport',
    'Social Life',
    'Stereotypes',
    'Expat Life',
    'Cringe Situations',
    'IT / Tech',
    'Absurd / Meme',
]

class ModalSettingsComponent extends React.PureComponent <ModalSettingsProps, ModalSettingsState> {
    constructor(props:any) {
        super(props);

        this.state = {
            isOpen: false,
            time: this.props.settings.time,
            hardLevel: this.props.settings.hardLevel,
            wordPack: this.props.settings.wordPack || 'classic',
            categories: (this.props.settings.categories && this.props.settings.categories.length > 0
                ? this.props.settings.categories
                : ALL_CATEGORIES.slice()),
            wordsToFinish: this.props.settings.wordsToFinish
        }
    }
    playSound = playSound

    componentDidUpdate(prevProps: Readonly<ModalSettingsProps>) {
        if(this.props.open){
            this.setState({isOpen: true})
        }
    }

    handleClose = () => {
        this.playSound('click');
        this.setState({isOpen:false});
        this.props.onFinishModalWindow({
            time:this.state.time,
            hardLevel:this.state.hardLevel,
            categories: this.state.categories,
            wordPack: this.state.wordPack,
            wordsToFinish:this.state.wordsToFinish,
        })
    };

    changeTime(param: number) {
        this.playSound('click');
        this.setState({time: param})
    }

    changeWordsToFinish(param: number) {
        this.playSound('click');
        this.setState({wordsToFinish: param})
    }

    changeHardLevel(param: string) {
        this.playSound('click');
        this.setState({hardLevel: param})
    }

    changePack(pack: WordPack) {
        this.playSound('click');
        this.setState({wordPack: pack})
    }

    toggleCategory = (cat: ExpatCategory) => {
        this.playSound('click')
        this.setState((prev) => {
            const set = new Set(prev.categories)
            if (set.has(cat)) set.delete(cat)
            else set.add(cat)
            const next = Array.from(set)
            return { ...prev, categories: next.length > 0 ? next : prev.categories }
        })
    }

    render() {
        const isExpat = this.state.wordPack === 'expat'
        return(
            <div>
                    <Dialog onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={this.state.isOpen}>

                        <div className={'setting'}>
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Word pack</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${!isExpat ? 'active' : ''}`}
                                        onClick={() => this.changePack('classic')}>Classic</h2>
                                    <h2 className={`${isExpat ? 'active' : ''}`}
                                        onClick={() => this.changePack('expat')}>Expat DE</h2>
                                </div>
                            </div>

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Time</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.time == 30 ? 'active' : ''}`}
                                        onClick={() => this.changeTime(30)}>30s</h2>
                                    <h2 className={`${this.state.time == 60 ? 'active' : ''}`}
                                        onClick={() => this.changeTime(60)}>60s</h2>
                                    <h2 className={`${this.state.time == 90 ? 'active' : ''}`}
                                        onClick={() => this.changeTime(90)}>90s</h2>
                                </div>
                            </div>

                            {!isExpat && (
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title' style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                                        <SpeedIcon style={{color: 'var(--text-muted)'}} />
                                        Level
                                    </h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.hardLevel == 'EASY' ? 'active' : ''}`}
                                        onClick={() => this.changeHardLevel('EASY')}>1</h2>
                                    <h2 className={`${this.state.hardLevel == 'NORMAL' ? 'active' : ''}`}
                                        onClick={() => this.changeHardLevel('NORMAL')}>2</h2>
                                    <h2 className={`${this.state.hardLevel == 'HARD' ? 'active' : ''}`}
                                        onClick={() => this.changeHardLevel('HARD')}>3</h2>
                                </div>
                            </div>
                            )}

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Target score</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.wordsToFinish == 30 ? 'active' : ''}`}
                                        onClick={() => this.changeWordsToFinish(30)}>30</h2>
                                    <h2 className={`${this.state.wordsToFinish == 60 ? 'active' : ''}`}
                                        onClick={() => this.changeWordsToFinish(60)}>60</h2>
                                    <h2 className={`${this.state.wordsToFinish == 90 ? 'active' : ''}`}
                                        onClick={() => this.changeWordsToFinish(90)}>90</h2>
                                </div>
                            </div>

                            {isExpat && (
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Categories</h2>
                                </div>
                                <div className={'info-block'} style={{flexWrap: 'wrap'}}>
                                    {ALL_CATEGORIES.map((cat) => (
                                        <h2
                                            key={cat}
                                            className={`${this.state.categories.includes(cat) ? 'active' : ''}`}
                                            onClick={() => this.toggleCategory(cat)}
                                            style={{fontSize: '1.05em'}}
                                        >
                                            {cat}
                                        </h2>
                                    ))}
                                </div>
                            </div>
                            )}
                        </div>
                        <div>
                            <div onClick={this.handleClose} className={'settings-block btn-start'}>
                                <h2>Ok</h2>
                            </div>
                        </div>

                    </Dialog>
            </div>
        )
    }
}

export default ModalSettingsComponent;
