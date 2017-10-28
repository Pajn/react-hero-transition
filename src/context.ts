import PropTypes from 'prop-types'
import {ReactChild} from 'react'
import {Hero} from './Hero'

export type HeroTransitionContext = {
  getRemovedHero: (heroId: string) => OldHero | undefined
  heroAdding: (heroId: string, hero: Hero<any>) => void
  heroAdded: (heroId: string, hero: Hero<any>) => void
  heroRemoved: (heroId: string, hero: Hero<any>) => void
  renderer: Renderer<any>
  timeout: number

  runTransition: (fromHero: Hero<any>, toHero: OldHero) => void
  awaitHero: (group: string, cb: () => void) => void
  onHeroStateChange: (cb: (heroState: StateChange) => void) => () => void
}

export type Renderer<T> = {
  initialState: T
  render: (hero: Hero<T>, renderedChildren: ReactChild) => ReactChild
  runTransition: (
    hero: Hero<T>,
    fromRect: ClientRect,
    toRect: ClientRect,
  ) => any
}

export type OldHero = {
  hero?: Hero<any>
  rect: ClientRect
  group?: string
  state?: string
  isRunning?: boolean
}

export type StateChange = {
  running: boolean
  group?: string
  fromState?: string
  toState?: string
  fromRect: ClientRect
  toRect: ClientRect
}

export const heroTransitionContext: {
  [P in keyof HeroTransitionContext]: Function
} = {
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
