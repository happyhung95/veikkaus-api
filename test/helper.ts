import request from 'supertest'
import app from '../src/app'

export async function getToken() {
  const res = await request(app).get('/api/v1/token').send()
  return 'Bearer ' + res.body['accessToken']
}

export async function createAccount() {
  const token = await getToken()
  const res = await request(app)
    .post('/api/v1/createAccount')
    .set('authorization', token)
    .set('Content-Type', 'application/json')
    .set('Idempotency-Key', Math.random().toString(36))
    .send({ name: 'test' })
  return res.body
}

export async function createAccountAndGetId() {
  const newAccount = await createAccount()
  return newAccount['_id']
}

export async function getAccount(accountId: string) {
  if (accountId) {
    const token = await getToken()
    const res = await request(app)
      .get('/api/v1/account/' + accountId)
      .set('authorization', token)
      .send()
    return res.body
  }
}

export async function getAccountBalance(accountId: string) {
  if (accountId) {
    const account = await getAccount(accountId)
    return account['balance']
  }
}
