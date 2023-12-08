const GithubStrategy = require('passport-github2')
const ManagerFactory = require('../dao/managersMongo/manager.factory')
const userManager = ManagerFactory.getManagerInstance('users')
const cartManager = ManagerFactory.getManagerInstance('carts')
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PORT, HOST, GITHUB_STRATEGY_NAME } = require('./config')
const logger = require('../logger/index')

const GitHubAccessConfig = { clientID: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET, callBackURL: "http://localhost:8080/githubSessions"}


// LOGICA DEL USUARIO

const gitHubUser = async (profile, done) => {

     //FECHA
    const today = new Date()

    logger.info(profile._json)
    const { name, email } = profile._json
    const _user = await userManager.getUserByEmail( email )
    if(!_user){
        logger.warn('Usuario inexistente')
        
        const cart = await cartManager.addCart()

        const newUser = {
            firstname: name.split(" ")[0],
            lastname: name.split(" ")[1],
            email: email,
            password: "",
            cart: cart,
            last_connection: `Connect ${today}`
        }

        const result = await userManager.addUser(newUser)

        return done(null, result)
    }

    // SI EL USUARIO YA EXISTE
    logger.warn('El usuario ya existe, rol asignado: ', _user?.role)
    await userManager.updateUser(_user._id, {..._user, last_connection: `Connect ${today}`})
    return done(null, _user)

}

const profileController = async ( accessToken, refreshToken, profile, done ) => {
    try {

        return await gitHubUser(profile, done)

    } catch (error) {
        logger.error(error)
        done(error)
    }
}

module.exports = {
    GithubStrategy,
    GitHubAccessConfig,
    profileController,
    strategyName: GITHUB_STRATEGY_NAME
}