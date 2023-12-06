const { Schema, model } = require('mongoose')

const shema = new Schema({
    user: String,
    text: String,
    datetime: String
})

const chatMessageModel = model('chatmessage', shema)

module.exports = chatMessageModel