import React from 'react'
import '../../App.css'
import '../BodyComponent.css'
import './index.css'
import { t } from '../../i18n'

interface RulesProps {
  onBack: () => void
}

class RulesComponent extends React.PureComponent<RulesProps> {
  render() {
    return (
      <div className="rules-screen">
        <h1 className="rules-screen__title">{t('rules.title')}</h1>
        <div className="rules-screen__card">
          <ol className="rules-screen__list">
            <li>{t('rules.1')}</li>
            <li>{t('rules.2')}</li>
            <li>{t('rules.3')}</li>
            <li>{t('rules.4')}</li>
            <li>{t('rules.5')}</li>
            <li>{t('rules.6')}</li>
            <li>{t('rules.7')}</li>
          </ol>
        </div>
        <div className="settings-block btn-start" onClick={this.props.onBack}>
          <h2>{t('common.back')}</h2>
        </div>
      </div>
    )
  }
}

export default RulesComponent
