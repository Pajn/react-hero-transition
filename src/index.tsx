import PropTypes from 'prop-types'
import {Children, Component, ReactElement} from 'react'
import {findDOMNode} from 'react-dom'
import {cssTransition} from './css-transition'

export const heroTransitionContext = {
  getRemovedHero: PropTypes.func,
  heroAdding: PropTypes.func,
  heroAdded: PropTypes.func,
  heroRemoved: PropTypes.func,
  renderer: PropTypes.object,
  timeout: PropTypes.number,

  runTransition: PropTypes.func,
  awaitHero: PropTypes.func,
  onHeroStateChange: PropTypes.func,
}

export type StateChange = {
  running: boolean
  group: string
  fromState: string|null
  toState: string|null
  fromRect: ClientRect
  toRect: ClientRect
}

export type Renderer<T> = {
  initialState: T
  render: (hero: Hero<T>, renderedChildren: ReactElement<any>) => ReactElement<any>
  runTransition: (hero: Hero<T>, fromRect: ClientRect, toRect: ClientRect) => any
}

export type OldHero = {
  hero?: Hero<any>
  rect: ClientRect
  group?: string
  state?: string
  isRunning?: boolean
}

export type ProviderProps = {
  timeout?: number
  renderer?: Renderer<any>
}

export class TransitionProvider extends Component<ProviderProps, {}> {
  static childContextTypes = heroTransitionContext
  static defaultProps = {
    renderer: cssTransition()
  }
  addingHeroes = new Map<String, Hero<any>>()
  activeHeroes = new Map<String, Hero<any>>()
  removedHeroes = new Map<String, OldHero>()
  awaitListeners = new Set<(hero: Hero<any>) => void>()
  heroStateChangeListeners = new Set<(hero: StateChange) => void>()

  get timeout() {
    return this.props.timeout === undefined ? 100 : this.props.timeout
  }

  getChildContext() {
    return {
      getRemovedHero: id => {
        if (this.activeHeroes.has(id)) return null
        return this.removedHeroes.get(id)
      },

      heroAdding: (id, hero) => {
        this.addingHeroes.set(id, hero)
      },

      heroAdded: (id, hero) => {
        this.addingHeroes.delete(id)
        this.awaitListeners.forEach(listener => {
          listener(hero)
        })
        const previousHero = this.activeHeroes.get(id)
        this.activeHeroes.set(id, hero)
        if (previousHero && previousHero.element) {
          const rect = previousHero.measure()
          previousHero.hide()
          return {
            hero: previousHero,
            rect,
            group: previousHero.props.group,
            state: previousHero.props.state,
            isRunning: previousHero.state.isRunning,
          }
        }
      },

      heroRemoved: (id, hero) => {
        if (this.activeHeroes.get(id) === hero) {
          this.activeHeroes.delete(id)
        }
        if (hero.element) {
          const rect = hero.measure()
          this.removedHeroes.set(id, {rect, group: hero.props.group, state: hero.props.state})
          setTimeout(() => {
            this.removedHeroes.delete(id)
          }, this.timeout)
        }
      },

      renderer: this.props.renderer,
      timeout: this.timeout,

      awaitHero: (group, callback) => {
        let listener
        for (const hero of this.addingHeroes.values()) {
          if (!listener && hero.props.group === group) {
            listener = hero => {
              if (hero.props.group === group) {
                this.awaitListeners.delete(listener)
                callback()
              }
            }
          }
        }

        if (listener) {
          this.awaitListeners.add(listener)
        } else {
          callback()
        }
      },

      onHeroStateChange: listener => {
        this.heroStateChangeListeners.add(listener)
        return () => this.heroStateChangeListeners.delete(listener)
      },

      runTransition: (newHero, oldHero) => {
        const toRect = newHero.measure()
        const running = this.props.renderer!.runTransition(newHero, oldHero.rect, toRect)

        if (running && newHero.props.group === oldHero.group) {
          const state = {
            group: oldHero.group,
            fromState: oldHero.state,
            toState: newHero.props.state,
            fromRect: oldHero.rect,
            toRect,
          }

          this.heroStateChangeListeners.forEach(listener => {
            listener({
              running: true,
              ...state,
            })
          })

          running.then(() => {
            this.heroStateChangeListeners.forEach(listener => {
              listener({
                running: false,
                ...state,
              })
            })
          })
        }
      }
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}

export type HeroProps = {
  id: string
  render?: (o: {heroIn: boolean, isRunning: boolean}) => ReactElement<any>|Array<ReactElement<any>>
  children?: ReactElement<any>
  group: string
  state?: string
  skipIfRunning?: boolean
  onlyFromState?: string|Array<string>
  skipFromState?: string|Array<string>
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
  element: Element
  oldHero: OldHero
  setRef = component => {
    this.element = findDOMNode(component)
    if (this.notifyAddOnRef) {
      this.onHeroAdded()
    }
  }
  notifyAddOnRef: boolean = false
  mounted: boolean = false

  constructor(props, context) {
    super(props, context)

    this.state.rendererState = context.renderer.initialState
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.renderer !== nextContext.renderer) {
      this.setState({rendererState: nextContext.renderer && nextContext.renderer.initialState})
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
      ? this.props.render({heroIn, isRunning: isRunning!})
      : this.props.children

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

  private checkHeroAdded(props) {
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
    if (this.oldHero && !(
        this.props.group && this.props.state &&
        this.props.group === this.oldHero.group &&
        this.props.state === this.oldHero.state
      ) &&
      (!this.props.skipIfRunning || !this.oldHero.isRunning) &&
      (!this.props.skipFromState || !inList(this.oldHero.state, this.props.skipFromState)) &&
      (!this.props.onlyFromState || inList(this.oldHero.state, this.props.onlyFromState))
    ) {
      this.context.runTransition(this, this.oldHero)
    }
  }
}

function inList(value: string|undefined, arrayOrString: string|Array<string>) {
  if (!arrayOrString) return false
  if (arrayOrString === value) return true
  if (arrayOrString['some'] && arrayOrString['some'](e => e === value)) return true
  return false
}

export type CompanionProps = {
  group: string
  render: (info: {awaiting: boolean, firstRender: boolean} & StateChange) => ReactElement<any>|null
}

export type CompanionState = {
  heroState?: StateChange
  awaiting?: boolean
  firstRender?: boolean
}

export class HeroCompanion extends Component<CompanionProps, CompanionState> {
  static contextTypes = heroTransitionContext
  state = {heroState: {running: false}, firstRender: true, awaiting: true} as this['state']
  disposeListener

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
    this.disposeListener = this.context.onHeroStateChange(this.onHeroStateChange)
    this.setState({firstRender: false})
  }

  componentWillUnmount() {
    this.disposeListener()
    this.disposeListener = null
  }

  componentWillReceiveProps(_, nextContext) {
    if (this.context.heroState !== nextContext.heroState) {

    }
  }

  render() {
    const {render} = this.props
    const {heroState, awaiting, firstRender} = this.state

    return render({...heroState, awaiting, firstRender})
  }
}
