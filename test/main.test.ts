import request from 'supertest'

import app from '../src/app'
import * as dbHelper from './db-helper'
import * as util from './helper'
import { TransactionType } from '../src/types/types'

let token: string

describe('All tests ', () => {
  beforeAll(async () => {
    jest.setTimeout(1000000000) // override maxTimeOut of jest
    await dbHelper.connect()
    token = await util.getToken()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('get token, should return 201 and token', async () => {
    const res = await request(app).get('/api/v1/token').send()

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('create an account, should return 201 and account', async () => {
    const name = 'test'

    const res = await request(app)
      .post('/api/v1/createAccount')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .set('Idempotency-Key', Math.random().toString(36))
      .send({ name })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body).toHaveProperty('balance', 0)
    expect(res.body).toHaveProperty('deleted', false)
    expect(res.body).toHaveProperty('name', name)
    expect(res.body).toHaveProperty('events', [])
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toHaveProperty('updatedAt')
  })

  it('get account, should return 200 and account', async () => {
    const accountId = await util.createAccountAndGetId()

    const res = await request(app)
      .get('/api/v1/account/' + accountId)
      .set('authorization', token)
      .send()

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('_id')
    expect(res.body).toHaveProperty('balance', 0)
    expect(res.body).toHaveProperty('deleted', false)
    expect(res.body).toHaveProperty('name')
    expect(res.body).toHaveProperty('events', [])
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toHaveProperty('updatedAt')
  })

  it('Add winning to account, should return 200 and account balance', async () => {
    const accountId = await util.createAccountAndGetId()
    const amount = 100
    const req = { accountId, amount, eventId: 'someId', transactionType: TransactionType.PROFIT, timeStamp: 'some-day' }

    const res = await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Idempotency-Key', Math.random().toString(36))
      .send(req)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accountId', accountId)
    expect(res.body).toHaveProperty('balance', amount)
  })

  it('Duplicated requests: add winning to account with same idempotence key, should return 200 and account balance should process just one', async () => {
    const accountId = await util.createAccountAndGetId()
    const amount = 100

    const req = { accountId, amount, eventId: 'someId', transactionType: TransactionType.PROFIT, timeStamp: 'some-day' }
    const idemKey = Math.random().toString(36)

    // send 3 requests with same idempotency key
    await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Idempotency-Key', idemKey)
      .send(req)

    await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Idempotency-Key', idemKey)
      .send(req)

    await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Idempotency-Key', idemKey)
      .send(req)

    const checkBalance = await util.getAccountBalance(accountId)

    expect(checkBalance).toBe(amount)
  })

  it('Purchase event from account more than balance, should return 400', async () => {
    const accountId = await util.createAccountAndGetId()
    const amount = 100
    const req = {
      accountId,
      amount,
      eventId: 'someId',
      transactionType: TransactionType.PURCHASE,
      timeStamp: 'some-day',
    }

    const res = await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Idempotency-Key', Math.random().toString(36))
      .send(req)

    expect(res.status).toBe(400)
  })

  it('Request to add winning with invalid token, should return 401', async () => {
    const accountId = await util.createAccountAndGetId()
    const amount = 100
    const req = {
      accountId,
      amount,
      eventId: 'someId',
      transactionType: TransactionType.PROFIT,
      timeStamp: 'some-day',
    }

    const res = await request(app)
      .post('/api/v1/updateAccount')
      .set('Content-Type', 'application/json')
      .set('authorization', token + 'invalid')
      .set('Idempotency-Key', Math.random().toString(36))
      .send(req)

    expect(res.status).toBe(401)
  })
})
