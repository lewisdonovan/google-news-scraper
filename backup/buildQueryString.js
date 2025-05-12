'use strict'

const buildQueryString = (query) => {
  // Sanity check
  if (
    !query ||
    typeof query !== 'object' ||
    Object.keys(query).length === 0
  ) {
    return ''
  }
  // Build query string
  // Example: { q: 'puppies', hl: 'en', gl: 'US' } => '?q=puppies&hl=en&gl=US'
  const queryString = Object.keys(query).reduce((acc, key, index) => {
    const prefix = index === 0 ? '?' : '&'
    return `${acc}${prefix}${key}=${query[key]}`
  }, '')

  return queryString
}

module.exports = {
  default: buildQueryString
}