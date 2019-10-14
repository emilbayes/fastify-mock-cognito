'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const MockCognito = require('..')
const jwkToPem = require('jwk-to-pem')
const jwt = require('jsonwebtoken')
const { promisify, callbackify } = require('util')

const verify = promisify(jwt.verify)

test('Test signing', async (assert) => {
  const fastify = Fastify()
  fastify.register(MockCognito)

  await fastify.ready()

  const token = fastify.mockCognito.sign({
    'custom:a': [1, null, 3].join()
  })

  const selectKey = callbackify(async function (header) {
    const key = fastify.mockCognito.publicKeys.keys.find(k => k.kid === header.kid)
    if (key == null) throw new Error('Missing key')
    return jwkToPem(key)
  })

  const verifiedToken = await verify(token, selectKey, {
    algorithms: ['RS256'],
    issuer: fastify.mockCognito.issuer,
    audience: fastify.mockCognito.audience
  })

  assert.equal(verifiedToken.aud, fastify.mockCognito.audience)
  assert.equal(verifiedToken.iss, fastify.mockCognito.issuer)
  assert.deepEqual(verifiedToken['custom:a'].split(','), ['1', '', '3'])
})

test('default root route', async (assert) => {
  const app = Fastify()

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  app.register(MockCognito, {})

  // tear down our app after we are done
  assert.tearDown(app.close.bind(app))

  const res = await app.inject({
    url: '/.well-known/jwks.json'
  })
  const jwks = JSON.parse(res.payload)
  assert.ok(jwks.keys.length > 0, 'has keys')

  for (var i = 0; i < jwks.keys.length; i++) {
    assert.ok(jwks.keys[i].kid != null, 'has kid')
    assert.ok(jwks.keys[i].n != null, 'has n')
    assert.ok(jwks.keys[i].e != null, 'has e')
  }
})
