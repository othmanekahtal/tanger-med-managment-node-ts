import userSchema from '@schemas/user.schema'
const mongoose = require('mongoose')

userSchema.pre('save', hashPassword)
userSchema.pre(/^find/, willBeActive)
userSchema.methods.correctPassword = correctPassword
userSchema.methods.changedAfter = changedAfter
userSchema.methods.createPasswordResetToken = createPasswordResetToken // error happens when we import function in another file
export default mongoose.model('user', userSchema)
