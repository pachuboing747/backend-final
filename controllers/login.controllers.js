const ManagerFactory = require('../dao/managersMongo/manager.factory')
const crypto = require('crypto')

const userManager = ManagerFactory.getManagerInstance('users')
const cartManager = ManagerFactory.getManagerInstance('carts')
const tokenPasswordManager = ManagerFactory.getManagerInstance('tokenPassword')
const logger = require('../logger/index')

const mailSenderService = require('../services/mail.sender.service')
const { hashPassword, isValidPassword } = require('../utils/password')


function generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
}

class LoginController {

    // Mostrar Signup
    getSignup (req, res) {

        res.render('signup',{
            style: 'signup'
        })
    
    }

    // Mostrar Login
    getLogin (req, res) {

        res.render('login', {   
            style: 'login'
        })
    
    }

    // Mostrar Profile
    async getProfile (req, res) {

        const cart = await cartManager.getCartById(req.user.cart._id)
        res.render('profile', {
            ...req.user,
            title: `Perfil de ${req.user.first_name}`,
            style: 'profile',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            } : null,
            idCart: cart._id
        })
    }

    // Mostrar Logout
    async getLogout (req, res) {
        const { first_name, last_name, _id } = req.user

        //FECHA
        const today = new Date()    
    
        req.logOut(async (err) => {

            if(!err){
                let user = await userManager.getUserById(_id)
                await userManager.updateUser(_id, {...user, last_connection: `Disconnect ${today}`})

                res.render('logout', {
                    name: `${first_name} ${last_name}`,
                    style: 'login'
                })
                
            }
        })


    }

    // Mostrar resetPassword
    async getResetpassword (req, res) {
        const token = req.query.token
        const tokenPassword = await tokenPasswordManager.getTokenByToken(token)
        if(tokenPassword){
            res.render('resetpassword', {
                style: 'login'
            })
        } else {
            return res.render('resetpassworderror', {
                style: 'login'
            })
        }
    }

    // Mostrar handlebars del reseteo de password
    getResetPasswordToken (req, res) {

        res.render('resetpasswordtoken', {
            style: 'login'
        })
    }
    getResetPasswordEmail (req, res) {

        res.render('resetpasswordemail', {
            style: 'login'
        })
    }

    // Generar enviar mail y generar token para el nuevo password

    async postTokenResetPassword (req, res) {
        const { email } = req.body

        const user = await userManager.getUserByEmail( email )

        if(!user){
            return res.render('resetpasswordtoken', {
                error: 'Email inexistente',
                style: 'login'
            })
        }
        
        const resetToken = generateResetToken()
        const fechaActual = new Date()
        const tokenP = {
            user: user._id,
            token: resetToken,
            expiration: new Date(fechaActual.getTime() + 60 * 60 * 1000)
        }
        await tokenPasswordManager.addToken(tokenP)
        setTimeout(async () => {
            await tokenPasswordManager.deleteToken(tokenP.token)
        }, 3600000)
        const resetLink = `https://proyectocoderhouse.up.railway.app/resetpassword?token=${resetToken}`

        const template = `
        <h2>¡Hola ${user.first_name}!</h2>

        <h3>Aqui te dejamos el link para poder restablecer tu contraseña</h3>
        <p>${resetLink}</p>

        <h3>¡Muchas Gracias!</h3>
        `
        const subject = 'Resetear Password'

        mailSenderService.send(subject, email, template)

        res.redirect('/resetpasswordemail')
    }

    // Reiniciar Password
    async postResetpassword (req, res) {
        const token = req.query.token

        const { email, password1, password2 } = req.body
        
        const user = await userManager.getUserByEmail( email )
        
        if(!user){
            return res.render('resetpassword', {
                error: 'El usuario no existe',
                style: 'login'
            })
        }

        if(password1 !== password2) {
            return res.render('resetpassword', {
                error: 'Las contraseñas no coinciden.',
                style: 'login'
            })
        }

        if( isValidPassword(password1, user.password) ) {
            return res.render('resetpassword', {
                error: 'La contraseña ingresada es la actual.',
                style: 'login'
            })
        }
        
        try {
                
            await userManager.updateUser(user._id, {
                ...user,
                password: hashPassword(password1)
            })
            
            await tokenPasswordManager.deleteToken(token)
            res.redirect('/login')
        
        } catch (error) {
            logger.error(error)
            return res.render('resetpassword', {
                error: 'Ha ocurrido un error',
                style: 'login'
            })
        }

    } 

    // Mostrar GithubSession
    getGithubSession (req, res) {
        const user = req.user
    
        req.session.user = {
            id: user.id,
            name: user.first_name,
            role: user?.role ?? "Customer",
            email: user.email
        }
    
    
        res.redirect('/')
    }
}

module.exports = new LoginController()