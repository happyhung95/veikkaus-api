import dotenv from 'dotenv'
import fs from 'fs'

import logger from './logger'

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables')
  dotenv.config({ path: '.env' })
} else {
  logger.debug('Using .env.example file to supply config environment variables')
  dotenv.config({ path: '.env.example' }) 
}

export const JWT_SECRET = process.env['JWT_SECRET'] as string
if (!JWT_SECRET) {
  logger.error('No client secret. Set SESSION_SECRET or JWT_SECRET environment variable.')
  process.exit(1)
}

export const ENVIRONMENT = process.env.NODE_ENV
const prod = ENVIRONMENT === 'production' // Anything else is treated as 'dev'

export const MONGODB_URI = (prod ? process.env['MONGODB_URI'] : process.env['MONGODB_URI_LOCAL']) as string

if (!MONGODB_URI) {
  if (prod) {
    logger.error('No mongo connection string. Set MONGODB_URI environment variable.')
  } else {
    logger.error('No mongo connection string. Set MONGODB_URI_LOCAL environment variable.')
  }
  process.exit(1)
}
