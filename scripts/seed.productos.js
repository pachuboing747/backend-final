require('dotenv').config()

// Importar los productos del JSON a MONGO

const fs = require('fs/promises')
const path = require('path')
const mongoose = require('mongoose')

const productModel = require('../dao/models/product.model')

async function seed() {
    await mongoose.connect(process.env.MONGO_CONNECT)

    const filepath = path.join(__dirname, '../', 'dao/data/productos.json')
    const data = await fs.readFile(filepath, 'utf-8')
    const products = JSON.parse(data).map(({ id, ...product }) => product)

    const result = await productModel.insertMany(products)

    console.log(result)

    await mongoose.disconnect()
}

seed()