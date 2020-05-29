import { Request, Response, NextFunction } from 'express'
// Services
import PupperteerScrapCoordinadora from '@services/scrap/pptrScrapCoordinadora.service'
// Exceptions
import {
  GuideNotFoundException,
  GuideBadRequestException
} from '@exceptions/index'

/**
 * GET /
 * Scrap page.
 */
export const index = (req: Request, res: Response) => {
  res.render('scrap', {
    title: 'Scrap'
  })
}

export const trackGuides = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const guidesToTrackString = (req.query.guides as string) || ''
  const guidesToTrack = guidesToTrackString.split(',')
  const pptrScrapCoordinadoraService = new PupperteerScrapCoordinadora(
    guidesToTrack
  )

  const guides = await pptrScrapCoordinadoraService.scrap()

  if (guidesToTrack) {
    if (guides.length <= 0) {
      next(new GuideNotFoundException(guidesToTrackString))
    } else {
      res.json(guides)
    }
  } else {
    next(new GuideBadRequestException())
  }
}
