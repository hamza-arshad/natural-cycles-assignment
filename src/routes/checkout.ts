import gateway from '../config/gatewayConfig'
import Payment from '../models/paymentModel'
import { Request, Response } from 'express'

const express = require('express')
const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  const nonceFromTheClient = req.body?.paymentMethodNonce;
  const subscriptionPlan = req.body?.subscriptionPlan; // 'monthly' or 'yearly'
  const thermometer = req.body?.thermometerIncluded;

  // Determine the plan ID based on user selection
  const planId = subscriptionPlan === 'yearly' ? 'YEARLY' : 'MONTHLY';
  const addOns = thermometer ? [{ inheritedFromId: '1', quantity: 1 }] : [];

  try {
    // Create customer
    const customerResult = await gateway.customer.create({
      email: req.session.userEmail,
      paymentMethodNonce: nonceFromTheClient,
    });

    if (!customerResult.success) {
      throw new Error(`Failed to create customer: ${customerResult.message}`);
    }

    const paymentMethodToken = customerResult.customer.paymentMethods?.[0]?.token ?? '';
    if (!paymentMethodToken) {
      throw new Error('No payment method token received.');
    }

    const paymentMethodResult = await gateway.paymentMethod.find(paymentMethodToken);

    if (!paymentMethodResult) {
      throw new Error('Payment method is invalid or not found.');
    }

    // Create subscription
    const subscriptionResult = await gateway.subscription.create({
      paymentMethodToken,
      planId,
      addOns: { add: addOns },
    });

    if (!subscriptionResult.success) {
      throw new Error(`Failed to create subscription: ${subscriptionResult.message}`);
    }

    await Payment.create({
      email: req.session.userEmail,
      customerId: customerResult.customer.id,
      subscriptionId: subscriptionResult.subscription.id,
      subscriptionType: subscriptionPlan,
      thermometerIncluded: thermometer,
    });

    res.status(200).send({
      success: true,
      message: 'Subscription and payment successful!',
    });

  } catch (error: any) {
    // Handle errors with detailed logging and client response
    console.error('Error processing subscription:', error.message || error);
    res.status(500).send({
      success: false,
      message: 'Internal Server Error. Please try again later.',
      error: error.message || 'An unknown error occurred.',
    });
  }
});

module.exports = router
