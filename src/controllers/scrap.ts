import { Request, Response, NextFunction } from 'express'
import puppeteer from 'puppeteer'
// Utils
import PuppeteerWrapper from '@util/puppeteerWrapper'
// Execptions
import { GuideNotFoundException, GuideBadRequestException } from '@exceptions/index'

/**
 * GET /
 * Scrap page.
 */
export const index = (req: Request, res: Response) => {
  res.render('scrap', {
    title: 'Scrap'
  })
}

export const trackGuides = async (req: Request, res: Response, next: NextFunction) => {
  const guidesToTrackString = (req.query.guides as string) || ''
  const guidesToTrack = guidesToTrackString.split(',')

  if (guidesToTrack) {
    const COORDINADORA_TRACKING_URL = 'https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/'
    const TRACK_GUIDE_BTN = '#frm_consultar_guia > div > button'
    const GUIDES_TEXTBOX = '#coor_guia'
    const GUIDE_STATUSES = '.estado_guia'
    const GUIDE_NOT_FOUND_STRING = 'Guia no localizada'

    const cssNumericSelectorOnUnicode = (prefix: string, selector: string) => {
      const selectorWithoutFirstNumber = selector.split('').slice(1).join('')
      const unicodeSelector = `${prefix}\\3${selector[0]} ${selectorWithoutFirstNumber}`

      return unicodeSelector
    }
    const resultTableSelector = (row: number, guideId = '') => {
      return (guideId)
        ? `${cssNumericSelectorOnUnicode('#', guideId)} .guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
        : `.guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
    }
    const getResultFromTable = (page: puppeteer.Page, resultsTableSelector: string) => page.$eval(resultsTableSelector, e => e.innerHTML)

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

    /* **** Puppeteer Checks if the guides exists or not **********************************/
    const elements = await puppeteerWrapper.getElementByText(GUIDE_NOT_FOUND_STRING, 'div')
    if (elements.length > 0) {
      next(new GuideNotFoundException(guidesToTrackString))
    }

    /* **** Puppeteer retrieve information from coordinadora **********************************/

    if (guidesToTrack.length <= 1) {
      const origin = await getResultFromTable(page, resultTableSelector(1))
      const destination = await getResultFromTable(page, resultTableSelector(2))
      const status = await getResultFromTable(page, resultTableSelector(3))
      const lastStatusDate = await getResultFromTable(page, resultTableSelector(4))
      const guideStatuses = await page.$$eval(GUIDE_STATUSES, divs => divs.map((div: HTMLElement) => {
        const getElementInnerText = (element: HTMLElement, cssSelector: string) => {
          try {
            return (element.querySelector(cssSelector) as HTMLElement).innerText
          } catch (error) {
            return ''
          }
        }

        return {
          status: getElementInnerText(div, '.desc-estado'),
          aditionalInfo: getElementInnerText(div, '.panel > .panel-body'),
          date: {
            day: getElementInnerText(div, '.desc-date > .dateNumbers'),
            month: getElementInnerText(div, '.desc-date > .dateChars > .dateCharsMonth'),
            year: getElementInnerText(div, '.desc-date > .dateChars > .dateCharsYear')
          }
        }
      }))

      await puppeteerWrapper.close()

      res.json({
        guide: guidesToTrack[0],
        origin,
        destination,
        status,
        lastStatusDate,
        guideStatuses
      })
    } else {
      const guidesData = []

      for (const guide of guidesToTrack) {
        const origin = await getResultFromTable(page, resultTableSelector(1, guide))
        const destination = await getResultFromTable(page, resultTableSelector(2, guide))
        const status = await getResultFromTable(page, resultTableSelector(3, guide))
        const lastStatusDate = await getResultFromTable(page, resultTableSelector(4, guide))
        const guideStatuses = await page.$$eval(`${cssNumericSelectorOnUnicode('#', guide)} ${GUIDE_STATUSES}`, divs => divs.map((div: HTMLElement) => {
          const getElementInnerText = (element: HTMLElement, cssSelector: string) => {
            try {
              return (element.querySelector(cssSelector) as HTMLElement).innerText
            } catch (error) {
              return ''
            }
          }

          return {
            status: getElementInnerText(div, '.desc-estado'),
            aditionalInfo: getElementInnerText(div, '.panel > .panel-body'),
            date: {
              day: getElementInnerText(div, '.desc-date > .dateNumbers'),
              month: getElementInnerText(div, '.desc-date > .dateChars > .dateCharsMonth'),
              year: getElementInnerText(div, '.desc-date > .dateChars > .dateCharsYear')
            }
          }
        }))

        guidesData.push({
          guide,
          origin,
          destination,
          status,
          lastStatusDate,
          guideStatuses
        })
      }

      await puppeteerWrapper.close()

      res.json(guidesData)
    }
  } else {
    next(new GuideBadRequestException())
  }
}
