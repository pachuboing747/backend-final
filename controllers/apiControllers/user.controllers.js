const ManagerFactory = require('../../dao/managersMongo/manager.factory')
const CustomError = require('../../errors/custom.error')
const EErrors = require('../../errors/enum.error')
const { userErrorInfo, errorExistingUser } = require('../../errors/info.error')
const logger = require('../../logger/index')
const eliminarUsuariosInactivosMiddleware = require('../../middlewares/eliminarUsuariosInactivosMiddleware')

const userManager = ManagerFactory.getManagerInstance('users')
const cartManager = ManagerFactory.getManagerInstance('carts')


class UserController {

    async deleteAllUsers (req, res){

        eliminarUsuariosInactivosMiddleware()

        res.status(202).send({Accepted: 'Se ejecuto la funcion para eliminar usuarios inactivos.'})
    }

    // Mostrar usuarios
    async getUsers (req, res) {

        const { email } = req.query
    
        if(email){
            
            const emailVer = await userManager.getUsers()
            if(emailVer.find(em => em.email == email)){
                const userEmail = await userManager.getUserByEmail(email)
                res.send(userEmail)
                return
            }
            
            res.status(404).send({
                error: 'EMAIL INEXISTENTE'
            })
        } else{
            const users = await userManager.getUsers()
            const usuarioSinPassword = users.map(user => {
                // Crea una copia del objeto de usuario excluyendo la contraseña
                const { _id, password, age, cart, last_connection, documents, ...usuarioSinPassword } = user;
                return usuarioSinPassword;
            });
            res.send(usuarioSinPassword)
        }
    
    }

