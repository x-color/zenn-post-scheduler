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

const run = async (): Promise<void> => {
  try {
    const basePath: string = core.getInput('path')
    const targetKey: string = core.getInput('target_key')

    const files = await fs.readdir(basePath)
    const result = await Promise.all(
      files.map(async file => {
        return await publishArticle(join(basePath, file), targetKey)
      })
    )
    const published = result.filter(v => v)

    core.setOutput('published', published.join(','))
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
