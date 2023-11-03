import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { knex } from './connection'
import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions'
})

app.get('/schemas', async(req, res) => {
  return await knex('transactions').select('*')
})