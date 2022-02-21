import {Response, Request, NextFunction} from 'express'
import ErrorHandler from '@utils/errorHandler'
import asyncCatch from '@utils/asyncCatch'
import {
  getSystemDocument,
  updateSystem as updateSystemService,
  initSystem as initSystemService,
} from '@services/index.service'

export const showSystemInfo = asyncCatch(
  async (req: Request, res: Response, _: NextFunction) => {
    const {user} = req.body
    const infoSystem = await getSystemDocument()
    if (!infoSystem) {
      return res.status(200).json({
        message:
          user.role != 'superAdmin'
            ? 'not information yeat!'
            : 'not information yeat add it into /api/v1/system',
        status: 'sucess',
      })
    }
    return res.status(200).json({
      status: 'sucess',
      data: infoSystem,
    })
  },
)

export const updateSystem = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: {[x: string]: string | number | Date | undefined} = req.body
    data.user = data.createdAt = data.updatedAt = undefined
    const system = await updateSystemService(
      {...data},
      {runValidators: true, new: true},
    )
    console.log(system)

    if (!system) {
      return next(
        new ErrorHandler({
          message: 'system not initialize yeat!',
          statusCode: 404,
        }),
      )
    }
    res.status(201).json({
      data: system,
      status: 'success',
    })
  },
)
export const initSystem = asyncCatch(
  async (req: Request, res: Response, _: NextFunction) => {
    const data = req.body
    data.user = undefined
    return res.status(201).json({
      status: 'success',
      data: await initSystemService(data),
    })
  },
)
