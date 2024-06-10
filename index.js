const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    // Connect the client to the server
    await client.connect();

    const userCollection = client.db("machineDb").collection("users");
    const serviceCollection = client.db("machineDb").collection("services");
    const workSheetCollection = client.db("machineDb").collection("WorkSheet");
    const messageCollection = client.db("machineDb").collection("messageCollection");
    const paymentCollection = client.db("machineDb").collection("payment");

    // Users related API
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Message Related API Start's Here
    app.get('/message', async (req, res) => {
      const result = await messageCollection.find().toArray();
      res.send(result);
    });

    app.post('/message', async (req, res) => {
      const data = req.body;
      const result = await messageCollection.insertOne(data);
      res.send(result);
    });

    app.delete('/message/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await messageCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: 'Message not found' });
        }
        res.send({ message: 'Message deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to delete message' });
      }
    });
    // Message Related API End's Here

    // Employee Related API
    app.get('/allEmployee', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/allEmployee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get('/allEmployees/:email', async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch('/allEmployeeUp/:email', async (req, res) => {
      const { email } = req.params;
      const { role } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: { role }
      };
      try {
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update user' });
      }
    });

    app.patch('/updateProfile/:email', async (req, res) => {
      const { email } = req.params;
      const { image } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: { image }
      };
      try {
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update user' });
      }
    });

    app.patch('/verifyEmployee/:email', async (req, res) => {
      const { email } = req.params;
      const filter = { email: email };
      const updateDoc = {
        $set: { verified: true }
      };
      try {
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'Employee verified successfully', result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to verify employee' });
      }
    });

    // Service related API
    app.get('/services', async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    // Dashboard related API
    app.post('/workSheet', async (req, res) => {
      const data = req.body;
      const result = await workSheetCollection.insertOne(data);
      res.send(result);
    });

    app.get('/workSheet', async (req, res) => {
      const result = await workSheetCollection.find().toArray();
      res.send(result);
    });

    // Payment Related API'S

    app.get('/payments/:email', async (req, res) => {
      const email = req.params.email;
      const result = await paymentCollection.find({ email }).toArray();
      res.send(result);
    });



    app.post('/create-payment', async (req, res) => {
      const { price } = req.body;
      const amount = Math.round(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    app.get('/payments', async (req, res) => {
      const pay = await paymentCollection.find().toArray();
      res.send(pay);
    });

    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send({ result });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Machine world is Running');
});

app.listen(port, () => {
  console.log(`Machine World server is Running on Port ${port}`);
});
