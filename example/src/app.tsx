import * as React from 'react'
import {Component} from 'react'
import {Hero, TransitionProvider} from 'react-hero-transition'
import {cssTransition} from 'react-hero-transition/lib/css-transition'
import {reactMotion} from 'react-hero-transition/lib/react-motion'
import {Motion, spring} from 'react-motion'

export const Row = (props: React.HTMLProps<HTMLDivElement>) => (
  <div style={{display: 'flex'}} {...props} />
)
export const Column = ({style, ...props}: any) => (
  <div
    style={{
      ...style,
      display: 'flex',
      flexDirection: 'column',
    }}
    {...props}
  />
)
export class Number extends Component<
  React.HTMLProps<HTMLDivElement> & {
    innerRef?: (element: HTMLDivElement | null) => void
  },
  {}
> {
  render() {
    const {style, innerRef, ...props} = this.props

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          width: 20,
          height: 20,
          backgroundColor: 'lightgrey',
          ...style,
        }}
        ref={innerRef}
        {...props}
      />
    )
  }
}
export const Box = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 200,
      height: 200,
    }}
    {...props}
  />
)

export const renderers = {
  css: cssTransition(),
  'react-motion': reactMotion(),
}

export type State = {
  position?: number
  positionSize?: number
  loadAnimation?: number
  multiple?: number
  renderer?: keyof typeof renderers
}

export class App extends Component<{}, State> {
  state = {
    renderer: 'css' as 'css',
    position: 0,
    positionSize: 0,
    loadAnimation: undefined,
    multiple: 0,
  }

  render() {
    const {
      loadAnimation,
      multiple,
      position,
      positionSize,
      renderer,
    } = this.state

    return (
      <TransitionProvider renderer={renderers[renderer]}>
        <Column>
          {renderer === 'css' ? (
            <button onClick={() => this.setState({renderer: 'react-motion'})}>
              Use react-motion
            </button>
          ) : (
            <button onClick={() => this.setState({renderer: 'css'})}>
              Use css transitions
            </button>
          )}
          <Row>
            <Column>
              <Box>
                {position === 0 && (
                  <Hero id="position">
                    <Number>0</Number>
                  </Hero>
                )}
              </Box>
              {position !== 0 && (
                <button onClick={() => this.setState({position: 0})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {position === 1 && (
                  <Hero id="position">
                    <Number>1</Number>
                  </Hero>
                )}
              </Box>
              {position !== 1 && (
                <button onClick={() => this.setState({position: 1})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {position === 2 && (
                  <Hero id="position">
                    <Number>2</Number>
                  </Hero>
                )}
              </Box>
              {position !== 2 && (
                <button onClick={() => this.setState({position: 2})}>
                  Move here
                </button>
              )}
            </Column>
          </Row>
          <Row>
            <Column>
              <Box>
                {positionSize === 0 && (
                  <Hero id="position-size">
                    <Number style={{width: 20, height: 20}}>0</Number>
                  </Hero>
                )}
              </Box>
              {positionSize !== 0 && (
                <button onClick={() => this.setState({positionSize: 0})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {positionSize === 1 && (
                  <Hero id="position-size">
                    <Number style={{width: 20, height: 50}}>1</Number>
                  </Hero>
                )}
              </Box>
              {positionSize !== 1 && (
                <button onClick={() => this.setState({positionSize: 1})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {positionSize === 2 && (
                  <Hero id="position-size">
                    <Number style={{width: 70, height: 70}}>2</Number>
                  </Hero>
                )}
              </Box>
              {positionSize !== 2 && (
                <button onClick={() => this.setState({positionSize: 2})}>
                  Move here
                </button>
              )}
            </Column>
          </Row>
          <Row>
            <Column>
              <Box>
                {loadAnimation === 0 && (
                  <Hero
                    id="loadAnimation"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>0</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                0
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              {loadAnimation !== 0 && (
                <button onClick={() => this.setState({loadAnimation: 0})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {loadAnimation === 1 && (
                  <Hero
                    id="loadAnimation"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>1</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                1
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              {loadAnimation !== 1 && (
                <button onClick={() => this.setState({loadAnimation: 1})}>
                  Move here
                </button>
              )}
            </Column>
            <Column>
              <Box>
                {loadAnimation === 2 && (
                  <Hero
                    id="loadAnimation"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>2</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                2
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              {loadAnimation !== 2 && (
                <button onClick={() => this.setState({loadAnimation: 2})}>
                  Move here
                </button>
              )}
            </Column>
          </Row>
          <Row>
            <Column>
              <Box>
                {(multiple & 1) !== 0 && (
                  <Hero
                    id="multiple"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>0</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                0
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              <button onClick={() => this.setState({multiple: multiple ^ 1})}>
                {multiple & 1 ? 'Hide' : 'Show'}
              </button>
            </Column>
            <Column>
              <Box>
                {(multiple & 2) !== 0 && (
                  <Hero
                    id="multiple"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>1</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                1
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              <button onClick={() => this.setState({multiple: multiple ^ 2})}>
                {multiple & 2 ? 'Hide' : 'Show'}
              </button>
            </Column>
            <Column>
              <Box>
                {(multiple & 4) !== 0 && (
                  <Hero
                    id="multiple"
                    render={({heroIn, ref}) => (
                      <Number innerRef={ref}>
                        {heroIn ? (
                          <span>2</span>
                        ) : (
                          <Motion
                            defaultStyle={{angle: 720}}
                            style={{angle: spring(0)}}
                          >
                            {({angle}) => (
                              <span style={{transform: `rotate(${angle}deg)`}}>
                                2
                              </span>
                            )}
                          </Motion>
                        )}
                      </Number>
                    )}
                  />
                )}
              </Box>
              <button onClick={() => this.setState({multiple: multiple ^ 4})}>
                {multiple & 4 ? 'Hide' : 'Show'}
              </button>
            </Column>
          </Row>
        </Column>
      </TransitionProvider>
    )
  }
}
