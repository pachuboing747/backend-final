const d = document

const socket = io()

const listProducts = d.getElementById('list-products')

// CREACION del producto a treves de la peticion POST
socket.on('addProduct', (product) => {

    const div = d.createElement('div')
    div.setAttribute('id', product.code)
    div.innerHTML = `<div class="uk-card uk-card-default uk-card-hover uk-border-rounded" style="height: 550px;">
                            <div class="uk-card-media-top uk-flex uk-flex-center" style="height: 200px;">
                                <img alt="foto producto" src="static/img/${product.thumbnail}" />
                            </div>
                            <div class="uk-card-body" style="height: 400px; text-align: center;">
                                <h3 class="uk-card-title">${product.title}</h3>
                                <h5>$${product.price}</h5>
                                <p>${product.description}</p>
                                <p>${product.stock}</p>
                                <p>${product.category}</p>
                                <button class="uk-button uk-button-secondary uk-button-small uk-border-rounded">Agregar al carrito</button>
                            </div>
                    </div>`

    listProducts.appendChild(div)
})


// ELIMINACION del producto a treves de la peticion DELETE
socket.on('deleteProduct', (pid) => {
    const p = pid.toString()
    const div = d.getElementById(p)

    listProducts.removeChild(div)
})
