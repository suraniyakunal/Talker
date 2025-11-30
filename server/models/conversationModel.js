
import mongoose, { Schema } from 'mongoose'

const conversationSchema = new Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  groupName: { // Optional: for group chats
    type: String,
    trim: true,
  },
  lastMessage: { // Denormalization for easy access to the latest message snippet
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true // Manages createdAt and updatedAt
})

// Index participants for fast lookups by user ID
conversationSchema.index({ participants: 1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation

