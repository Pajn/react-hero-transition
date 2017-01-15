# react-hero-transition

A library to help create beutiful hero transitions for view changes. It tracks
mounting and unmounting of components and is therfore not dependant on react-router
or any other way of managing different views.
It is based on the principle of [FLIP](https://aerotwist.com/blog/flip-your-animations/) animations and uses `getBoundingClientRect` 
to calculate the position and size of the old and the new element, the new element
is then animated using transforms from the position of the old element. Transitions
are however applied using [react-motion](https://github.com/chenglou/react-motion) instead of CSS transitions for a more
realistic physics feeling.

## Usage
First wrap your app with `<TransitionProvider>` similarly to the provider of [react-redux](https://github.com/reactjs/react-redux).
Then wrap your "heroes" with the `<Hero>` component.

A basic example:

```jsx
<TransitionProvider>
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
  </Row>
</TransitionProvider>
```

## API
### TransitionProvider
#### Props
##### timeout
  - Type: `number`
  - required: no
  - default value: 100

How much time in ms it may pass between an element beeing removed and added for a hero transition to
be run.

### Hero
#### Props
##### id
  - Type: `string`
  - required: yes
  
A hero will transition to another hero with the same id.
It should be unique per page but be repeated on the pages it should transition between.

##### children
  - Type: `ReactElement`
  - required: no
  
A hero must either have a render prop or be provided with a single child. The child will be provided
a ref and a style prop and must therfore be either a browser element or a class component, not a 
function component as those can't have refs.

##### render
  - Type: `({heroIn: boolean}) => ReactElement`
  - required: no
  
If a render function is provided, it will be called with a single argument containing an object
with a `heroIn` property. `heroIn` will be true if the hero will perform an hero transition and false
otherwise. This can be used to for example show a fade in animation instead. The function should return
a single rendered ReactElement that corresponds to the same rules as for the children prop.
