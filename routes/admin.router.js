const { Router } = require('express')
const adminController = require('../controllers/admin.controllers')

const router = Router()

router.get('/admin', adminController.getAdmin)

router.get('/editarProducto', adminController.getAdminEditarProducto)

router.get('/getUser', adminController.getUsersAdmin)

router.post('/getUser', adminController.postUsersAdmin)

router.post('/deleteUser/:id', adminController.deleteUsersAdmin)

router.post('/admin', adminController.addProductAdmin)

router.post('/editarProducto', adminController.updateProductAdmin)

module.exports = router