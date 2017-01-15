import * as React from 'react'
import {Children, Component, PropTypes, ReactElement, ReactType, cloneElement} from 'react'
import {findDOMNode} from 'react-dom'
import {Motion, spring} from 'react-motion'

export const heroTransitionContext = {
  elementAdded: PropTypes.func,
  elementRemoved: PropTypes.func,
}

export type ProviderProps = {
  timeout?: number
}

export class TransitionProvider extends Component<ProviderProps, {}> {
  static childContextTypes = heroTransitionContext
  removedElements = {}

  getChildContext() {
    return {
      elementAdded: id => {
        return this.removedElements[id]
      },

      elementRemoved: (id, rect) => {
        this.removedElements[id] = rect
        setTimeout(() => {
          delete this.removedElements[id]
        }, typeof this.props.timeout === 'number' ? this.props.timeout : 100)
      },
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}

export type HeroProps = {
  id: string
  render?: (o: {heroIn: boolean}) => ReactElement<any>
  children?: ReactElement<any>
}

export class Hero extends Component<HeroProps, {render: boolean, hidden: boolean}> {
  static contextTypes = heroTransitionContext
  state = {render: false, hidden: true, to: {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
  }}
  element: Element
  oldRect: ClientRect
  setRef = component => {
    this.element = findDOMNode(component)
  }

  componentWillMount() {
    this.oldRect = this.context.elementAdded(this.props.id)
    if (this.oldRect) {
      this.setState({render: true}, () => {
        this.maybeRunTransition()
        this.setState({hidden: false})
      })
    }
  }

  componentDidMount() {
    if (!this.state.render) {
      this.oldRect = this.context.elementAdded(this.props.id)
      this.setState({render: true}, () => {
        this.maybeRunTransition()
        this.setState({hidden: false})
      })
    }
  }

  componentWillUnmount() {
    const rect = this.element.getBoundingClientRect()
    this.context.elementRemoved(this.props.id, rect)
  }

  render() {
    const {hidden, from, to, render} = this.state
    const heroIn = !!this.oldRect
    if (!render) return null

    const renderedChildren = this.props.render
        ? this.props.render({heroIn})
        : this.props.children

    if (!renderedChildren) return null

    return (
      <Motion style={to}>
        {value => cloneElement(Children.only(renderedChildren), {
            ref: this.setRef
            style: heroIn
              ? {
                ...renderedChildren.props.style,
                transform: `translate(${value.translateX}px, ${value.translateY}px) ` +
                           `scale(${value.scaleX}, ${value.scaleY})`,
                transformOrigin: '0 0',
              }
              : {
                ...renderedChildren.props.style,
                visability: hidden
                  ? 'hidden'
                  : (renderedChildren.props.style && renderedChildren.props.style.visability),
                transformOrigin: '0 0',
              },
          }
        )}
      </Motion>
    )
  }

  private maybeRunTransition() {
    if (this.oldRect) {
      const rect = this.element.getBoundingClientRect()

      this.setState({
        to: {
          translateX: this.oldRect.left - rect.left,
          translateY: this.oldRect.top - rect.top,
          scaleX: this.oldRect.width / rect.width,
          scaleY: this.oldRect.height / rect.height,
        }
      }, () => {
        this.setState({
          to: {
            translateX: spring(0),
            translateY: spring(0),
            scaleX: spring(1),
            scaleY: spring(1),
          },
        })
      })
    }
  }
}
