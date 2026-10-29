# [3.2.0](https://github.com/lewisdonovan/google-news-scraper/compare/v3.1.0...v3.2.0) (2026-10-29)


### Features

* **mcp:** optional third-party API key via environment variables ([b4ac1b1](https://github.com/lewisdonovan/google-news-scraper/commit/b4ac1b1cf7de3d7250cdffcb3c65a07aca6e643a))
* tag each article with the provider that served it ([0925792](https://github.com/lewisdonovan/google-news-scraper/commit/09257929bc71c23801ee588ea10415903accb20b))

# [3.1.0](https://github.com/lewisdonovan/google-news-scraper/compare/v3.0.3...v3.1.0) (2026-10-29)


### Features

* add optional third-party provider, starting with SerpApi ([420d491](https://github.com/lewisdonovan/google-news-scraper/commit/420d4915bec6ae782fb35c6491f5dfa7796af78e))

## [3.0.3](https://github.com/lewisdonovan/google-news-scraper/compare/v3.0.2...v3.0.3) (2026-10-14)


### Bug Fixes

* drop unused build dependency and expose package.json ([3b19e87](https://github.com/lewisdonovan/google-news-scraper/commit/3b19e877f6f55eda98b08b093a1320ef61b6d983))

## [3.0.2](https://github.com/lewisdonovan/google-news-scraper/compare/v3.0.1...v3.0.2) (2026-10-14)


### Bug Fixes

* license under MIT ([4dac517](https://github.com/lewisdonovan/google-news-scraper/commit/4dac5176873cf3d3816892f652b5c873e1243800))

## [3.0.1](https://github.com/lewisdonovan/google-news-scraper/compare/v3.0.0...v3.0.1) (2026-10-14)


### Bug Fixes

* retry Google News requests that fail with 429 or 5xx ([e4492d4](https://github.com/lewisdonovan/google-news-scraper/commit/e4492d429613da74a11094d5559dc8a7ae3436c0)), closes [#73](https://github.com/lewisdonovan/google-news-scraper/issues/73)

# [3.0.0](https://github.com/lewisdonovan/google-news-scraper/compare/v2.7.1...v3.0.0) (2026-10-14)


* feat!: read Google News RSS feeds instead of scraping the page ([b890303](https://github.com/lewisdonovan/google-news-scraper/commit/b89030388d413628211ae8f7e2c55f02063c4bf5)), closes [#71](https://github.com/lewisdonovan/google-news-scraper/issues/71) [#63](https://github.com/lewisdonovan/google-news-scraper/issues/63) [#71](https://github.com/lewisdonovan/google-news-scraper/issues/71) [#63](https://github.com/lewisdonovan/google-news-scraper/issues/63)


### Bug Fixes

* close browser page in getArticleContent to prevent memory leak ([22293b9](https://github.com/lewisdonovan/google-news-scraper/commit/22293b9f7a78c3c5c78bdc6a83bd6d9b3b6add40))
* let TypeScript resolve types and default import from CommonJS ([cd6d00c](https://github.com/lewisdonovan/google-news-scraper/commit/cd6d00c884fde37757a1be048416549b31681297)), closes [#62](https://github.com/lewisdonovan/google-news-scraper/issues/62)
* nullish coalescing for readability 0.6.0 type safety ([8be7865](https://github.com/lewisdonovan/google-news-scraper/commit/8be78652274ad292e60433317bb8d10977e368e8))


### BREAKING CHANGES

* puppeteer must be installed separately to use
getArticleContent; image is always empty, articleType is always
"regular", time is a relative string, and Node 18+ is required.

# google-news-scraper CHANGELOG
All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-10-27

To update please run `npm update google-news-scraper`

### Changed
  
- Added support for both ESM and CJS. 
- Added TypeScript support. 
- Integrated Rollup to make shipping easier. 
- Added release action, to bump version and ship to NPM every time we push to `master` branch`. 

## [1.2.2] - 2024-03-18
  
To update please run `npm update google-news-scraper`

### Changed
  
- **index.js**
    - Merge changes from [#45](https://github.com/lewisdonovan/google-news-scraper/pull/45) (credit to [ole-ve](https://github.com/ole-ve/))
- **package.json**
    - Bump version
- **README.md**
    - Include details of new `puppeteerHeadlessMode` config item.

## [1.2.1] - 2024-03-11
  
To update please run `npm update google-news-scraper`
 
### Added

- **getArticleType.js** 
    - Helper function to detect which type of article display is being used in the DOM (this helps with conditional DOM selectors to scrape the info).
- **getTitle.js** 
    - Helper function to enable scraping of titles for each different article type.
- **CHANGELOG.md**

### Changed
  
- **index.js**
    - Merge changes from [#44](https://github.com/lewisdonovan/google-news-scraper/pull/44) (credit to [hahagu](https://github.com/hahagu/))
    - Import and integrate the new helper functions
    - Fix `searchTerm` prop naming
    - Minor refactoring
- **package.json**
    - Bump version
- **README.md**
    - Include details of new inputs and output

## [1.2.0] - 2024-02-19
  
To update please run `npm update google-news-scraper`
 
### Added

- **getArticleContent.js** 
    - Enabled the scraping of the text content of an article (credit to [anthonyfranc](https://github.com/lewisdonovan/google-news-scraper/issues/40))
- **getPrettyUrl.js** 
    - Updated fetch-less version of prettyURLs (credit to [anthonyfranc](https://github.com/lewisdonovan/google-news-scraper/issues/42))
- **CHANGELOG.md**

### Changed
  
- **index.js**
    - Import and integrate the new functions
    - Create config defaults
    - Fix indentation
- **package.json**
    - Bump major versions of Puppeteer, Babel and Jest
    - Remove node-fetch
- **README.md**
    - Include details of new config options
    - General tidy-up
