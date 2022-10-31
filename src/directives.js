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
      const { arg: event, el, seed } = this

      if (this.handler) el.removeEventListener(event, this.handler)

      if (handler) {
        // bind scope to handler
        this.handler = e => {
          return handler({ el, event: e, seed })
        }
        // 因为el子元素和changeMessage是同一作用域,所以handler添加到子元素事件中
        el.addEventListener(event, this.handler)
      }
    },
    unbind: function () {
      if (this.handlers) {
        this.el.removeEventListener(this.arg, this.handler)
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
  /**
   * 用于将checkbox的属性checked和指定变量双向绑定在一起
   * 例如click checkbox,然后checked发生变化->绑定的变量done也发生变化
   */
  checked: {
    // 监听change事件
    bind() {
      this.handler = () => {
        this.seed.scope[this.variable] = this.el.checked
      }
      this.el.addEventListener('change', this.handler)
    },
    update(flag) {
      this.el.checked = flag
    },
    unbind() {
      this.el.removeEventListener('change', this.handler)
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
      /**
       * 因为数组更新后,虽然childSeed建立了联系，但是没有重新调用extension
       * 将新建的变量值重新绑定
       */
      this.seed._extension()
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
      // debugger
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
