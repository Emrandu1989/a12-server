const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://machine-world.netlify.app",
  ],
  credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ff4sini.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();

    const userCollection = client.db("machineDb").collection("users");
    const serviceCollection = client.db("machineDb").collection("services");
    const workSheetCollection = client.db("machineDb").collection("WorkSheet");
    const messageCollection = client.db("machineDb").collection("messageCollection");
    const paymentCollection = client.db("machineDb").collection("payment");



    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token }); 
    });


    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to add user' });
      }
    });

    app.get('/message', async (req, res) => {
      try {
        const result = await messageCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch messages' });
      }
    });

    app.post('/message', async (req, res) => {
      try {
        const data = req.body;
        const result = await messageCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to add message' });
      }
    });

    app.delete('/message/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await messageCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: 'Message not found' });
        }
        res.send({ message: 'Message deleted successfully' });
      } catch (error) {
        res.status(500).send({ error: 'Failed to delete message' });
      }
    });

    app.get('/allEmployee', async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch employees' });
      }
    });

    app.get('/allEmployee/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch employee' });
      }
    });

    app.get('/allEmployees/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const result = await userCollection.find({ email: req.params.email }).toArray();
        console.log(result)
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch employee' });
      }
    });

    app.patch('/allEmployeeUp/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const { role } = req.body;
        const filter = { email: email };
        const updateDoc = {
          $set: { role }
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        res.status(500).send({ error: 'Failed to update user' });
      }
    });
    app.patch('/allEmployeeUpS/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const { salary } = req.body;
        const filter = { email: email };
        const updateDoc = {
          $set: { salary }
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        res.status(500).send({ error: 'Failed to update user' });
      }
    });

    app.patch('/updateProfile/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const { image } = req.body;
        const filter = { email: email };
        const updateDoc = {
          $set: { image }
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        res.status(500).send({ error: 'Failed to update user' });
      }
    });

    app.patch('/verifyEmployee/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const filter = { email: email };
        const updateDoc = {
          $set: { verified: true }
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'No changes made to the user' });
        }
        res.send({ message: 'Employee verified successfully', result });
      } catch (error) {
        res.status(500).send({ error: 'Failed to verify employee' });
      }
    });

    app.get('/services', async (req, res) => {
      try {
        const result = await serviceCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch services' });
      }
    });

    app.post('/workSheet', async (req, res) => {
      try {
        const data = req.body;
        const result = await workSheetCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to add worksheet' });
      }
    });

    app.get('/workSheet', async (req, res) => {
      try {
        const result = await workSheetCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch worksheets' });
      }
    });

    app.get('/payments/:email', async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email, "206")
        const result = await paymentCollection.find({ email: req.params.email }).toArray();
        console.log("207", result)
        return res.send(result);

      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch payments' });
      }
    });

    app.post('/create-payment', async (req, res) => {
      try {
        const { price } = req.body;
        const amount = Math.round(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          payment_method_types: ['card'],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        res.status(500).send({ error: 'Failed to create payment intent' });
      }
    });

    app.get('/payments', async (req, res) => {
      try {
        const pay = await paymentCollection.find().toArray();
        res.send(pay);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch payments' });
      }
    });

    app.post('/payments', async (req, res) => {
      try {
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment);
        res.send({ result });
      } catch (error) {
        res.status(500).send({ error: 'Failed to add payment' });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Machine world is Running');
});

app.listen(port, () => {
  console.log(`Machine World server is Running on Port ${port}`);
});
