require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const port = process.env.PORT || 4000;
const app = express();

app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

//----------------------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j5yqq.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //-----------------------------Start-----------------------------------

    const db = client.db("SkillSwapDB");
    const usersCollection = db.collection("users");
    const skillsCollection = db.collection("skills");
    const categoriesCollection = db.collection("categories");
    const exchangesCollection = db.collection("exchanges");

    // create a new skill
    app.post("/create-skills", async (req, res) => {
      const newSkill = req.body;
      const result = await skillsCollection.insertOne(newSkill);
      res.send(result);
    });

    // get all skills
    app.get("/get-skills", async (req, res) => {
      const result = await skillsCollection.find().toArray();
      res.send(result);
    });

    // get single skill by id
    app.get("/get-skill/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await skillsCollection.findOne(query);
      res.send(result);
    });

    // get all skills (by email) added by a specific user
    app.get("/get-skills/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        creatorEmail: email,
      };
      const result = await skillsCollection.find(query).toArray();
      res.send(result);
    });

    // get all categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    // save exchange requested skills in db
    app.post("/exchanges", async (req, res) => {
      const newExchange = req.body;
      const result = await exchangesCollection.insertOne(newExchange);
      res.send(result);
    });

    //---------------users related apis are below-------------------------

    // save or update users in db
    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;

      // check if user is already exist in db or not
      const isExist = await usersCollection.findOne(query);

      if (isExist) {
        return res.send(isExist);
      }

      const result = await usersCollection.insertOne({
        ...user,
        role: "user",
      });
      res.send(result);
    });

    // get all users
    app.get("/allUsers", async (req, res) => {
      const users = await usersCollection.find().toArray();
      console.log(users.length);
      len = users.length;
      res.send(`there are ${users.length} users`);
    });

    //-----------------------------End-----------------------------------
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//----------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("SkillSwap server is running...");
});

app.listen(port, () => {
  console.log(`SkillSwap server is running on port ${port}`);
});
