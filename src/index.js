const Seed = require('./seed')
const Filters = require('./filters')

class Main {
  constructor(id, scope) {
    const root = document.getElementById(id)
    return new Seed(root, scope)
  }
  static filter(name, fn) {
    Filters[name] = fn
  }
}
module.exports = Main
