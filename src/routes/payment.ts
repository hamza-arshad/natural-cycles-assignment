const express = require('express')
const router = express.Router()
import gateway from '../config/gatewayConfig'
import dotenv from 'dotenv'
import Payment from '../models/paymentModel'
import { Request, Response } from 'express'

dotenv.config()

router.get('/', async (req: Request, res: Response) => {
  try {
    const userEmail = req.session.userEmail

    const paymentInfo = await Payment.findOne({ email: userEmail }).sort({ created_at: -1 })

    if (paymentInfo) {
      const subscription = await gateway.subscription.find(
        paymentInfo.subscriptionId,
      )

      if (subscription.status === 'Active') {
        return res.redirect('/status')
      }
    }
    res.render('payment', {
      braintreeToken: process.env.BRAINTREE_TOKEN,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
