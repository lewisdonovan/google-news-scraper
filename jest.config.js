module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?)$',
    transformIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['js', 'json', 'jsx'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };
  