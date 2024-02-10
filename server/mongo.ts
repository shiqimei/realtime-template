import { MongoClient, ChangeStream } from 'mongodb'

export async function createMongoConnection(
  uri: string,
  databaseName: string
): Promise<ChangeStream[]> {
  const client = new MongoClient(uri)
  const changeStreams: ChangeStream[] = []

  try {
    await client.connect()
    console.log('Connected successfully to MongoDB')

    const database = client.db(databaseName)
    const collections = await database.listCollections().toArray()

    collections.forEach(collection => {
      const collectionInstance = database.collection(collection.name)
      const changeStream = collectionInstance.watch()
      changeStreams.push(changeStream)
    })
  } catch (err) {
    console.error(err)
    await client.close()
    throw err
  }

  return changeStreams
}
