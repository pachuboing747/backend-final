// Generamos nuestras estrategias de passport
const local = require('passport-local')
const ManagerFactory = require('../dao/managersMongo/manager.factory')

const userManager = ManagerFactory.getManagerInstance('users')
const cartManager = ManagerFactory.getManagerInstance('carts')
const { hashPassword, isValidPassword } = require('../utils/password')
const logger = require('../logger/index')

const LocalStrategy = local.Strategy

const signup = async ( req, email, password, done ) => {
    const { password: _password, password2: _password2, ...user } = req.body

    const _user = await userManager.getUserByEmail( email )

    //FECHA
    const today = new Date()

    if(_user){
        logger.warn('El usuario ya existe.')
        return done(null, false)
    }

    try {

        const cart = await cartManager.addCart()

        const newUser = await userManager.addUser({
            ...user,
            password: hashPassword(password),
            cart: cart,
            last_connection: `Connect ${today}`
        })

        let cartId = await cartManager.getCartById(newUser.cart._id)
        cartId.user = newUser._id

        cartId.save()

        return done(null, {
            name: newUser.first_name,
            id: newUser._id,
            ...newUser._doc
        })

    } catch (error) {
        logger.error('Ha ocurrido un error')
        done(error, false)
    }

}

const login = async ( email, password, done ) => {

    //FECHA
    const today = new Date()

    try {
        
        let _user = await userManager.getUserByEmail( email )

        if(!_user){
            logger.war('Contraseña o Usuario incorrecto')
            return done(null, false)
        }

        if (!password) {
            return done(null, false)
        }

        if(!isValidPassword( password, _user.password )){
            logger.warn('Contraseña o Usuario incorrecto')
            return done(null, false)
        }

        await userManager.updateUser(_user._id, {..._user, last_connection: `Connect ${today}`})
        return done(null, _user)

    } catch (error) {
        logger.error('Ha ocurrido un error')
        done(error, false)
    }

}


module.exports = {
    LocalStrategy,
    signup,
    login
}