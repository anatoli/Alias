import React from "react";
import '../../../App.css';
import '../../BodyComponent.css';

import './index.css'
import Dialog from "@material-ui/core/Dialog";
import {playSound} from "../../utils";

type ExpatCategory =
    | 'Bureaucracy'
    | 'Work'
    | 'German Language'
    | 'Transport'
    | 'Social Life'
    | 'Stereotypes'
    | 'Expat Life'
    | 'Cringe Situations'
    | 'IT / Tech'
    | 'Absurd / Meme'


interface ModalSettingsProps {
    onFinishModalWindow?:(any),
    open: boolean,
    settings: {
        time: number,
        hardLevel: string,
        categories?: ExpatCategory[],
        language?: 'ru' | 'en' | 'de',
        wordsToFinish: number
    }
}

interface ModalSettingsState {
    isOpen: boolean,
    time: number,
    hardLevel: string,
    categories: ExpatCategory[],
    language: 'ru' | 'en' | 'de',
    wordsToFinish: number
}

class ModalSettingsComponent extends React.PureComponent <ModalSettingsProps, ModalSettingsState> {
    constructor(props:any) {
        super(props);

        this.state = {
            isOpen: false,
            time: this.props.settings.time,
            hardLevel: this.props.settings.hardLevel,
            categories: (this.props.settings.categories && this.props.settings.categories.length > 0
                ? this.props.settings.categories
                : [
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
                ]),
            language: this.props.settings.language || 'ru',
            wordsToFinish: this.props.settings.wordsToFinish
        }
    }
    playSound = playSound

    componentDidMount() {
    }

    componentDidUpdate(prevProps: Readonly<ModalSettingsProps>, prevState: Readonly<ModalSettingsState>, snapshot?: any) {
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
            language: this.state.language,
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

    toggleCategory = (cat: ExpatCategory) => {
        this.playSound('click')
        this.setState((prev) => {
            const set = new Set(prev.categories)
            if (set.has(cat)) set.delete(cat)
            else set.add(cat)
            // if user deselected everything, fallback to "all"
            const next = Array.from(set)
            return { ...prev, categories: next.length > 0 ? next : prev.categories }
        })
    }

    changeLanguage = (lang: 'ru' | 'en' | 'de') => {
        this.playSound('click')
        this.setState({language: lang})
    }

    render() {
        const allCategories: ExpatCategory[] = [
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

        return(
            <div>
                    <Dialog onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={this.state.isOpen}>

                        <div className={'setting'}>
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Time</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.time == 30 ? 'active' : ''}`}
                                        onClick={(node) => this.changeTime(30)}>30s</h2>
                                    <h2 className={`${this.state.time == 60 ? 'active' : ''}`}
                                        onClick={(node) => this.changeTime(60)}>60s</h2>
                                    <h2 className={`${this.state.time == 90 ? 'active' : ''}`}
                                        onClick={(node) => this.changeTime(90)}>90s</h2>
                                </div>

                            </div>
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Level</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.hardLevel == 'EASY' ? 'active' : ''}`}
                                        onClick={(node) => this.changeHardLevel('EASY')}>1</h2>
                                    <h2 className={`${this.state.hardLevel == 'NORMAL' ? 'active' : ''}`}
                                        onClick={(node) => this.changeHardLevel('NORMAL')}>2</h2>
                                    <h2 className={`${this.state.hardLevel == 'HARD' ? 'active' : ''}`}
                                        onClick={(node) => this.changeHardLevel('HARD')}>3</h2>
                                </div>

                            </div>
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Words</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.wordsToFinish == 30 ? 'active' : ''}`}
                                        onClick={(node) => this.changeWordsToFinish(30)}>30</h2>
                                    <h2 className={`${this.state.wordsToFinish == 60 ? 'active' : ''}`}
                                        onClick={(node) => this.changeWordsToFinish(60)}>60</h2>
                                    <h2 className={`${this.state.wordsToFinish == 90 ? 'active' : ''}`}
                                        onClick={(node) => this.changeWordsToFinish(90)}>90</h2>
                                </div>

                            </div>

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Language</h2>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.language === 'ru' ? 'active' : ''}`}
                                        onClick={() => this.changeLanguage('ru')}>RU</h2>
                                    <h2 className={`${this.state.language === 'en' ? 'active' : ''}`}
                                        onClick={() => this.changeLanguage('en')}>EN</h2>
                                    <h2 className={`${this.state.language === 'de' ? 'active' : ''}`}
                                        onClick={() => this.changeLanguage('de')}>DE</h2>
                                </div>
                            </div>

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Categories</h2>
                                </div>
                                <div className={'info-block'} style={{flexWrap: 'wrap'}}>
                                    {allCategories.map((cat) => (
                                        <h2
                                            key={cat}
                                            className={`${this.state.categories.includes(cat) ? 'active' : ''}`}
                                            onClick={() => this.toggleCategory(cat)}
                                            style={{fontSize: '1.2em'}}
                                        >
                                            {cat}
                                        </h2>
                                    ))}
                                </div>
                            </div>
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

