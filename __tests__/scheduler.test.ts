import {afterScheduledDate, dump, load, publish} from '../src/scheduler'

describe('Load content', () => {
  test('valid content', () => {
    const article = load(
      `---
title: test title
emoji: 🦉
type: tech
topics:
- aws
- cloudformation
published: false
published_at: 2021/12/31 09:00:00
---
sample text`,
      'published_at'
    )
    expect(article).toEqual({
      title: 'test title',
      emoji: '🦉',
      type: 'tech',
      topics: ['aws', 'cloudformation'],
      published: false,
      published_at: '2021/12/31 09:00:00',
      __published_at: '2021/12/31 09:00:00',
      __content: '\nsample text'
    })
  })

  test('empty data', () => {
    const article = load(``, 'published_at')
    expect(article).toEqual({
      __content: ''
    })
  })

  test('no yaml front matter', () => {
    const article = load(
      `---
title: test title
sample text`,
      'published_at'
    )
    expect(article).toEqual({
      __content: '---\ntitle: test title\nsample text'
    })
  })
})

test('Dump an article', () => {
  const data = dump({
    title: 'test title',
    emoji: '🦉',
    type: 'tech',
    topics: ['aws', 'cloudformation'],
    published: false,
    published_at: '2021/12/31 09:00:00',
    __published_at: '2021/12/31 09:00:00',
    __content: '\nsample text'
  })

  expect(data).toEqual(`---
title: test title
emoji: 🦉
type: tech
topics:
  - aws
  - cloudformation
published: false
published_at: 2021/12/31 09:00:00
---
sample text`)
})

describe('Check whether an article must be published', () => {
  test('after the publication date', () => {
    const result = afterScheduledDate(
      {
        title: 'test title',
        emoji: '🦉',
        type: 'tech',
        topics: ['aws', 'cloudformation'],
        published: false,
        published_at: '2021/12/30 09:00:00',
        __published_at: '2021/12/30 09:00:00',
        __content: '\nsample text'
      },
      new Date(Date.UTC(2021, 11, 30, 1)) // 2021/12/30 10:00:00 JST
    )
    expect(result).toBeTruthy()
  })

  test('before the publication date', () => {
    const result = afterScheduledDate(
      {
        title: 'test title',
        emoji: '🦉',
        type: 'tech',
        topics: ['aws', 'cloudformation'],
        published: false,
        published_at: '2022/1/1 09:00:00',
        __published_at: '2021/12/31 09:00:00',
        __content: '\nsample text'
      },
      new Date(Date.UTC(2021, 11, 31, 0)) // 2021/12/31 09:00:00 JST
    )
    expect(result).toBeFalsy()
  })

  test('no publication date parameter', () => {
    const result = afterScheduledDate(
      {
        title: 'test title',
        emoji: '🦉',
        type: 'tech',
        topics: ['aws', 'cloudformation'],
        published: false,
        __content: '\nsample text'
      },
      new Date(Date.UTC(2021, 11, 31, 0)) // 2021/12/31 09:00:00 JST
    )
    expect(result).toBeFalsy()
  })

  test('publication date parameter is null', () => {
    const result = afterScheduledDate(
      {
        title: 'test title',
        emoji: '🦉',
        type: 'tech',
        topics: ['aws', 'cloudformation'],
        published: false,
        published_at: '',
        __content: '\nsample text'
      },
      new Date(Date.UTC(2021, 11, 31, 0)) // 2021/12/31 09:00:00 JST
    )
    expect(result).toBeFalsy()
  })

  test('invalid publication date parameter', () => {
    const result = afterScheduledDate(
      {
        title: 'test title',
        emoji: '🦉',
        type: 'tech',
        topics: ['aws', 'cloudformation'],
        published: false,
        published_at: 'XXX',
        __published_at: 'XXX',
        __content: '\nsample text'
      },
      new Date(Date.UTC(2021, 11, 31, 0)) // 2021/12/31 09:00:00 JST
    )
    expect(result).toBeFalsy()
  })
})

test('Publish an article', () => {
  const article = publish({
    title: 'test title',
    emoji: '🦉',
    type: 'tech',
    topics: ['aws', 'cloudformation'],
    published: false,
    published_at: '2021/1/1 09:00:00',
    __published_at: '2021/1/1 09:00:00',
    __content: '\nsample text'
  })

  expect(article.published).toBeTruthy()
})
