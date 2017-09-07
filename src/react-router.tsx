import PropTypes from 'prop-types'
import React from 'react'
import {Component} from 'react'
import DefaultRoute from 'react-router/Route'
import {HeroCompanion, heroTransitionContext} from './index'

export {PropTypes as _PropTypes}

export class HeroRoute extends Component<any, {}> {
  static contextTypes = heroTransitionContext
  state = {render: false}
  mounted: boolean
  keepRendered: boolean
  timeout: number|null

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const {wrap: Route = DefaultRoute, render, component: Component, group, fromState, toState, ...props} = this.props

    return (
      <Route {...props} children={({match, ...rest}) => {
        if (!!match !== this.keepRendered) {
          if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
          }

          if (match) {
            this.keepRendered = match
          } else {
            this.timeout = setTimeout(() => {
              this.timeout = null
              this.keepRendered = false
              if (this.mounted) {
                this.setState({})
              }
            }, this.context.timeout)
          }
        }

        return <HeroCompanion group={group} render={({running, firstRender, fromState: runningFromState, toState: runningToState}) =>
          (
            (
              (running || firstRender) &&
              (!fromState || fromState === runningFromState) && (!toState || toState === runningToState)
            ) ||
            match ||
            !!this.keepRendered
          ) && (
            Component
              ? <Component {...rest} match={match || this.keepRendered} />
              : render({...rest, match: match || this.keepRendered})
          )
        } />
      }} />
    )
  }
}
