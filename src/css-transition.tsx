import {ReactElement, cloneElement} from 'react'
import {get, stylePath, visibility} from './helpers'
import {Hero} from './index'

export type State = {style: {transition?: string, transform?: string}}

export const cssTransition = ({transition = 'transform 0.4s'} = {}) => ({
  initialState: {style: {}},

  render(hero: Hero<State> , renderedChildren: ReactElement<any>) {
    return cloneElement(renderedChildren, {
      ref: hero.setRef,
      style: Object.assign({
        ...get(renderedChildren, stylePath),
        visibility: visibility(renderedChildren, hero),
        transformOrigin: '0 0',
        ...hero.state.rendererState.style,
      }),
    })
  },

  runTransition(hero: Hero<State> , fromRect: ClientRect, toRect: ClientRect) {
    const translateX = fromRect.left - toRect.left
    const translateY = fromRect.top - toRect.top
    const scaleX = fromRect.width / toRect.width
    const scaleY = fromRect.height / toRect.height
    const transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`

    return new Promise(resolve => {
      let observer

      function cleanUp(e?) {
        if (e) {
          e.target.removeEventListener('transitionend', cleanUp)
        }
        if (observer) {
          observer.disconnect()
        }
        if (hero.mounted) {
          hero.setState({
            isRunning: false,
            rendererState: {
              style: {},
            }
          }, () => resolve())
        } else {
          resolve()
        }
      }

      // The hero may be removed from the DOM during transition and transitionend will then
      // never be called so we set up this MutationObserver to track and handle that case.
      if (hero.element) {
        observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.removedNodes.length > 0) {
              if (!document.body.contains(hero.element)) {
                cleanUp()
              }
            }
          })
        })

        observer.observe(window.document, {subtree: true, childList: true})
      }

      hero.setState({
        isRunning: true,
        rendererState: {
          style: {
            transition: ``,
            transform,
          },
        }
      }, () => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!hero.mounted) return
          hero.setState({
            rendererState: {
              style: {
                transition,
                transform,
              },
            },
          }, () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              if (!hero.mounted) return
              if (hero.element) hero.element.addEventListener('transitionend', cleanUp)
              hero.setState({
                rendererState: {
                  style: {
                    transition,
                    transform: ``,
                  },
                },
              })
            }))
          })
        }))
      })
    })
  },
})
