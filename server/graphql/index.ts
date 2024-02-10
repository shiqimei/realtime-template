import { ApolloServer } from '@apollo/server'
import { graphqlSchema, pubsub } from './schema'

export { graphqlSchema, pubsub }

export const apolloServer = new ApolloServer({
  schema: graphqlSchema
})
