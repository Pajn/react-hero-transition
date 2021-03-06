import {ReactElement, cloneElement} from 'react'
import {Hero} from './Hero'
import {get, stylePath, visibility} from './helpers'

export type State = {
  style: {transition?: string; transform?: string; transformOrigin?: string}
}

export const cssTransition = ({transition = 'transform 0.4s'} = {}) => ({
  initialState: {style: {}},

  render(hero: Hero<State>, renderedChildren: ReactElement<any>) {
    return cloneElement(renderedChildren, {
      style: Object.assign({
        ...get(renderedChildren, stylePath),
        visibility: visibility(renderedChildren, hero),
        ...hero.state.rendererState.style,
      }),
    })
  },

  runTransition(hero: Hero<State>, fromRect: ClientRect, toRect: ClientRect) {
    const translateX = fromRect.left - toRect.left
    const translateY = fromRect.top - toRect.top
    const scaleX = fromRect.width / toRect.width
    const scaleY = fromRect.height / toRect.height
    const transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`

    return new Promise(resolve => {
      let observer: MutationObserver

      function cleanUp(e?: Event) {
        if (e) {
          e.target.removeEventListener('transitionend', cleanUp)
        }
        if (observer) {
          observer.disconnect()
        }
        if (hero.mounted) {
          hero.setState(
            {
              isRunning: false,
              rendererState: {
                style: {},
              },
            },
            () => resolve(),
          )
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

      hero.setState(
        {
          isRunning: true,
          rendererState: {
            style: {
              transition: ``,
              transform,
              transformOrigin: '0 0',
            },
          },
        },
        () => {
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (!hero.mounted) return
              hero.setState(
                {
                  rendererState: {
                    style: {
                      transition,
                      transform,
                      transformOrigin: '0 0',
                    },
                  },
                },
                () => {
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                      if (!hero.mounted) return
                      if (hero.element)
                        hero.element.addEventListener('transitionend', cleanUp)
                      hero.setState({
                        rendererState: {
                          style: {
                            transition,
                            transformOrigin: '0 0',
                          },
                        },
                      })
                    }),
                  )
                },
              )
            }),
          )
        },
      )
    })
  },
})
