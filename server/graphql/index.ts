import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
export { pubsub } from './resolvers'

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
})