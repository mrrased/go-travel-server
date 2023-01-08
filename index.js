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
app.use(cors());
app.use(express.json())
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zingp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    // await client.connect();
    const database = client.db("insertDB");
    const haiku = database.collection("haiku");
    // create a document to insert
    // const doc = {
    //   title: "Record of a Shriveled Datum",
    //   content: "No bytes, no problem. Just insert a document, in MongoDB",
    // }
    // const result = await haiku.insertOne(doc);
    // console.log(`A document was inserted with the _id: ${result.insertedId}`);

    app.post('/booking', async(req, res)=>{

      const date = req.body.date;
      const serviceKey = req.body.serviceKey;
      const planeName = req.body.planeName;
      const month = req.body.month;
      const time = req.body.time;
      const area = req.body.area;
      const hour = req.body.hour;
      const stops = req.body.stops;
      const operate = req.body.operate;
      const price = req.body.price;
      const airPort = req.body.airPort;
      const nextDay = req.body.nextDay;
      const tmp = req.body.tmp;
      const passengerClass = req.body.passengerClass;
      const flightNumber = req.body.flightNumber;
      const airplaneNumber = req.body.airplaneNumber;
      const weight = req.body.weight;
      const nextFlightAirPortName = req.body.nextFlightAirPortName;
      const img = req.files.image.data.toString('base64');
      const imageBuffer = Buffer.from(img, 'base64');

      console.log(img);
    })
    console.log('inside function',uri);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => console.log(`listening on port ${port}!`))