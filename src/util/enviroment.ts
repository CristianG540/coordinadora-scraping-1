import logger from '@util/logger'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env')) {
  logger.info('Using .env file to supply config environment variables')
  dotenv.config({ path: '.env' })
} else {
  logger.info('Using .env.example file to supply config environment variables')
  dotenv.config({ path: '.env.example' }) // you can delete this after you create your own .env file!
}

const SESSION_SECRET = process.env.SESSION_SECRET
const NODE_ENV = process.env.NODE_ENV

if (!SESSION_SECRET) {
  logger.error('No client secret. Set SESSION_SECRET environment variable on your ".env" file please.')
  process.exit(1)
}

if (!NODE_ENV) {
  logger.error('No NODE_ENV. Set NODE_ENV environment variable on your ".env" file please.')
  process.exit(1)
}

export {
  SESSION_SECRET,
  NODE_ENV
}
