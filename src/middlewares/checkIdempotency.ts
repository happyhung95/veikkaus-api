import { Request, Response, NextFunction } from 'express'
import { getSharedIdempotencyService } from 'express-idempotency'

import { InternalServerError, InvalidRequestError } from '../helpers/apiError'

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    if (getSharedIdempotencyService().isHit(req)) {
      // Check if there was a hit, i.e. the cached response with idempotency key has been returned. Stop process here
      return
    } else if (req.method === 'POST' && !req.headers['idempotency-key']) {
      next(new InvalidRequestError('POST requests must have Idempotency-Key in header'))
    } else {
      next()
    }
  } catch (error) {
    next(new InternalServerError('Something went wrong in checking idempotency', error))
  }
}
