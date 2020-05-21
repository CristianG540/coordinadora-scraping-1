import { Router } from 'express'

// Controllers (route handlers)
import * as homeController from '@controllers/home'
import * as scrapController from '@controllers/scrap'

const router = Router()

// Home
router.get('/', homeController.index)

// Scrap routes
router.get('/scrap', scrapController.index)
router.get('/scrapCoordinadora/:guide', scrapController.scrapCoordinadora)

export default router
