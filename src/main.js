const directives = require('./directives')
const filters = require('./filters')
const prefix = 'sd'

// Element Class
function Element(opt) {
  const root = document.getElementById(opt.id)

  // 绑定至各指令的变量名，并且添加详细信息
  const bindings = {}
  // Element
  // 闭包scope
  const scope = (this.scope = {})

  // 获取绑定至directive的变量
  Object.keys(directives).forEach(directive => {
    bind(directive)
  })

  function bind(directive) {
    // 所有带有该指令的Node元素
    const els = document.querySelectorAll(`[${prefix}-${directive}]`)
    ;[].forEach.call(els, (el, idx) => {
      const value = el.getAttribute(`${prefix}-${directive}`)
      // 除了变量名以外，还获取修饰符
      const [variable, filter] = value.split('|').map(i => i.trim())

      // 如果不存在则新建一个
      if (!bindings[variable]) bindings[variable] = { directives: [] }
      bindings[variable].directives.push({
        filter,
        directive,
        el
      })
    })
  }
  function mapValue(variable) {
    Object.defineProperty(scope, variable, {
      get() {
        return bindings[variable].value
      },
      set(newVal) {
        bindings[variable].value = newVal
        bindings[variable].directives.forEach(directiveObj => {
          const { directive, filter, el } = directiveObj
          const directiveF = directives[directive]
          if (typeof directiveF == 'function') {
            return directiveF(
              el,
              filter && filters[filter] ? filters[filter](newVal) : newVal
            )
          }
          const event = directive.split('-')[1]
          directiveF.update(el, scope[variable], event, directiveObj)
        })
      }
    })
  }
  for (let variable in bindings) {
    mapValue(variable)
    scope[variable] = opt.scope[variable]
  }
}
module.exports = Element
