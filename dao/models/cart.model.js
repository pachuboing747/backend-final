const { Schema, model } = require('mongoose')

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    products: {
        type: [{
            product: {type: Schema.Types.ObjectId, ref: 'products'},
            quantity: {type: Number, default: 0}
        }], 
    default: []
}
})

schema.pre("findOne", function(){
    this.populate({ path: 'user', select: ['email', 'first_name', 'last_name'] })
})

const cartModel = model('carts', schema)

module.exports = cartModel