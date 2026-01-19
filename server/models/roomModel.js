import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['voiceroom', 'liveroom'], default: 'voiceroom' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    speaker: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    listener: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    participantCount: { type: Number, default: 1 },
    description: { type: String, required: true },
    isPrivate: { type: Boolean, default: false }
  },
  { timestamps: true }
);

roomSchema.index({ createdAt: -1 })
const Room = mongoose.model('Room', roomSchema);
export default Room;