    // Mostrar usuarios por ID
    async getUserById (req, res, next) {
        const { id } = req.params
    
        try {
            const userId = await userManager.getUserById( id )
            if(!userId){
                next(CustomError.createError({
                    name: 'ID DEL USUARIO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${id} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            const {password, ...usuarioSinPassword} = userId
            res.send(usuarioSinPassword)
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    
    }

    // Creacion de Usuario
    async addUser (req, res, next) {

        const { first_name, last_name, email, age, role, password } = req.body
        const { body } = req
        const users = await userManager.getUsers()
    
        if(!first_name || !last_name || !email || !age || !role || !password){
            next(CustomError.createError({
                name: 'CAMPOS OBLIGATORIOS',
                message: 'Todos los campos son obligatorios',
                cause: userErrorInfo({ first_name, last_name, email, age, role, password }),
                code: EErrors.CAMPOS_OBLIGATORIOS,
                statusCode: 400
            }))
            return
        } else if(users.find(us => us.email == email)){
            next(CustomError.createError({
                name: 'PRODUCTO EXISTENTE',
                message: 'El producto ya existe.',
                cause: await errorExistingUser({ email }),
                code: EErrors.PRODUCTO_EXISTENTE,
                statusCode: 400
            }))
        } else{
    
            const result = await userManager.addUser( body )
            res.status(201).send({
                Created: `El usuario ha sido creado con exito. ¡Bienvenido ${body.last_name}!`, payload: result
            })
    
        }
    
    }

    // Modificar Usuarios
    async updateUser (req, res, next) {

        const { id } = req.params
        const { body } = req
    
        try {
    
            const user = await userManager.updateUser(id, body)
            if(user.matchedCount >= 1){
                res.status(202).send({Accepted: `El usuario con id: ${id} ha sido modificado.`})
                return
            }
            
            next(CustomError.createError({
                name: 'ID DEL USUARIO INEXISTENTE',
                message: 'El id ingresado es inexistente',
                cause: `El id: ${id} que ingresaste es inexistente`,
                code: EErrors.ID_INEXISTENTE,
                statusCode: 401
            }))
    
        } catch (error) {
            res.status(500).send({
                message: 'Ha ocurrido un error en el servidor',
                exception: error.stack
            })
        }
    
    }

    // Eliminar usuario
    async deleteUser (req, res, next) {

        const { id } = req.params
    
        try {
            
            const user = await userManager.deleteUser( id )
            if(user.deletedCount >= 1){
                res.status(202).send({
                    Accepted: `El usuario con id: ${id} ha sido eliminado`
                })
                return
            }
    
            next(CustomError.createError({
                name: 'ID DEL USUARIO INEXISTENTE',
                message: 'El id ingresado es inexistente',
                cause: `El id: ${id} que ingresaste es inexistente`,
                code: EErrors.ID_INEXISTENTE,
                statusCode: 401
            }))
    
        } catch (error) {
            res.status(500).send({
                message: 'Ha ocurrido un error en el servidor',
                exception: error.stack
            })
        }
    
    }

    // CAMBIAR USUARIOS PREMIUM a CUSTOMER Y VICEVERSA

    async premiumCustomer (req, res, next){
        const uid = req.params.uid

        try {
            const userId = await userManager.getUserById(uid)

            if(!userId){
                next(CustomError.createError({
                    name: 'ID DEL USUARIO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${uid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
    
            if(userId.role == 'Customer'){

                const verificacion = ["identificacion", "comprobante de domicilio", "comprobante de estado de cuenta"]
                const verificacionOK = verificacion.every(ver => 
                    userId.documents.some(obj => obj.name === ver)
                )

                if(!verificacionOK){
                    next(CustomError.createError({
                        name: 'PERMISO BLOQUEADO',
                        message: 'El usuario no puede ser un Customer/Premium',
                        cause: `el usuario: ${userId.first_name}, no tiene la documentacion necesaria para ser un Customer/Premium`,
                        code: EErrors.PERMISOS_BLOQUEADOS,
                        statusCode: 401
                    }))
                    return
                }

                const user = await userManager.updateUser(uid, {role: 'Premium'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Premium`)
                    res.status(202).send({Accepted: `El usuario con id: ${uid} paso a ser Premium!.`})
                    return
                }
            }
    
            if(userId.role == 'Premium'){
                const user = await userManager.updateUser(uid, {role: 'Customer'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Customer`)
                    res.status(202).send({Accepted: `El usuario con id: ${uid} paso a ser Customer!.`})
                    return
                }
            }

            next(CustomError.createError({
                name: 'PERMISO BLOQUEADO',
                message: 'El usuario no puede ser un Customer/Premium',
                cause: `el usuario: ${userId.first_name}, no tiene los permisos necesarios para ser un Customer/Premium`,
                code: EErrors.PERMISOS_BLOQUEADOS,
                statusCode: 401
            }))

        } catch (error) {
            res.status(500).send({
                message: 'Ha ocurrido un error en el servidor',
                exception: error.stack
            })
        }

    }
    // Mostrar en Handlebars
    async premiumCustomerView (req, res){
        const uid = req.params.uid

        try {
            const userId = await userManager.getUserById(uid)
    
            if(userId.role == 'Customer'){

                const verificacion = ["identificacion", "comprobante de domicilio", "comprobante de estado de cuenta"]
                const verificacionOK = verificacion.every(ver => 
                    userId.documents.some(obj => obj.name === ver)
                )

                if(!verificacionOK){
                    const cartId = await cartManager.getCartById(req.user.cart._id)
                    res.render('errorCarrito', {
                        title: '¡No posee la documentacion necesarioa para pasar a ser Premium!',
                        user: req.user ? {
                            ...req.user,
                            isAdmin: req.user.role == 'admin',
                            isPublic: req.user.role == 'Customer',
                            isPremium: req.user.role == 'Premium'
                        } : null,
                        idCart: cartId._id,
                        style: 'order'
                    })
                    return
                }

                const user = await userManager.updateUser(uid, {role: 'Premium'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Premium`)
                    res.redirect('/profile')
                    return
                }
            }
    
            if(userId.role == 'Premium'){
                const user = await userManager.updateUser(uid, {role: 'Customer'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Customer`)
                    res.redirect('/profile')
                    return
                }
            }

        } catch (error) {
            res.status(500).send({
                message: 'Ha ocurrido un error en el servidor',
                exception: error.stack
            })
        }

    }

    async premiumAdminView (req, res){

        const uid = req.params.uid

        try {
            const userId = await userManager.getUserById(uid)
    
            if(userId.role == 'Customer'){

                const user = await userManager.updateUser(uid, {role: 'Premium'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Premium`)
                    res.render('errorCarrito', {
                        title: 'Se cambio el Rol del Usuario',
                        style: 'order',
                        user: req.user ? {
                            ...req.user,
                            isAdmin: req.user.role == 'admin',
                            isPublic: req.user.role == 'Customer',
                            isPremium: req.user.role == 'Premium'
                        } : null
                    })
                    return
                }
            }
    
            if(userId.role == 'Premium'){
                const user = await userManager.updateUser(uid, {role: 'Customer'})
                if(user.matchedCount >= 1){
                    logger.info(`El usuario ${userId.first_name} paso a ser Customer`)
                    res.render('errorCarrito', {
                        title: 'Se cambio el Rol del Usuario',
                        style: 'order',
                        user: req.user ? {
                            ...req.user,
                            isAdmin: req.user.role == 'admin',
                            isPublic: req.user.role == 'Customer',
                            isPremium: req.user.role == 'Premium'
                        } : null
                    })
                    return
                }
            }

        } catch (error) {
            res.status(500).send({
                message: 'Ha ocurrido un error en el servidor',
                exception: error.stack
            })
        }

    }

    // CREACION DE DOCUMENTOS

    async postDocuments ( req, res ){

        const { uid } = req.params
        const user = await userManager.getUserById(uid)

        if(!user.documents){
            await userManager.updateUser(
                uid,
                {
                    ...user,
                    documents: [
                        {
                        name: req.body.name,
                        reference: req.file.path,
                        tipo: req.body.tipo
                        }
                    ]
                }
            )
        } else {
            await userManager.updateUser(
                uid,
                {
                    ...user,
                    documents: [
                        ...user.documents,
                        {
                        name: req.body.name,
                        reference: req.file.path,
                        tipo: req.body.tipo
                        }
                    ]
                }
            )
        }


        res.send('OK')
    }
}

module.exports = new UserController()