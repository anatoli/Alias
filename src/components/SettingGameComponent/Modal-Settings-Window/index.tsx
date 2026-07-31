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
import {t, categoryLabel} from "../../../i18n";
import {MessageKey} from "../../../i18n/types";
import NoAdsModalComponent from "../../NoAdsModalComponent";

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
    showNoAdsModal: boolean,
    /** Bump after purchase so locked UI re-evaluates hasPremiumWordFeatures() */
    premiumTick: number,
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

const DIFFICULTY_OPTIONS: { key: string; labelKey: MessageKey }[] = [
    { key: 'EASY', labelKey: 'settings.easy' },
    { key: 'NORMAL', labelKey: 'settings.normal' },
    { key: 'HARD', labelKey: 'settings.hard' },
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
            showNoAdsModal: false,
            premiumTick: 0,
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
                showNoAdsModal: false,
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
            this.setState({ showNoAdsModal: true })
            return
        }
        this.setState({
            wordPack: pack,
            customPacks: listCustomPacks(),
        })
    }

    selectCustomPack = (id: string) => {
        this.playSound('click')
        this.setState({ wordPack: 'custom', customPackId: id })
    }

    saveDraftPack = () => {
        this.playSound('click')
        if (!hasPremiumWordFeatures()) {
            this.setState({ showNoAdsModal: true })
            return
        }
        const words = parseWordsText(this.state.draftWords)
        const saved = saveCustomPack({ name: this.state.draftName, words })
        if (!saved) {
            this.setState({ draftError: t('settings.draftError') })
            return
        }
        this.setState({
            customPacks: listCustomPacks(),
            customPackId: saved.id,
            wordPack: 'custom',
            draftName: '',
            draftWords: '',
            draftError: '',
        })
    }

    closeNoAdsModal = () => {
        this.setState({ showNoAdsModal: false })
    }

    onSubscribedFromSettings = () => {
        this.setState({
            showNoAdsModal: false,
            premiumTick: this.state.premiumTick + 1,
            wordPack: 'custom',
            customPacks: listCustomPacks(),
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
            return pack ? pack.name : t('preview.myPack')
        }
        if (wordPack === 'expat') return t('settings.packExpat')
        const diff = DIFFICULTY_OPTIONS.find((d) => d.key === hardLevel)
        return t('preview.classic', { level: diff ? t(diff.labelKey) : hardLevel })
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
                            <div className={'settings-block settings-block--stack'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>{t('settings.wordPack')}</h2>
                                    <button type="button" className="pack-preview-btn" onClick={this.openPreview}>
                                        {t('settings.viewWords')}
                                    </button>
                                </div>
                                <div className={'info-block'}>
                                    <h2 className={`${this.state.wordPack === 'classic' ? 'active' : ''}`}
                                        onClick={() => this.changePack('classic')}>{t('settings.packClassic')}</h2>
                                    <h2 className={`${this.state.wordPack === 'expat' ? 'active' : ''}`}
                                        onClick={() => this.changePack('expat')}>{t('settings.packExpat')}</h2>
                                    <h2
                                        className={`${isCustom ? 'active' : ''} ${!isPremium ? 'pack-option--locked' : ''}`}
                                        onClick={() => this.changePack('custom')}
                                    >
                                        {t('settings.packMy')}{!isPremium ? ` · ${t('common.locked')}` : ''}
                                    </h2>
                                </div>

                                {isCustom && isPremium && (
                                <div className="pack-subsection">
                                    <h3 className="pack-subsection__title">{t('settings.yourPacks')}</h3>
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
                                        <p className="pack-premium-hint">{t('settings.noCustomPacks')}</p>
                                    )}

                                    <div className="custom-pack-form">
                                        <label className="custom-pack-label">
                                            {t('settings.packName')}
                                            <input
                                                className="custom-pack-input"
                                                value={this.state.draftName}
                                                onChange={(e) => this.setState({ draftName: e.target.value, draftError: '' })}
                                                placeholder={t('settings.packNamePlaceholder')}
                                                maxLength={40}
                                            />
                                        </label>
                                        <label className="custom-pack-label">
                                            {t('settings.wordsLabel')}
                                            <textarea
                                                className="custom-pack-textarea"
                                                value={this.state.draftWords}
                                                onChange={(e) => this.setState({ draftWords: e.target.value, draftError: '' })}
                                                placeholder={t('settings.wordsPlaceholder')}
                                                rows={5}
                                            />
                                        </label>
                                        {this.state.draftError && (
                                            <p className="pack-premium-hint pack-premium-hint--error">{this.state.draftError}</p>
                                        )}
                                        <button type="button" className="pack-preview-btn pack-preview-btn--primary" onClick={this.saveDraftPack}>
                                            {t('settings.savePack')}
                                        </button>
                                    </div>
                                </div>
                                )}

                                {isExpat && (
                                <div className="pack-subsection">
                                    <h3 className="pack-subsection__title">{t('settings.categories')}</h3>
                                    <div className={'info-block'} style={{flexWrap: 'wrap'}}>
                                        {ALL_CATEGORIES.map((cat) => (
                                            <h2
                                                key={cat}
                                                className={`${this.state.categories.includes(cat) ? 'active' : ''}`}
                                                onClick={() => this.toggleCategory(cat)}
                                                style={{fontSize: '1.05em'}}
                                            >
                                                {categoryLabel(cat)}
                                            </h2>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {comingSoonPacks.length > 0 && (
                                <div className="pack-subsection">
                                    <h3 className="pack-subsection__title">{t('settings.morePacks')}</h3>
                                    <div className="pack-coming-list">
                                        {comingSoonPacks.map((pack) => (
                                            <div key={pack.id} className="pack-coming-item">
                                                <strong>{t(`pack.${pack.id}.title` as MessageKey)}</strong>
                                                <span>{t('settings.comingSoonPlay')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}
                            </div>

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>{t('settings.time')}</h2>
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
                                        {t('settings.difficulty')}
                                    </h2>
                                </div>
                                <div className={'info-block'}>
                                    {DIFFICULTY_OPTIONS.map((opt) => (
                                        <h2
                                            key={opt.key}
                                            className={`${this.state.hardLevel == opt.key ? 'active' : ''}`}
                                            onClick={() => this.changeHardLevel(opt.key)}
                                        >
                                            {t(opt.labelKey)}
                                        </h2>
                                    ))}
                                </div>
                            </div>
                            )}

                            <div className={'settings-block'}>
                                <div className={'title-block'}>
                                    <h2 className='title'>{t('settings.targetScore')}</h2>
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
                        </div>
                        <div>
                            <div onClick={this.handleClose} className={'settings-block btn-start'}>
                                <h2>{t('common.ok')}</h2>
                            </div>
                        </div>

                    </Dialog>

                    <Dialog open={this.state.previewOpen} onClose={this.closePreview} aria-labelledby="pack-preview-title">
                        <div className="pack-preview">
                            <h2 id="pack-preview-title" className="pack-preview__title">{this.getPreviewTitle()}</h2>
                            <p className="pack-preview__count">{t('preview.wordsCount', { n: previewWords.length })}</p>
                            <div className="pack-preview__list">
                                {previewWords.length === 0 ? (
                                    <p className="pack-premium-hint">{t('preview.empty')}</p>
                                ) : (
                                    <ul>
                                        {previewWords.map((word, i) => (
                                            <li key={`${word}-${i}`}>{word}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div onClick={this.closePreview} className={'settings-block btn-start'}>
                                <h2>{t('common.close')}</h2>
                            </div>
                        </div>
                    </Dialog>
            <NoAdsModalComponent
                open={this.state.showNoAdsModal}
                onClose={this.closeNoAdsModal}
                onSubscribed={this.onSubscribedFromSettings}
            />
            </div>
        )
    }
}

export default ModalSettingsComponent;
