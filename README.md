## Global Styles for JSS

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/cssinjs/lobby)

If you want to write regular globally scoped CSS with JSS, this plugin is for you. Don't use it if you can avoid it.


## Top level global declarations block

```javascript
const sheet = jss.createStyleSheet({
  '@global': {
    body: {
      color: 'green'
    },
    a: {
      textDecoration: 'underline'
    }
  }
})
```

## Top level global prefix

```javascript
const sheet = jss.createStyleSheet({
  '@global body': {
    color: 'green'
  }
})
```

## Nested global declarations block

```javascript
const sheet = jss.createStyleSheet({
  button: {
    float: 'left',
    '@global': {
      span: {color: 'red'}
    }
  }
})
```
## Nested global prefix

```javascript
const sheet = jss.createStyleSheet({
  button: {
    float: 'left',
    '@global span': {color: 'red'}
  }
})
```

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-global\]](https://github.com/cssinjs/jss/issues/new?title=[jss-global]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
