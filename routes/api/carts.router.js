const { Router } = require('express')
const cartController = require('../../controllers/apiControllers/carts.controllers')
const { productsOutOfStock, policiesCustomerAndPremium } = require('../../middlewares/policies.middleware')

const router = Router()

// Creacion de un nuevo CARRITO
router.post('/', cartController.addCart)

router.get('/', cartController.getCart)

// Leer los productos del carrito con su C-ID

router.get('/:cid', cartController.getCartById)

router.post('/:cid/products/:idProduct', policiesCustomerAndPremium, cartController.addProductCart)

router.delete('/:cid/products/:idProduct', cartController.deleteProductCart)

router.delete('/:cid', cartController.deleteCart)

router.delete('/:cid/delete', cartController.deleteEntireCart)

router.put('/:cid', cartController.updateCart)

router.put('/:cid/:product/:idProduct', cartController.updateProductCart)

// Orden de compra

router.get('/orders/purchase', cartController.getOrders)

router.get('/orders/:id/purchase', cartController.getOrderById)

router.post('/:cid/purchase', productsOutOfStock, cartController.addOrderCart)

router.delete('/orders/:id/purchase', cartController.deleteOrder)

module.exports = router