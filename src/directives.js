module.exports = {
  text: function (el, value) {
    el.textContent = value || ''
  },
  show: function (el, value) {
    el.style.display = value ? '' : 'none'
  },
  class: function (el, value, classname) {
    el.classList[value ? 'add' : 'remove'](classname)
  },
  'on-click': {
    update: function (el, handler, event, directiveObj) {
      if (!directiveObj.handlers) {
        directiveObj.handlers = {}
      }
      var handlers = directiveObj.handlers
      // 查看事件是否存在
      if (handlers[event]) {
        el.removeEventListener(event, handler[event])
      }
      // 回调函数是否存在
      if (handler) {
        handler = handler.bind(el)

        el.addEventListener(event, handler)
        handlers[event] = handler
      }
    },
    unbind: function (el, event, directiveObj) {
      if (directiveObj.handlers) {
        el.removeEventListener(event, directiveObj.handlers[event])
      }
    },
    // 不知道！！！
    customFilter: function (handler, selectors) {}
  }
}
