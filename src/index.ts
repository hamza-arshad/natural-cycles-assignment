import path from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/userModel'
import express, { Request, Response } from 'express'
import session from 'express-session'
import { checkSession } from './middlewares/authMiddleware'

dotenv.config()

const app = express()
const mongoURI = process.env.MONGO_URI ?? ''
const port = process.env.PORT || 3000
const secret = process.env.SECRET_KEY ?? ''

const payment = require('./routes/payment')
const checkout = require('./routes/checkout')
const status = require('./routes/status')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')))

// Add session middleware to the Express app
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
)

// Set EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Connect to the database
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error))

app.get('/', (req, res) => {
  // @ts-ignore
  const userId = req.session.userId

  // If user ID exists in session, proceed to the next middleware/route handler
  if (userId) {
    res.redirect('/payment')
  } else {
    res.render('login')
  }
})

app.use('/checkout', checkout)

app.use('/status', checkSession, status)

app.use('/payment', checkSession, payment)

app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to log out')
    res.redirect('/')
  })
})

// Handle login form submission
app.post('/login', async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ email })

    // If the user doesn't exist, create a new one
    if (!user) {
      user = new User({ email })
      await user.save()
      console.log(`Created new user: ${user.email}`)
    } else {
      console.log(`User already exists: ${user.email}`)
    }
    // @ts-ignore
    req.session.userId = user._id
    // @ts-ignore
    req.session.userEmail = user.email
    // Redirect to the payment page (or wherever you want)
    res.redirect('/payment')
  } catch (error) {
    console.error('Error finding or creating user:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
