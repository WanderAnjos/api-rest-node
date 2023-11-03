import { FastifyInstance } from "fastify";
import crypto from 'node:crypto';
import { z } from 'zod';
import { knex } from "../connection";

export async function transactionsRoutes(app: FastifyInstance){

  /**
   * Grupo de Rotas para Transactions
   * Prefix => .../transactions
   */

  app.post('/', async (req, res) => {
    const { body } = req

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    const { title, amount, type } = createTransactionBodySchema.parse(body)
    
    let sessionId = req.cookies.sessionId

    if(!sessionId){
      sessionId = crypto.randomUUID()
      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: ((((1000 * 60) * 60) * 24) * 7) // -> 7 Dias
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title: title,
      amount: (type === "credit" ? amount : amount *-1),
      session_id: sessionId
    })

    return res.status(201).send()
  })

  app.get('/', async(req, res) => {

    const {sessionId} = req.cookies
    
    const transactions = await knex('transactions')
    .where('session_id', sessionId)
    .select()

    return {
      transactions
    }
  })

  app.get('/:id', async(req, res) => {

    const { sessionId } = req.cookies

    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = getTransactionsParamsSchema.parse(req.params)

    const transaction = await knex('transactions')
    .where('id', id)
    .where('session_id', sessionId)
    .first()

    return transaction
  })

  app.get('/summary', async (req) => {

    const { sessionId } = req.cookies

    const summary = await knex('transactions')
    .sum('amount', { as: 'amount'})
    .where('session_id', sessionId)
    .first()

    return {
      summary
    }
  })

}