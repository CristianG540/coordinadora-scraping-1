import puppeteer from 'puppeteer'

class PuppeteerWrapper {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  async startBrowser () {
    this.browser = await puppeteer.launch({ headless: false })
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
    await this.page.goto(pageUrlToScrap, { waitUntil: 'networkidle2' })
  }

  async clickSubmitButtonAndWait (buttonSelector: string) {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2' }), // The promise resolves after navigation has finished
      this.page.click(buttonSelector) // Clicking the button/link will indirectly cause a navigation
    ])
  }

  async getElementByText (text: string, element: string) {
    return await this.page.$x(`//${element}[contains(., '${text}')]`)
  }
}

export default PuppeteerWrapper
