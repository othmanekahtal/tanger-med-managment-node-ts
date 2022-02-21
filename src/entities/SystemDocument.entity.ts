import {Document, Types} from 'mongoose'
export interface SystemDocument extends System, Document {
  _id: Types.ObjectId
}
