const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/";
const dbName = "tododatabase";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect(function (err) {
      if (err) {
        console.error('Failed to connect to MongoDB:', err);
        return;
      }
    })


    const db = client.db(dbName);
    const collection = db.collection('todocollection');
    const document = { value: 'Do something nice for someone I care about'};

    const result = await collection.insertOne(document, function (err) {
      if (err) {
        console.error('Failed to insert document:', err);
        return;
      }

    });
    console.log('Document inserted successfully:', result.insertedId.toString());
    await listDbs(client);
    await client.close();
  }
  catch (e) {
    console.error(e);
  }
  finally {
    console.log("done");
  }

}


main().catch(console.error);

async function listDbs(client) {
  const dbList = await client.db().admin().listDatabases();

  console.log("databases:");
  dbList.databases.forEach(db => {
    console.log(`* ${db.name}`)
  });
}