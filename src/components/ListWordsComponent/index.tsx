import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'


interface ListWordsProps {
    teamInfo: any[],
    onNext: any
}

interface ListWordsState {
    list: {
        team: '',
        listWords: {}
    }
}

class ListWordsComponent extends React.PureComponent <ListWordsProps, ListWordsState> {
    constructor(props: any) {
        super(props);

        this.state = {
            list: {
                team: '',
                listWords: {}
            }
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
            ? parsed
            : { team: key, listWords: {} }
        this.setState({list: safeList})
    }


    saveToStorage() {
        let key: any = localStorage.getItem('currentTeam')
        // @ts-ignore
        localStorage.setItem(key, JSON.stringify(this.state.list))
    }

    componentDidUpdate(prevProps: Readonly<ListWordsProps>, prevState: Readonly<ListWordsState>, snapshot?: any) {

    }

    changeStatus = (el: any) => {
        let listWords: any = this.state.list.listWords
        listWords[el] = !listWords[el]
        let list = {team: this.state.list.team, listWords: listWords}
        this.setState({list: list})
        this.saveToStorage()
    }

    onNext = () => {
        const key: string = localStorage.getItem('currentTeam') || ''
        let results: { [name: string]: { name: string, trues: number, wrong: number } } | null = null
        try {
            const raw = localStorage.getItem('results')
            results = raw ? JSON.parse(raw) : null
        } catch {
            results = null
        }

        const {listWords} = this.state.list
        let words = Object.keys(listWords).length
        let truescounter = Object.values(listWords).filter(el => !!el).length

        if (!results) {
            let saveObj = {
                [key]: {
                    name: key,
                    trues: truescounter,
                    wrong: words - truescounter
                }
            }
            localStorage.setItem('results', JSON.stringify(saveObj))
        } else
            // @ts-ignore
            if (!results[key]) {
                let saveObj = {
                    name: key,
                    trues: truescounter,
                    wrong: words - truescounter
                }
                // @ts-ignore
                results[key] = saveObj
                localStorage.setItem('results', JSON.stringify(results))
            } else {
                // @ts-ignore
                let saveObj: { name: string, trues: number, wrong: number } = results[key]
                saveObj.trues = saveObj.trues + truescounter
                saveObj.wrong = saveObj.wrong + (words - truescounter)
                // @ts-ignore
                results[key] = saveObj
                localStorage.setItem('results', JSON.stringify(results))
            }

        this.props.onNext()
    }

    render() {
        const {listWords} = this.state.list
        let words = Object.keys(listWords)
        let truescounter = Object.values(listWords).filter(el => !!el).length
        return (
            <div className={'word-list'}>
                <div className={'word-list-wrapper'}>
                    {(words.map((el: string) =>
                        <div className={'word-row'}>
                            <h1 className={'word'}>{el}</h1>
                            <div className={'buttons'}>
                                <label className="switch">
                                    <input type="checkbox" onClick={() => this.changeStatus(el)}
                                        // @ts-ignore
                                           checked={listWords[el]}/>
                                    <span className="slider round"/>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={'footer'}>
                    <div className={'result-counter'}>
                        <div className={'trues'}>
                            <h2>Correct:</h2>
                            <h3>{truescounter}</h3>
                        </div>
                        <div className={'false'}>
                            <h2>Skipped:</h2>
                            <h3>{words.length - truescounter}</h3>
                        </div>
                    </div>
                    <div className={'btn'} onClick={this.onNext}>
                        <h1>Next</h1>
                    </div>
                </div>
            </div>
        )
    }
}

export default ListWordsComponent;

