const port = 5500;
const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.or4h7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db("cosmetics").collection("products");
    const orderCollection = client.db("cosmetics").collection("orders");

    app.get('/products', (req, res) => {
        productCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    });

    app.get('/checkout/:_id', (req, res) => {
        console.log('ok')
        productCollection
            .find({ _id: ObjectId(req.params._id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            });
    });

    app.get('/userOrders', (req, res) => {
        // console.log(req.query.email)
        orderCollection
            .find({ userEmail: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new event: ', newProduct)
        productCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orderCollection.insertOne(newOrder).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // Delete product order from mongoDB 
    app.delete('/deleteOrder/:_id', (req, res) => {
        orderCollection
            .deleteOne({ _id: ObjectId(req.params._id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            });
    });

    // Delete Ptoduct from Admin Dashboard and mongoDB
    app.delete('/deleteProduct/:_id', (req, res) => {
        productCollection
            .deleteOne({ _id: ObjectId(req.params._id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            });
    });

});

app.listen(process.env.PORT || port, () => {
    console.log(`http://localhost:${port}`)
})