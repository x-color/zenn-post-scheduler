import * as core from '@actions/core'
import {afterScheduledDate, dump, load, publish} from './scheduler'
import {promises as fs} from 'fs'
import {join} from 'path'

const publishArticle = async (
  filepath: string,
  targetKey: string
): Promise<string | null> => {
  try {
    const data = await fs.readFile(filepath)
    const article = load(data.toString(), targetKey)

    core.debug(`Read Article:\n${data.toString()}`)
    core.debug(`Convert to:`)
    for (const key of Object.keys(article)) {
      core.debug(`${key}: ${article[key]}`)
    }

    if (article.published) {
      core.info(`${filepath} has already published`)
      return null
    }
    if (!afterScheduledDate(article)) {
      core.info(`${filepath} is not published`)
      return null
    }

    const published = publish(article)
    await fs.writeFile(filepath, dump(published))
    core.info(`${filepath} is published`)
    return filepath
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Failed to publish ${filepath}: ${error.message}`)
    }
    return null
  }
}

const publishedURL = (file: string, user: string): string => {
  if (user === '') {
    return ''
  }

  const path = file.split('/').slice(-1)[0].slice(0, -3)

  return `https://zenn.dev/${user}/articles/${path}`
}

const run = async (): Promise<void> => {
  try {
    const basePath: string = core.getInput('path')
    const targetKey: string = core.getInput('target_key')
    const user: string = core.getInput('user')

    const files = await fs.readdir(basePath)
    const result = await Promise.all(
      files.map(async file => {
        return await publishArticle(join(basePath, file), targetKey)
      })
    )

    const published = result.filter(
      (v): v is NonNullable<typeof v> => v !== null
    )
    core.setOutput('published', published)

    const publishedURLs = published
      .map(path => publishedURL(path, user))
      .filter(v => v !== '')
    core.setOutput('published_url', publishedURLs)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
