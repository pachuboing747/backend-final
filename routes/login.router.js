const { Router } = require('express')
const passport = require('passport')
const userManager = require('./../dao/managersMongo/user.manager')
const autenticacion = require('../middlewares/autenticacion.middlewares.js')
const {verificacionLogin, verificacionSignup} = require('../middlewares/verificaciones.midleware')
const { hashPassword, isValidPassword } = require('../utils/password')
const { GITHUB_STRATEGY_NAME } = require('../config/config')
const loginControllers = require('../controllers/login.controllers')
const logger = require('../logger/index')

const router = Router()

// Funciones controladoras

const signup = async (req, res) => {
    const user = req.body

    // Verificamos si el usuario existe a traves del email
    const userEmail = await userManager.getUserByEmail(user.email)

    if(userEmail){
        return res.render('signup', {
            error: 'El Email ingresado ya existe.',
            style: 'signup'
        })
    }

    if(user.password !== user.password2) {
        return res.render('signup', {
            error: 'Las contraseñas no coinciden.',
            style: 'signup'
        })
    }

    // Creaccion del usuario
    try {

        const newUser = await userManager.addUser({
            ...user,
            password: hashPassword(user.password)
        })
        
        req.session.user = {
            name: newUser.first_name,
            id: newUser._id,
            ...newUser._doc
        }

        req.session.save((err) => {
            res.redirect('/')
        })

    } catch (error) {
        return res.render('signup', {
            error: 'Ocurrio un error. Vuelve a intentarlo',
            style: 'signup'
        })
    }

}

const login = async (req, res) => {

    const { email, password } = req.body

    try {

        const _user = await userManager.getUserByEmail(email)

        
        if(!_user){
            return res.render('login', {
                error: 'Contraseña o Usuario incorrecto',
                style: 'login'
            })
        }
        
        const { password: _password, ...user } = _user

        if(!password) {
            return res.render('login', {
                error: 'Contraseña requerida',
                style: 'login'
            })
        }

        if(!isValidPassword( password, _password )){
            return res.render('login', {
                error: 'Contraseña o Usuario incorrecto',
                style: 'login'
            })
        }



        if(_user.email == "adminCoder@coder.com" && password == "adminCod3r123"){

            req.session.user = {
                name: user.first_name,
                id: user._id,
                ...user,
                role: 'admin'
            }

            req.session.save((err) => {
                if(!err){
                    res.redirect('/')
                }
            })

        } else {
            req.session.user = {
                name: user.first_name,
                id: user._id,
                ...user
            }

            req.session.save((err) => {
                if(!err){
                    res.redirect('/')
                }
            })
        }


    } catch (error) {
        logger.error(error)
        res.render('login', {
            error: 'Ocurrio un error. Vuelve a intentarlo.',
            style: 'login'
        })
    }

}

const logout = (req, res) => {

    // const { user } = req.cookies

    // // Borrar las cookies
    // res.clearCookie('user')

    req.session.destroy((err) => {
        if(err) {
            return res.redirect('/error')
        }
    })

    res.render('logout', {
        user: req.user.name,
        style: 'login'
    })
}

// Rutas de Login

router.get('/signup', loginControllers.getSignup)
router.get('/login', loginControllers.getLogin)
router.get('/profile', autenticacion, loginControllers.getProfile)
router.get('/resetpassword', loginControllers.getResetpassword)
router.get('/resetpasswordtoken', loginControllers.getResetPasswordToken)
router.get('/resetpasswordemail', loginControllers.getResetPasswordEmail)
router.get('/logout', autenticacion, loginControllers.getLogout)

// RUTAS DE GITHUB

router.get('/github', passport.authenticate(GITHUB_STRATEGY_NAME), (req, res) => {})

router.get('/githubSessions', passport.authenticate(GITHUB_STRATEGY_NAME), loginControllers.getGithubSession)

router.post('/signup', verificacionSignup, passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup'
}))
router.post('/login', verificacionLogin, passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login'
}))
router.post('/resetpassword', loginControllers.postResetpassword)
router.post('/resetpasswordtoken', loginControllers.postTokenResetPassword)

module.exports = router