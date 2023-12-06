const chai = require('chai')
const supertest = require('supertest')

const expect = chai.expect
const requestor = supertest('http://localhost:8080')

// INTEGRACION DE PRUEBAS

describe('Integration - Tests', () => {

    // TEST DE PRODUCTS
    describe('Product', () => {

        let adminSession // Variable para almacenar la sesión del administrador

        // Antes de cada prueba, inicia sesión como administrador
        beforeEach(async () => {
            // Realiza un proceso de inicio de sesión de administrador y guarda la sesión
            const loginResponse = await requestor
                .post('/login') // Ruta de inicio de sesión
                .send({
                    email: 'ulisesros70@gmail.com',
                    password: 'ulises12'
                });

            adminSession = loginResponse.header['set-cookie'][0];
        });

        let idProduct

        it('Product - /POST', async () => {
            const product = {
                title: 'Pelota',
                description: 'Pelota de Futbol',
                code: 'a288',
                price: 20000,
                stock: 100,
                category: 'Jugueteria',
                owner: 'admin'
            }

            const { statusCode, ok, _body: { payload } } = await requestor.post('/api/products').set('Cookie', adminSession).send(product)

            idProduct = payload._id
            expect(payload.status).to.be.true
            expect(statusCode).to.be.equal(201)

            console.log(`Este es el id del producto que luego se eliminara: ${idProduct}`)
        })

        it('Product - /GET', async () => {
            const { _body: { status, payload } } = await requestor.get('/api/products')

            expect(status).to.be.equal('success')
            expect(Array.isArray(payload)).to.be.true

        })

        it('Product - /DELETE', async () => {

            const response = await requestor.del(`/api/products/${idProduct}`).set('Cookie', adminSession)

            expect(response.statusCode).to.be.equal(200)

            const { _body: { payload } } = await requestor.get('/api/products')

            const productDeleted = payload.find(p => p._id == idProduct)

            expect(productDeleted).to.be.undefined

        })
    })

    // TEST CART
    describe('Cart', () => {

        let idCart

        it('Cart - /POST', async () => {

            const cart = {
                user: '6511e76c922311fc5fcbc50a',
                products: []
            }

            const { statusCode, ok, _body: { payload } } = await requestor.post('/api/carts').send(cart)

            idCart = payload._id
            expect(statusCode).to.be.equal(201)

            console.log(`Este es el id del carrito que luego se eliminara: ${idCart}`)
        })

        it('Cart - /GET', async () => {

            const { _body } = await requestor.get('/api/carts')

            expect(Array.isArray(_body)).to.be.true

        })

        it('Cart - /DELETE', async () => {

            const response = await requestor.del(`/api/carts/${idCart}/delete`)

            expect(response.statusCode).to.be.equal(202)

            const { _body }  = await requestor.get('/api/carts')

            const cartDeleted = _body.find(c => c._id == idCart)
            
            expect(cartDeleted).to.be.undefined

        })
    })

    // TEST USER
    describe('User', () => {
        let idUser
        const userFail = {
            first_name: 'Ramon',
            last_name: 'Perez',
            email: 'ramon@gmail.com',
            age: 30,
            password: 'ramon12',
        }
        const user = {
            first_name: 'Ramon',
            last_name: 'Perez',
            email: 'ramon@gmail.com',
            role: 'Customer',
            age: 30,
            password: 'ramon12',
        }

        it('User - /POST', async () => {

            const { statusCode, ok, _body: { payload } } = await requestor.post('/api/users').send(user)

            idUser = payload._id
            expect(statusCode).to.be.equal(201)

            console.log(`El usuario se creo con el id: ${idUser}`)
        })

        it('User - /POST - 400', async () => {

            const { statusCode } = await requestor.post('/api/users').send(userFail)

            expect(statusCode).to.be.equal(400)
        })

        it('User - /GET', async () => {

        const { _body } = await requestor.get('/api/users')

        expect(Array.isArray(_body)).to.be.true

        })

        it('User - /DELETE', async () => {

            const response = await requestor.del(`/api/users/${idUser}`)

            expect(response.statusCode).to.be.equal(202)

            const { _body }  = await requestor.get('/api/users')

            const userDeleted = _body.find(u => u._id == idUser)
            
            expect(userDeleted).to.be.undefined

        })
    })
})