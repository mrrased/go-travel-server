const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const fileUpload = require('express-fileupload')


app.get('/', (req, res) => res.send('Go travel!'))

// passWord: 8UBTkaXTRNwBU54U
// UserName: go-travel


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zingp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log(uri);
  // perform actions on the collection object
  client.close();
});


app.listen(port, () => console.log(`listening on port ${port}!`))