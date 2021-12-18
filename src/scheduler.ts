import * as yaml from 'js-yaml'
import * as yamlFront from 'yaml-front-matter'

interface ZennArticle {
  readonly published?: boolean
  readonly published_at?: string
  readonly __content: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [key: string]: any
}

export const load = (data: string): ZennArticle => {
  return yamlFront.safeLoadFront(data)
}

export const dump = (article: ZennArticle): string => {
  const {__content, ...meta} = article
  return `---\n${yaml.dump(meta)}---${__content}`
}

const toJST = (date: Date): Date => {
  const offset = date.getTimezoneOffset() + 540 // 540m = 9h (offset for JST)
  date.setMinutes(date.getUTCMinutes() + offset)
  return date
}

export const afterScheduledDate = (
  {published_at}: ZennArticle,
  now?: Date
): boolean => {
  if (!published_at) {
    return false
  }

  return toJST(new Date(published_at)) < toJST(now ? now : new Date())
}

export const publish = (article: ZennArticle): ZennArticle => {
  return {
    ...article,
    published: true
  }
}
