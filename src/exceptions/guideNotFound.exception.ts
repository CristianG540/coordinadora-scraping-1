import createError from 'http-errors'

class GuideNotFoundException extends createError.NotFound {
  constructor (
    id: number
  ) {
    super(`Guide with number ${id} not found`)
  }
}

export default GuideNotFoundException
