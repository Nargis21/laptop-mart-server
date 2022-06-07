const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middlewares
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
// app.use(cors())
app.use(express.json())

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1]
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' })
//         }
//         console.log('decoded', decoded)
//         req.decoded = decoded
//         next()
//     })
// }

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dswlh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const productCollection = client.db('laptopMart').collection('product')

        // // Auth api
        // app.post('/login', async (req, res) => {
        //     const user = req.body
        //     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' })
        //     res.send(accessToken)
        // })

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

        // Update quantity api
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id
            const updatedProduct = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updatedProduct.newUpdatedQuantity
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


        // app.get('/items', verifyJWT, async (req, res) => {
        //     const decodedEmail = req.decoded.email
        //     console.log(decodedEmail)
        //     const email = req.query.email
        //     console.log(email)
        //     if (decodedEmail === email) {
        //         const query = { email: email }
        //         const cursor = productCollection.find(query)
        //         const result = await cursor.toArray()
        //         res.send(result)
        //     }
        //     else {
        //         return res.status(403).send({ message: 'Forbidden access' })
        //     }
        // })

        app.get('/items', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = { email: email }
            const cursor = productCollection.find(query)
            const result = await cursor.toArray()
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

