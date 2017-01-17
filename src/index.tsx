import {Children, Component, PropTypes, ReactElement} from 'react'
import {findDOMNode} from 'react-dom'
import {cssTransition} from './css-transition'

export const heroTransitionContext = {
  elementAdded: PropTypes.func,
  elementRemoved: PropTypes.func,
  renderer: PropTypes.object,
}

export type Renderer<T> = {
  initialState: T
  render: (hero: Hero<T>, renderedChildren: ReactElement<any>) => ReactElement<any>
  runTransition: (hero: Hero<T>, rect: ClientRect) => any
}

export type ProviderProps = {
  timeout?: number
  renderer?: Renderer<any>
}

export class TransitionProvider extends Component<ProviderProps, {}> {
  static childContextTypes = heroTransitionContext
  removedElements = {}

  getChildContext() {
    return {
      elementAdded: id => {
        return this.removedElements[id]
      },

      elementRemoved: (id, rect) => {
        this.removedElements[id] = rect
        setTimeout(() => {
          delete this.removedElements[id]
        }, typeof this.props.timeout === 'number' ? this.props.timeout : 100)
      },

      renderer: this.props.renderer || cssTransition()
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}

export type HeroProps = {
  id: string
  render?: (o: {heroIn: boolean}) => ReactElement<any>
  children?: ReactElement<any>
}

export type HeroState<T> = {
  render?: boolean
  hidden?: boolean
  rendererState: T
}

export class Hero<T> extends Component<HeroProps, HeroState<T>> {
  static contextTypes = heroTransitionContext
  state = {render: false, hidden: true} as HeroState<T>
  element: Element
  oldRect: ClientRect
  setRef = component => {
    this.element = findDOMNode(component)
  }

  constructor(props, context) {
    super(props, context)

    this.state.rendererState = context.renderer.initialState
  }

  componentWillMount() {
    this.oldRect = this.context.elementAdded(this.props.id)
    if (this.oldRect) {
      this.setState({render: true} as HeroState<T>, () => {
        this.maybeRunTransition()
        this.setState({hidden: false} as HeroState<T>)
      })
    }
  }

  componentWillReceiveProps(_, nextContext) {
    if (this.context.renderer !== nextContext.renderer) {
      this.setState({rendererState: nextContext.renderer && nextContext.renderer.initialState})
    }
  }

  componentDidMount() {
    if (!this.state.render) {
      this.oldRect = this.context.elementAdded(this.props.id)
      this.setState({render: true} as HeroState<T>, () => {
        this.maybeRunTransition()
        this.setState({hidden: false} as HeroState<T>)
      })
    }
  }

  componentWillUnmount() {
    const rect = this.element.getBoundingClientRect()
    this.context.elementRemoved(this.props.id, rect)
  }

  render() {
    const {render} = this.state
    const heroIn = !!this.oldRect
    if (!render) return null

    const renderedChildren = this.props.render
        ? this.props.render({heroIn})
        : this.props.children

    if (!renderedChildren) return null

    return this.context.renderer.render(this, Children.only(renderedChildren))
  }

  private maybeRunTransition() {
    if (this.oldRect) {
      const rect = this.element.getBoundingClientRect()
      this.context.renderer.runTransition(this, rect)
    }
  }
}
