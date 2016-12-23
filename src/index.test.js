import expect from 'expect.js'
import {create} from 'jss'
import nested from 'jss-nested'

import global from './index'

const settings = {
  generateClassName: (str, rule) => `${rule.name}-id`
}

describe('jss-global', () => {
  let jss

  beforeEach(() => {
    jss = create(settings).use(global())
  })

  describe('@global root container', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        '@global': {
          a: {color: 'red'},
          body: {color: 'green'}
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('@global')).to.not.be(undefined)
      expect(sheet.getRule('a')).to.be(undefined)
      expect(sheet.getRule('body')).to.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  color: red;\n' +
        '}\n' +
        'body {\n' +
        '  color: green;\n' +
        '}'
      )
    })
  })

  describe('@global root prefix', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        '@global body': {
          color: 'red'
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('body')).to.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'body {\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('@global container inside of a regular rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        button: {
          float: 'left',
          '@global': {
            span: {color: 'red'}
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('button')).to.not.be(undefined)
      expect(sheet.getRule('.button-id span')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.button-id {\n' +
        '  float: left;\n' +
        '}\n' +
        '.button-id span {\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('@global prefix inside of a regular rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        button: {
          float: 'left',
          '@global span': {
            color: 'red'
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('button')).to.not.be(undefined)
      expect(sheet.getRule('.button-id span')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.button-id {\n' +
        '  float: left;\n' +
        '}\n' +
        '.button-id span {\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('@global with nested rules inside', () => {
    let jss2

    beforeEach(() => {
      jss2 = create({plugins: [global(), nested()]})
    })

    it('should handle regular nested rules', () => {
      const sheet = jss2.createStyleSheet({
        '@global': {
          button: {
            color: 'red',
            '& span': {
              color: 'green'
            }
          }
        }
      })
      expect(sheet.toString()).to.be(
        'button {\n' +
        '  color: red;\n' +
        '}\n' +
        'button span {\n' +
        '  color: green;\n' +
        '}'
      )
    })

    it('should handle regular deep nested rules', () => {
      const sheet = jss2.createStyleSheet({
        '@global': {
          button: {
            color: 'red',
            '& span': {
              color: 'green',
              '& b': {
                color: 'blue'
              }
            }
          }
        }
      })

      expect(sheet.toString()).to.be(
        'button {\n' +
        '  color: red;\n' +
        '}\n' +
        'button span {\n' +
        '  color: green;\n' +
        '}\n' +
        'button span b {\n' +
        '  color: blue;\n' +
        '}'
      )
    })

    it('should handle nested conditional rules', () => {
      const sheet = jss2.createStyleSheet({
        '@global': {
          html: {
            color: 'red',
            '@media (max-width: 767px)': {
              color: 'green'
            }
          }
        }
      })
      expect(sheet.toString()).to.be(
        'html {\n' +
        '  color: red;\n' +
        '}\n' +
        '@media (max-width: 767px) {\n' +
        '  html {\n' +
        '    color: green;\n' +
        '  }\n' +
        '}'
      )
    })

    it('should handle conditionals with nesting inside', () => {
      const sheet = jss2.createStyleSheet({
        '@global': {
          '@media (max-width: 767px)': {
            html: {
              color: 'red',
              '& button': {
                color: 'green'
              }
            }
          }
        }
      })
      expect(sheet.toString()).to.be(
        '@media (max-width: 767px) {\n' +
        '  html {\n' +
        '    color: red;\n' +
        '  }\n' +
        '  html button {\n' +
        '    color: green;\n' +
        '  }\n' +
        '}'
      )
    })
  })
})
