import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Subscription {
    dataChanged: ChangeNotification
  }
  type ChangeNotification {
    _id: ID
    operationType: String
    fullDocument: String
    ns: String
    documentKey: String
  }
  type Query {
    hello: String
  }
`
