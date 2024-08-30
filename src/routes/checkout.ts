import gateway from '../config/gatewayConfig'
import Payment from '../models/paymentModel'
import { Request, Response } from 'express'

const express = require('express')
const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  const nonceFromTheClient = req.body?.paymentMethodNonce
  const subscriptionPlan = req.body?.subscriptionPlan // 'monthly' or 'yearly'
  const thermometer = req.body?.thermometerIncluded

  // Determine the plan ID based on user selection
  let planId = subscriptionPlan === 'yearly' ? 'YEARLY' : 'MONTHLY'
  let addOns = []

  // Add thermometer as an add-on if selected
  if (thermometer) {
    addOns.push({
      inheritedFromId: '1',
      quantity: 1,
    })
  }

  try {
    const customerResult = await gateway.customer.create({
      email: req.session.userEmail,
      paymentMethodNonce: nonceFromTheClient,
    })

    if (customerResult.success) {
      const paymentMethodToken =
        customerResult.customer.paymentMethods?.[0]?.token ?? ''

      const subscriptionResult = await gateway.subscription.create({
        paymentMethodToken: paymentMethodToken,
        planId: planId,
        addOns: {
          add: addOns,
        },
      })

      if (subscriptionResult.success) {
        // Delete all payments with the same email before creating a new one
        await Payment.deleteMany({ email: req.session.userEmail })

        await Payment.create({
          email: req.session.userEmail,
          customerId: customerResult.customer.id,
          subscriptionId: subscriptionResult.subscription.id,
          subscriptionType: subscriptionPlan,
          thermometerIncluded: thermometer,
        })
        console.log(
          'Subscription created successfully:',
          subscriptionResult.subscription.id,
        )
        res.status(200).send({
          success: true,
          message: 'Subscription and payment successful!',
        })
      }
    }
  } catch (error) {
    console.error('Error processing subscription:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
