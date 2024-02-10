import mongoose from 'mongoose'
import { Post } from './models'

export async function createMongooseConnection(uri: string, databaseName: string) {
  await mongoose.connect(uri, { dbName: databaseName })
  console.log('Connected successfully to MongoDB with Mongoose')

  const changeStreams = [Post.watch()]
  return changeStreams
}
