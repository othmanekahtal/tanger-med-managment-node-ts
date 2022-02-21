import {
  showSystemInfo,
  updateSystem,
  protect,
  onlyFor,
  initSystem,
} from '@controllers/index.controller'
import express from 'express'
const router = express.Router()
router
  .route('/')
  .get(protect, showSystemInfo)
  .patch(protect, onlyFor('superAdmin'), updateSystem)
  .post(protect, onlyFor('superAdmin'), initSystem)
export default router
