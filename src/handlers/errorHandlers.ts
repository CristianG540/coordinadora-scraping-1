import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
// Exceptions
import HttpException from '@exceptions/httpException'

interface ControllerFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>
}

/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/
export const catchErrors = (fn: ControllerFunction) => {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch(next)
  }
}

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
  In Express, 404 responses are not the result of an error, so the error-handler middleware will not capture them.
  This behavior is because a 404 response simply indicates the absence of additional work to do; in other words,
  Express has executed all middleware functions and routes, and found that none of them responded.
  All you need to do is add a middleware function at the very bottom of the stack (below all other functions)
  to handle a 404 response.
  more info about this here: http://i.imgur.com/X4pLH7H.png
*/
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  // const err = new HttpException(404, 'Not Found')
  // next(err)
  console.log('errorHandler -> notFound 🦄🦄🦄')
  next(createError(404))
}

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error,
  we can show good info on what happened
*/
export const developmentErrors = (err: HttpException, req: Request, res: Response, _next: NextFunction) => {
  console.log('errorHandler -> developmentErrors 🐽🐽🐽')

  err.stack = err.stack || ''
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  }
  res.status(err.status || 500)
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails)
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  })
}

/*
  Production Error Handler

  No stacktraces are leaked to user
*/
export const productionErrors = (err: HttpException, req: Request, res: Response, _next: NextFunction) => {
  console.log('errorHandler -> productionErrors 🐀🐀🐀')
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
}
