import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalMessage extends Document {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  createdAt: Date;
}

const GlobalMessageSchema = new Schema<IGlobalMessage>(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model<IGlobalMessage>('GlobalMessage', GlobalMessageSchema);
