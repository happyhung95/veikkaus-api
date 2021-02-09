import Account, { AccountDocument } from '../models/Account'
import Event from '../models/Event'
import { NotFoundError, InvalidRequestError } from '../helpers/apiError'
import { GameEvent, AccountBalance, TransactionType } from '../types/types'

async function createAccount(name: string): Promise<AccountDocument> {
  const account = new Account({ name })
  account.events = []
  return await account.save()
}

async function findAccountById(id: string): Promise<AccountDocument | null> {
  return await Account.findById(id).exec()
}

async function updateAccountBalance(gameEvent: GameEvent): Promise<AccountBalance | undefined> {
  let accountBalance

  if (gameEvent) {
    const account = await findAccountById(gameEvent.accountId)

    if (!account) {
      throw new NotFoundError('Account not found')
    }

    if (gameEvent.transactionType == TransactionType.PURCHASE && gameEvent.amount != null) {
      if (account.balance < gameEvent.amount) {
        throw new InvalidRequestError(`Insufficient balance in account ${account._id}`)
      }
      account.balance -= Math.abs(gameEvent.amount)
    } else if (gameEvent.transactionType == TransactionType.PROFIT && gameEvent.amount != null) {
      account.balance += Math.abs(gameEvent.amount)
    } else {
      throw new InvalidRequestError('Game event needs amount and correct transactionType')
    }

    // log the event to account object
    const event = new Event({
      timeStamp: gameEvent.timeStamp,
      accountId: gameEvent.accountId,
      eventId: gameEvent.eventId,
      transactionType: gameEvent.transactionType,
      amount: gameEvent.amount,
    })
    account.events.push(event)

    await account.save()

    accountBalance = { accountId: account._id, balance: account.balance }
  }

  return accountBalance
}

export default {
  createAccount,
  findAccountById,
  updateAccountBalance,
}
