const mongoose = require('mongoose')
const { MONGO_CONNECT } = require('../config/config')

class MongoDb {

    connect(){
        return mongoose.connect(MONGO_CONNECT)
    }

    disconnect(){
        return mongoose.disconnect(MONGO_CONNECT)
    }

}

module.exports = new MongoDb()