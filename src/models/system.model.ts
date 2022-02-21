import systemSchema from '@schemas/system.schema'
import mongoose from 'mongoose'
import {SystemDocument} from '@entities/SystemDocument.entity'
export default mongoose.model<SystemDocument>('system', systemSchema)
