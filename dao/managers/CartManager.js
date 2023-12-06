const fs = require('fs/promises')
const path = require('path')

class CartManager {

    constructor(filename){
        this.filename = filename,
        this.filepath = path.join(__dirname, this.filename) 
    }

    async addCart () {

        const data = await fs.readFile(this.filepath, 'utf-8')
        const cart = JSON.parse(data)

        const newId = (cart[cart.length - 1]?.id || 0) + 1

        cart.push({
            id: newId,
            products: cart.products ? cart.products.split(", ") : []
        })

        await fs.writeFile(this.filepath, JSON.stringify(cart, null, 2))
    }

    async getCartById (id) {

        const data = await fs.readFile(this.filepath, 'utf-8')
        const cart = JSON.parse(data)

        const cartId = cart.find(cart => cart.id == id)

        return cartId
    }

    async addProductCart (cid, id) {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const cart = JSON.parse(data)

        const cartId = cart.find(cart => cart.id == cid)
        const productId = cartId.products.find(prod => prod.product == id)

        if(!productId){
            cartId.products.push({
                product: id,
                quantity: 1
            })
        } else {
            productId.quantity = productId.quantity + 1
        }
        
        await fs.writeFile(this.filepath, JSON.stringify(cart, null, 2))
    }

}

module.exports = CartManager