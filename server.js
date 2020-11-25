import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

//app Config
const app = express();
const PORT = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1108191",
  key: "5061c6233fc0eec6ea5b",
  secret: "eebec84cd6d8ffcb99d4",
  cluster: "eu",
  useTLS: true,
});

//Middleware
app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

//Db Connecting
const connection_url =
  "mongodb+srv://user:1234@cluster0.dz4gx.mongodb.net/whatsapp?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to-------> DB");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log("A change occured", change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("message", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

//App routes
app.get("/", (req, res) => {
  res.status(200).send("Getting ready");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created \n ${data}`);
    }
  });
});

//Listen
app.listen(PORT, () => console.log(`Listening on ---->${PORT}`));
