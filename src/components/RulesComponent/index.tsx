import React from 'react'
import '../../App.css'
import '../BodyComponent.css'
import './index.css'

interface RulesProps {
  onBack: () => void
}

class RulesComponent extends React.PureComponent<RulesProps> {
  render() {
    return (
      <div className="rules-screen">
        <h1 className="rules-screen__title">Rules</h1>
        <div className="rules-screen__card">
          <ol className="rules-screen__list">
            <li>
              <strong>Teams take turns.</strong> One player explains words; teammates guess.
            </li>
            <li>
              <strong>Explain without saying the word</strong> (or its root). Gestures are OK.
            </li>
            <li>
              Tap <span className="rules-chip rules-chip--next">Next</span> when guessed,
              <span className="rules-chip rules-chip--skip">Skip</span> to pass.
            </li>
            <li>
              After the timer, review answers — you can flip correct/skipped.
            </li>
            <li>
              <strong>Streak bonus:</strong> from 3 correct in a row, each hit gives +1 bonus point.
            </li>
            <li>
              After a team reaches the target, finish the round so every team
              gets the same number of turns. Highest score wins; if tied, keep
              playing until one team leads.
            </li>
            <li>
              Choose pack in settings: <em>Classic</em> (by difficulty) or <em>Expat DE</em> (categories).
            </li>
          </ol>
        </div>
        <div className="settings-block btn-start" onClick={this.props.onBack}>
          <h2>Back</h2>
        </div>
      </div>
    )
  }
}

export default RulesComponent
