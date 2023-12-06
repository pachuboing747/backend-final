const { Schema, model } = require('mongoose')
const paginate = require('mongoose-paginate-v2')

const schema = new Schema({
    status: { type: Boolean, default: true},
    title: String,
    description: {type: String, default: 'Sin descripcion'},
    code: String,
    price: Number,
    stock: {type: Number, default: 0},
    category: String,
    thumbnail: {type: [String], default: []},
    owner: { type: String, default: 'admin' }
})

schema.plugin(paginate)

const productModel = model('products', schema)

module.exports = productModel