// PRODUCT MANAGER CON FILESYSTEM

const fs = require('fs/promises')
const path = require('path')


class ProductManager {

    constructor(filename){
        this.filename = filename
        this.filepath = path.join(__dirname, this.filename)
    }

    async addProduct ( producto, id ) {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const product = JSON.parse(data)


        product.push({
            status: true,
            ...producto,
            thumbnail: producto.thumbnail ? `static/img/${producto.thumbnail.split(", ")}` : [],
            id
        })

        await fs.writeFile(this.filepath, JSON.stringify(product, null, 2))
    }

    async getProducts () {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const product = JSON.parse(data)

        return product
    }
    

    async getProductById (id) {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const product = JSON.parse(data)
        
        const productId = product.find(prod => prod.id == id)

        return productId
    }
    
    async updateProduct (id, edit) {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const product = JSON.parse(data)

        let productId = product.find(prod => prod.id == id)
        let productDelete = product.filter(prod => prod.id != id)
        
        const productEdit = {
            ...productId,
            ...edit
        }

        if(productId){
            await fs.writeFile(this.filepath, JSON.stringify(productDelete, null, 2))
            productDelete.push(productEdit)
        }

        await fs.writeFile(this.filepath, JSON.stringify(productDelete, null, 2))
    }

    async deleteProduct (id) {
        const data = await fs.readFile(this.filepath, 'utf-8')
        const product = JSON.parse(data)

        const productDelete = product.filter(prod => prod.id != id)
        await fs.writeFile(this.filepath, JSON.stringify(productDelete, null, 2))

    }


}

    module.exports = ProductManager


