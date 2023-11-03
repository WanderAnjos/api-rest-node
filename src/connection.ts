
import { knex as setupKnex } from 'knex'
import { env } from './env'

export const config = {
  client: env.DATABASE_CLIENTE,
  connection: (env.DATABASE_CLIENTE === "sqlite" ? {
    filename: env.DATABASE_URL,
  } : env.DATABASE_URL),
  useNullAsDefault: true
}

export const knex = setupKnex(config)
