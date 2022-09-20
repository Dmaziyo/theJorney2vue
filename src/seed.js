const directive = require('./directive')
const Directive = require('./directive')

class Seed {
  constructor(root, scope) {
    this.el = root
    // 每个directive上的变量
    this._bindings = {}
    this.scope = {}

    // 递归初始化Node
    this._compileNode(root)

    for (let variable in this._bindings) {
      // 把传入的scope值拿过来
      this.scope[variable] = scope[variable]
    }
  }

  destroy() {
    for (let bindKey in this._bindings) {
      this._bindings[bindKey].directives.forEach(directive => {
        // 解绑事件
        if (!directive.unbind) return
        directive.unbind()
      })
      delete this._bindings[bindKey]
    }
    this.el.parentNode.removeChild(this.el)
  }

  _compileNode(el) {
    if (el.nodeType === Node.TEXT_NODE) {
    }
    if (!(el.attributes && el.attributes.length)) return
    const attrs = [].map.call(el.attributes, ({ name, value }) => ({ name, value }))
    attrs.forEach(({ name, value }) => {
      //查询el上相关的指令，并获取相关config
      const directive = Directive.parse(name, value)
      if (!directive) return
      el.removeAttribute(name)
      this._bind(el, directive)
    })
    // 绑定this,使得内部方法也能调用bindings和scope
    el.childNodes.forEach(this._compileNode.bind(this))
  }

  _bind(el, directive) {
    directive.el = el
    directive.seed = this
    const { variable } = directive
    // 创建双向绑定
    if (!this._bindings[variable]) this._createBinding(variable)
    this._bindings[variable].directives.push(directive)
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
        // 遍历响应绑定该变量的指令

        this._bindings[variable].directives.forEach(directive => {
          directive.update(newVal)
        })
      }
    })
  }
}
module.exports = Seed
