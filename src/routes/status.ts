const express = require('express')
const router = express.Router()
import gateway from '../config/gatewayConfig'
import dotenv from 'dotenv'
import Payment from '../models/paymentModel'

dotenv.config()

router.get('/', async (req: any, res: any) => {
  try {
    const userEmail = req.session.userEmail

    if (!userEmail) {
      return res.status(401).send('Unauthorized')
    }

    const paymentInfo = await Payment.findOne({ email: userEmail })

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
