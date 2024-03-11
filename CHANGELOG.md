
# google-news-scraper CHANGELOG
All notable changes to this project will be documented in this file.

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