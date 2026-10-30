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

class VirtualConsole {
  on() { return this }
}

module.exports = { JSDOM, VirtualConsole }
