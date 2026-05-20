class JSDOM {
  constructor(html) {
    this._html = html
  }
  get window() {
    return {
      document: {},
      getComputedStyle: () => ({}),
    }
  }
  serialize() { return this._html }
  reconfigure() {}
}

module.exports = { JSDOM }
