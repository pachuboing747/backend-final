const { Schema, model } = require('mongoose')

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    code: String,
    total: Number,
    products: {
        type: [{
            product: { type: Schema.Types.ObjectId, ref: 'products' },
            quantity: { type: Number, default: 0 }
        }],
        default: []
    },
    purchaser: String,
    purchaseDate: String
})

const purchaseOrderModel = model('orders', schema)

module.exports = purchaseOrderModel