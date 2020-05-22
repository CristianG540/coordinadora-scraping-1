import createError from 'http-errors'

class GuideBadRequestException extends createError.BadRequest {
  constructor () {
    super('You need to specify a guide to search')
  }
}

export default GuideBadRequestException
