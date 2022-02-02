import {Types} from 'mongoose'
import {Response, Request, NextFunction, CookieOptions} from 'express'
import AsyncCatch from '@utils/asyncCatch'
import userModel from '@models/userModel'
import jwt, {JwtPayload} from 'jsonwebtoken'
import ErrorHandler from '@utils/errorHandler'
import mail from '@utils/mail'
import crypto from 'crypto'
const generateToken = (id: Types.ObjectId) =>
  jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
const sendTokenResponse = (
  response: Response,
  user: userModel,
  statusCode: number,
) => {
  user.password = undefined
  const token = generateToken(user.id)
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  response.cookie('jwt', token, cookieOptions)
  return response.status(statusCode).json({
    status: 'success',
    token,
    user,
  })
}
exports.login = AsyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body
    if (!email || !password)
      return next(
        new ErrorHandler({
          message: 'provide email and password !',
          statusCode: 400,
        }),
      )
    let response = await userModel.findOne({email})?.select('+password')
    const passwordsMatch = await response?.correctPassword({
      candidatePassword: response.password,
      userPassword: password,
    })
    response && passwordsMatch && sendTokenResponse(res, response, 200)

    next(
      new ErrorHandler({
        message: 'password or email is not correct',
        statusCode: 401,
      }),
    )
  },
)

exports.signup = AsyncCatch(async (req: Request, res: Response) => {
  const user = req.body
  user.role = undefined
  let response = await userModel.create(user)
  sendTokenResponse(res, response, 201)
})

exports.protect = AsyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    /// we need to verify tree layer : token,verification token,check if user is exists ,check if user change password after the token was issued
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ').at(-1)
    }
    if (!token) {
      next(
        new ErrorHandler({message: "You're not authorized !", statusCode: 401}),
      )
    }
    const decodedToken: JwtPayload = jwt.verify(
      token as string,
      process.env.JWT_SECRET,
    ) as JwtPayload
    const userFresh = await userModel.findById(decodedToken.id)
    if (!userFresh)
      next(
        new ErrorHandler({
          message: 'The user belonging to this token does no longer exist.',
          statusCode: 401,
        }),
      )
    if (!userFresh.changedAfter({date: decodedToken.iat})) {
      next(
        new ErrorHandler({
          message: 'You changed password , you need to login again!',
          statusCode: 401,
        }),
      )
    }
    // TODO:
    req.body.user = userFresh
    next()
  },
)
exports.onlyFor =
  (...roles: Array<string | any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.user.role)) {
      return next(
        new ErrorHandler({
          message: 'You do not have permission to perform this action',
          statusCode: 403,
        }),
      )
    }
    next()
  }
exports.forgotPassword = AsyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get user based on POSTed email
    const email = req.body.email
    const user = await userModel.findOne({email})
    if (!user)
      return next(
        new ErrorHandler({
          message: 'There is no user with email address',
          statusCode: 404,
        }),
      )
    // 2-generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave: false})
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/reset-password/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
    try {
      await mail({
        email,
        subject: 'activate your account',
        message,
      })
      res.status(200).json({status: 'success', message: 'check your email'})
    } catch (error) {
      user.resetTokenExpiration = user.resetToken = undefined
      await user.save({validateBeforeSave: false})
      return next(
        new ErrorHandler({
          message: 'email not send try later!',
          statusCode: 500,
        }),
      )
    }
  },
)
exports.resetPassword = AsyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {token} = req.params
    const {password, confirmPassword} = req.body
    ;(!password || !confirmPassword) &&
      next(
        new ErrorHandler({
          message: 'Please provide password and password confirmation',
          statusCode: 400,
        }),
      )
    // encrypt token and check if exist or not
    const encryptedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
    console.log(encryptedToken)
    let user = await userModel.findOne({
      resetToken: encryptedToken,
      resetTokenExpiration: {$gt: Date.now()},
    })
    if (!user) {
      next(
        new ErrorHandler({
          message: 'token is invalid or expired',
          statusCode: 400,
        }),
      )
    }
    user.resetToken = user.resetTokenExpiration = undefined
    user.updatePasswordAt = Date.now()
    user.password = password
    user.confirmPassword = confirmPassword
    await user.save()
    sendTokenResponse(res, user, 200)
  },
)
exports.updatePassword = AsyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    const {
      body: {
        password,
        confirmPassword,
        passwordCurrent,
        user: {id},
      },
    } = req
    const user = await userModel.findById(id).select('+password')
    if (
      !(await user.correctPassword({
        candidatePassword: user.password,
        userPassword: passwordCurrent,
      }))
    ) {
      return next(
        new ErrorHandler({
          message: 'Your current password is wrong.',
          statusCode: 401,
        }),
      )
    }
    user.updatePasswordAt = Date.now()
    user.password = password
    user.confirmPassword = confirmPassword
    await user.save()
    sendTokenResponse(res, user, 200)
  },
)
