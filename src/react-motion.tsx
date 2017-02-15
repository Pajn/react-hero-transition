import * as React from 'react'
import {ReactElement, cloneElement} from 'react'
import {Motion, OpaqueConfig, spring} from 'react-motion'
import {get, stylePath, transformPath, visibility} from './helpers'
import {Hero} from './index'

export type State = {
  translateX: number|OpaqueConfig
  translateY: number|OpaqueConfig
  scaleX: number|OpaqueConfig
  scaleY: number|OpaqueConfig
}

export const reactMotion = (springOptions) => ({
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
        {value => cloneElement(renderedChildren, {
            ref: hero.setRef,
            style: {
              ...get(renderedChildren, stylePath),
              visibility: visibility(renderedChildren, hero),
              transform: heroIn
                ? `translate(${value.translateX}px, ${value.translateY}px) ` +
                  `scale(${value.scaleX}, ${value.scaleY})`
                : get(renderedChildren, transformPath),
              transformOrigin: '0 0',
            },
          }
        )}
      </Motion>
    )
  },

  runTransition(hero: Hero<State>, fromRect: ClientRect, toRect: ClientRect) {
    hero.setState({
      rendererState: {
        translateX: fromRect.left - toRect.left,
        translateY: fromRect.top - toRect.top,
        scaleX: fromRect.width / toRect.width,
        scaleY: fromRect.height / toRect.height,
      }
    }, () => {
      hero.setState({
        rendererState: {
          translateX: spring(0, (springOptions && springOptions.translateX) || springOptions),
          translateY: spring(0, (springOptions && springOptions.translateY) || springOptions),
          scaleX: spring(1, (springOptions && springOptions.scaleX) || springOptions),
          scaleY: spring(1, (springOptions && springOptions.scaleY) || springOptions),
        },
      })
    })
  },
})
