import {SystemDocument} from '@entities/SystemDocument.entity'
import systemModel from '@models/system.model'
import {QueryOptions} from 'mongoose'

export const getSystemDocument = async () => await systemModel.findOne({})
export const updateSystem = async (
  document: SystemDocumentDTO,
  options: QueryOptions,
): Promise<SystemDocument | null> => {
  return await systemModel.findOneAndUpdate(
    {},
    {...document, updatedAt: new Date(Date.now())},
    options,
  )
}
export const initSystem = async (data: System) => await systemModel.create(data)
