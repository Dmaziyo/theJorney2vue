const Seed = require('./seed')
const Filters = require('./filters')
module.exports = {
  create(opt) {
    return new Seed(opt)
  },

  filter(name, fn) {
    Filters[name] = fn
  }
}
