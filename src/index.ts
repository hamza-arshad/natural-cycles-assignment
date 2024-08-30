import path from 'path'
import express, { Request, Response } from 'express'
import { connectToDatabase } from './config/database'
import { sessionConfig } from './config/session'
import { checkSession } from './middlewares/authMiddleware'

const payment = require('./routes/payment')
const checkout = require('./routes/checkout')
const status = require('./routes/status')
const login = require('./routes/login')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')))

// Extending Session Data to Include Custom Fields
declare module 'express-session' {
  export interface SessionData {
    userId: string
    userEmail?: string
  }
}

// Add session middleware to the Express app
app.use(sessionConfig)

// Set EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Connect to the database
connectToDatabase()

// Routes
app.get('/', (req, res) => {
  return res.redirect('/login')
})

app.use('/checkout', checkout)
app.use('/status', checkSession, status)
app.use('/payment', checkSession, payment)

app.use('/login', login)

app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to log out')
    return res.redirect('/login')
  })
})

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})
