const cartModel = require('../../models/cart.model.js')
const productModel = require('../../models/product.model.js')

class CartManager {

    async addCart () {

        const cart = await cartModel.create( { user: undefined, products: [] } )

        return cart
    }

    async getCart (){

        const cart = await cartModel.find({}).lean()

        return cart
    }

    async getCartById (id) {

        const cartId = await cartModel.find({_id: id})

        return cartId[0]
    }

    async addProductCart (cid, idProduct, userId, isPremiumUser) {

        let cart = await cartModel.findOne({_id: cid})

        const product = await productModel.findOne({_id: idProduct})

        if (isPremiumUser && product.owner === userId) {
            return;
        }

        const p = cart.products.find(pr => pr.product.equals(product._id))

        if(p) {
            p.quantity += 1
        } else {
            cart.products.push({
                product: product._id,
                quantity: 1
            })
        }

        cart = await cart.populate({ path: 'products.product', select: [ 'title', 'price' ] })
        
        await cart.save()

    }

    async deleteProductCart(_id, idProduct) {
        try {
            const cart = await cartModel.findOne({ _id});
    
            if (!cart) {
                console.error("El carrito no existe.");
                return false; 
            }
    
            const productId = await productModel.findOne({ _id: idProduct });
            const productQ = cart.products.find(pr => pr.product && pr.product.equals(idProduct));

            if (productQ) {
                if (productQ.quantity > 1) {
                    productQ.quantity = productQ.quantity - 1;
                } else {
                    cart.products = cart.products.filter(pr => pr.product && !pr.product.equals(productId._id));
                }
                console.log("Producto eliminado del carrito");
                await cart.save();
                return true; 
            } else {
                console.error("Producto no encontrado en el carrito.");
                return false; 
            }
            
            
        } catch (error) {
            console.error("Error al eliminar el producto del carrito", error);
            throw error;
        }
    }
    

    async deleteProductsCart(cid){

        let cart = await cartModel.findOne({_id: cid})

        cart.products = []

        cart.save()
    }

    async updateCart (cid, product){

        let cart = await cartModel.findOne({ _id: cid })

        cart.products = product

        cart.save()

    }

    async updateProductCart (cid, newQuantity, idProduct) {
        let cart = await cartModel.findOne({ _id: cid })

        const productId = await productModel.findOne({ _id: idProduct})

        const p = cart.products.find(prod => prod.product.equals(productId._id))

        p.quantity = newQuantity.quantity

        cart.save()
    }

    async getPopulate(pid) {
        try {
          const cart = await this.model.findById(pid).populate("products.product");
          return cart;
        } catch (error) {
          console.error("Error al obtener el carrito:", error);
          return null;
        }
    }
    
}

module.exports = new CartManager()