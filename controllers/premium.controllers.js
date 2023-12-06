const ManagerFactory = require('../dao/managersMongo/manager.factory')

const productManager = ManagerFactory.getManagerInstance('products')
const cartManager = ManagerFactory.getManagerInstance('carts')

const logger = require('../logger/index')

class PremiumController {

    async getPremium (req, res) {

        const cart = await cartManager.getCartById(req.user.cart._id)
    
        res.render('premium/deletePremium', {
            title: 'Eliminar un producto Premium',
            style: 'admin',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            } : null,
            idCart: cart._id
        })
    
    }
    
    async deletePremium (req, res) {
        const pid = req.body.id
        
        const cart = await cartManager.getCartById(req.user.cart._id)
        const productId = await productManager.getProductById( pid )

        if(!productId){
            res.render('errorCarrito', {
                title: 'El id del producto es inexistente',
                style: 'order',
                user: req.user ? {
                    ...req.user,
                    isAdmin: req.user.role == 'admin',
                    isPublic: req.user.role == 'Customer',
                    isPremium: req.user.role == 'Premium'
                } : null,
                idCart: cart._id
            })
            return
        }
        
        const premium = productId.owner == 'admin'

        if(req.user.role == 'admin'){
            const result = await productManager.deleteProduct(pid)
            if (result.deletedCount >= 1) {
                req.io.emit('deleteProduct', productId.code)
                res.status(200).send({OK: `El producto con id: ${pid} ha sido eliminado.`})
                return
            }     
        } else {
            if(premium){
                res.render('errorCarrito', {
                    title: 'No tienes permiso para eliminar este producto',
                    style: 'order',
                    user: req.user ? {
                        ...req.user,
                        isAdmin: req.user.role == 'admin',
                        isPublic: req.user.role == 'Customer',
                        isPremium: req.user.role == 'Premium'
                    } : null,
                    idCart: cart._id
                })
                return
            } 

            const result = await productManager.deleteProduct(pid)
            if (result.deletedCount >= 1) {
                req.io.emit('deleteProduct', productId.code)
                logger.info('Producto eliminado con exito!')
                res.redirect('/')
                return
            }
        }

    }
}

module.exports = new PremiumController()