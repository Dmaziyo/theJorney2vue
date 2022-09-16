const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

class Seed {
  constructor({ id, scope }) {
    const root = document.getElementById(id)
    // 每个directive上的变量
    this._bindings = {}
    this.scope = {}
    Object.keys(Directives).forEach(directiveKey => this._bind(directiveKey))
    for (let variable in this._bindings) {
      // 把传入的scope值拿过来
      this.scope[variable] = scope[variable]
    }
  }
  _bind(directiveKey) {
    const attributeKey = `${prefix}-${directiveKey}`
    const els = document.querySelectorAll(`[${attributeKey}]`)

    // 把该指令上的变量进行详细描述，绑定到binding上
    ;[].forEach.call(els, (el, idx) => {
      const value = el.getAttribute(`${attributeKey}`)
      el.removeAttribute(attributeKey)
      const [variable, filter] = value.split('|').map(item => item.trim())
      //   设置双向绑定
      if (!this._bindings[variable]) this._createBinding(variable)

      this._bindings[variable].directives.push({
        directive: Directives[directiveKey],
        key: directiveKey,
        filter: filter && Filters[filter],
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
      // 使用箭头函数
      get: () => {
        return this._bindings[variable].value
      },
      set: newVal => {
        this._bindings[variable].value = newVal
        this._bindings[variable].directives.forEach(directiveObj => {
          const { directive, key, filter, el } = directiveObj
          if (typeof directive === 'function') {
            return directive(el, filter ? filter(newVal) : newVal)
          }
          const event = key.split('-')[1]
          directive.update(el, this.scope[variable], event, directiveObj)
        })
      }
    })
  }
}
module.exports = Seed
