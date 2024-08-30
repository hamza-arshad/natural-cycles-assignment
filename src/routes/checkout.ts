const express = require('express')
const router = express.Router()
import gateway from '../config/gatewayConfig'
import dotenv from 'dotenv'
import Payment from '../models/paymentModel'

dotenv.config()

router.post('/', async (req: any, res: any) => {
  const nonceFromTheClient = req.body.paymentMethodNonce
  const subscriptionPlan = req.body.subscriptionPlan // 'monthly' or 'yearly'
  const thermometer = req.body.thermometer // 'yes' or 'no'

  // Determine the plan ID based on user selection
  let planId = subscriptionPlan === 'yearly' ? 'YEARLY' : 'MONTHLY'
  let addOns = []

  // Add thermometer as an add-on if selected
  if (thermometer === 'yes') {
    addOns.push({
      inheritedFromId: '1',
      quantity: 1,
    })
  }

  try {
    const paymentInfo = await Payment.findOne({ email: req.session.userEmail })
    if (paymentInfo) {
      const activeSubscription = await gateway.subscription.find(
        paymentInfo.subscriptionId,
      )
      if (activeSubscription.status === 'Active') {
        return res.status(200).send({
          success: false,
          message: 'You already have an active subscription.',
        })
      }
    }

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
          thermometerIncluded: thermometer === 'yes',
        })
        console.log(
          'Subscription created successfully:',
          subscriptionResult.subscription.id,
        )
        res.status(200).send({
          success: true,
          message: 'Subscription and payment successful!',
        })
      } else {
        console.error(
          'Error creating subscription:',
          subscriptionResult.message,
        )
        res
          .status(500)
          .send({ success: false, message: 'Subscription creation failed.' })
      }
    } else {
      console.error('Error creating customer:', customerResult.message)
      res
        .status(500)
        .send({ success: false, message: 'Customer creation failed.' })
    }
  } catch (error) {
    console.error(
      'Error processing subscription or thermometer purchase:',
      error,
    )
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
