const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


// midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0m3pw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
async function run() {
    try {
        await client.connect();
        const database = client.db("cars_fantasy");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users")
        const reviewCollection = database.collection("reviews")

        app.get('/products', async (req, res) => {
            // find email to filterout
            const email = req.query.email;
            const query = { email: email };
            console.log(query)
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            console.log(products)
            res.json(products);


        })


        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            // console.log(product);

            res.json(result)
            console.log(result);

        })
        // GET Single Product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            }
            const result = await productsCollection.deleteOne(query)
            console.log('deleting the user', result);
            res.json(result);
            console.log(result)
        });


        app.get('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            }
            const user = await ordersCollection.findOne(query)
            console.log('load the data', id);
            res.send(user)
        })
        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrders = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrders.status

                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', result);
            res.json(result)
        })
        // get the orders api 
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            console.log('get data from database', orders)
            res.send(orders);
        })

        // get the specific order api with eamil
        app.get('/myOrders', async (req, res) => {
            // find email to filterout
            const email = req.query.email
            const query = { email: email };
            console.log(query)
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray()
            console.log(orders)
            res.json(orders);


        })
        //  post the order api 
        app.post('/myOrders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.json(result)
            console.log(result);

        })
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            }
            const result = await ordersCollection.deleteOne(query)
            console.log('deleting the user', result);
            res.json(result);
            console.log(result)
        });
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            console.log('get data from database', reviews)
            res.send(reviews);
        })
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews);
            res.json(result)
            console.log(result);

        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin })
        })
        // set the users 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })


    }

    finally {
        //  await client.close()

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Car Fantasy!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})