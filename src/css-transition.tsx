import {ReactElement, cloneElement} from 'react'
import {Hero} from './index'

export type State = {
  transform: string
  transition: string
}

export const cssTransition = ({transition = 'transform 0.4s'} = {}) => ({
  initialState: {
    transform: '',
    transition: '',
  },

  render(hero: Hero<State> , renderedChildren: ReactElement<any>) {
    const {hidden, rendererState} = hero.state
    const heroIn = !!hero.oldRect

    return cloneElement(renderedChildren, {
      ref: hero.setRef,
      style: heroIn
        ? {
          ...(renderedChildren['props'] && renderedChildren['props'].style),
          transform: rendererState.transform,
          transformOrigin: '0 0',
          transition: rendererState.transition,
        }
        : {
          ...(renderedChildren['props'] && renderedChildren['props'].style),
          visability: hidden
            ? 'hidden'
            : (renderedChildren['props'] && renderedChildren['props'].style && renderedChildren['props'].style.visability),
          transformOrigin: '0 0',
        },
    })
  },

  runTransition(hero: Hero<State> , rect: ClientRect) {
    const translateX = hero.oldRect.left - rect.left
    const translateY = hero.oldRect.top - rect.top
    const scaleX = hero.oldRect.width / rect.width
    const scaleY = hero.oldRect.height / rect.height

    hero.element.style.transition = ''
    hero.element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`

    requestAnimationFrame(() => {
      hero.element.style.transition = transition
      requestAnimationFrame(() => {
        hero.element.style.transform = ''
      })
    })
    hero.element.addEventListener('transitionend', cleanUp)
  },
})

function cleanUp(e) {
  e.target.style.transition = ''
  e.target.style.transform = ''
  e.target.removeEventListener('transitionend', cleanUp)
}
