import {Component, ReactChild} from 'react'
import {
  HeroTransitionContext,
  StateChange,
  heroTransitionContext,
} from './context'

export type HeroCompanionProps = {
  group: string
  render: (
    info: {awaiting: boolean; firstRender: boolean} & StateChange,
  ) => ReactChild
}

export type HeroCompanionState = {
  heroState: StateChange
  awaiting: boolean
  firstRender: boolean
}

export class HeroCompanion extends Component<
  HeroCompanionProps,
  HeroCompanionState
> {
  static contextTypes = heroTransitionContext
  state = {
    heroState: {running: false},
    firstRender: true,
    awaiting: true,
  } as HeroCompanionState
  context: HeroTransitionContext
  disposeListener?: () => void

  onHeroStateChange = (heroState: StateChange) => {
    if (heroState.group === this.props.group) {
      this.setState({heroState, firstRender: true}, () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (this.disposeListener) {
              this.setState({firstRender: false})
            }
          })
        })
      })
    }
  }

  componentDidMount() {
    this.context.awaitHero(this.props.group, () => {
      this.setState({awaiting: false})
    })
    this.disposeListener = this.context.onHeroStateChange(
      this.onHeroStateChange,
    )
    this.setState({firstRender: false})
  }

  componentWillUnmount() {
    if (this.disposeListener) {
      this.disposeListener()
      this.disposeListener = undefined
    }
  }

  render() {
    const {render} = this.props
    const {heroState, awaiting, firstRender} = this.state

    return render({...heroState, awaiting, firstRender})
  }
}
