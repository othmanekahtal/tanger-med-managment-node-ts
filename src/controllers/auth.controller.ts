import {Response, Request, NextFunction, CookieOptions} from 'express'
import ErrorHandler from '@utils/errorHandler'
import mail from '@utils/SendEmail'
import crypto from 'crypto'
import jwt, {JwtPayload} from 'jsonwebtoken'
import {UserBaseDocument} from '@entities/UserBaseDocument.entity'
import {Types} from 'mongoose'
import {
  findUser,
  createUser,
  validatePassword,
  findUserById,
  generatePasswordResetToken,
  saveUser,
} from '@services/index.service'
import asyncCatch from '@utils/asyncCatch'
const generateToken = (id: Types.ObjectId) =>
  jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
const sendTokenResponse = ({
  response,
  user,
  statusCode,
}: {
  response: Response
  user: UserBaseDocument
  statusCode: number
}) => {
  // user.password = undefined
  const token = generateToken(user._id)
  // const cookieOptions: CookieOptions = {
  //   expires: new Date(
  //     Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  //   ),
  //   httpOnly: true,
  // }
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  // response.cookie('jwt', token, cookieOptions)
  user.password = undefined
  return response.status(statusCode).json({
    status: 'success',
    token,
    user,
  })
}
export const login = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body
    if (!email || !password)
      return next(
        new ErrorHandler({
          message: 'provide email and password !',
          statusCode: 400,
        }),
      )
    const response: UserBaseDocument | null = await findUser({email})
    if (!response)
      return next(
        new ErrorHandler({
          message: 'password or email is not correct',
          statusCode: 401,
        }),
      )
    const passwordsMatch = await validatePassword({
      document: response,
      userPassword: password,
    })

    if (passwordsMatch)
      return sendTokenResponse({response: res, user: response, statusCode: 200})
    return next(
      new ErrorHandler({
        message: 'password or email is not correct',
        statusCode: 401,
      }),
    )
  },
)

export const signup = asyncCatch(async (req: Request, res: Response) => {
  const user = req.body
  console.log(user)

  const response = await createUser(user)
  sendTokenResponse({response: res, user: response, statusCode: 201})
})

export const protect = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined
    // token = req.cookies['jwt']
    // let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }
    !token &&
      next(
        new ErrorHandler({message: "You're not authorized !", statusCode: 401}),
      )
    const decodedToken: JwtPayload = jwt.verify(
      token as string,
      process.env.JWT_SECRET,
    ) as JwtPayload
    const userFresh: UserBaseDocument | null = await findUserById(
      decodedToken.id,
    )
    if (!userFresh)
      return next(
        new ErrorHandler({
          message: 'The user belonging to this token does no longer exist.',
          statusCode: 401,
        }),
      )

    !userFresh.changedAfter({date: decodedToken.iat}) &&
      next(
        new ErrorHandler({
          message: 'You changed password , you need to login again!',
          statusCode: 401,
        }),
      )

    req.body.user = userFresh
    next()
  },
)
export const onlyFor =
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
export const forgotPassword = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get user based on email
    const email = req.body.email
    const user = await findUser({email})
    if (!user)
      return next(
        new ErrorHandler({
          message: 'There is no user with email address',
          statusCode: 404,
        }),
      )
    // 2-generate the random reset token
    const resetToken = await generatePasswordResetToken(user)
    await saveUser(user, {validateBeforeSave: false})
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
      await saveUser(user, {validateBeforeSave: false})
      return next(
        new ErrorHandler({
          message: 'email not send try later!',
          statusCode: 500,
        }),
      )
    }
  },
)
export const resetPassword = asyncCatch(
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
    const user = await findUser({
      resetToken: encryptedToken,
      resetTokenExpiration: {$gt: Date.now()},
    })
    if (!user) {
      return next(
        new ErrorHandler({
          message: 'token is invalid or expired',
          statusCode: 400,
        }),
      )
    }
    user.resetToken = user.resetTokenExpiration = undefined
    user.updatePasswordAt = new Date(Date.now())
    user.password = password
    user.confirmPassword = confirmPassword
    await saveUser(user)
    sendTokenResponse({response: res, user: user, statusCode: 200})
  },
)
export const updatePassword = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: {
        password,
        confirmPassword,
        passwordCurrent,
        user: {id},
      },
    } = req
    if (!password || !confirmPassword || !passwordCurrent)
      return next(
        new ErrorHandler({
          message:
            'please send necessary fields (password ,confimation of password,new password).',
          statusCode: 401,
        }),
      )
    const user = await findUserById(id)
    console.log(user)
    if (
      !(await user!.correctPassword({
        candidatePassword: passwordCurrent,
        userPassword: user!.password!,
      }))
    ) {
      return next(
        new ErrorHandler({
          message: 'Your current password is wrong.',
          statusCode: 401,
        }),
      )
    }
    user!.updatePasswordAt = new Date(Date.now())
    user!.password = password
    user!.confirmPassword = confirmPassword
    await saveUser(user!)
    sendTokenResponse({response: res, user: user!, statusCode: 200})
  },
)
export const logout = asyncCatch(
  async (_: Request, res: Response, __: NextFunction) => {
    res.cookie('jwt', '', {maxAge: 0})
    res.status(204).json({})
  },
)
export const check = asyncCatch(
  async (req: Request, res: Response, __: NextFunction) => {
    res.status(200).json(req.body.user)
  },
)
