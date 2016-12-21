import {RulesContainer} from 'jss'

const key = '@global'
const prefixKey = '@global '

class GlobalContainerRule {
  type = 'global'

  constructor(name, styles, options) {
    this.name = name
    this.options = options
    this.rules = new RulesContainer({
      ...options,
      parent: this
    })

    for (const selector in styles) {
      this.rules.add(selector, styles[selector], {
        generateClassName: null,
        selector
      })
    }

    this.rules.process()
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
    const rule = this.rules.add(name, style, {
      ...options,
      generateClassName: null
    })
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

class GlobalPrefixedRule {
  constructor(name, style, options) {
    this.name = name
    this.options = options
    const selector = name.substr(prefixKey.length)
    this.rule = options.jss.createRule(selector, style, {
      ...options,
      parent: this,
      selector,
      generateClassName: null
    })
  }

  toString(options) {
    return this.rule.toString(options)
  }
}

function handleNestedGlobalContainerRule(rule) {
  const {options, style} = rule
  const rules = style[key]

  if (!rules) return

  for (const name in rules) {
    const selector = `${rule.selector} ${name}`
    options.sheet.addRule(name, rules[name], {
      ...options,
      selector,
      generateClassName: null
    })
  }

  delete style[key]
}

function handlePrefixedGlobalRule(rule) {
  const {options, style} = rule
  for (const prop in style) {
    if (prop.substr(0, key.length) !== key) continue

    const selector = prop.substr(key.length).trim()
    const scopedSelector = `${rule.selector} ${selector}`
    options.sheet.addRule(scopedSelector, style[prop], {
      ...options,
      selector: scopedSelector,
      generateClassName: null
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
    if (name === key) {
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

    if (options.global) {
      options.selector = name
      options.generateClassName = null
    }

    return null
  }

  function onProcessRule(rule) {
    if (rule.type !== 'regular' || !rule.style) return

    handleNestedGlobalContainerRule(rule)
    handlePrefixedGlobalRule(rule)
  }

  return {onCreateRule, onProcessRule}
}

