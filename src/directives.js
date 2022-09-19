module.exports = {
  text: function (value) {
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value, classname) {
    this.el.classList[value ? 'add' : 'remove'](classname)
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

        el.addEventListener(event, handler)
        handlers[event] = handler
      }
    },
    unbind: function () {
      if (this.handlers) {
        this.el.removeEventListener(this.arg, this.handlers[this.arg])
      }
    },
    // 不知道！！！
    customFilter: function (handler, selectors) {}
  }
}
