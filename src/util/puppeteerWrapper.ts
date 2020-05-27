import puppeteer from 'puppeteer'

class PuppeteerWrapper {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  async startBrowser () {
    this.browser = await puppeteer.launch({ headless: true })
    this.page = await this.browser.newPage()

    return {
      browser: this.browser,
      page: this.page
    }
  }

  async goTo (pageUrlToScrap: string) {
    /**
     * networkidle0 comes handy for SPAs that load resources with fetch requests.
     * networkidle2 comes handy for pages that do long-polling or any other side activity.
     */
    return await this.page.goto(pageUrlToScrap, { waitUntil: 'networkidle2' })
  }

  async clickSubmitButtonAndWait (buttonSelector: string) {
    return await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2' }), // The promise resolves after navigation has finished
      this.page.click(buttonSelector) // Clicking the button/link will indirectly cause a navigation
    ])
  }

  async getElementByText (text: string, element: string) {
    return await this.page.$x(`//${element}[contains(., '${text}')]`)
  }

  async close () {
    return await this.browser.close()
  }
}

export default PuppeteerWrapper
