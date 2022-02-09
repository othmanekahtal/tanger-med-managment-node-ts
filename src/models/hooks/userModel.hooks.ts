import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import slugify from 'slugify'
import {NextFunction} from 'express'
exports.find = function (next: NextFunction) {
  this.find({secretTour: {$ne: true}})
  next()
}
exports.slug = function (next: NextFunction) {
  this.slug = slugify(this.name, {
    lower: true,
  })
  next()
}
// before aggregate, we need to execute all VIP or secret tours
exports.aggregate = function (next: NextFunction) {
  // to get all pipeline here
  console.log(this.pipeline())
  this.pipeline().unshift({
    $match: {
      secretTour: {$ne: true},
    },
  })
  next()
}
exports.hashPassword = async function (next: NextFunction) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.confirmPassword = undefined
  next()
}
exports.correctPassword = async ({
  candidatePassword,
  userPassword,
}: {
  candidatePassword: string
  userPassword: string
}): Promise<boolean> => await bcrypt.compare(userPassword, candidatePassword)

exports.changedAfter = async ({date}: {date: number}): Promise<boolean> => {
  if (this.updatePasswordAt) {
    const parsedDate = this.updatePasswordAt.getTime() / 1000
    return parsedDate > date
  }
  return false
}
exports.createPasswordResetToken = function () {
  const resetTokenUser = crypto.randomBytes(32).toString('hex')
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetTokenUser)
    .digest('hex')
  this.resetTokenExpiration = Date.now() + 10 * 60 * 1000
  return resetTokenUser
}
exports.willBeActive = function (next: NextFunction) {
  this.find({active: {$ne: false}})
  next()
}
