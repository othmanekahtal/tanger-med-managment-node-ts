import {SystemDocument} from '@entities/SystemDocument.entity'
import systemModel from '@models/system.model'
import {QueryOptions} from 'mongoose'

export const getSystemDocument = async () => await systemModel.findOne({})
export const updateSystem = async (
  document: SystemDocument,
  options?: QueryOptions,
): Promise<SystemDocument> => await document.save(options)
