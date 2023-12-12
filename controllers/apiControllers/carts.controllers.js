const ManagerFactory = require('../../dao/managersMongo/manager.factory')
const CustomError = require('../../errors/custom.error')
const EErrors = require('../../errors/enum.error')
const logger = require('../../logger/index')

const cartManager = ManagerFactory.getManagerInstance('carts')
const productManager = ManagerFactory.getManagerInstance('products')
const purchaseManager = ManagerFactory.getManagerInstance('purchases')

const mailSenderService = require('../../services/mail.sender.service')

class CartController {


    async addCart(req, res) {
        try {
          const { body } = req; 
          console.log('Request Body:', body);
          const result = await cartManager.addCart(body); 
          console.log('Result:', result); 
          res.status(201).send({ Created: 'El carrito fue creado con éxito!', payload: result });
        } catch (error) {
          console.error('Error en addCart:', error);
          res.status(500).send({ error: 'Ocurrió un error en el sistema' });
        }
    }
    
    async getCart(req, res) {
        try {
            const cart = await cartManager.getCart();
            res.render('carts', { cartId: cart }); // Asegúrate de ajustar el nombre de la plantilla
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            res.status(500).send('Error al obtener el carrito');
        }
    }
    

    async getCartById (req, res, next) {
        const { cid } = req.params
    
        try {
            
            const cartId = await cartManager.getCartById( cid )
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
    
            res.send(cartId)
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema' })
        }
    
    }

