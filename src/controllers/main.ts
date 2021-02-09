import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import AccountService from '../services/account'
import ApiError, { InternalServerError, InvalidRequestError, NotFoundError } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'

//* GET /token
export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // create a mocked access token to use in this assignment. Normally, this token is assumed to be generated in the API gateway
    const accessToken = jwt.sign({}, JWT_SECRET, { expiresIn: '1h' })
    res.status(201).json({ accessToken })
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

//* GET /account/:accountId
export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await AccountService.findAccountById(req.params.accountId)

    if (!account) {
      next(new NotFoundError('Account not found'))
    }

    res.status(200).json(account)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

//* POST /createAccount
export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.name == null) {
      next(new InvalidRequestError('Request body must have name to create account'))
    }

    const account = await AccountService.createAccount(req.body.name)

    if (account) {
      res.status(201).json(account)
    } else {
      next(new InternalServerError('Something went wrong in AccountService, createAccount'))
    }
  } catch (error) {
    if (error instanceof ApiError) {
      next(error)
    } else {
      next(new InternalServerError('Something went wrong', error))
    }
  }
}

//* POST /updateAccount
export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountBalance = await AccountService.updateAccountBalance(req.body)

    if (accountBalance) {
      res.status(200).json(accountBalance)
    } else {
      next(new InternalServerError('Something went wrong in AccountService, updateAccountBalance'))
    }
  } catch (error) {
    if (error instanceof ApiError) {
      next(error)
    } else {
      next(new InternalServerError('Something went wrong', error))
    }
  }
}
