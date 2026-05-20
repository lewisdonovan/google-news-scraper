module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?)$',
    transformIgnorePatterns: [
      '/node_modules/(?!(cheerio|undici|@exodus|html-encoding-sniffer|jsdom|cssstyle|data-urls|w3c-xmlserializer|tr46|webidl-conversions|whatwg-mimetype|whatwg-url|ssri|lru-cache|symbol-tree|tree-sitter|nth-check|entities|parse5|@sinclair)/)',
    ],
    moduleFileExtensions: ['js', 'json', 'jsx'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^jsdom$': '<rootDir>/test/__mocks__/jsdom.js',
      '^@mozilla/readability$': '<rootDir>/test/__mocks__/readability.js',
    },
  };
