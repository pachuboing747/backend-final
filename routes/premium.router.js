const { Router } = require('express')
const premiumController = require('../controllers/premium.controllers')

const router = Router()

router.get('/deletePremium', premiumController.getPremium)

router.post('/deletePremium', premiumController.deletePremium)

module.exports = router