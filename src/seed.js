const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

class Seed {
  constructor({ id, scope }) {
    const root = document.getElementById(id)
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

  _compileNode(el) {
    if (el.nodeType === Node.TEXT_NODE) {
      console.log(el, 'this is text Node')
    }
    if (!(el.attributes && el.attributes.length)) return
    ;[].forEach.call(el.attributes, ({ name, value }) => {
      //查询el上相关的指令，并获取相关config
      const directive = this._parseDirective(el, name, value)
      if (!directive) return

      const { variable } = directive
      // 创建双向绑定
      if (!this._bindings[variable]) this._createBinding(variable)
      this._bindings[variable].directives.push(directive)
    })
    // 绑定this,使得内部方法也能调用bindings和scope
    el.childNodes.forEach(this._compileNode.bind(this))
  }

  _parseDirective(el, name, value) {
    if (name.indexOf(prefix + '-') === -1) return
    const noPrefix = name.slice(prefix.length + 1)
    // name: sd-on-click  | sd-text
    /**
     * arg可能为undefined or click等事件
     */
    const [key, ...arg] = noPrefix.split('-')
    const [variable, filter] = value.split('|').map(i => i.trim())
    return {
      filter: filter && Filters[filter],
      directive: Directives[key],
      arg,
      variable,
      el
    }
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
        this._bindings[variable].directives.forEach(directiveObj => {
          const { directive, arg, filter, el } = directiveObj
          // 如果指令是函数，直接将el，val传入进行调用
          if (typeof directive === 'function') {
            return directive(el, filter ? filter(newVal) : newVal)
          }
          // 否则进行事件的添加
          directive.update(el, this.scope[variable], arg, directiveObj)
        })
      }
    })
  }
}
module.exports = Seed
