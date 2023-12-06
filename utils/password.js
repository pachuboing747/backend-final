const bcrypt = require('bcrypt')

const hashPassword = (password) => {

    // Aqui vamos a hacer el Hasheo del password
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

const isValidPassword = (pass1, pass2) => {

    // Aqui vamos a comparar el password ingresado con el password Hasheado.
    // pass1 es la data sin encriptar, pass2 es la data encriptada

    return bcrypt.compareSync(pass1, pass2)
}

module.exports = {
    hashPassword,
    isValidPassword
}