const { block } = require('./config')
module.exports = {
  text: function (value) {
    // debugger
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value) {
    this.el.classList[value ? 'add' : 'remove'](this.arg)
  },
  on: {
    update: function (handler) {
      const { handlers = {}, arg: event, el, seed } = this

      if (handlers[event]) el.removeEventListener(event, handlers[event])

      if (handler) {
        // bind scope to handler
        handler = handler.bind(seed)
        el.addEventListener(event, handler)
        this.handlers = { [event]: handler, ...handlers }
      }
    },
    unbind: function () {
      if (this.handlers) {
        this.el.removeEventListener(this.arg, this.handlers[this.arg])
      }
    },
    customFilter: function (handler, selectors) {
      return function (e) {
        var match = selectors.every(function (selector) {
          return e.target.webkitMatchesSelector(selector)
        })
        if (match) handler.apply(this, arguments)
      }
    }
  },

  each: {
    bind() {
      // 将元素从ul中删除，但记录在directive里面,同时建立联系
      this.el[block] = true
      const ctn = (this.container = this.el.parentNode)
      this.marker = document.createComment('sd-each-' + this.arg + '-marker')
      ctn.insertBefore(this.marker, this.el)
      this.container.removeChild(this.el)
      this.childSeeds = []
    },
    update(collection) {
      let str = ''
      // 用于clone再生成实例时,防止因为block属性的存在而跳过其内容
      this.el.removeAttribute(block)
      collection.forEach(element => {
        const seed = this.buildHtml(element)
        // 为ul添加子结点
        this.childSeeds.push(seed)
        this.container.append(seed.el)
      })
    },
    buildHtml(element) {
      const data = Object.keys(element).reduce((pre, cur) => {
        pre[this.arg + '.' + cur] = element[cur]
        return pre
      }, {})
      const node = this.el.cloneNode(true)
      return new Seed(node, data)
    }
  }
}
