const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
const sharp = require("sharp");
const bodyParser = require("body-parser");

app.get("/", (req, res) => res.send("Go travel!"));

// passWord: 8UBTkaXTRNwBU54U
// UserName: go-travel
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zingp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log(authHeader);

  if (!authHeader) {
    console.log("what is problem");

    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  // console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;

    next();
  });
}

async function run() {
  try {
    // await client.connect();
    const database = client.db("go-travel");
    const serviceDataCollection = database.collection("serviceList");
    const userCollection = database.collection("users");
    const userMessageCollection = database.collection("message");
    const seenMessageCollection = database.collection("seen");

    // create a user booking service list

    app.post("/booking", async (req, res) => {
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

      sharp(imgData)
        .resize(200, 200)
        .png()
        .toBuffer()
        .then(async (data) => {
          const encodedImg = data.toString("base64");
          const imageBuffer = Buffer.from(encodedImg, "base64");
          const serviceData = {
            date,
            serviceKey,
            planeName,
            month,
            time,
            area,
            hour,
            stops,
            operate,
            price,
            airPort,
            nextDay,
            tmp,
            passengerClass,
            flightNumber,
            airplaneNumber,
            weight,
            nextFlightAirPortName,
            img: imageBuffer,
          };

          const result = await serviceDataCollection.insertOne(serviceData);
          res.json(result);
        });
    });

    // create users post data route
    app.post("/users", async (req, res) => {
      const displayName = req.body.displayName;
      const email = req.body.email;
      const usersData = {
        displayName,
        email,
      };
      const result = await userCollection.insertOne(usersData);
      res.json(result);
    });

    app.post("/user/conatact", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const subject = req.body.subject;
      const number = req.body.number;
      const messages = req.body.messages;
      const date = req.body.date;

      const messageData = {
        name,
        email,
        subject,
        number,
        messages,
        seen: "unseen",
        date,
      };

      const result = await userMessageCollection.insertOne(messageData);
      res.json(result);
    });

    // post users message seen data
    app.put("/seen", async (req, res, next) => {
      try {
        const id = req.body._id;
        const name = req.body.name;
        const email = req.body.email;
        const subject = req.body.subject;
        const number = req.body.number;
        const messages = req.body.messages;

        const query = { email: email };
        const options = { upsert: true };
        const find = await userMessageCollection.findOne(query);
        // console.log(find.seen);
        if (find && find.seen !== "seen") {
          // console.log('inside condition');
          const updateDoc = {
            $set: {
              seen: "seen",
            },
          };

          const addProperty = await userMessageCollection.updateOne(
            query,
            updateDoc,
            options
          );
        } else {
          // const querys = { _id: ObjectId(id) }
          // const exist = await userMessageCollection.deleteOne(querys);
          res.send({ message: "Not Found " });
        }

        // if(!find){

        //   console.log('find not fund')

        //   const messageData = {
        //     name, email, subject, number, messages
        //   }

        //   const result = await seenMessageCollection.insertOne(messageData)
        //   console.log('inserted ducoment success')
        //   // res.json(result);

        //   const querys = { _id: ObjectId(id) }
        //   const findUser = await userMessageCollection.deleteOne(querys)

        //   if (findUser?.deletedCount === 1) {
        //     console.log("Successfully deleted one document.");
        //   } else {
        //     console.log("No documents matched the query. Deleted 0 documents.");
        //   }

        //   res.json(result);
        // }
      } catch (err) {
        console.log(err);
        next(err);
      }
    });

    // make role area
    app.put("/users/admin", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const users = req.body;
      const role = req.body.jobPosition;
      const filter = { email: users.email };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          lastName: users.lastName,
          role: role,
          number: users.number,
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.post("/remove", async (req, res) => {
      // console.log(req.body);
    });

    // booking data get
    app.get("/booking/:email", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const bookings = await serviceDataCollection.find(query).toArray();
      res.send(bookings);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }

      res.status(403).send({ accessToken: "" });
    });

    //get access role verify
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);

      let isRole = false;

      if (user?.role) {
        isRole = true;
      }
      const usersInfo = { isRole: isRole, role: user?.role };

      res.json(usersInfo);
    });

    app.get("/user/contact", async (req, res) => {
      // const j = await userMessageCollection.aggregate([{ $project: { name: 1  }}])
      const query = { seen: "unseen" };
      const options = {
        projection: { _id: 0, seen: 1 },
      };

      const find = await userMessageCollection.find(query, options).toArray();

      const count = await userMessageCollection.countDocuments({});
      res.json(find);
    });

    app.get("/user/contact/message", async (req, res) => {
      const onlyName = await userMessageCollection
        .aggregate([{ $project: { name: 1, messages: 1, seen: 1, date: 1 } }])
        .toArray();
      res.json(onlyName);
    });

    app.get("/singleView/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const singleIfo = await userMessageCollection.findOne(query);

      res.json(singleIfo);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => `listening on port ${port}!`);
