import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  role: { type: String, enum: ['admin', 'moderator', 'guest'], default: 'guest' },
  speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  listeners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, required: true },
}, { timestamps: true })

const Room = mongoose.model('Room', roomSchema)
export default Room
