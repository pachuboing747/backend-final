const ManagerFactory = require('../../dao/managersMongo/manager.factory')
const CustomError = require('../../errors/custom.error')
const EErrors = require('../../errors/enum.error')
const { productErrorInfo, errorExistingProduct } = require('../../errors/info.error')
const logger = require('../../logger/index')

const productManager = ManagerFactory.getManagerInstance('products')
const userManager = ManagerFactory.getManagerInstance('users')

const mailSenderService = require('../../services/mail.sender.service')

class ProductController {

    async getProducts (req, res) {

        let { query, page, limit, sort } = req.query

        if(sort == 'asc'){
            sort = 1
        } else if( sort == 'desc'){
            sort = -1
        }
    
        if(query){
            if (!query.startsWith('{"') || !query.endsWith('"}'))
            res.status(400).send({error: 'Query incorrecto.'})
    
            query = JSON.parse(query);
        }
        
    
        if(sort == 1 || sort == -1 || sort == "" || sort == undefined){
            sort
        } else {
            res.status(400).send({ error: 'Sort incorrecto.'})
        }
    
        const { docs: products, ...pageInfo } = await productManager.getProducts( page, limit, query, sort )
    
        if(query){
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}&query=${query}` : null
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}&query=${query}` : null
        } else if (query && sort){
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}&query=${query}&sort=${sort}` : null
    
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}&query=${query}&sort=${sort}` : null
        } else {
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}` : null
    
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}` : null
        }
    
        if(sort){
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}&sort=${sort}` : null
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}&sort=${sort}` : null
        } else if (query && sort){
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}&query=${query}&sort=${sort}` : null
    
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}&query=${query}&sort=${sort}` : null
        } else{
            
            pageInfo.prevLink = pageInfo.hasPrevPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.prevPage}&limit=${pageInfo.limit}` : null
        
            pageInfo.nextLink = pageInfo.hasNextPage ? `https://proyectocoderhouse.up.railway.app/?page=${pageInfo.nextPage}&limit=${pageInfo.limit}` : null
    
        }
            
        try {
            res.send({
                status: 'success',
                payload: products,
                totalPages: pageInfo.totalPages,
                prevPage: pageInfo.prevPage,
                nextPage: pageInfo.nextPage,
                page: pageInfo.page,
                hasPrevPage: pageInfo.hasPrevPage,
                hasNextPage: pageInfo.hasNextPage,
                prevLink: pageInfo.prevLink,
                nextLink: pageInfo.nextLink
            })
        } catch{
            res.send({
                status: 'error',
                payload: products,
                totalPages: pageInfo.totalPages,
                prevPage: pageInfo.prevPage,
                nextPage: pageInfo.nextPage,
                page: pageInfo.page,
                hasPrevPage: pageInfo.hasPrevPage,
                hasNextPage: pageInfo.hasNextPage,
                prevLink: pageInfo.prevLink,
                nextLink: pageInfo.nextLink
            })
        }
    
    }

    async getProductById (req, res, next) {
        const { pid } = req.params
    
        try {
    
            const product = await productManager.getProductById(pid)
            
            if(!product){
                next(CustomError.createError({
                    name: 'ID INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${pid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }

            res.send(product)
            
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el servidor'})
        }
    
    }

    async addProduct (req, res, next) {
        const { title, description, price, category, code, stock } = req.body
        const { body } = req
    
        const {docs: product} = await productManager.getProducts()
        
        if(!title || !description || !price || !category || !code || !stock){
            next(CustomError.createError({
                name: 'CAMPOS OBLIGATORIOS',
                message: 'Todos los campos son obligatorios',
                cause: productErrorInfo({ title, description, price, category, code, stock }),
                code: EErrors.CAMPOS_OBLIGATORIOS,
                statusCode: 400
            }))
            return
        } else if (product.find(prod => prod.title == title || prod.code == code)) {
            next(CustomError.createError({
                name: 'PRODUCTO EXISTENTE',
                message: 'El producto ya existe.',
                cause: await errorExistingProduct({ title, code }),
                code: EErrors.PRODUCTO_EXISTENTE,
                statusCode: 400
            }))
            return
        } else {
            if(req.user.role == 'Premium'){
                req.io.emit('addProduct', {
                    ...body,
                    owner: req.user.email
                });
                const result = await productManager.addProduct({
                    ...body,
                    owner: req.user.email
                })
                res.status(201).send({Created: `El Producto ${title} fue creado con exito`, payload: result})
            } else{
                req.io.emit('addProduct', body);
                const result = await productManager.addProduct(body)
                res.status(201).send({Created: `El Producto ${title} fue creado con exito`, payload: result})
            }
        }
        
    }

    async updateProduct (req, res, next) {
        const { pid } = req.params
        const { body } = req
    
        try {
            
            const result = await productManager.updateProduct(pid, body)
            if(result.matchedCount >= 1){
                res.status(202).send({Accepted: `El producto con id: ${pid} ha sido modificado.`})
                return
            }
            
            next(CustomError.createError({
                name: 'ID INEXISTENTE',
                message: 'El id ingresado es inexistente',
                cause: `El id: ${pid} que ingresaste es inexistente`,
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

    async deleteProduct (req, res, next) {
        const { pid } = req.params
        
        try {
            
            const productId = await productManager.getProductById( pid )

            if(!productId){
                next(CustomError.createError({
                    name: 'ID INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${pid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            
            const premium = productId.owner == 'admin'

            if(req.user.role == 'admin'){

                if(!premium){

                    const user = await userManager.getUserByEmail(productId.owner)

                    const template = `
                    <h2>¡Hola ${user.first_name}, ${user.last_name}!</h2>
                    <h4>Queriamos avisarte que el producto con id: ${productId._id} fue eliminado por un usuario Administrador.</h4>    
                    <br>
                    <h3>¡Muchas gracias, te esperamos pronto!</h3>
                `

                    const subject = 'Producto Eliminado Por Un Administrador'
            
                    mailSenderService.send(subject, user.email, template)

                    logger.debug(`Fue eliminado un producto premium con id: ${productId._id}`)

                }

                const result = await productManager.deleteProduct(pid)
                if (result.deletedCount >= 1) {
                    req.io.emit('deleteProduct', productId.code)
                    res.status(200).send({OK: `El producto con id: ${pid} ha sido eliminado.`, payload: result})
                    return
                }
                
            } else {
                if(premium){
                    next(CustomError.createError({
                        name: 'PERMISO BLOQUEADO',
                        message: 'El usuario no puede eliminar este producto',
                        cause: `el usuario: ${req.user.email}, no tiene los permisos necesarios para eliminar este producto`,
                        code: EErrors.PERMISOS_BLOQUEADOS,
                        statusCode: 401
                    }))
                    return
                } 

                const result = await productManager.deleteProduct(pid)
                if (result.deletedCount >= 1) {
                    req.io.emit('deleteProduct', productId.code)
                    res.status(200).send({OK: `El producto con id: ${pid} ha sido eliminado.`, payload: result})
                    return
                }
            }
            
            
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el servidor'})
        }
        
    }


    // GENERADOR DE PRODUCTOS CON MOCK
    async getProductsMock (req, res) {
        try {
            
            const products = await productManager.getProductsMock()

            res.send(products)

        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el servidor'})
        }
    }
}

module.exports = new ProductController()