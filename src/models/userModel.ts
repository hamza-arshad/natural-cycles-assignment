import { Schema, model } from 'mongoose'

// Define the user schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
})

// Create and export the user model
const User = model('User', UserSchema)
export default User
