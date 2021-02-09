# Overview
* [Task](#task)
* [Setup for this project](#setup-for-this-project)
* [API Documentation](#api-documentation)


# Task
```
Your job is to implement a simple integration between the game engine and the game account (Wallet) that allows you to buy games and pay out winnings.

In this context, a game account refers to a server that provides an HTTP API to game engines and manages customers’ gaming funds. The game engine does not need to be implemented for this assignment.

You can choose the programming language and other technical solutions yourself.
 
Tasks:
 
1. Design and document the HTTP interface between the game engine and the game account.

When you charge a game, the game engine transmits to the game account the unique identifier of the purchase transaction, the unique identifier of the player and the amount. In response, the game account forwards to the game engine the remaining balance of the player’s game account.

If the game round is a winning game, the game engine transmits to the game account the unique identifier of the winning event, the unique identifier of the player and the winning amount. In response, the game account forwards the new balance of the player’s game account to the game engine.

These HTTP APIs are idempotent.
 

2. Design and implement a database for the game account

Information to be saved about players:
  The unique identifier of the player
  Name
  Game account balance

Game event information:
  Timestamp
  The unique identifier of the player
  Unique identifier of the event
  Type of transaction (purchase or profit)
  Amount
 

3. Implement a game account

When processing a game purchase, the game engine debits the purchase amount from the player’s game account. If the player wins, the game engine pays them into the game account.

If the game account balance is not sufficient for the purchase, the system will return an error to the game engine.

Traffic between the game engine and the game account must be encrypted.
 

4. Write tests for the system

5.Write instructions for running the game engine and tests
 
```

# Setup for this project
Require:
* Node v10.19 or later
* MongoDB 4.0.3 or later (only to run test cases)

**The API connects to a MongoDB instance hosted on Mongo Atlas (AWS Frankfurt), hence no need for the local MongoDB to run.** 

To install the dependencies and run the API, open a terminal and run these:
```
git clone git@github.com:happyhung95/veikkaus-api.git
cd veikkaus-api
npm install
npm run watch
```

**Note:** since the task requests for secure traffic, this API was built with HTTPS server with self-signed SSL certificate. Hence, some browsers might not accept accessing the endpoints via the URL bar. **Postman (with disabled SSL verification) is recommended for testing this API**.

To run test cases: `npm test` (MongoDb is required)

# API Documentation
API rejects requests without `Idempotency-Key` with status code 400, or `access-token` with status code 401. 

Requests with the same idempotency key will only be processed once during a time period. Only the first request get processed, others will be returned with cached response.

## 1. Get access token

Access token is needed for all other endpoints. For simplicity, there is no logic to authenticate requests to get access token in this API.
```
REQUEST

- URL: https://localhost:3000/api/v1/token
- Method: GET

========
RESPONSE

{
  "accessToken": "some-token"
}

- Status code:
    201: Success. 
    500: Internal Server Error.
```
## 2. Create a wallet account (player)

This endpoint is used to create a account.

```
REQUEST

- URL: https://localhost:3000/api/v1/createAccount
- Method: POST
- Header:
  - Idempotency-Key : someKey. 
  - Authorization : Bearer <access-token>
  - Content-Type : application/json
- Body:
  {
    "name" : "some-name"
  }

========
RESPONSE
 {
    "_id": "uuid",
    "name": "some-name",
    "balance": 0,
    "deleted": false,
    "events": [],
    "createdAt": "string",
    "updatedAt": "string",
 }

- Status code:
    201: Success.
    400: Invalid request. Incorrect request structure in body and/or header
    401: Unauthorized request. Missing access token in request header.
    500: Internal Server Error.
```
## 3. Update wallet account
This endpoint is used for receiving debiting/crediting account requests from game engine.

If the account has insufficient balance for the `purchase` event, API responds with status code 400
```
REQUEST

- URL: https://localhost:3000/api/v1/updateAccount
- Method: POST
- Header:
  - Idempotency-Key : someKey. 
  - Authorization : Bearer <access-token>
  - Content-Type : application/json
- Body:
  {
    "eventId": "event-uuid-from-game-engine",
    "accountId": "account-uuid",
    "transactionType" : "profit" || "purchase",
    "amount": number,
    "timeStamp": "string"
  }

========
RESPONSE

  {
    "accountId": "account-uuid",
    "balance": number
  }
  
- Status code:
    200: Success.
    400: Invalid request. Insufficient balance or incorrect request structure in body and/or header.
    401: Unauthorized request. Missing access token in request header.
    404: Not found. Account not found.
    500: Internal Server Error.
```

## 4. Get wallet account
This endpoint can be used to check the account.
```
REQUEST

- URL: https://localhost:3000/api/v1/account/<account-uuid>
- Method: GET
- Header:
  - Authorization : Bearer <access-token>

========
RESPONSE

  {
    "_id": "account-uuid",
    "name": "some-name",
    "balance": number,
    "deleted": false,
    "events": [
        {
            "amount": number,
            "deleted": false,
            "_id": "uuid-of-this-event-on-db",
            "timeStamp": "timeStamp-from-game-engine",
            "accountId": "account-uuid",
            "eventId": "event-uuid-from-game-engine",
            "transactionType": "profit",
            "createdAt": "string",
            "updatedAt": "string"
        }
    ],
    "createdAt": "string",
    "updatedAt": "string",
  }

- Status code:
    200: Success.
    400: Invalid request. Insufficient balance or incorrect request URL param.
    401: Unauthorized request. Missing access token in request header.
    404: Not found. Account not found.
    500: Internal Server Error.
```
