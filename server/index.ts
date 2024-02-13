import next from 'next'
import { createServer } from 'http'
import { createMongooseConnection } from './mongo'
import { ApolloServer } from '@apollo/server'
import { pubsub, graphqlSchema } from './graphql'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import cors from 'cors'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const host = '0.0.0.0'
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const app = express()
  const server = createServer(app)

  // Apollo Server
  const path = '/api/graphql'
  const wsServer = new WebSocketServer({ server, path })
  const serverCleanup = useServer({ schema: graphqlSchema }, wsServer)
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  const database = 'realtime-template'
  const [changeStreams] = await Promise.all([
    await createMongooseConnection(process.env.MONGO_URI!, database),
    await apolloServer.start()
  ])
  app.use(path, cors<cors.CorsRequest>(), express.json(), expressMiddleware(apolloServer))

  for (const changeStream of changeStreams) {
    changeStream.on('change', (next: any) => {
      pubsub.publish('DATA_CHANGED', next)
    })
  }

  app.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, host, () => {
    console.log(`> Ready on http://${host}:${port}`)
  })
})
