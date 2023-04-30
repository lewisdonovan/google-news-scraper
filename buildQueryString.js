'use strict'

export default (query) => {

  // Sanity check
  if (
    !query || 
    typeof query !== 'object' || 
    Object.keys(query).length === 0
  ) {
    return ''
  }

  // Build and return query string
  return Object.keys(query).map(key => `${key}=${query[key]}`).join('&')

}