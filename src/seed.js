const Binding = require('./binding')
const { CONTROLLER, BLOCK } = require('./config')
const Controllers = require('./controllers')

class Seed {
  constructor(root, scope, options) {
    // 为子seed添加options
    if (typeof root == 'string') root = document.getElementById(root)
    this.el = root
    this.controllerName = this.el.getAttribute(CONTROLLER)
    // internal copy
    this._bindings = {}
    // external interface
    this.scope = {}
    this._options = options || {}
    this._compileNode(root)

    for (var variable in scope) {
      this.scope[variable] = scope[variable]
    }
    this._extension()
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

  _compileNode(el) {
    if (el.nodeType === Node.TEXT_NODE) return

    if (el.attributes && el.attributes.length) {
      // attrs should copy out
      const attrs = [].map.call(el.attributes, ({ name, value }) => ({
        name,
        value
      }))
      attrs.forEach(({ name, value }) => {
        const directive = Binding.parse(name, value)
        if (!directive) return
        // if (directive.variable === 'todos') debugger
        this._bind(el, directive)
        // 移除结点上的指令
        el.removeAttribute(name)
      })
    }
    // 给遍历模板元素标记因为不需要子元素，所以直接pass，然后删除
    if (el[BLOCK]) return console.log(el, 'BLOCK')
    el.childNodes.forEach(this._compileNode.bind(this))
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
