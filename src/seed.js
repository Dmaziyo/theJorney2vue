const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

class Seed {
  constructor({ id, scope }) {
    const root = document.getElementById(id)
    // opt.scope
    // internal copy
    this._bindings = {}
    // external interface
    this.scope = {}

    Object.keys(Directives).forEach(directiveKey => this._bind(directiveKey))

    for (var variable in this._bindings) {
      this.scope[variable] = scope[variable]
    }
  }

  _getAttributeKey(key) {
    return `${prefix}-${key}`
  }

  _bind(directiveKey) {
    // 获取带有这个指令的所有节点
    const attributeKey = `${prefix}-${directiveKey}`
    const els = document.querySelectorAll(`[${attributeKey}]`)

    // 把directive装到binding上
    ;[].forEach.call(els, (el, idx) => {
      const value = el.getAttribute(`${attributeKey}`)
      el.removeAttribute(attributeKey)

      const [variable, filter] = value.split('|').map(i => i.trim())

      //
      if (!this._bindings[variable]) this._createBinding(variable)

      this._bindings[variable].directives.push({
        filter: filter && Filters[filter],
        // directive直接变成了函数
        directive: Directives[directiveKey],
        // 添加了key键
        key: directiveKey,
        el
      })
    })
  }

  _createBinding(variable) {
    this._bindings[variable] = {
      directives: [],
      value: null
    }
    Object.defineProperty(this.scope, variable, {
      get: () => this._bindings[variable].value,
      set: newVal => {
        this._bindings[variable].value = newVal
        this._bindings[variable].directives.forEach(directiveObj => {
          debugger
          const { directive, key, filter, el } = directiveObj
          if (typeof directive == 'function')
            return directive(el, filter ? filter(newVal) : newVal)

          const event = key.split('-')[1]
          directive.update(el, this.scope[variable], event, directiveObj)
        })
      }
    })
  }
}

module.exports = Seed
