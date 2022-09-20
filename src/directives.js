module.exports = {
  text: function (value) {
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  // 添加类名,只要结果为true则添加
  class: function (value) {
    this.el.classList[value ? 'add' : 'remove'](this.arg)
  },
  on: {
    // 绑定函数
    update: function (handler) {
      const { handlers = {}, arg: event, el, seed } = this
      // 查看事件是否存在
      if (handlers[event]) {
        el.removeEventListener(event, handlers[event])
      }
      // 回调函数是否存在
      if (handler) {
        handler = handler.bind(seed)

        // 修复handlers不存在
        el.addEventListener(event, handler)
        this.handlers = { [event]: handler, ...handlers }
      }
    },
    unbind: function () {
      if (this.handlers) {
        this.el.removeEventListener(this.arg, this.handlers[this.arg])
      }
    },
    // 不知道！！！
    customFilter: function (handler, selectors) {}
  },
  each: {
    update(collection) {}
  }
}
