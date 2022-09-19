const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

// 指令实例
/**
 * name        指令名称
 * variable    绑定的变量名称
 * el          绑定的元素
 * update      数据更新时指令对应的回调操作
 */
class Directive {
  constructor(name, value) {
    const noPrefix = name.substr(prefix.length + 1)
    const [key, ...arg] = noPrefix.split('-')
    const [variable, filter] = value.split('|').map(i => i.trim())

    // on指令的参数
    this.arg = arg
    this.variable = variable

    // 将对应指令进行回调更新绑定
    this._buildUpdate(key)

    this._filter = Filters[filter]
  }

  _buildUpdate(key) {
    const def = Directives[key]
    if (typeof def === 'function') return (this._update = def)

    for (let prop in def) {
      this[prop == 'update' ? '_update' : prop] = def[prop]
    }
  }

  update(newVal) {
    const { _filter } = this
    this._update(_filter ? _filter(newVal) : newVal)
  }
}

module.exports = {
  parse(name, value) {
    if (name.indexOf(prefix + '-') === -1) return

    return new Directive(name, value)
  }
}
