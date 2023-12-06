const ManagerFactory = require('../dao/managersMongo/manager.factory')

const chatMessageManager = ManagerFactory.getManagerInstance('chatMessages')
const cartManager = ManagerFactory.getManagerInstance('carts')
const userManager = ManagerFactory.getManagerInstance('users')
const productManager = ManagerFactory.getManagerInstance('products')

const mailSenderService = require('../services/mail.sender.service')
const logger = require('../logger/index')

async function SocketManager (socket) {

    const userOnline = {}

    // Carrito de compras
    socket.on('productCart', (cartId) => {
        const cartAndProductId = cartId.split(",")

        cartManager.addProductCart(cartAndProductId[0], cartAndProductId[1])
    })

    // Elimnar producto del carrito de compras
    socket.on('deleteProductCart', (productId) => {
        const cartAndProductId = productId.split(",")
        cartManager.deleteProductCart(cartAndProductId[0], cartAndProductId[1])

    })

    // Eliminar producto por el ADMIN
    socket.on('deleteProduct', async (productId) => {
        const product = await productManager.getProductById(productId)
        const premium = product.owner == 'admin'

        if(!premium){
            const user = await userManager.getUserByEmail(product.owner)
            const template = `
                    <h2>¡Hola ${user.first_name}, ${user.last_name}!</h2>
                    <h4>Queriamos avisarte que el producto con id: ${product._id} fue eliminado por un usuario Administrador.</h4>    
                    <br>
                    <h3>¡Muchas gracias, te esperamos pronto!</h3>
                `

            const subject = 'Producto Eliminado Por Un Administrador'
    
            mailSenderService.send(subject, user.email, template)

            logger.debug(`Fue eliminado un producto premium con id: ${product._id}`)
        }

        await productManager.deleteProduct(productId)

    })

    // logica de los mensajes
    // obtengo todos los mensajes de la base de datos

    const messages = await chatMessageManager.getMessages()

    socket.emit('chat-messages', messages)

    socket.on('chat-message', async (msg) => {
        
        // guardamos los mensajes en la DB

        await chatMessageManager.addMessage(msg)
        socket.broadcast.emit('chat-message', msg)
    })

    socket.on('user', ({ user, action }) => {
        userOnline[socket.id] = user
        socket.broadcast.emit('user', { user, action })
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('user', {
            user: userOnline[socket.id],
            action: false
    })

    delete userOnline[socket.id] // como borrar la propiedad del objeto
    })
}

module.exports = SocketManager