const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/";
const dbName = "tododatabase";
const client = new MongoClient(url);
const db = client.db(dbName);

async function main() {

  try {
    await client.connect(function (err) {
      if (err) {
        console.error('Failed to connect to MongoDB:', err);
        return;
      }
    })

    var collectionExists = (await db.listCollections().toArray()).filter(x => x.name === "todocollection");
    if (collectionExists == false) {
      {
        console.log("creating collection");
        const collection = db.collection('todocollection');
        await initCollection(collection);
      }
    }
    else
      console.log("collection exist");

  }
  catch (e) {
    console.error(e);
  }
  finally {
    console.log("done");
  }

}

async function initCollection(collection) {
   fetch('https://dummyjson.com/todos?limit=6')
    .then(async res => {
      const documentsFromDummyjson = await res.json();
      const todoValues = documentsFromDummyjson.todos.map(x => ({todo: x.todo, completed: x.completed}));
      const result = await collection.insertMany(todoValues, function (err) {
        if (err) {
          console.error('Failed to insert document:', err);
          return;
        }
      });
      console.log("Number of documents inserted: " + result.insertedCount)
    })
}

async function closeMongoClient() {
  try {
    await client.close();
    console.log('MongoDB client connection closed');
  } catch (err) {
    console.error('Failed to close MongoDB client connection:', err);
  }
}

main().catch(console.error);


module.exports = {
  db,
  closeMongoClient,
};
