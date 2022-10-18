const { BLOCK, mutatorMethods } = require('./config')
// 引用mutator方法
module.exports = {
  text: function (value) {
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
      this.el[BLOCK] = true
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

      // 重置数组的方法
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
          Array.prototype[method].call(collection, ...args)
          this.update(collection)
        }
      })
    },
    buildHtml(data) {
      // 相比之前，直接自己去掉字符串变量todo.message的前缀todo
      const el = this.el.cloneNode(true)
      // 添加options{parentScope,prefixReg}用于去掉变量名前缀
      /**
       * 例如：todo.msg
       * 就去掉todo.->msg,方便直接遍历
       */
      debugger
      return new Seed({
        el,
        data,
        options: {
          eachPrefixRE: new RegExp(`^${this.arg}.`),
          parentScope: this.seed
        }
      })
    }
  }
}
