import { Schema, model } from 'mongoose'

// Define the payment schema
const PaymentSchema = new Schema(
  {
    email: { type: String, required: true, ref: 'User' }, // Reference to User model
    customerId: { type: String, required: true }, // Braintree customer ID
    subscriptionId: { type: String, required: true }, // Braintree subscription ID
    subscriptionType: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    }, // Type of subscription
    thermometerIncluded: { type: Boolean, default: false }, // Whether thermometer was included
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
)

// Create and export the payment model
const Payment = model('Payment', PaymentSchema)
export default Payment
