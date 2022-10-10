const { block, mutatorMethods } = require('./config')
// 引用mutator方法
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

      //clear old childSeeds
      this.childSeeds.forEach(seed => seed.destroy())
      this.childSeeds = []

      this.watchArray(collection)

      collection.forEach(element => {
        const seed = this.buildHtml(element)
        // 为ul添加子结点
        this.childSeeds.push(seed)
        this.container.append(seed.el)
      })
    },
    /**
     为绑定的数组的方法设置回调函数，每当修改数组的时候,回调update
     */
    watchArray(collection) {
      mutatorMethods.forEach(method => {
        // 解构符会默认将数据变成数组
        collection[method] = (...args) => {
          console.log('args', args)
          console.log('...args', ...args)
          Array.prototype[method].call(collection, ...args)
          this.update(collection)
        }
      })
      console.log('collection', collection)
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
