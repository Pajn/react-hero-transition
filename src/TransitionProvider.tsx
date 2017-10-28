import {Children, Component, ReactElement} from 'react'
import {Hero} from './Hero'
import {
  HeroTransitionContext,
  OldHero,
  Renderer,
  StateChange,
  heroTransitionContext,
} from './context'
import {cssTransition} from './css-transition'

export type __ReactElement = ReactElement<any>

export type TransitionProviderProps = {
  timeout?: number
  renderer?: Renderer<any>
}

export class TransitionProvider extends Component<TransitionProviderProps, {}> {
  static childContextTypes = heroTransitionContext
  static defaultProps = {
    renderer: cssTransition(),
  }
  addingHeroes = new Map<String, Hero<any>>()
  activeHeroes = new Map<String, Hero<any>>()
  removedHeroes = new Map<String, OldHero>()
  awaitListeners = new Set<(hero: Hero<any>) => void>()
  heroStateChangeListeners = new Set<(hero: StateChange) => void>()

  get timeout() {
    return this.props.timeout === undefined ? 100 : this.props.timeout
  }

  getChildContext(): HeroTransitionContext {
    return {
      getRemovedHero: id => {
        if (this.activeHeroes.has(id)) return undefined
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
          this.removedHeroes.set(id, {
            rect,
            group: hero.props.group,
            state: hero.props.state,
          })
          setTimeout(() => {
            this.removedHeroes.delete(id)
          }, this.timeout)
        }
      },

      renderer: this.props.renderer!,
      timeout: this.timeout,

      awaitHero: (group, callback) => {
        let listener: undefined | ((hero: Hero<any>) => void) = undefined

        for (const hero of this.addingHeroes.values()) {
          if (!listener && hero.props.group === group) {
            listener = (hero: Hero<any>) => {
              if (hero.props.group === group) {
                this.awaitListeners.delete(listener!)
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
        const running = this.props.renderer!.runTransition(
          newHero,
          oldHero.rect,
          toRect,
        )

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
      },
    }
  }

  render() {
    return Children.only(this.props.children) as JSX.Element
  }
}