    async addProductCart (req, res, next) {
        const { cid, idProduct } = req.params
    
        try {
            const cartId = await cartManager.getCartById( cid )
            const productId = await productManager.getProductById( idProduct )

            
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            
            if(!productId){
                next(CustomError.createError({
                    name: 'ID DEL PRODUCTO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${idProduct} que ingresaste es inexistente`,
                    code: EErrors.INVALID_TYPES_ERROR,
                    statusCode: 401
                }))
                return
            }
            
            const premium = productId.owner == 'admin'
            if(req.user.role == 'Customer'){
                await cartManager.addProductCart( cid, idProduct )
                res.status(202).send({Accepted: `Se ha agregado un producto al carrito con id: ${ cid }`})
            } else if(req.user.role == 'Premium'){
                if(!premium){
                    next(CustomError.createError({
                        name: 'PERMISO BLOQUEADO',
                        message: 'El usuario no puede eliminar este producto',
                        cause: `el usuario: ${req.user.email}, no tiene los permisos necesarios para eliminar este producto`,
                        code: EErrors.PERMISOS_BLOQUEADOS,
                        statusCode: 401
                    }))
                    return
                }

                await cartManager.addProductCart( cid, idProduct )
                res.status(202).send({Accepted: `Se ha agregado un producto al carrito con id: ${ cid }`})
            }
            
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async deleteProductCart (req, res, next) {
        const {cid, idProduct} = req.params
    
        try {
            const cartId = await cartManager.getCartById( cid )
    
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
    
            if(!cartId.products.find(pr => pr.product == idProduct)){
                next(CustomError.createError({
                    name: 'ID DEL PRODUCTO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${idProduct} que ingresaste es inexistente`,
                    code: EErrors.INVALID_TYPES_ERROR,
                    statusCode: 401
                }))
                return
            }
        
            await cartManager.deleteProductCart(cid, idProduct)
            res.status(202).send({ Accepted: `Se elimino el producto con id: ${idProduct} del carrito con id: ${cid}`})
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async deleteCart (req, res, next) {
        const { cid } = req.params
    
        try {
            const cartId = await cartManager.getCartById( cid )
    
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            
            await cartManager.deleteProductsCart( cid )
            res.status(202).send({ Accepted: `Se eliminaron todos los productos del carrito con id: ${cid}`})
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async deleteEntireCart(req, res, next) {
        const { cid } = req.params
    
        try {
            const cartId = await cartManager.getCartById( cid )
    
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            
            await cartManager.deleteCart( cid )
            res.status(202).send({ Accepted: `Se elimino el carrito con id: ${cid}`})
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async updateCart (req, res, next) {
        const { cid } = req.params
        const { body } = req
    
        try {
            const cartId = await cartManager.getCartById( cid )
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
            
            await cartManager.updateCart(cid, body)
            res.status(202).send({ Accepted: `El carrito con id: ${cid} ha sido modificado.` })
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async updateProductCart (req, res, next) {
        const { cid, idProduct } = req.params
        const { body } = req
    
        try {
            const cartId = await cartManager.getCartById( cid )
    
            if(!body == { quantity: Number }){
                logger.error('Error')
            }
            
            if(!cartId){
                next(CustomError.createError({
                    name: 'ID DEL CARRITO INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${cid} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
        
            if(!cartId.products.find(pr => pr.product == idProduct)){
                next(CustomError.createError({
                    name: 'ID DEL PRODUCT INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${idProduct} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
        
            await cartManager.updateProductCart(cid, body, idProduct) 
            res.status(202).send({ Accepted: `El producto con id: ${idProduct} del carrito con id: ${cid} ha modificado su cantidad` })
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    
    }

    async addOrderCart (req, res) {
        const { cid } = req.params

        try {
        
                let cart = await cartManager.getCartById(cid)
        
                if(!cart) {
                    return res.sendStatus(404)
                }
        
                const { products: productsInCart } = cart
                const products = [] 
                const productsDelete = []
        
                for (const { product: id, quantity } of productsInCart) {
            
                    
                    const p = await productManager.getProductById(id)
        
                    if(!p.stock){
                        return
                    }
        
                    const toBuy = p.stock >= quantity ? quantity : p.stock
        
                    products.push({
                        id: p._id,
                        price: p.price,
                        quantity: toBuy
                    })
                    
                    
                    if(quantity > p.stock){
                        productsDelete.push({
                            id: p._id,
                            unPurchasedQuantity: quantity - p.stock
                        })
                    } 
                    
                
                    if(p.stock > quantity){
                        await cartManager.deleteProductsCart(cid)
                    }
                    
                
                    p.stock = p.stock - toBuy
                    
                    await p.save()
                    
                }
        
               
                for(const { id, unPurchasedQuantity } of productsDelete) {
                    await cartManager.addProductCart(cid, id)
                    await cartManager.updateProductCart(cid, {quantity: unPurchasedQuantity}, id)
                }
        
                cart = await cart.populate({ path: 'user', select: [ 'email', 'firstname', 'lastname' ] })
        
        
                const today = new Date()
                const hoy = today.toLocaleString()
        
                const order = {
                    user: cart.user._id,
                    code: Date.now(),
                    total: products.reduce((total, { price, quantity }) => (price * quantity) + total, 0),
                    products: products.map(({ id, quantity }) => {
                        return {
                            product: id,
                            quantity
                        }
                    }),
                    purchaser: cart.user.email,
                    purchaseDate: hoy
                }

                purchaseManager.addOrder(order)
        
            
        
                const template = `
                    <h2>¡Hola ${cart.user.firstname}!</h2>
                    <h3>Tu compra fue realizada con exito. Aqui te dejamos el ticket de compra.</h3>    
                    <br>
                    <div style="border: solid 1px black; width: 310px;">
                        <h3 style="font-weight: bold; color: black; text-align: center;">Comprobante de Compra</h3>
                        <ul style="list-style: none; color: black; font-weight: 500;">
                            <li>Nombre y Apellido: ${cart.user.firstname}, ${cart.user.lastname}</li>
                            <li>Codigo: ${order.code}</li>
                            <li>Catidad de Productos Comprados: ${order.products.length}</li>
                            <li>Total: $ ${order.total}</li>
                            <li>Fecha: ${order.purchaseDate}</li>
                        </ul>
                    </div>
        
                    <h3>¡Muchas gracias, te esperamos pronto!</h3>
                `

                const subject = 'Compra realizada'
        
                mailSenderService.send(subject, order.purchaser, template)
        
                res.status(202).send(
                    {
                        Accepted: `!Felicitaciones ha finalizado su compra!. Orden enviada por mail`,
                        unPurchasedProducts: productsDelete
                    })

        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }

    }


    async getOrders (req, res) {

        const orders = await purchaseManager.getOrders()

        res.send(orders)
    }


    async getOrderById (req, res, next) {
        const { id } = req.params

        try {
            
            const order = await purchaseManager.getOrderById(id)
            if(!order){
                next(CustomError.createError({
                    name: 'ID DE LA ORDEN INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${id} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
    
            res.send(order)
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }


    async deleteOrder (req, res, next) {
        const { id } = req.params

        try {
            
            const order = await purchaseManager.getOrderById(id)
            if(!order){
                next(CustomError.createError({
                    name: 'ID DE LA ORDEN INEXISTENTE',
                    message: 'El id ingresado es inexistente',
                    cause: `El id: ${id} que ingresaste es inexistente`,
                    code: EErrors.ID_INEXISTENTE,
                    statusCode: 401
                }))
                return
            }
    
            await purchaseManager.deleteOrder(id)
            res.status(202).send({Accepted: `Se ha eliminado con exito la orden con id: ${id}`})
    
        } catch (error) {
            logger.error(error)
            res.status(500).send({ error: 'Ocurrio un error en el sistema'})
        }
    }

    async getAll  (req, res) {

        const { search, max, min, limit } = req.query;
        const cart = await cartManager.getCart();
      
        let filtrados = cart;
      
        if (search) {
          filtrados = filtrados.filter(
            (p) =>
              p.keywords.includes(search.toLowerCase()) ||
              p.title.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase())
          );
        }
      
        if (min || max) {
          filtrados = filtrados.filter(
            (p) => p.price >= (+min || 0) && p.price <= (+max || Infinity)
          );
        }
      
        res.send(filtrados);
    }

}

module.exports = new CartController()