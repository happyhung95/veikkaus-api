import express from 'express'
import { idempotency } from 'express-idempotency'

import { createAccount, updateAccount, getAccount, generateToken } from '../controllers/main'
import verifyToken from '../middlewares/verifyToken'
import checkIdempotency from '../middlewares/checkIdempotency'

const router = express.Router()

// Every path we define here will get /api/v1/ prefix
router.get('/token', generateToken)
router.get('/account/:accountId', verifyToken, getAccount)
router.post('/createAccount', verifyToken, idempotency(), checkIdempotency, createAccount)
router.post('/updateAccount', verifyToken, idempotency(), checkIdempotency, updateAccount)

export default router
