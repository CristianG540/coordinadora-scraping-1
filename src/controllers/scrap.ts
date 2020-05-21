import { Request, Response } from 'express'
import puppeteer from 'puppeteer'

/**
 * GET /
 * Scrap page.
 */
export const index = (req: Request, res: Response) => {
  res.render('scrap', {
    title: 'Scrap'
  })
}

export const scrapCoordinadora = async (req: Request, res: Response) => {
  const guideToTrack = req.params.guide || ''

  if (guideToTrack) {
    const COORDINADORA_TRACKING_URL = 'https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/'
    const TRACK_GUIDE_BTN = '#frm_consultar_guia > div > button'
    const GUIDES_TEXTBOX = '#coor_guia'
    const GUIDE_STATUSES = '.estado_guia'
    const RESULTS_TABLE = (row: number) => `div.guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
    const getResult = (row: number, page: puppeteer.Page) => page.$eval(RESULTS_TABLE(row), e => e.innerHTML)

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    /**
     * networkidle0 comes handy for SPAs that load resources with fetch requests.
     * networkidle2 comes handy for pages that do long-polling or any other side activity.
     */
    await page.goto(COORDINADORA_TRACKING_URL, { waitUntil: 'networkidle2' })
    await page.focus(GUIDES_TEXTBOX)
    await page.type(GUIDES_TEXTBOX, guideToTrack)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }), // The promise resolves after navigation has finished
      page.click(TRACK_GUIDE_BTN) // Clicking the link will indirectly cause a navigation
    ])

    const origin = await getResult(1, page)
    const destination = await getResult(2, page)
    const status = await getResult(3, page)
    const lastStatusDate = await getResult(4, page)
    const guideStatuses = await page.$$eval(GUIDE_STATUSES, divs => divs.map((div: HTMLElement) => div.innerText))

    res.json({
      origin,
      destination,
      status,
      lastStatusDate,
      guideStatuses
    })
  } else {
    // next(new HttpException(404, 'Post not found'));
    res.status(404).json({ error: 'you need to provide a guide number' })
  }
}
