const socket = io()

const listProducts = document.getElementById('list-products')
const listProductsCart = document.getElementById("productsInCart")

// Funcion del boton de Agregar al Carrito
function addToCart (cartId) {
    socket.emit('productCart', cartId)
}

// Funcion para que el ADMIN elimine un producto
function deleteProductAdmin (productId) {

    socket.emit('deleteProduct', productId)

    const p = productId.toString()
    const div = document.getElementById(p)
    
    listProducts.removeChild(div)

}

// Funcion para elimnar producto del carrito de Compras
function deleteProductCart (productId) {
    
    socket.emit('deleteProductCart', productId)

    setTimeout(() => {
        location.reload(true)
    }, 500)

}

