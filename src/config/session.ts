import session from 'express-session'
import dotenv from 'dotenv'

dotenv.config()

const secret = process.env.SECRET_KEY ?? ''

export const sessionConfig = session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
})
