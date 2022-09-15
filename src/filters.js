module.exports = {
  capitalize: function (value) {
    value = value.toString()
    return value[0].toUpperCase() + value.slice(1)
  }
}
