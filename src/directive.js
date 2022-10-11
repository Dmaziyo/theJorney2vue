const Filters = require('./filters')
const Directives = require('./directives')
const { prefix, CONTROLLER } = require('./config')

class Directive {
  // 添加了参数配置选项
  constructor(name, value, options = {}) {
    const noPrefix = name.substr(prefix.length + 1)
    const [key, arg] = noPrefix.split('-')
    // 获取多个filter
    const [variable, ...filters] = value.split('|').map(i => i.trim())

    // for directives on method
    this.arg = arg
    // for seed
    this.variable = variable
    // 调用方法将filters全部解析并添加到directive中去
    this._parseFilters(filters)

    this._buildUpdate(key)
  }

  // 把当前指令的filter以及参数添加至_filters中
  _parseFilters(filters) {
    if (filters.length) {
      this._filters = []
      filters.forEach(filter => {
        const [name, ...args] = filter.split(/\s+/)
        const apply = Filters[name]
        if (!apply) throw new Error('invalid filter' + name)
        this._filters.push({ apply, args })
      })
    }
  }

  _applyFilters(value) {
    let tmpVal = value
    this._filters.forEach(({ apply, args }) => {
      args.unshift(tmpVal)
    })
  }

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
    // 不解析controller
    if (name.indexOf(prefix + '-') == -1) return

    return new Directive(name, value)
  }
}
