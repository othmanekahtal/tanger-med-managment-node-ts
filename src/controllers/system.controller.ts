import {Response, Request, NextFunction} from 'express'
import ErrorHandler from '@utils/errorHandler'
import asyncCatch from '@utils/asyncCatch'
import {
  getSystemDocument,
  updateSystem as updateSystemService,
} from '@services/index.service'

export const showSystemInfo = asyncCatch(
  async (req: Request, res: Response, _: NextFunction) => {
    const {user} = req.body
    const infoSystem = await getSystemDocument()
    if (!infoSystem) {
      return res.json(200).json({
        message:
          user.role != 'superAdmin'
            ? 'not information yeat!'
            : 'not information yeat add it into /api/v1/system',
        status: 'sucess',
      })
    }
    return res.json(200).json({
      status: 'sucess',
      data: infoSystem,
    })
  },
)

export const updateSystem = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body
    data.user = data.createdAt = data.updatedAt = undefined
    let system = await getSystemDocument()
    if (!system) {
      return next(
        new ErrorHandler({
          message: 'system not initialize yeat!',
          statusCode: 404,
        }),
      )
    }
    const document = {...system, ...data}
    document.updatedAt = new Date(Date.now() + 1)
    const newSystem = await updateSystemService(document)
    res.status(201).json({
      data: newSystem,
      status: 'success',
    })
  },
)
