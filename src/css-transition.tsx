import {ReactElement, cloneElement} from 'react'
import {get, stylePath, visibility} from './helpers'
import {Hero} from './index'

export type State = {}

export const cssTransition = ({transition = 'transform 0.4s'} = {}) => ({
  render(hero: Hero<State> , renderedChildren: ReactElement<any>) {
    return cloneElement(renderedChildren, {
      ref: hero.setRef,
      style: Object.assign({
        ...get(renderedChildren, stylePath),
        visibility: visibility(renderedChildren, hero),
        transformOrigin: '0 0',
      }),
    })
  },

  runTransition(hero: Hero<State> , rect: ClientRect) {
    const translateX = hero.oldRect.left - rect.left
    const translateY = hero.oldRect.top - rect.top
    const scaleX = hero.oldRect.width / rect.width
    const scaleY = hero.oldRect.height / rect.height

    hero.element['style'].transition = ''
    hero.element['style'].transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`

    requestAnimationFrame(() => {
      hero.element.addEventListener('transitionend', cleanUp)
      hero.element['style'].transition = transition
      requestAnimationFrame(() => {
        hero.element['style'].transform = ''
      })
    })
  },
})

function cleanUp(e) {
  e.target.style.transition = ''
  e.target.style.transform = ''
  e.target.removeEventListener('transitionend', cleanUp)
}
