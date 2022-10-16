const Binding = require('./binding')
const { CONTROLLER, EACH } = require('./config')
const Controllers = require('./controllers')

class Seed {
  constructor({ el, data, options }) {
    // 利用query选择器
    if (typeof el == 'string') el = document.querySelector(el)
    this.el = el
    this.controllerName = this.el.getAttribute(CONTROLLER)
    // internal copy
    this._bindings = {}
    // external interface
    this.scope = {}
    this._options = options || {}
    this._compileNode(this.el)

    for (var variable in data) {
      this.scope[variable] = data[variable]
    }
    this._extension()
  }

  // 先判断有无each指令,然后给添加binding,然后跳过执行其余指令，用于clone
  _compileNode(el) {
    if (el.nodeType === Node.TEXT_NODE) return

    if (el.attributes && el.attributes.length) {
      const build = (name, value) => {
        const directive = Binding.parse(name, value)
        if (!directive) return
        this._bind(el, directive)
        // 移除结点上的指令
        el.removeAttribute(name)
      }
      const ctrol = el.getAttribute(CONTROLLER)
      const isEach = el.getAttribute(EACH)
      console.log('Controller Name', this.controllerName, isEach)
      if (ctrol != this.controllerName && isEach) {
        debugger
        return build(EACH, isEach)
      }
      // attrs should copy out
      const attrs = [].map.call(el.attributes, ({ name, value }) => ({
        name,
        value
      }))
      attrs.forEach(({ name, value }) => build(name, value))
    }
    el.childNodes.forEach(this._compileNode.bind(this))
  }

  // 添加将属性的
  destroy() {
    // clean scene: call directives unbind
    for (let bindKey in this._bindings) {
      this._bindings[bindKey].directives.forEach(directive => {
        if (!directive.unbind) return
        directive.unbind()
      })

      delete this._bindings[bindKey]
    }

    // rm dom
    this.el.parentNode.removeChild(this.el)
  }

  _extension() {
    const controller = Controllers[this.controllerName]
    controller.call(null, this.scope, this)
  }

  // 指令绑定el,vue实例
  _bind(el, directive) {
    directive.el = el
    directive.seed = this
    const epr = this._options.eachPrefixRE
    let { variable } = directive
    variable = epr ? variable.replace(epr, '') : variable

    if (!this._bindings[variable]) this._createBinding(variable)
    this._bindings[variable].directives.push(directive)

    // 用于todos的绑定
    // 将元素从ul中删除，但记录在directive里面,同时建立联系
    if (directive.bind) directive.bind.call(directive)
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
        this._bindings[variable].directives.forEach(directive => {
          directive.update(newVal)
        })
      }
    })
  }
}

module.exports = Seed
