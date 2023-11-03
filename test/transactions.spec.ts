import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { app } from '../src/app'

describe('Transactions Routes', () => {

  beforeAll(async () => {
    await app.ready()
  })
  
  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:latest --all')
    execSync('npm run knex migrate:latest')
  })
  
  test('The user can create a new transaction!', async () => {
    await request(app.server).post('/transactions')
    .send({
      title: "Transaction Test",
      amount: 5000,
      type: "credit"
    })
    .expect(201)
  })

  test('The user can list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Transaction Test",
      amount: 5000,
      type: "credit"
    })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Transaction Test",
        amount: 5000,
      })
    ])

  })

  test('The user can get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Transaction Test",
      amount: 5000,
      type: "credit"
    })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    const transactionId =  listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)
    .expect(200)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        title: "Transaction Test",
        amount: 5000,
      })
    )

  })

  test('The user can a summary', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Transaction Test",
      amount: 5000,
      type: "credit"
    })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: "Debit Transaction",
      amount: 2000,
      type: "debit"
    })

    const summaryResponse = await request(app.server)
    .get('/transactions/summary')
    .set('Cookie', cookies)
    .expect(200)

    console.log(summaryResponse.body)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000
    })

  })
})
