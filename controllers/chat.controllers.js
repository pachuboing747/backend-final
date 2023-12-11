const ManagerFactory = require('../dao/managersMongo/manager.factory')

const userManager = ManagerFactory.getManagerInstance('users')

class ChatController {

    async getChat (req, res) {

        const user = await userManager.getUserById(req.user._id)
    
        res.render('chatmessage', {
            title: 'Chat',
            user: {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            },
            idUser: user._id,
            style: 'chatmessage'
        })
    
    }

}

module.exports = new ChatController()