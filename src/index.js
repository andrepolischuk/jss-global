import {RuleList} from 'jss'

const propKey = '@global'
const prefixKey = '@global '

class GlobalRule {
  constructor(key, styles, options) {
    this.key = key
    this.options = options
    this.rules = new RuleList({
      ...options,
      parent: this
    })
  }

  /**
   * Get a rule.
   */
  getRule(name) {
    return this.rules.get(name)
  }

  /**
   * Create and register rule, run plugins.
   */
  addRule(name, style, options) {
    const rule = this.rules.add(name, style, options)
    this.options.jss.plugins.onProcessRule(rule)
    return rule
  }

  /**
   * Get index of a rule.
   */
  indexOf(rule) {
    return this.rules.indexOf(rule)
  }

  /**
   * Generates a CSS string.
   */
  toString() {
    return this.rules.toString()
  }
}

class GlobalContainerRule extends GlobalRule {
  constructor(key, styles, options) {
    super(key, styles, options)
    this.type = 'global'

    for (const selector in styles) {
      this.rules.add(selector, styles[selector], {selector})
    }

    this.rules.process()
  }
}

class GlobalPrefixedRule extends GlobalRule {
  constructor(name, style, options) {
    super(propKey, style, options)

    const selector = name.substr(prefixKey.length)

    this.rules.add(selector, style, {selector})
    this.rules.process()
  }
}

const separatorRegExp = /\s*,\s*/g

function addScope(selector, scope) {
  const parts = selector.split(separatorRegExp)
  let scoped = ''
  for (let i = 0; i < parts.length; i++) {
    scoped += `${scope} ${parts[i].trim()}`
    if (parts[i + 1]) scoped += ', '
  }
  return scoped
}

function handleNestedGlobalContainerRule(rule) {
  const {options, style} = rule
  const rules = style[propKey]

  if (!rules) return

  for (const name in rules) {
    options.sheet.addRule(name, rules[name], {
      ...options,
      selector: addScope(name, rule.selector)
    })
  }

  delete style[propKey]
}

function handlePrefixedGlobalRule(rule) {
  const {options, style} = rule
  for (const prop in style) {
    if (prop.substr(0, propKey.length) !== propKey) continue

    const selector = addScope(prop.substr(propKey.length), rule.selector)
    options.sheet.addRule(selector, style[prop], {
      ...options,
      selector
    })
    delete style[prop]
  }
}

/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssGlobal() {
  function onCreateRule(name, styles, options) {
    if (name === propKey) {
      return new GlobalContainerRule(name, styles, options)
    }

    if (name[0] === '@' && name.substr(0, prefixKey.length) === prefixKey) {
      return new GlobalPrefixedRule(name, styles, options)
    }

    const {parent} = options

    if (parent) {
      if (
        parent.type === 'global' ||
        parent.options.parent.type === 'global'
      ) {
        options.global = true
      }
    }

    if (options.global) options.selector = name

    return null
  }

  function onProcessRule(rule) {
    if (rule.type !== 'style') return

    handleNestedGlobalContainerRule(rule)
    handlePrefixedGlobalRule(rule)
  }

  return {onCreateRule, onProcessRule}
}
