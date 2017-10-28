import * as React from 'react'
import {Component, ReactChild} from 'react'
import {
  Route as DefaultRoute,
  RouteComponentProps,
  RouteProps,
  match,
} from 'react-router'
import {HeroCompanion} from './HeroCompanion'
import {heroTransitionContext} from './context'

export type Diff<T extends string, U extends string> = ({[P in T]: P} &
  {[P in U]: never} & {[x: string]: never})[T]
export type Omit<T, K extends keyof T> = {[P in Diff<keyof T, K>]: T[P]}

export type HeroRouteProps = Omit<RouteProps, 'component' | 'render'> & {
  wrap?: React.ComponentType<RouteProps>
  render?: (props: RouteComponentProps<any>) => ReactChild
  component?: React.ComponentType<RouteComponentProps<any>>
  group: string
  fromState?: string
  toState?: string
}

export class HeroRoute extends Component<HeroRouteProps, {}> {
  static contextTypes = heroTransitionContext
  state = {render: false}
  mounted: boolean
  keepRendered: match<any> | undefined
  timeout: number | null

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const {
      wrap: Route = DefaultRoute,
      render,
      component: Component,
      group,
      fromState,
      toState,
      ...props,
    } = this.props

    return (
      <Route
        {...props}
        children={({match, ...rest}) => {
          if (!!match !== !!this.keepRendered) {
            if (this.timeout) {
              clearTimeout(this.timeout)
              this.timeout = null
            }

            if (match) {
              this.keepRendered = match
            } else {
              this.timeout = setTimeout(() => {
                this.timeout = null
                this.keepRendered = undefined
                if (this.mounted) {
                  this.setState({})
                }
              }, this.context.timeout)
            }
          }

          return (
            <HeroCompanion
              group={group}
              render={({
                running,
                firstRender,
                fromState: runningFromState,
                toState: runningToState,
              }) =>
                (((running || firstRender) &&
                  (!fromState || fromState === runningFromState) &&
                  (!toState || toState === runningToState)) ||
                  match ||
                  !!this.keepRendered) &&
                (Component ? (
                  <Component {...rest} match={match || this.keepRendered!} />
                ) : (
                  render!({...rest, match: match || this.keepRendered})
                ))}
            />
          )
        }}
      />
    )
  }
}
