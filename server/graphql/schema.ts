import { composeWithMongoose } from 'graphql-compose-mongoose'
import { schemaComposer } from 'graphql-compose'
import { Post } from '../models'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()
const DATA_CHANGED_TOPIC = 'DATA_CHANGED'

const PostTC = composeWithMongoose(Post)

// Query
schemaComposer.Query.addFields({
  hello: {
    type: 'String',
    resolve: () => 'Hello World!'
  }
})
schemaComposer.Query.addFields({
  postById: PostTC.getResolver('findById'),
  postMany: PostTC.getResolver('findMany')
})

// Mutation
schemaComposer.Mutation.addFields({
  postCreateOne: PostTC.getResolver('createOne'),
  postUpdateById: PostTC.getResolver('updateById')
})

// Subscription
schemaComposer.createObjectTC({
  name: 'ChangeNotification',
  fields: {
    _id: 'ID',
    operationType: 'String',
    fullDocument: 'String',
    ns: 'String',
    documentKey: 'String'
  }
})

schemaComposer.Subscription.addFields({
  dataChanged: {
    type: 'ChangeNotification',
    subscribe: () => pubsub.asyncIterator([DATA_CHANGED_TOPIC]),
    resolve: payload => {
      return {
        _id: payload._id ? payload._id._data : null,
        operationType: payload.operationType,
        fullDocument: payload.fullDocument ? JSON.stringify(payload.fullDocument) : null,
        ns: payload.ns ? `${payload.ns.db}.${payload.ns.coll}` : null,
        documentKey: payload.documentKey ? payload.documentKey._id.toString() : null
      }
    }
  }
})

export const graphqlSchema = schemaComposer.buildSchema()
