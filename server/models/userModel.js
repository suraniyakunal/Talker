import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Normal', 'Moderator', 'Vip'],
    default: 'Normal'
  },
  timestamps: true
})

const User = mongoose.model(userSchema)

export default User
