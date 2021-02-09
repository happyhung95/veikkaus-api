import mongoose, { Document } from 'mongoose'

export type EventDocument = Document & {
  timeStamp: string;
  accountId: string;
  eventId: string;
  transactionType: string;
  amount: number;
}

export const eventSchema = new mongoose.Schema(
  {
    timeStamp: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    transactionType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model<EventDocument>('Event', eventSchema)
