
import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', // Links back to the conversation metadata
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Optional: add status (e.g., sent, delivered, read)
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  }
}, {
  timestamps: true // Automatically adds createdAt
});

// Create a compound index for highly efficient message retrieval and sorting
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
