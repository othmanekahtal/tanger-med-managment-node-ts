import {
  signup,
  protect,
  login,
  forgotPassword,
  updatePassword,
  resetPassword,
  logout,
} from '@controllers/index.controller'
import express, {NextFunction, Request, Response} from 'express'
const router = express.Router()
router
  .route('/init-super')
  .post(async (req: Request, res: Response, next: NextFunction) => {
    console.log('user')
    req.body['role'] = 'superAdmin'
    // console.log(req.body)
    next()
  }, signup)
router.route('/login').post(login)
router.route('/forget-password').post(forgotPassword)
// we use patch because we need to change some fields
router.route('/reset-password/:token').patch(resetPassword)
router.route('/update-password').patch(protect, updatePassword)
router.route('/logout').delete(protect, logout)
export default router
