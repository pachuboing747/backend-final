const ManagerFactory = require('../dao/managersMongo/manager.factory')
const productManager = ManagerFactory.getManagerInstance('products')
const userManager = ManagerFactory.getManagerInstance('users')

// TODOS LOS CAMPOS SON OBLIGATORIOS
const productErrorInfo = (p) => {
    return `TODOS LOS CAMPOS SON OBLIGATORIOS
    CAMPOS REQUIRIDOS:
    - Title: ${p.title}
    - Description: ${p.description}
    - Price: ${p.price}
    - Category: ${p.category}
    - Code: ${p.code}
    - Stock: ${p.stock}

    COMPLETA EL CAMPO QUE DICE UNDEFINED
    `
}

// TITLE Y CODE NO PUEDEN REPETIRSE 
const errorExistingProduct = async (p) => {
    
    const {docs: product} = await productManager.getProducts()

    if(product.find(prod => prod.title == p.title && prod.code == p.code)){
        return `PRODUCTO YA EXISTENTE
        CAMPOS REPETIDO:
        - Title: ${p.title}
        - Code: ${p.code}

        CAMBIA EL CAMPO QUE ESTE REPETIDO
    `
    }

    if(product.find(prod => prod.title == p.title)){
        return `PRODUCTO YA EXISTENTE
        CAMPOS REPETIDO:
        - Title: ${p.title}

        CAMBIA EL CAMPO QUE ESTE REPETIDO
    `
    } else if(product.find(prod => prod.code == p.code)){
        return `PRODUCTO YA EXISTENTE
        CAMPOS REPETIDO:
        - Code: ${p.code}

        CAMBIA EL CAMPO QUE ESTE REPETIDO
    `
    }

}

// TODOS LOS CAMPOS SON OBLIGATORIOS
const userErrorInfo = (u) => {
    return `TODOS LOS CAMPOS SON OBLIGATORIOS
    CAMPOS REQUIRIDOS:
    - First Name: ${u.first_name}
    - Last Name: ${u.last_name}
    - Email: ${u.email}
    - Age: ${u.age}
    - Role: ${u.role}
    - Password: ${u.password}

    COMPLETA EL CAMPO QUE DICE UNDEFINED
    `
}

const errorExistingUser = async (u) => {
    
    const users = await userManager.getUsers()

    if(users.find(us => us.email == u.email)){
        return `EL USUARIO YA EXISTENTE
        CAMPOS REPETIDO:
        - Email: ${u.email}

        CAMBIA EL CAMPO QUE ESTE REPETIDO
    `
    } 
}

module.exports = {
    productErrorInfo,
    errorExistingProduct,
    userErrorInfo,
    errorExistingUser

}