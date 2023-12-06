const productManager = require('./product.manager')
const cartManager = require('./cart.manager')
const chatMessageManager = require('./chat.message.manager')
const userManager = require('./user.manager')
const purchaseManager = require('./purchase.manager')
const tokenPasswordManager = require('./token.password.manager')

const productManagerFile = require('../managers/ProductManager')
const cartManagerFile = require('../managers/CartManager')
const userManagerFile = require('../managers/UserManager')

const { PERSISTANCE } = require('../../config/config')

class ManagerFactory {

    static getManagerInstance(name) {

        if(PERSISTANCE == 'mongo') {
            // EJECUTO LOS MANAGERS DE MONGO
            switch (name) {
                case 'products':
                    return productManager;
                
                case 'carts': 
                    return cartManager;

                case 'chatMessages': 
                    return chatMessageManager;

                case 'users': 
                    return userManager;

                case 'purchases': 
                    return purchaseManager;
                case 'tokenPassword':
                    return tokenPasswordManager
            }
        } else {
            // EJECUTO LOS MANAGERS DE FILESYSTEM
            switch (name) {
                case 'products':
                    return productManagerFile;
                
                case 'carts': 
                    return cartManagerFile;
                
                case 'users': 
                    return userManagerFile;
            }
        }
    }
}

module.exports = ManagerFactory