import {
  showSystemInfo,
  updateSystem,
  protect,
  onlyFor,
} from '@controllers/index.controller'
import express from 'express'
const router = express.Router()
router
  .route('/')
  .get(protect, showSystemInfo)
  .patch(protect, onlyFor(['superAdmin']), updateSystem)
export default router
