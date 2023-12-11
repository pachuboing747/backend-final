const { Router } = require('express')
const cartController = require('../controllers/chat.controllers')

const router = Router()

router.get('/', cartController.getChat)

module.exports = router