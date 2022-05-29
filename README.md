# Zenn Post Scheduler

**Zenn Post Scheduler** posts an article to Zenn at the scheduled date.
It publishes an article when it is executed after the scheduled date (JST) of the article.

## How To Work

The action updates `published` parameter to `true` in YAML front matter of an article after the scheduled date of the article.

1. Read all articles
2. Get the meta data of the scheduled date of an article
3. Update the `published` to `true` if the date is after the execution date (JST)

### Example

The action updates the file when it is executed after `2021/12/31 09:00:00 JST`.

**Before updating**

```markdown
---
title: test title
emoji: 🦉
type: tech
topics:
  - github
published: false
published_at: 2021/12/31 09:00:00 # It defines the publication date
---

sample text
```

**After updating**

```markdown
---
title: test title
emoji: 🦉
type: tech
topics:
  - github
published: true # Updated
published_at: 2021/12/31 09:00:00
---

sample text
```

## Usage

```yaml
name: publish

on:
  schedule:
    - cron: '0 * * * *'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # Publish articles
      - uses: x-color/zenn-post-scheduler@v1.0.0
      # Commit and Push published articles to main branch
      - run: |
          git config --local user.email '<YOUR EMAIL>'
          git config --local user.name '<YOUR USERNAME>'
          git add -u articles
          git diff --cached --quiet || git commit -m 'Publish articles' && git push origin main
```

### Inputs

| Name       | Description                                                        | Required | Default        |
| ---------- | ------------------------------------------------------------------ | -------- | -------------- |
| path       | A path of directory for article files                              | No       | `articles`     |
| target_key | A key of the publication date of an article                        | No       | `published_at` |
| user       | Your Zenn account name. It's required if you want `published_url`. | No       | -              |

### Outputs

| Name          | Description                                                                    | Example                                                                                   |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| published     | A list of published article files path                                         | `['articles/sample1.md','articles/sample2.md']`                                           |
| published_url | A list of published articles url. It is empty list if `user` input is not set. | `['https://zenn.dev/<user>/articles/sample1','https://zenn.dev/<user>/articles/sample2']` |
