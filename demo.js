function log() {
  var self = this,
    bindings = {} // the internal copy
  data = self.data = {} // the external interface

  console.log(bindings)
  console.log(data)
  data = 1
  console.log(data)
}
log()
console.log(data)
