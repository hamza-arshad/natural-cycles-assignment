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

      res.render('status', {
        status: subscription.status,
        subscriptionType: subscription.planId,
        expiryDate: subscription.paidThroughDate,
        thermometerIncluded: (subscription.addOns?.length ?? 0) > 0,
        amountPaid: subscription.transactions?.[0]?.amount ?? 0,
      })
    } else {
      res.render('status', {
        status: 'No active subscription',
        subscriptionType: 'None',
        expiryDate: 'None',
        thermometerIncluded: false,
        amountPaid: 0,
      })
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
