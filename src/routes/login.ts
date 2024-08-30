import { Request, Response } from 'express'
import User from '../models/userModel'

const express = require('express')
const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  const userId = req.session.userId
  if (userId) {
    return res.redirect('/payment')
  } else {
    res.render('login')
  }
})

router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ email })

    // If the user doesn't exist, create a new one
    if (!user) {
      user = new User({ email })
      await user.save()
    }
    req.session.userId = user._id.toString()
    req.session.userEmail = user.email
    // Redirect to the payment page (or wherever you want)
    return res.redirect('/payment')
  } catch (error) {
    console.error('Error finding or creating user:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
