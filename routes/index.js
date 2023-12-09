const { Router } = require('express')
const ProductRouter = require('./api/products.router')
const CartRouter = require('./api/carts.router')
const HomeRouter = require('./home.router')
const UserRouter = require('./api/user.router')
const LoginRouter = require('./login.router')
const ChatRouter = require('./chat.router')
const AdminRouter = require('./admin.router')
const TestRouter = require('./api/test.router')
const LoggerTest = require('./api/loggerTest.router')
const PremiumRouter = require('./premium.router')


// api
const api = Router();

// ruta de productos
api.use('/products', ProductRouter)

// ruta del carrito
api.use('/carts', CartRouter)

// ruta del usuario
api.use('/users', UserRouter)

// ruta del test
api.use('/test', TestRouter)
api.use('/loggerTest', LoggerTest)

// home
const home = Router()

// ruta del home
home.use('/', HomeRouter)

// ruta del login
home.use('/', LoginRouter)

// ruta del chat
home.use('/chatmessage', ChatRouter)

// ruta del admin
home.use('/admin', AdminRouter)

// ruta de premium
home.use('/premium', PremiumRouter)


module.exports = {
    api,
    home
}