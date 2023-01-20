const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const fileUpload = require('express-fileupload');
const sharp = require('sharp');



app.get('/', (req, res) => res.send('Go travel!'))

// passWord: 8UBTkaXTRNwBU54U
// UserName: go-travel
app.use(cors());
app.use(express.json())
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zingp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){

  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status (401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'forbidden access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    // await client.connect();
    const database = client.db("go-travel");
    const serviceDataCollection = database.collection("serviceList");
    const userCollection = database.collection("users");
    
    // create a user booking service list
    
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
      const imgData = req.files.image.data;
      

      sharp(imgData).resize(200, 200).png().toBuffer().then(async(data)=>{
        
        const encodedImg = data.toString('base64');
        const imageBuffer = Buffer.from(encodedImg, 'base64');
        const serviceData = {
          date, serviceKey, planeName, month, time, area, hour, stops, operate, price, airPort, nextDay,
          tmp, passengerClass, flightNumber, airplaneNumber, weight, nextFlightAirPortName, img:imageBuffer 
        }

        const result = await serviceDataCollection.insertOne(serviceData);
        res.json(result);
      })
    });

    // booking data get
    app.get('/booking', verifyJWT,  async(req, res)=>{
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      
      if(email !== decodedEmail){
        return res.status(403).send({message: 'forbidden access'});
      }
      const query = {email: email};
      const bookings = await serviceDataCollection.find(query).toArray();
      res.send(bookings);
    })

    app.get('/jwt', async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      if(user){
        const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })
    })

    // create users post data route
    app.post('/users', async(req, res)=>{

      const displayName = req.body.displayName;
      const email = req.body.email;
      const usersData = {
        displayName, email
      }
      const result = await userCollection.insertOne(usersData);
      res.json(result);
    }) 

    // console.log('inside function',uri);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => console.log(`listening on port ${port}!`))