const { Router } = require('express')
const upload = require('../../middlewares/uploads')
const userController = require('../../controllers/apiControllers/user.controllers')

const router = Router()

router.get('/deleteAllUsers', userController.deleteAllUsers)

router.get('/', userController.getUsers)

router.get('/:id', userController.getUserById)

router.post('/', userController.addUser)

router.put('/:id', userController.updateUser)

router.delete('/:id', userController.deleteUser)

router.get('/premium/:uid', userController.premiumCustomer)

router.get('/premiumC/:uid', userController.premiumCustomerView)

router.get('/premiumAdmin/:uid', userController.premiumAdminView)

router.post('/:uid/documents', upload.single('file'), userController.postDocuments)


module.exports = router