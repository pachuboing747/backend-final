// Importacion del modelo userModel
const userModel = require('../models/user.model')

class UserManager {
    
    getUsers () {
        return userModel.find({}).lean()
    }

    getUserById ( id ) {
        return userModel.findOne({ _id: id }).lean()
    }

    getUserByEmail ( email ) {

        return userModel.findOne({ email }).lean()

    }

    addUser ( user ) {
        return userModel.create( user )
    }

    updateUser ( id, user ) {
        return userModel.updateOne({ _id: id }, user)
    }

    deleteUser ( id ) {
        return userModel.deleteOne({ _id: id })
    }

}

module.exports = new UserManager()