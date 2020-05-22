import { Request, Response, NextFunction } from 'express'
import puppeteer from 'puppeteer'
// Utils
import PuppeteerWrapper from '@util/puppeteerWrapper'
// Execptions
import GuideBadRequestException from '@exceptions/guideBadRequest.exception'

/**
 * GET /
 * Scrap page.
 */
export const index = (req: Request, res: Response) => {
  res.render('scrap', {
    title: 'Scrap'
  })
}

export const scrapCoordinadora = async (req: Request, res: Response, next: NextFunction) => {
  const guidesToTrackString = (req.query.guides as string) || ''
  const guidesToTrack = guidesToTrackString.split(',')

  if (guidesToTrack) {
    const COORDINADORA_TRACKING_URL = 'https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/'
    const TRACK_GUIDE_BTN = '#frm_consultar_guia > div > button'
    const GUIDES_TEXTBOX = '#coor_guia'
    const GUIDE_STATUSES = '.estado_guia'
    const RESULTS_TABLE = (row: number) => `div.guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
    const getResultFromTable = (row: number, page: puppeteer.Page) => page.$eval(RESULTS_TABLE(row), e => e.innerHTML)

    /* **** Puppeteer init ************************************************/
    const puppeteerWrapper = new PuppeteerWrapper()
    const { page } = await puppeteerWrapper.startBrowser()

    /* **** Puppeteer track guides on coordinadora **********************************/
    await puppeteerWrapper.goTo(COORDINADORA_TRACKING_URL)
    await page.focus(GUIDES_TEXTBOX)
    for (const guide of guidesToTrack) {
      await page.type(GUIDES_TEXTBOX, guide)
      await page.keyboard.press('Enter')
    }
    await puppeteerWrapper.clickSubmitButtonAndWait(TRACK_GUIDE_BTN)

    /* **** Puppeteer retrieve information from coordinadora **********************************/

    // const elements = await puppeteerWrapper.getElementByText('Guia no localizada', 'div')
    // console.log('scrapCoordinadora -> elements 🦒🦒🦒', elements.length)
    // await elements[0].screenshot({ path: '/images/gatoGatil.png' })

    const origin = await getResultFromTable(1, page)
    const destination = await getResultFromTable(2, page)
    const status = await getResultFromTable(3, page)
    const lastStatusDate = await getResultFromTable(4, page)
    const guideStatuses = await page.$$eval(GUIDE_STATUSES, divs => divs.map((div: HTMLElement) => div.innerText))

    await puppeteerWrapper.close()

    res.json({
      origin,
      destination,
      status,
      lastStatusDate,
      guideStatuses
    })
  } else {
    next(new GuideBadRequestException())
  }
}
