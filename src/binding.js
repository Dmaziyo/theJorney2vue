const Filters = require('./filters')
const Directives = require('./directives')
const { prefix, CONTROLLER } = require('./config')

class Directive {
  // 添加了参数配置选项
  constructor(name, value, options = {}) {
    // 获取指令name
    const key = name.substr(prefix.length + 1)
    /**
     * sd-on="click:changeMessage | delegate .button" => noArg 解析为changeMessage | delegate .button
     * sd-text="msg | capitalize" =>noArg解析为msg | capitalize
     * arg:click
     * noArg:changeMessage | delegate .button
     */
    let [, arg, noArg] = value.match(/(^\w+):(.+)/) || []
    noArg = noArg ? noArg : value
    const [variable, ...filters] = noArg.split('|').map(i => i.trim())
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
    //按照filter顺序,把tmpVal逐步filter加工
    this._filters.forEach(({ apply, args }) => {
      args.unshift(tmpVal)
      tmpVal = apply.apply(apply, args)
    })
    return tmpVal
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
    const { _filters } = this
    // debugger
    this._update(_filters ? this._applyFilters(newVal) : newVal)
  }
}

module.exports = {
  parse(name, value) {
    return new Directive(name, value)
  }
}
