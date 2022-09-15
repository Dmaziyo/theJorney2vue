const directives = require('./directives')
const filters = require('./filters')
const prefix = 'sd'

// 老版本的Vue实例
function Element(opt) {
  // 获取DOM元素结点
  const root = document.getElementById(opt.id)

  // 绑定到元素上的变量
  const bindings = {}

  // 类似于Vue的data了
  const scope = (this.scope = {})

  Object.keys(directives).forEach(directive => {
    bind(directive)
  })

  // 相当于标记每个变量绑定的方法和属性,把每个指令所包含的变量记录
  function bind(directive) {
    // 获取所有带有该directive的元素
    const els = document.querySelectorAll(`[${prefix}-${directive}]`)

    ;[].forEach.call(els, (el, idx) => {
      // 获取元素值
      const value = el.getAttribute(`${prefix}-${directive}`)
      // variable是变量，filter是已经配置的过滤条件,通过trim()删除多余的空格
      const [variable, filter] = value.split('|').map(i => i.trim())

      // 将该变量的config属性设置好
      /**
       filter:筛选方式
       directive：对应的指令
       el:所绑定的元素
       Tips:这是一个数组，所以意思是变量不一定只对应一共元素
      */
      if (!bindings[variable]) bindings[variable] = { directives: [] }
      bindings[variable].directives.push({
        filter,
        directive,
        el
      })
    })
  }

  // 把每个变量的值动态绑定在一起
  function mapValue(variable) {
    //
    Object.defineProperty(scope, variable, {
      get() {
        return bindings[variable].value
      },
      set(newVal) {
        bindings[variable].value = newVal

        // 提取出该变量的每个指令config
        bindings[variable].directives.forEach(directiveObj => {
          const { directive, filter, el } = directiveObj
          // 这个directives是从另一个文件中获取的
          const directiveF = directives[directive]
          if (typeof directiveF == 'function') {
            directiveF(
              el,
              // 如果有大写就存大写值进去,否则不传
              filter && filters[filter] ? filters[filter](newVal) : newVal
            )
            // 直接停止,
            return
          }
          const event = directive.split('-')[1]
          directiveF.update(el, scope[variable], event, directiveObj)
          console.log('这还能运行吗?', variable)
        })
      }
    })
  }

  for (var variable in bindings) {
    mapValue(variable)
    scope[variable] = opt.scope[variable]
  }
}

module.exports = Element
