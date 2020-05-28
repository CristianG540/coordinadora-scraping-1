import { Router } from 'express'
// Controllers (route handlers)
import * as scrapController from '@controllers/scrap.controller'
// Handlers
import { catchAsyncErrors } from '@handlers/error.handler'

const router = Router()

router.get('/', scrapController.index)
router.get('/track-guides', catchAsyncErrors(scrapController.trackGuides))

export default router
