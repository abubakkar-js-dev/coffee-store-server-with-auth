const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y24v7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db('coffeeDb');
        const coffeeCollection = database.collection('coffeeCollection');

        const userCollection = client.db('coffeeUsers').collection('users');


        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log('Adding new coffee', newCoffee)

            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: req.body
            }

            const result = await coffeeCollection.updateOne(filter, updatedDoc, options )

            res.send(result);
        })

        app.delete('/coffee/:id', async (req, res) => {
            console.log('going to delete', req.params.id);
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })


        // user authentication info
        app.post('/auth/signIn',async(req,res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(user);
            res.send(result);
        })

        app.get('/users', async(req,res)=>{
            const cursor = userCollection.find();
            const result = await cursor.toArray();

            res.send(result);
        })

        app.patch('/users',async(req,res)=>{
            const user = req.body;

            const filter = {email: user.email};

            const updatedUser = {
                $set: {
                    lastSignInTime: user?.lastSignInTime
                }
            }

            const result = await userCollection.updateOne(filter,updatedUser);

            res.send(result);
        })


        app.delete('/users/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};

            const result = await userCollection.deleteOne(query);
            res.send(result);
        })



    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('HOT HOT HOT COFFEEEEEEE, Yeah. This is working')
})

app.listen(port, () => {
    console.log(`COffee is getting warmer in port: ${port}`);
})
