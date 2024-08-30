import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoURI = process.env.MONGO_URI ?? ''

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}
