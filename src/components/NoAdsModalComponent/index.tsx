import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import { APP_CONFIG } from '../../config/appConfig'
import { getSubscriptionOfferCopy, purchaseNoAdsSubscription } from '../../services/subscription'
import './index.css'

interface NoAdsModalProps {
  open: boolean
  onClose: () => void
  onSubscribed?: () => void
}

interface NoAdsModalState {
  busy: boolean
  error: string
}

class NoAdsModalComponent extends React.PureComponent<NoAdsModalProps, NoAdsModalState> {
  state: NoAdsModalState = { busy: false, error: '' }

  componentDidUpdate(prev: NoAdsModalProps) {
    if (this.props.open && !prev.open) {
      this.setState({ busy: false, error: '' })
    }
  }

  onSubscribe = async () => {
    this.setState({ busy: true, error: '' })
    const result = await purchaseNoAdsSubscription()
    this.setState({ busy: false })
    if (result === 'ok') {
      this.props.onSubscribed && this.props.onSubscribed()
      this.props.onClose()
      return
    }
    if (result === 'cancelled') {
      this.props.onClose()
      return
    }
    this.setState({
      error:
        result === 'unavailable'
          ? 'In-app purchases are not available on this device yet. Product must be configured in Google Play.'
          : 'Purchase failed. Please try again later.',
    })
  }

  render() {
    const copy = getSubscriptionOfferCopy()
    return (
      <Dialog
        open={!!this.props.open}
        onClose={this.props.onClose}
        aria-labelledby="no-ads-title"
        PaperProps={{ className: 'no-ads-modal-paper' }}
      >
        <div className="no-ads-modal">
          <h2 id="no-ads-title" className="no-ads-modal__title">
            {copy.title}
          </h2>
          <p className="no-ads-modal__message">{copy.message}</p>
          <div className="no-ads-modal__badge">{APP_CONFIG.subscriptionOfferLabel}</div>
          {this.state.error && <p className="no-ads-modal__error">{this.state.error}</p>}
          <div className="no-ads-modal__actions">
            <Button
              className="no-ads-modal__cta"
              color="primary"
              variant="contained"
              disabled={this.state.busy}
              onClick={this.onSubscribe}
            >
              {this.state.busy ? '…' : 'Subscribe 6 months'}
            </Button>
            <Button disabled={this.state.busy} onClick={this.props.onClose}>
              Continue with ads
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default NoAdsModalComponent
