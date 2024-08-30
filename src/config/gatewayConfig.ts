import braintree from 'braintree'
import dotenv from 'dotenv'

dotenv.config()

// Create a single instance of BraintreeGateway
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID as string,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY as string,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY as string,
})

export default gateway
