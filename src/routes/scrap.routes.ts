import { Router } from 'express'
// Controllers (route handlers)
import * as scrapController from '@controllers/scrap'
// Handlers
import { catchAsyncErrors } from '@handlers/errorHandlers'

const router = Router()

router.get('/', scrapController.index)
router.get('/track-guides', catchAsyncErrors(scrapController.trackGuides))

export default router
