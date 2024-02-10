import next from 'next'
import { createMongoConnection } from './mongo'
import { apolloServer, pubsub } from './graphql'
import express from 'express'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()
  const database = 'realtime-template'
  const [changeStreams] = await Promise.all([
    await createMongoConnection(process.env.MONGO_URI!, database),
    await apolloServer.start()
  ])
  for (const changeStream of changeStreams) {
    changeStream.on('change', (next: any) => {
      pubsub.publish('DATA_CHANGED', { dataChanged: next })
    })
  }

  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
