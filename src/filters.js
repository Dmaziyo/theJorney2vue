module.exports = {
  capitalize: function (value) {
    value = value.toString()
    return value[0].toUpperCase() + value.slice(1)
  },
  uppercase: function (value) {
    return value.toUpperCase()
  },
  // 相当于替身
  delegate: function (handler, selector) {
    return function (e) {
      if (e.target.webkitMatchesSelector(selector)) {
        handler.apply(this, arguments)
      }
    }
  }
}
