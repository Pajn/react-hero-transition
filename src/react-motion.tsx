import * as React from 'react'
import {ReactElement, cloneElement} from 'react'
import {Motion, OpaqueConfig, SpringHelperConfig, spring} from 'react-motion'
import {Hero} from './Hero'
import {get, stylePath, transformPath, visibility} from './helpers'

export type State = {
  translateX: number | OpaqueConfig
  translateY: number | OpaqueConfig
  scaleX: number | OpaqueConfig
  scaleY: number | OpaqueConfig
}
export type IndividualSpringHelperConfig = {
  translateX: SpringHelperConfig
  translateY: SpringHelperConfig
  scaleX: SpringHelperConfig
  scaleY: SpringHelperConfig
}

export const reactMotion = (
  springOptions?: IndividualSpringHelperConfig | SpringHelperConfig,
) => ({
  initialState: {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
  },

  render(hero: Hero<State>, renderedChildren: ReactElement<any>) {
    const {rendererState} = hero.state
    const heroIn = !!hero.oldHero

    return (
      <Motion style={rendererState}>
        {value =>
          cloneElement(renderedChildren, {
            style: {
              ...get(renderedChildren, stylePath),
              visibility: visibility(renderedChildren, hero),
              transform: heroIn
                ? `translate(${value.translateX}px, ${value.translateY}px) ` +
                  `scale(${value.scaleX}, ${value.scaleY})`
                : get(renderedChildren, transformPath),
              transformOrigin: '0 0',
            },
          })}
      </Motion>
    )
  },

  runTransition(hero: Hero<State>, fromRect: ClientRect, toRect: ClientRect) {
    hero.setState(
      {
        rendererState: {
          translateX: fromRect.left - toRect.left,
          translateY: fromRect.top - toRect.top,
          scaleX: fromRect.width / toRect.width,
          scaleY: fromRect.height / toRect.height,
        },
      },
      () => {
        hero.setState({
          rendererState: {
            translateX: spring(
              0,
              (springOptions &&
                (springOptions as IndividualSpringHelperConfig).translateX) ||
                (springOptions as SpringHelperConfig),
            ),
            translateY: spring(
              0,
              (springOptions &&
                (springOptions as IndividualSpringHelperConfig).translateY) ||
                (springOptions as SpringHelperConfig),
            ),
            scaleX: spring(
              1,
              (springOptions &&
                (springOptions as IndividualSpringHelperConfig).scaleX) ||
                (springOptions as SpringHelperConfig),
            ),
            scaleY: spring(
              1,
              (springOptions &&
                (springOptions as IndividualSpringHelperConfig).scaleY) ||
                (springOptions as SpringHelperConfig),
            ),
          },
        })
      },
    )
  },
})
