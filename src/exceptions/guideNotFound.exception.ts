import createError from 'http-errors'

class GuideNotFoundException extends createError.NotFound {
  constructor (
    ids: string
  ) {
    super(`We couldn't find the guide or guides you entered: ${ids}`)
  }
}

export default GuideNotFoundException
