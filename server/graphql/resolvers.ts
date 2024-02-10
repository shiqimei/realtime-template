import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

export const resolvers = {
  Subscription: {
    dataChanged: {
      subscribe: () => pubsub.asyncIterator(['DATA_CHANGED'])
    }
  },
  Query: {
    hello: () => 'Hello world!'
  }
}
