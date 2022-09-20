const Filters = require('./filters')
const Directives = require('./directives')
const { prefix } = require('./config')

class Directive {
  constructor(name, value) {
    const noPrefix = name.substr(prefix.length + 1)
    const [key, ...arg] = noPrefix.split('-')
    const [variable, filter] = value.split('|').map(i => i.trim())

    // if(!Directives[key]) return;
    // for directives on method
    this.arg = arg
    // for seed
    this.variable = variable

    this._buildUpdate(key)

    this._filter = Filters[filter]
  }

  _buildUpdate(key) {
    const def = Directives[key]
    if (typeof def == 'function') return (this._update = def)

    for (let prop in def) {
      this[prop == 'update' ? '_update' : prop] = def[prop]
    }
  }

  update(newVal) {
    const { _filter } = this
    this._update(_filter ? _filter(newVal) : newVal)
  }
}

module.exports = {
  parse(name, value) {
    if (name.indexOf(prefix + '-') == -1) return

    return new Directive(name, value)
  }
}
