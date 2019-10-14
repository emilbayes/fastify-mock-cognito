# `fastify-mock-cognito`

[![Build Status](https://travis-ci.org/emilbayes/fastify-mock-cognito.svg?branch=master)](https://travis-ci.org/emilbayes/fastify-mock-cognito)

> Fastify plugin to mock AWS Cognito for testing

## Usage

```js
var FastifyMockCognito = require('fastify-mock-cognito')

fastify.register(FastifyMockCognito, {
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example',
  audience: 'some-random-string', // optional, but should be verified
  mountWellKnown: true // default
})

const data = {
  'custom:property': 'value'
}

const opts = {} // jsonwebtoken options

const token = fastify.mockCognito.sign(data, opts)
```

## API

### `const issuer = fastify.mockCognito.issuer`

The issuer passed in as option during `fastify.register`. This is usually an
url of the form `https://cognito-idp.REGION.amazonaws.com/USER_POOL`,
but you may want to change this during testing to the locally mounted
`/.well-known/jwks.json`, such that verification of keys happen against this
endpoint.

### `const audience = fastify.mockCognito.audience`

The audience passed in as option during `fastify.register`. This is the string
that you get for a specific "app" in Cognito.

### `const token = fastify.mockCognito.sign(data, opts)`

Create a new JWT token with the specified properties defined by Cognito. You can
overwrite and pass extra properties through `data`, such as `custom:` properties
or overwrite the user data. `opts` is passed to `jsonwebtoken`.

### `fastify.mockCognito.enableWellKnown()`

Enable the `/.well-known/jwks.json` endpoint to return the
`fastify.mockCognito.publicKeys` data. This will only have effect if
`mountWellKnown` was `true` during the plugin registration.

### `fastify.mockCognito.disableWellKnown()`

Disable the `/.well-known/jwks.json` endpoint to return `404`.
This will only have effect if `mountWellKnown` was `true` during the plugin
registration.

### `const publicKeys = fastify.mockCognito.publicKeys`

`{ keys: [...]}` list of `jwks` public keys. Predefined with the RSA key from
the IETF RFC.

### `const privateKeys = fastify.mockCognito.privateKeys`

`{ keys: [...]}` list of `jwks` private keys. Predefined with the RSA key from
the IETF RFC.

## Install

```sh
npm install fastify-mock-cognito
```

## License

[ISC](LICENSE)
