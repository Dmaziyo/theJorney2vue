const Seed = require('./seed')
const Filters = require('./filters')
const Controllers = require('./controllers')
const config = require('./config')
const Directives = require('./directives')
/**
 * 将绑定each指令内部的元素用模板li生成seed实例，添加至绑定元素的父元素(即ul元素)
 */
class Main extends Seed {
  // 将自定义controller
  static controller(name, extensions) {
    Controllers[name] = extensions
  }

  static filter(name, fn) {
    Filters[name] = fn
  }

  static directive(name, fn) {
    Directives[name] = fn
  }
  static plant() {
    return this.controller.apply(this, arguments)
  }
  static sprout(opt) {
    return new Seed(opt)
  }
}

module.exports = Main
