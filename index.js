const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middlewares
// const corsConfig = {
//     origin: true,
//     credentials: true,
// }
// app.use(cors(corsConfig))
// app.options('*', cors(corsConfig))
app.use(cors())
app.use(express())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dswlh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
async function run() {
    try {
        await client.connect()
        const productCollection = client.db('laptopMart').collection('product')
        // load  product api
        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.limit(6).toArray()
            res.send(products)
        })
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        // Load product by id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        // Update quantity
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id
            const updatedQuantity = req.body
            console.log(updatedQuantity)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.updatedQuantity
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        // Delete product Api
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

        // post product api
        app.post('/product', async (req, res) => {
            const newProduct = req.body
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Laptop mart server is running...')
})

app.listen(port, () => {
    console.log('Listening to port:', port)
})

