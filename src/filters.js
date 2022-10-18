module.exports = {
  capitalize: function (value) {
    value = value.toString()
    return value[0].toUpperCase() + value.slice(1)
  },
  uppercase: function (value) {
    return value.toUpperCase()
  },
  // 事件委托
  delegate: function (handler, selector) {
    return function (e) {
      console.log(e.target)
      if (e.target.webkitMatchesSelector(selector)) {
        handler.apply(this, arguments)
      }
    }
  }
}
