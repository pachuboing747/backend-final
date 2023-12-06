const { Router } = require('express')
const cartController = require('../controllers/chat.controllers')
const { policiesCustomer } = require('../middlewares/policies.middleware')

const router = Router()

router.get('/', policiesCustomer, cartController.getChat)

module.exports = router