const Seed = require('./seed')
const Filters = require('./filters')

class Main {
  constructor(opt) {
    return new Seed(opt)
  }
  static filter(name, fn) {
    Filters[name] = fn
  }
}
module.exports = Main
