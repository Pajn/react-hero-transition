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

export const reactMotion = () => ({
  initialState: {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
  },

  render(hero: Hero<State>, renderedChildren: ReactElement<any>) {
    const {rendererState} = hero.state
    const heroIn = !!hero.oldRect

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

  runTransition(hero: Hero<State>, rect: ClientRect) {
    hero.setState({
      rendererState: {
        translateX: hero.oldRect.left - rect.left,
        translateY: hero.oldRect.top - rect.top,
        scaleX: hero.oldRect.width / rect.width,
        scaleY: hero.oldRect.height / rect.height,
      }
    }, () => {
      hero.setState({
        rendererState: {
          translateX: spring(0),
          translateY: spring(0),
          scaleX: spring(1),
          scaleY: spring(1),
        },
      })
    })
  },
})
