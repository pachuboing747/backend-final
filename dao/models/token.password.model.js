const { Schema, model } = require('mongoose')

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    token: String,
    expiration: String
})

const tokenPasswordModel = model('tokenPassword', schema)

module.exports = tokenPasswordModel