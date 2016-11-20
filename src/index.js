const key = '@global'

class GlobalContainerRule {
  constructor(name, styles, options) {
    this.name = key
    this.options = options
    this.rules = []

    for (const selector in styles) {
      const rule = options.jss.createRule(selector, styles[selector], {
        ...options,
        className: selector,
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
    this.name = key
    this.options = options
    const selector = name.substr(key.length).trim()
    this.rule = options.jss.createRule(selector, style, {
      ...options,
      className: selector,
      selector
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
    const className = `${rule.selector} ${name}`
    options.sheet.addRule(name, rules[name], {
      ...options,
      className,
      selector: className
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
  function onSetup(jss) {
    jss.registerRuleClass(`${key} `, GlobalPrefixedRule)
    jss.registerRuleClass(key, GlobalContainerRule)
  }

  function onRule(rule) {
    if (rule.type !== 'regular' || !rule.style) return

    handleNestedGlobalContainerRule(rule)
    handlePrefixedGlobalRule(rule)
  }

  return {onSetup, onRule}
}
