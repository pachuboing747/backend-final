const { Router } = require("express")
const autenticacion = require('../middlewares/autenticacion.middlewares')
const homeControllers = require("../controllers/home.controllers")
const { productsOutOfStock } = require('../middlewares/policies.middleware')

const router = Router()



router.get('/', homeControllers.getHome)
router.post('/', homeControllers.postHome)

router.get('/realtimeproducts', autenticacion, homeControllers.getRealTimeProducts)

router.get('/:cid/purchase', autenticacion, productsOutOfStock, homeControllers.getOrderHome)

router.get('/carts/:cid', autenticacion, homeControllers.getCartHome)

router.get("/carts", homeControllers.carts)

module.exports = router