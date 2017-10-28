import {ReactElement} from 'react'
import {Hero} from './Hero'

export type Key = string | number

export const stylePath = ['props', 'style']
export const transformPath = stylePath.concat('transform')
export const visibilityPath = stylePath.concat('visibility')

export function get(object: any, path: Array<Key>) {
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < path.length; i += 1) {
    if (!object) return object
    object = object[path[i]]
  }
  return object
}

export function visibility(
  renderedChildren: ReactElement<any>,
  hero: Hero<any>,
) {
  return hero.state.hidden ? 'hidden' : get(renderedChildren, visibilityPath)
}

export function inList(
  value: string | undefined,
  arrayOrString: string | Array<string>,
) {
  if (!arrayOrString) return false
  if (arrayOrString === value) return true
  if (Array.isArray(arrayOrString) && arrayOrString.some(e => e === value))
    return true
  return false
}
