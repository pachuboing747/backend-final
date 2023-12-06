const passport = require('passport')
const ManagerFactory = require('../dao/managersMongo/manager.factory')
const userManager = ManagerFactory.getManagerInstance('users')

const { LocalStrategy, signup, login } = require('./passport.config')
const { 
    GithubStrategy,
    GitHubAccessConfig,
    profileController,
    strategyName
} = require('./passport.github')

const init = () => {

    passport.use('local-signup', new LocalStrategy({ usernameField: 'email',  passReqToCallback: true }, signup))
    passport.use('local-login', new LocalStrategy({ usernameField: 'email' }, login))

    passport.use( strategyName, new GithubStrategy( GitHubAccessConfig, profileController ) );


    passport.serializeUser( (user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser( async (id, done) => {
        const user = await userManager.getUserById(id)
        
        done(null, user)
    })
}

module.exports = init