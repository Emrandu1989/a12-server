const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ff4sini.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
      
     const userCollection = client.db("machineDb").collection("users");
     const serviceCollection = client.db("machineDb").collection("services")
     const workSheetCollection = client.db("wordSheetDb").collection("workSheet")

    //  users related api
     app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result) 
     })


    //  service Related api
     app.get('/services', async(req, res)=>{
        const result = await serviceCollection.find().toArray();
        res.send(result)
     })


    //  Dashboard related api
      app.post('/workSheet', async(req, res)=>{
          const data = req.body;
          const result = await workSheetCollection.insertOne(data);
          res.send(result)
      })
      app.get('/workSheet', async(req, res)=>{
          const result = await workSheetCollection.find().toArray();
          res.send(result)
      })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get('/', (req, res)=>{
     res.send('Machine world is Running');
})

app.listen(port, ()=>{
    console.log(`Machine World server is Running on Port ${port}`)
})