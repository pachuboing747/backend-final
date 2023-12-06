const tokenPasswordModel = require('../models/token.password.model')

class TokenPasswordManager {

    async addToken ( token ) {

        const tokenPassword = await tokenPasswordModel.create(token)

        return tokenPassword
    }

    async getTokenByToken ( token ) {
        const tokenPassword = await tokenPasswordModel.find({ token: token })

        return tokenPassword[0]
    }

    async deleteToken ( token ) {
        const tokenPassword = await tokenPasswordModel.deleteOne({ token: token })

        return tokenPassword
    }
}

module.exports = new TokenPasswordManager()