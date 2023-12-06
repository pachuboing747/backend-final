//PRODUCT MANAGER CON MONGO

// Importacion del modelo de mongo
const productModel = require('../models/product.model')
const generateProducts = require('../../utils/mock.utils')

class ProductManager {

    async addProduct ( producto ) {
        
        const product = await productModel.create( producto )

        return product
        
    }

    async getProducts ( page = 1, limit = 10, query, sort) {

        if(sort == 1 || sort == -1){

            const opciones = {
                page: page,
                limit: limit,
                sort: { price: sort },
                lean: true
            }
    
            if(query){
    
                const query1 = {}
        
                query1["$or"] = [
                    query
                ]

                const products = await productModel.paginate( query1, opciones )
        
                return products
            } else{
                const products = await productModel.paginate( {}, opciones )
        
                return products
            }
        } else {
            
            const opciones = {
                page: page,
                limit: limit,
                lean: true
            }
    
            if(query){
    
                const query1 = {}
        
                query1["$or"] = [
                    query
                ]
                const products = await productModel.paginate( query1, opciones )
        
                return products
            } else{
                const products = await productModel.paginate( {}, opciones )
        
                return products
            }
        }

    }
    
    async getProductById ( id ) {
        const products = await productModel.find({ _id: id })

        return products[0]
    }
    
    async updateProduct (id, product) {
        
        const result = await productModel.updateOne({ _id: id }, product)

        return result
    }

    async deleteProduct (id) {
        
        const result = await productModel.deleteOne({ _id: id })

        return result
        
    }

    // GENERADOR DE PRODUCTOS CON MOCK

    async getProductsMock() {

        return await generateProducts()
    }

}

module.exports = new ProductManager()


