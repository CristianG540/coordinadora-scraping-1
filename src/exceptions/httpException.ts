// more info about parameter property: https://stackoverflow.com/a/48571668/1630756
// more ingo about handling errors on js: https://wanago.io/2018/11/12/handling-errors-in-javascript-with-try-catch-and-finally/
class HttpException extends Error {
  constructor (
    public status: number,
    public message: string
  ) {
    super(message)
    this.name = '🦊HttpException'
  }
}

export default HttpException
