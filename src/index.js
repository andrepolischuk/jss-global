const containerKey = '@global'
const prefixKey = '@global '

class GlobalContainerRule {
  constructor(name, styles, options) {
    this.name = containerKey
    this.options = options
    this.rules = []

    for (const selector in styles) {
      const rule = options.jss.createRule(selector, styles[selector], {
        ...options,
        className: selector,
        parent: this,
        selector
      })
      this.rules.push(rule)
    }
  }

  toString(options) {
    return this.rules
      .map(rule => rule.toString(options))
      .join('\n')
  }
}

class GlobalPrefixedRule {
  constructor(name, style, options) {
    this.name = containerKey
    this.options = options
    const selector = name.substr(containerKey.length).trim()
    this.rule = options.jss.createRule(selector, style, {
      ...options,
      className: selector,
      parent: this,
      selector
    })
  }

  toString(options) {
    return this.rule.toString(options)
  }
}

function handleNestedGlobalContainerRule(rule) {
  const {options, style} = rule
  const rules = style[containerKey]

  if (!rules) return

  for (const name in rules) {
    const className = `${rule.selector} ${name}`
    options.sheet.addRule(name, rules[name], {
      ...options,
      className,
      selector: className
    })
  }

  delete style[containerKey]
}

function handlePrefixedGlobalRule(rule) {
  const {options, style} = rule
  for (const prop in style) {
    if (prop.substr(0, containerKey.length) !== containerKey) continue

    const selector = prop.substr(containerKey.length).trim()
    const scopedSelector = `${rule.selector} ${selector}`
    options.sheet.addRule(scopedSelector, style[prop], {
      ...options,
      className: scopedSelector,
      selector: scopedSelector
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
  function onCreate(name, styles, options) {
    if (name === containerKey) {
      return new GlobalContainerRule(name, styles, options)
    }

    if (name.substr(0, prefixKey.length) === prefixKey) {
      return new GlobalPrefixedRule(name, styles, options)
    }
  }

  function onProcess(rule) {
    if (rule.type !== 'regular' || !rule.style) return

    handleNestedGlobalContainerRule(rule)
    handlePrefixedGlobalRule(rule)
  }

  return {onCreate, onProcess}
}

