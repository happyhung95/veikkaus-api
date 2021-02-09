import mongoose, { Document } from 'mongoose'
import { EventDocument, eventSchema } from './Event'

export type AccountDocument = Document & {
  name: string;
  balance: number;
  events: EventDocument[];
  deleted: boolean;
}

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    events: [eventSchema],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model<AccountDocument>('Account', accountSchema)
