import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'
import { t } from '../../i18n'


interface ListWordsProps {
    teamInfo: any[],
    onNext: any
}

interface ListWordsState {
    list: {
        team: string,
        listWords: {[k: string]: boolean},
        streakBonus?: number
    }
    advancing: boolean
}

class ListWordsComponent extends React.PureComponent <ListWordsProps, ListWordsState> {
    /** Storage key may be "[Category] word"; UI shows only the word. */
    displayWord = (storageKey: string) => storageKey.replace(/^\[[^\]]+\]\s+/, '')

    constructor(props: any) {
        super(props);

        this.state = {
            list: {
                team: '',
                listWords: {},
                streakBonus: 0,
            },
            advancing: false,
        }
    }

    componentDidMount() {
        const key = localStorage.getItem('currentTeam') || ''
        const raw = key ? localStorage.getItem(key) : null
        let parsed: any = null
        try {
            parsed = raw ? JSON.parse(raw) : null
        } catch {
            parsed = null
        }
        const safeList = parsed && typeof parsed === 'object'
            ? {
                team: parsed.team || key,
                listWords: parsed.listWords || {},
                streakBonus: Number(parsed.streakBonus) || 0,
              }
            : { team: key, listWords: {}, streakBonus: 0 }
        this.setState({list: safeList})
    }

    saveToStorage() {
        const key = localStorage.getItem('currentTeam')
        if (!key) return
        localStorage.setItem(key, JSON.stringify(this.state.list))
    }

    changeStatus = (el: any) => {
        let listWords: any = this.state.list.listWords
        listWords[el] = !listWords[el]
        let list = {
            team: this.state.list.team,
            listWords: listWords,
            streakBonus: this.state.list.streakBonus || 0,
        }
        this.setState({list: list})
        this.saveToStorage()
    }

    onNext = () => {
        if (this.state.advancing) return
        this.setState({ advancing: true })

        const key: string = localStorage.getItem('currentTeam') || ''
        type TeamScore = { name: string, trues: number, wrong: number, bonus: number, score: number }
        let results: { [name: string]: TeamScore } | null = null
        try {
            const raw = localStorage.getItem('results')
            results = raw ? JSON.parse(raw) : null
        } catch {
            results = null
        }

        const {listWords} = this.state.list
        const words = Object.keys(listWords).length
        const truescounter = Object.values(listWords).filter(el => !!el).length
        const bonus = Number(this.state.list.streakBonus) || 0
        const roundScore = truescounter + bonus

        const apply = (prev?: TeamScore): TeamScore => ({
            name: key,
            trues: (prev ? prev.trues : 0) + truescounter,
            wrong: (prev ? prev.wrong : 0) + (words - truescounter),
            bonus: (prev ? (prev.bonus || 0) : 0) + bonus,
            score: (prev ? (prev.score != null ? prev.score : prev.trues) : 0) + roundScore,
        })

        if (!results) {
            localStorage.setItem('results', JSON.stringify({ [key]: apply() }))
        } else if (!results[key]) {
            results[key] = apply()
            localStorage.setItem('results', JSON.stringify(results))
        } else {
            results[key] = apply(results[key])
            localStorage.setItem('results', JSON.stringify(results))
        }

        try {
            this.props.onNext()
        } catch {
            this.setState({ advancing: false })
        }
    }

    render() {
        const {listWords} = this.state.list
        let words = Object.keys(listWords)
        let truescounter = Object.values(listWords).filter(el => !!el).length
        const bonus = Number(this.state.list.streakBonus) || 0
        return (
            <div className={'word-list'}>
                <div className={'word-list-wrapper'}>
                    {(words.map((el: string) =>
                        <div className={'word-row'} key={el}>
                            <h1 className={'word'}>{this.displayWord(el)}</h1>
                            <div className={'buttons'}>
                                <label className="switch">
                                    <input type="checkbox" onClick={() => this.changeStatus(el)}
                                           checked={!!listWords[el]}/>
                                    <span className="slider round"/>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={'footer'}>
                    <div className={'result-counter'}>
                        <div className={'trues'}>
                            <h2>{t('review.correct')}</h2>
                            <h3>{truescounter}</h3>
                        </div>
                        <div className={'false'}>
                            <h2>{t('review.skipped')}</h2>
                            <h3>{words.length - truescounter}</h3>
                        </div>
                        {bonus > 0 && (
                            <div className={'trues'}>
                                <h2>{t('review.bonus')}</h2>
                                <h3>+{bonus}</h3>
                            </div>
                        )}
                    </div>
                    <div
                        className={`btn ${this.state.advancing ? 'btn--disabled' : ''}`}
                        onClick={this.onNext}
                        aria-busy={this.state.advancing}
                    >
                        <h1>{t('common.next')}</h1>
                    </div>
                </div>
            </div>
        )
    }
}

export default ListWordsComponent;
