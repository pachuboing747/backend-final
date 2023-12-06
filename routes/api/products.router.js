const { Router } = require('express')
const productController = require('../../controllers/apiControllers/products.controllers')
const { policiesAdmin, policiesAdminAndPremium } = require('../../middlewares/policies.middleware')

const router = Router()

router.get('/', productController.getProducts)

router.get('/mockingproducts', productController.getProductsMock)

router.get('/:pid', productController.getProductById)

router.post('/', policiesAdminAndPremium, productController.addProduct)

router.put('/:pid', policiesAdmin, productController.updateProduct)

router.delete('/:pid', policiesAdminAndPremium, productController.deleteProduct)

module.exports = router