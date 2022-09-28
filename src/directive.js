const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

class Directive {
  constructor(name, value) {
    const noPrefix = name.substr(prefix.length + 1)
    const [key, arg] = noPrefix.split('-')
    // 获取多个filter
    const [variable, filter] = value.split('|').map(i => i.trim())

    // for directives on method
    this.arg = arg
    // for seed
    this.variable = variable
    // 调用方法将filters全部解析并添加到directive中去
    this._buildUpdate(key)

    this._filter = Filters[filter]
  }

  /**
   添加解析绑定Filters的方法
   */

  /**
   传入newVal调用之前绑定的filters方法,并返回新的值
   */

  _buildUpdate(key) {
    const def = Directives[key]
    // 指令函数与_update绑定在一起
    if (typeof def == 'function') return (this._update = def)

    // on的属性函数也绑定在一起，尤其是_update也存在
    for (let prop in def) {
      this[prop == 'update' ? '_update' : prop] = def[prop]
    }
  }

  update(newVal) {
    const { _filter } = this
    // 修改filter
    this._update(_filter ? _filter(newVal) : newVal)
  }
}

module.exports = {
  parse(name, value) {
    if (name.indexOf(prefix + '-') == -1) return

    return new Directive(name, value)
  }
}
