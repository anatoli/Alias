import React from "react";
import '../../../App.css';
import '../../BodyComponent.css';

import './index.css'
import Dialog from "@material-ui/core/Dialog";
import {playSound} from "../../utils";
import SpeedIcon from '@material-ui/icons/Speed';
import {ExpatCategory, WordPack} from "../../GameFrameComponent/helpArray";
import {EXPAT_DECK} from "../../GameFrameComponent/helpArray";
import {getWordsForLevel} from "../../../services/wordSync";
import {
    deleteCustomPack,
    getCustomPack,
    listCustomPacks,
    parseWordsText,
    saveCustomPack,
    CustomWordPack,
} from "../../../services/customPacks";
import {hasPremiumWordFeatures} from "../../../services/subscription";
import {PACK_CATALOG} from "../../../services/packCatalog";

interface ModalSettingsProps {
    onFinishModalWindow?:(any),
    open: boolean,
    settings: {
        time: number,
        hardLevel: string,
        categories?: ExpatCategory[],
        wordPack?: WordPack,
        customPackId?: string,
        wordsToFinish: number
    }
}

interface ModalSettingsState {
    isOpen: boolean,
    time: number,
    hardLevel: string,
    categories: ExpatCategory[],
    wordPack: WordPack,
    customPackId: string,
    wordsToFinish: number,
    previewOpen: boolean,
    customPacks: CustomWordPack[],
    draftName: string,
    draftWords: string,
    draftError: string,
    premiumHint: string,
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

const DIFFICULTY_OPTIONS: { key: string; label: string }[] = [
    { key: 'EASY', label: 'Easy' },
    { key: 'NORMAL', label: 'Normal' },
    { key: 'HARD', label: 'Hard' },
]

class ModalSettingsComponent extends React.PureComponent <ModalSettingsProps, ModalSettingsState> {
    constructor(props:any) {
        super(props);

        this.state = {
            isOpen: false,
            time: this.props.settings.time,
            hardLevel: this.props.settings.hardLevel,
            wordPack: this.props.settings.wordPack || 'classic',
            customPackId: this.props.settings.customPackId || '',
            categories: (this.props.settings.categories && this.props.settings.categories.length > 0
                ? this.props.settings.categories
                : ALL_CATEGORIES.slice()),
            wordsToFinish: this.props.settings.wordsToFinish,
            previewOpen: false,
            customPacks: listCustomPacks(),
            draftName: '',
            draftWords: '',
            draftError: '',
            premiumHint: '',
        }
    }
    playSound = playSound

    componentDidUpdate(prevProps: Readonly<ModalSettingsProps>) {
        if (this.props.open && !prevProps.open) {
            this.setState({
                isOpen: true,
                time: this.props.settings.time,
                hardLevel: this.props.settings.hardLevel,
                wordPack: this.props.settings.wordPack || 'classic',
                customPackId: this.props.settings.customPackId || '',
                categories: (this.props.settings.categories && this.props.settings.categories.length > 0
                    ? this.props.settings.categories
                    : ALL_CATEGORIES.slice()),
                wordsToFinish: this.props.settings.wordsToFinish,
                customPacks: listCustomPacks(),
                draftError: '',
                premiumHint: '',
            })
        } else if (this.props.open) {
            this.setState({ isOpen: true })
        }
    }

