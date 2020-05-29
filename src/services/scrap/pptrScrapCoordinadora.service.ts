// Third-party libs
import puppeteer from 'puppeteer'
// Constants
import * as guideConstants from '@constants/scrap.constants'
// Utils
import PuppeteerWrapper from '@util/puppeteerWrapper'

interface StatusLog {
  status: string
  aditionalInfo: string
  date: {
    day: number
    month: string
    year: string
  }
}

interface Guide {
  guide: string
  origin: string
  destination: string
  status: string
  lastStatusDate: string
  statusesLog: StatusLog[]
}

class PupperteerScrapCoordinadora {
  private puppeteerWrapper: PuppeteerWrapper
  private page: puppeteer.Page

  constructor (private guideNumbers: string[]) {
    this.puppeteerWrapper = new PuppeteerWrapper()
  }

  private async initPuppeteer () {
    ;({ page: this.page } = await this.puppeteerWrapper.startBrowser())
  }

  private cssNumericSelectorOnUnicode (prefix: string, selector: string) {
    const selectorWithoutFirstNumber = selector
      .split('')
      .slice(1)
      .join('')
    const unicodeSelector = `${prefix}\\3${selector[0]} ${selectorWithoutFirstNumber}`

    return unicodeSelector
  }

  private resultTableSelector (row: number, guideId = '') {
    return guideId
      ? `${this.cssNumericSelectorOnUnicode(
          '#',
          guideId
        )} .guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
      : `.guia-data.dot1 > table > tbody > tr:nth-child(${row}) > td.guia-val`
  }

  private getResultFromTable (resultsTableSelector: string) {
    return this.page.$eval(resultsTableSelector, e => e.innerHTML)
  }

  private async trackGuides () {
    await this.puppeteerWrapper.goTo(guideConstants.COORDINADORA_TRACKING_URL)
    await this.page.focus(guideConstants.GUIDES_TEXTBOX)
    for (const guide of this.guideNumbers) {
      await this.page.type(guideConstants.GUIDES_TEXTBOX, guide)
      await this.page.keyboard.press('Enter')
    }
    await this.puppeteerWrapper.clickSubmitButtonAndWait(
      guideConstants.TRACK_GUIDE_BTN
    )
  }

  private async anyTrackedGuideExists () {
    const elements = await this.puppeteerWrapper.getElementByText(
      guideConstants.GUIDE_NOT_FOUND_STRING,
      'div'
    )

    return !(elements.length > 0)
  }

  private getOldStatusesInfo (
    divs: HTMLElement[],
    guideConstants: { [key: string]: any }
  ): StatusLog[] {
    // This function needs to be here due to puppeteer
    // https://stackoverflow.com/questions/47304665/how-to-pass-a-function-in-puppeteers-evaluate-method
    const getElementInnerText = (element: HTMLElement, cssSelector: string) => {
      try {
        return (element.querySelector(cssSelector) as HTMLElement).innerText
      } catch (error) {
        return ''
      }
    }

    return divs.map(div => ({
      status: getElementInnerText(div, guideConstants.GUIDE_STATUS),
      aditionalInfo: getElementInnerText(
        div,
        guideConstants.GUIDE_ADITIONAL_INFO
      ),
      date: {
        day: parseInt(
          getElementInnerText(div, guideConstants.GUIDE_DATE_DAY),
          10
        ),
        month: getElementInnerText(div, guideConstants.GUIDE_DATE_MONTH),
        year: getElementInnerText(div, guideConstants.GUIDE_DATE_YEAR)
      }
    }))
  }

  private async scrapGuide (guideNumber = '') {
    const origin = await this.getResultFromTable(
      this.resultTableSelector(1, guideNumber)
    )
    const destination = await this.getResultFromTable(
      this.resultTableSelector(2, guideNumber)
    )
    const status = await this.getResultFromTable(
      this.resultTableSelector(3, guideNumber)
    )
    const lastStatusDate = await this.getResultFromTable(
      this.resultTableSelector(4, guideNumber)
    )

    const guideStatusesSelector = guideNumber
      ? `${this.cssNumericSelectorOnUnicode('#', guideNumber)} ${
          guideConstants.GUIDE_STATUSES
        }`
      : guideConstants.GUIDE_STATUSES

    const statusesLog = await this.page.$$eval(
      guideStatusesSelector,
      this.getOldStatusesInfo,
      guideConstants
    )

    return {
      guide: guideNumber || this.guideNumbers[0],
      origin,
      destination,
      status,
      lastStatusDate,
      statusesLog
    }
  }

  public async scrap (): Promise<Guide[]> {
    const guides = []

    await this.initPuppeteer()
    await this.trackGuides()

    if (await this.anyTrackedGuideExists()) {
      if (this.guideNumbers.length <= 1) {
        guides.push(await this.scrapGuide())
      } else {
        for (const guide of this.guideNumbers) {
          guides.push(await this.scrapGuide(guide))
        }
      }
    }
    await this.puppeteerWrapper.close()

    return guides
  }
}

export default PupperteerScrapCoordinadora
