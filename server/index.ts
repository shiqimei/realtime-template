import next from 'next'
import { createServer } from 'http'
import { createMongooseConnection } from './mongo'
import { apolloServer, pubsub, graphqlSchema } from './graphql'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const app = express()
  const server = createServer(app)

  const database = 'realtime-template'
  const [changeStreams] = await Promise.all([
    await createMongooseConnection(process.env.MONGO_URI!, database),
    await apolloServer.start()
  ])
  for (const changeStream of changeStreams) {
    changeStream.on('change', (next: any) => {
      pubsub.publish('DATA_CHANGED', { dataChanged: next })
    })
  }

  const path = '/api/graphql'
  app.use(path, cors<cors.CorsRequest>(), express.json(), expressMiddleware(apolloServer))
  const wsServer = new WebSocketServer({ server, path })
  useServer({ schema: graphqlSchema }, wsServer)

  app.all('*', (req, res) => {
    return handle(req, res)
  })

  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
