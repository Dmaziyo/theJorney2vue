const Seed = require('./seed')
const Filters = require('./filters')
/**
 * 将绑定each指令内部的元素用模板li生成seed实例，添加至绑定元素的父元素(即ul元素)
 */
class Main {
  // 添加str判断
  constructor(root, scope) {
    if (typeof root == 'string') root = document.getElementById(root)

    return new Seed(root, scope)
  }

  static filter(name, fn) {
    Filters[name] = fn
  }

  // 添加自定义指令
}

module.exports = Main
