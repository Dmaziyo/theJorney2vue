const Directive = require('./directive')
const { block } = require('./config')

class Seed {
  constructor(root, scope) {
    this.el = root
    // internal copy
    this._bindings = {}
    // external interface
    this.scope = {}
    this._compileNode(root)

    for (var variable in this._bindings) {
      this.scope[variable] = scope[variable]
    }
  }

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

  _compileNode(el) {
    if (el.nodeType === 3) return

    if (el.attributes && el.attributes.length) {
      // attrs should copy out
      const attrs = [].map.call(el.attributes, ({ name, value }) => ({
        name,
        value
      }))
      attrs.forEach(({ name, value }) => {
        const directive = Directive.parse(name, value)
        if (!directive) return
        // if (directive.variable === 'todos') debugger
        this._bind(el, directive)
        // 移除结点上的指令
        el.removeAttribute(name)
      })
    }
    // 给遍历模板元素标记因为不需要子元素，所以直接pass，然后删除
    if (el.getAttribute(block)) return console.log(el, 'block')
    el.childNodes.forEach(this._compileNode.bind(this))
  }

  // 指令绑定el,vue实例
  _bind(el, directive) {
    directive.el = el
    directive.seed = this
    const { variable } = directive

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
