const ManagerFactory = require('../dao/managersMongo/manager.factory')

const cartManager = ManagerFactory.getManagerInstance('carts')

class CartController {

    async getChat (req, res) {

        const cart = await cartManager.getCartById(req.user.cart._id)
    
        res.render('chatmessage', {
            title: 'Chat',
            user: {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            },
            idCart: cart._id,
            style: 'chatmessage'
        })
    
    }

}

module.exports = new CartController()