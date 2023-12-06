const ManagerFactory = require('../dao/managersMongo/manager.factory')

const userManager = ManagerFactory.getManagerInstance('users')

const { isValidPassword } = require('../utils/password')
const logger = require('../logger/index')


async function verificacionLogin(req, res, next){

    const { email, password } = req.body

    try {

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if(!regex.test(email)){
            return res.render('login', {
                error: 'Formato de email incorrecto.',
                style: 'signup'
            })
        }

        const _user = await userManager.getUserByEmail(email)

        
        if(!_user){
            return res.render('login', {
                error: 'Contraseña o Usuario incorrecto',
                style: 'login'
            })
        }
        
        const { password: _password } = _user

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

    } catch (error) {
        logger.error(error)
        res.render('login', {
            error: 'Ocurrio un error. Vuelve a intentarlo.',
            style: 'login'
        })
    }

    next()
}

async function verificacionSignup (req,res,next) {

    const user = req.body

    
    try {
        // Verificamos que el email ingresado tenga el formato de email.
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if(!regex.test(user.email)){
            return res.render('signup', {
                error: 'Formato de email incorrecto.',
                style: 'signup'
            })
        }

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

    } catch (error) {
        return res.render('signup', {
            error: 'Ocurrio un error. Vuelve a intentarlo',
            style: 'signup'
        })
    }

    next()
}


module.exports = {
    verificacionLogin,
    verificacionSignup
}