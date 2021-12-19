import * as yaml from 'js-yaml'
import * as yamlFront from 'yaml-front-matter'

interface ZennArticle {
  readonly published?: boolean
  readonly __published_at?: string
  readonly __content: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [key: string]: any
}

export const load = (data: string, targetKey: string): ZennArticle => {
  const meta = yamlFront.safeLoadFront(data)
  return {...meta, __published_at: meta[targetKey]}
}

export const dump = (article: ZennArticle): string => {
  const {__content, ...meta} = article
  delete meta.__published_at
  return `---\n${yaml.dump(meta)}---${__content}`
}

const adjustTZ = (date: Date): Date => {
  const offset = -date.getTimezoneOffset() - 540 // 540m = 9h (offset for JST)
  date.setMinutes(date.getUTCMinutes() + offset)
  return date
}

export const afterScheduledDate = (
  {__published_at}: ZennArticle,
  now?: Date
): boolean => {
  if (!__published_at) {
    return false
  }

  return adjustTZ(new Date(__published_at)) < (now ? now : new Date())
}

export const publish = (article: ZennArticle): ZennArticle => {
  return {
    ...article,
    published: true
  }
}
