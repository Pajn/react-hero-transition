import {
  Children,
  Component,
  ReactChild,
  ReactInstance,
  cloneElement,
} from 'react'
import {findDOMNode} from 'react-dom'
import {HeroTransitionContext, OldHero, heroTransitionContext} from './context'
import {inList} from './helpers'

export type HeroProps = {
  id: string
  render?: (
    o: {
      heroIn: boolean
      isRunning: boolean
      ref: (instance: ReactInstance | null) => void
    },
  ) => ReactChild
  children?: ReactChild
  group?: string
  state?: string
  skipIfRunning?: boolean
  onlyFromState?: string | Array<string>
  skipFromState?: string | Array<string>
  skipInitialRender?: boolean
}

export type HeroState<T> = {
  render?: boolean
  hidden?: boolean
  isRunning?: boolean
  rendererState: T
}

export class Hero<T> extends Component<HeroProps, HeroState<T>> {
  static contextTypes = heroTransitionContext
  state = {render: false, hidden: true, isRunning: false} as HeroState<T>
  context: HeroTransitionContext
  element: Element
  oldHero: OldHero | undefined
  setRef = (component: ReactInstance | null) => {
    if (component) {
      this.element = findDOMNode(component)
      if (this.notifyAddOnRef) {
        this.onHeroAdded()
      }
    }
  }
  notifyAddOnRef: boolean = false
  mounted: boolean = false

  constructor(props: HeroProps, context: HeroTransitionContext) {
    super(props, context)

    this.state.rendererState = context.renderer.initialState
  }

  componentWillReceiveProps(
    nextProps: HeroProps,
    nextContext: HeroTransitionContext,
  ) {
    if (this.context.renderer !== nextContext.renderer) {
      this.setState({
        rendererState:
          nextContext.renderer && nextContext.renderer.initialState,
      })
    }
    if (!this.props.id && nextProps.id) {
      this.checkHeroAdded(nextProps)
    }
  }

  componentWillMount() {
    this.context.heroAdding(this.props.id, this)
  }

  componentDidMount() {
    this.mounted = true
    if (this.props.id) {
      this.checkHeroAdded(this.props)
    }
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.props.id) {
      this.context.heroRemoved(this.props.id, this)
    }
    if (this.oldHero && this.oldHero.hero) {
      this.oldHero.hero.show()
    }
  }

  render() {
    const {skipInitialRender} = this.props
    const {isRunning, render} = this.state
    const heroIn = !!this.oldHero
    if (skipInitialRender && !render) return null

    const renderedChildren = this.props.render
      ? this.props.render({heroIn, isRunning: isRunning!, ref: this.setRef})
      : cloneElement(Children.only(this.props.children), {
          ref: this.setRef,
        })

    if (!renderedChildren) return null

    return this.context.renderer.render(this, Children.only(renderedChildren))
  }

  measure() {
    return this.element.getBoundingClientRect()
  }

  show() {
    if (this.mounted) {
      this.setState({hidden: false} as HeroState<T>)
    }
  }

  hide() {
    this.setState({hidden: true} as HeroState<T>)
  }

  private checkHeroAdded(props: HeroProps) {
    this.oldHero = this.context.getRemovedHero(props.id)
    this.setState({render: true} as HeroState<T>, () => {
      if (this.element) {
        this.onHeroAdded()
      } else {
        this.notifyAddOnRef = true
      }
    })
  }

  private onHeroAdded() {
    this.oldHero = this.context.heroAdded(this.props.id, this) || this.oldHero
    this.maybeRunTransition()
    this.setState({hidden: false} as HeroState<T>)
  }

  private maybeRunTransition() {
    if (
      this.oldHero &&
      !(
        this.props.group &&
        this.props.state &&
        this.props.group === this.oldHero.group &&
        this.props.state === this.oldHero.state
      ) &&
      (!this.props.skipIfRunning || !this.oldHero.isRunning) &&
      (!this.props.skipFromState ||
        !inList(this.oldHero.state, this.props.skipFromState)) &&
      (!this.props.onlyFromState ||
        inList(this.oldHero.state, this.props.onlyFromState))
    ) {
      this.context.runTransition(this, this.oldHero)
    }
  }
}
