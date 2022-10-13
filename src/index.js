const Seed = require('./seed')
const Filters = require('./filters')
const Controller = require('./controllers')
const config = require('./config')
/**
 * 将绑定each指令内部的元素用模板li生成seed实例，添加至绑定元素的父元素(即ul元素)
 */
class Main extends Seed {
  // 将自定义controller
  static controller(name, extensions) {
    Controller[name] = extensions
  }

  static filter(name, fn) {
    Filters[name] = fn
  }

  // 添加自定义指令
}

module.exports = Main
