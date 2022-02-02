import ErrorHandler from './../utils/errorHandler'
import {Response, Request, NextFunction} from 'express'
const errorDev = (error: ErrorHandler, res: Response) =>
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  })

const errorProd = (error: ErrorHandler, res: Response) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    })
  }
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  })
}
export default (
  error: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  error.statusCode ||= 500
  error.status ||= 'error'
  if (process.env.NODE_ENV === 'development') {
    errorDev(error, res)
  } else if (process.env.NODE_ENV === 'production') {
    let err: ErrorHttp = {
      ...error,
      path: error.path,
      name: error.name,
      message: error.message,
    }
    if (err.name === 'CastError') {
      err = new ErrorHandler({
        message: `invalid ${err.path}:${err.value}`,
        statusCode: 400,
      })
    }
    // to identify errors happens in duplicate unique field code = 11000
    if (err.code === 11000) {
      err = new ErrorHandler({
        message:
          Object.entries(err.keyValue).length === 1
            ? `The field with name '${Object.entries(err.keyValue)
                .map(el => `${el[0]} : ${el[1]}`)
                .join(' | ')}' is duplicated `
            : `The fields with names '${Object.entries(err.keyValue)
                .map(el => `${el[0]} : ${el[1]}`)
                .join(' | ')}' are duplicated `,
        statusCode: 400,
      })
    }
    if (err.name === 'ValidationError') {
      const errors = err.errors
      const message = Object.entries(errors)
        .map(el => `${el[0]}:${el[1].message}`)
        .join(' & ')
      err = new ErrorHandler({
        statusCode: 400,
        message,
      })
    }
    if (err.name === 'JsonWebTokenError') {
      err = new ErrorHandler({
        statusCode: 401,
        message: 'You are not authorized !',
      })
    }
    errorProd(err, res)
  }
}
