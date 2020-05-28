import { Router } from 'express'
// Routes
import scrap from '@routes/scrap.routes'
// Controllers (route handlers)
import * as homeController from '@controllers/home.controller'

const router = Router()

router.get('/', homeController.index)
router.use('/scrap', scrap)

export default router
