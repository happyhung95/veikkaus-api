import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { UnauthorizedError } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'

//! require token in request header
export default function (req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization']
    if (!token) {
      throw new Error('No token found')
    }
    token = token as string
    // Remove 'Bearer ' from token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft()
    }
    // verify token, throws error if fail
    jwt.verify(token, JWT_SECRET)

    //verification succeeds
    next()
  } catch (error) {
    next(new UnauthorizedError('Unauthorized Request', error))
  }
}
