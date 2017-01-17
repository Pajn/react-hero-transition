import {Hero} from './index'

export type Key = string|number

export const stylePath = ['props', 'style']
export const transformPath = stylePath.concat('transform')
export const visibilityPath = stylePath.concat('visibility')

export function get(object: any, path: Array<Key>) {
  for (let i = 0; i < path.length; i += 1) {
    if (!object) return object
    object = object[path[i]]
  }
  return object
}

export function visibility(renderedChildren, hero: Hero<any>) {
  return hero.state.hidden
    ? 'hidden'
    : get(renderedChildren, visibilityPath)
}