    handleClose = () => {
        this.playSound('click');
        this.setState({isOpen:false, previewOpen: false});
        this.props.onFinishModalWindow({
            time:this.state.time,
            hardLevel:this.state.hardLevel,
            categories: this.state.categories,
            wordPack: this.state.wordPack,
            customPackId: this.state.customPackId,
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
        if (pack === 'custom' && !hasPremiumWordFeatures()) {
            this.setState({
                premiumHint: 'With a no-ads subscription you can add your own word packs.',
            })
            return
        }
        this.setState({
            wordPack: pack,
            premiumHint: '',
            customPacks: listCustomPacks(),
        })
    }

    selectCustomPack = (id: string) => {
        this.playSound('click')
        this.setState({ wordPack: 'custom', customPackId: id, premiumHint: '' })
    }

    saveDraftPack = () => {
        this.playSound('click')
        if (!hasPremiumWordFeatures()) {
            this.setState({ premiumHint: 'With a no-ads subscription you can add your own word packs.' })
            return
        }
        const words = parseWordsText(this.state.draftWords)
        const saved = saveCustomPack({ name: this.state.draftName, words })
        if (!saved) {
            this.setState({ draftError: 'Enter a pack name and at least one word (one per line).' })
            return
        }
        this.setState({
            customPacks: listCustomPacks(),
            customPackId: saved.id,
            wordPack: 'custom',
            draftName: '',
            draftWords: '',
            draftError: '',
            premiumHint: '',
        })
    }

    removeCustomPack = (id: string) => {
        this.playSound('click')
        deleteCustomPack(id)
        const packs = listCustomPacks()
        const nextId = this.state.customPackId === id
            ? (packs[0] && packs[0].id) || ''
            : this.state.customPackId
        this.setState({
            customPacks: packs,
            customPackId: nextId,
            wordPack: packs.length ? this.state.wordPack : 'classic',
        })
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

    openPreview = () => {
        this.playSound('click')
        this.setState({ previewOpen: true })
    }

    closePreview = () => {
        this.playSound('click')
        this.setState({ previewOpen: false })
    }

    getPreviewWords = (): string[] => {
        const { wordPack, hardLevel, categories, customPackId } = this.state
        if (wordPack === 'custom') {
            const pack = getCustomPack(customPackId)
            return pack ? pack.words.slice() : []
        }
        if (wordPack === 'expat') {
            const selected = categories.length > 0 ? categories : ALL_CATEGORIES
            const words: string[] = []
            selected.forEach((cat) => {
                (EXPAT_DECK[cat] || []).forEach((w) => words.push(w))
            })
            return words
        }
        return getWordsForLevel(hardLevel).slice()
    }

    getPreviewTitle = (): string => {
        const { wordPack, hardLevel, customPackId } = this.state
        if (wordPack === 'custom') {
            const pack = getCustomPack(customPackId)
            return pack ? pack.name : 'My pack'
        }
        if (wordPack === 'expat') return 'Expat DE'
        const diff = DIFFICULTY_OPTIONS.find((d) => d.key === hardLevel)
        return `Classic · ${diff ? diff.label : hardLevel}`
    }

    render() {
        const isExpat = this.state.wordPack === 'expat'
        const isCustom = this.state.wordPack === 'custom'
        const isPremium = hasPremiumWordFeatures()
        const previewWords = this.state.previewOpen ? this.getPreviewWords() : []
        const comingSoonPacks = PACK_CATALOG.filter((p) => p.comingSoon)

        return(
            <div>
                    <Dialog onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={this.state.isOpen}>

                        <div className={'setting'}>
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Word pack</h2>
                                    <button type="button" className="pack-preview-btn" onClick={this.openPreview}>
                                        View words
                                    </button>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.wordPack === 'classic' ? 'active' : ''}`}
                                        onClick={() => this.changePack('classic')}>Classic</h2>
                                    <h2 className={`${this.state.wordPack === 'expat' ? 'active' : ''}`}
                                        onClick={() => this.changePack('expat')}>Expat DE</h2>
                                    <h2
                                        className={`${isCustom ? 'active' : ''} ${!isPremium ? 'pack-option--locked' : ''}`}
                                        onClick={() => this.changePack('custom')}
                                    >
                                        My packs{!isPremium ? ' · Locked' : ''}
                                    </h2>
                                </div>
                                {this.state.premiumHint && (
                                    <p className="pack-premium-hint">{this.state.premiumHint}</p>
                                )}
                            </div>

                            {isCustom && isPremium && (
                            <div className={'settings-block settings-block--stack'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>Your packs</h2>
                                </div>
                                {this.state.customPacks.length > 0 ? (
                                    <div className={'info-block'} style={{flexWrap: 'wrap'}}>
                                        {this.state.customPacks.map((pack) => (
                                            <div key={pack.id} className="custom-pack-chip">
                                                <h2
                                                    className={`${this.state.customPackId === pack.id ? 'active' : ''}`}
                                                    onClick={() => this.selectCustomPack(pack.id)}
                                                >
                                                    {pack.name} ({pack.words.length})
                                                </h2>
                                                <button
                                                    type="button"
                                                    className="custom-pack-delete"
                                                    onClick={() => this.removeCustomPack(pack.id)}
                                                    aria-label={`Delete ${pack.name}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="pack-premium-hint">No custom packs yet — create one below.</p>
                                )}

                                <div className="custom-pack-form">
                                    <label className="custom-pack-label">
                                        Pack name
                                        <input
                                            className="custom-pack-input"
                                            value={this.state.draftName}
                                            onChange={(e) => this.setState({ draftName: e.target.value, draftError: '' })}
                                            placeholder="Party night"
                                            maxLength={40}
                                        />
                                    </label>
                                    <label className="custom-pack-label">
                                        Words (one per line)
                                        <textarea
                                            className="custom-pack-textarea"
                                            value={this.state.draftWords}
                                            onChange={(e) => this.setState({ draftWords: e.target.value, draftError: '' })}
                                            placeholder={"apple\norange\nbanana"}
                                            rows={5}
                                        />
                                    </label>
                                    {this.state.draftError && (
                                        <p className="pack-premium-hint pack-premium-hint--error">{this.state.draftError}</p>
                                    )}
                                    <button type="button" className="pack-preview-btn pack-preview-btn--primary" onClick={this.saveDraftPack}>
                                        Save pack
                                    </button>
                                </div>
                            </div>
                            )}

                            {comingSoonPacks.length > 0 && (
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>More packs</h2>
                                </div>
                                <div className="pack-coming-list">
                                    {comingSoonPacks.map((pack) => (
                                        <div key={pack.id} className="pack-coming-item">
                                            <strong>{pack.title}</strong>
                                            <span>Coming soon · Play purchase</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

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

                            {!isExpat && !isCustom && (
                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title' style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                                        <SpeedIcon style={{color: 'var(--text-muted)'}} />
                                        Difficulty
                                    </h2>
                                </div>
                                <div className={'info-block'}>
                                    {DIFFICULTY_OPTIONS.map((opt) => (
                                        <h2
                                            key={opt.key}
                                            className={`${this.state.hardLevel == opt.key ? 'active' : ''}`}
                                            onClick={() => this.changeHardLevel(opt.key)}
                                        >
                                            {opt.label}
                                        </h2>
                                    ))}
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

                    <Dialog open={this.state.previewOpen} onClose={this.closePreview} aria-labelledby="pack-preview-title">
                        <div className="pack-preview">
                            <h2 id="pack-preview-title" className="pack-preview__title">{this.getPreviewTitle()}</h2>
                            <p className="pack-preview__count">{previewWords.length} words</p>
                            <div className="pack-preview__list">
                                {previewWords.length === 0 ? (
                                    <p className="pack-premium-hint">No words in this pack yet.</p>
                                ) : (
                                    <ul>
                                        {previewWords.map((word, i) => (
                                            <li key={`${word}-${i}`}>{word}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div onClick={this.closePreview} className={'settings-block btn-start'}>
                                <h2>Close</h2>
                            </div>
                        </div>
                    </Dialog>
            </div>
        )
    }
}

export default ModalSettingsComponent;
