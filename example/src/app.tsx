import * as React from 'react'
import {Component} from 'react'
import {Hero, TransitionProvider} from 'react-hero-transition'
import {Motion, spring} from 'react-motion'

export const Row = props => <div style={{display: 'flex'}} {...props} />
export const Column = ({style, ...props}: any) => <div style={{
  ...style,
  display: 'flex',
  flexDirection: 'column',
  width: 200,
}} {...props} />
export class Number extends Component<any, {}> {
  render() {
    const {style, ...props} = this.props

    return <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      width: 20,
      height: 20,
      backgroundColor: 'lightgrey',
      ...style,
    }} {...props} />
  }
}
export const Box = props =>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  }} {...props} />

export class App extends Component<{}, {loadAnimation?: number, position?: number, positionSize?: number}> {
  state = {loadAnimation: undefined, position: 0, positionSize: 0}

  render() {
    const {loadAnimation, position, positionSize} = this.state

    return (
      <TransitionProvider>
        <Column style={{width: 'auto'}}>
          <Row>
            <Column>
              <Box>
                {position === 0 && <Hero id='position'><Number>0</Number></Hero>}
              </Box>
              {position !== 0 && <button onClick={() => this.setState({position: 0})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {position === 1 && <Hero id='position'><Number>1</Number></Hero>}
              </Box>
              {position !== 1 && <button onClick={() => this.setState({position: 1})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {position === 2 && <Hero id='position'><Number>2</Number></Hero>}
              </Box>
              {position !== 2 && <button onClick={() => this.setState({position: 2})}>Move here</button>}
            </Column>
          </Row>
          <Row>
            <Column>
              <Box>
                {positionSize === 0 && <Hero id='position-size'><Number style={{width: 20, height: 20}}>0</Number></Hero>}
              </Box>
              {positionSize !== 0 && <button onClick={() => this.setState({positionSize: 0})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {positionSize === 1 && <Hero id='position-size'><Number style={{width: 20, height: 50}}>1</Number></Hero>}
              </Box>
              {positionSize !== 1 && <button onClick={() => this.setState({positionSize: 1})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {positionSize === 2 && <Hero id='position-size'><Number style={{width: 70, height: 70}}>2</Number></Hero>}
              </Box>
              {positionSize !== 2 && <button onClick={() => this.setState({positionSize: 2})}>Move here</button>}
            </Column>
          </Row>
          <Row>
            <Column>
              <Box>
                {loadAnimation === 0 &&
                  <Hero id='loadAnimation' render={({heroIn}) =>
                    <Number>
                      {heroIn
                        ? <span>0</span>
                        : <Motion defaultStyle={{angle: 720}} style={{angle: spring(0)}}>
                            {({angle}) => <span style={{transform: `rotate(${angle}deg)`}}>0</span>}
                          </Motion>
                      }
                    </Number>
                  } />}
              </Box>
              {loadAnimation !== 0 && <button onClick={() => this.setState({loadAnimation: 0})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {loadAnimation === 1 &&
                  <Hero id='loadAnimation' render={({heroIn}) =>
                    <Number>
                      {heroIn
                        ? <span>1</span>
                        : <Motion defaultStyle={{angle: 720}} style={{angle: spring(0)}}>
                            {({angle}) => <span style={{transform: `rotate(${angle}deg)`}}>1</span>}
                          </Motion>
                      }
                    </Number>
                  } />}
              </Box>
              {loadAnimation !== 1 && <button onClick={() => this.setState({loadAnimation: 1})}>Move here</button>}
            </Column>
            <Column>
              <Box>
                {loadAnimation === 2 &&
                  <Hero id='loadAnimation' render={({heroIn}) =>
                    <Number>
                      {heroIn
                        ? <span>2</span>
                        : <Motion defaultStyle={{angle: 720}} style={{angle: spring(0)}}>
                            {({angle}) => <span style={{transform: `rotate(${angle}deg)`}}>2</span>}
                          </Motion>
                      }
                    </Number>
                  } />}
              </Box>
              {loadAnimation !== 2 && <button onClick={() => this.setState({loadAnimation: 2})}>Move here</button>}
            </Column>
          </Row>
        </Column>
      </TransitionProvider>
    )
  }
}
