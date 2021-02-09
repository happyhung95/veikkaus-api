export enum TransactionType {
  PURCHASE = 'purchase',
  PROFIT = 'profit',
}

export type GameEvent = {
  eventId: string
  accountId: string
  transactionType: TransactionType
  amount: number
  timeStamp: string
}

export type AccountBalance = {
  accountId: string
  balance: number
}
