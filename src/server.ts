import https from 'https'
import fs from 'fs'
import errorHandler from 'errorhandler'

import app from './app'

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler())

/**
 * Start Express server.
 */
const server = https
  .createServer(
    {
      key: fs.readFileSync('./src/keytmp.pem'),
      cert: fs.readFileSync('./src/cert.pem'),
      passphrase: 'simplePhrase',
    },
    app
  )
  .listen(app.get('port'), () => {
    console.log('  App is running at https://localhost:%d in %s mode', app.get('port'), app.get('env'))
    console.log('  Press CTRL-C to stop\n')
  })

export default server
