import {Schema} from 'mongoose'
import {SystemDocument} from '@entities/SystemDocument.entity'
// we need to getting schema class in mongoose:
export default new Schema<SystemDocument>({
  name: {
    type: String,
    required: [true, 'An system must have a name'],
    trim: true,
    maxlength: [40, 'name must have less or equal then 40 characters'],
    minlength: [6, 'name must have more or equal then 10 characters'],
  },
  description: {
    type: String,
    required: [true, 'system must have a description'],
    trim: true,
  },
  storageDeadLine: {
    required: [true, 'system must have a storageDeadLine'],
    type: Number,
  },
  lateShippingFee: {
    type: Number,
    required: [true, 'system must have a lateShippingFee'],
  },
  capacityPerQuais: {
    type: Number,
    required: [true, 'system must have a capacityPerQuais'],
  },
  quaisFeePerDay: {
    type: Number,
    required: [true, 'system must have a quaisFeePerDay'],
  },
  updatedAt: Date,

  createdAt: {
    type: Date,
  },
})
