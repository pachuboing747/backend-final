const ManagerFactory = require('../dao/managersMongo/manager.factory')

const productManager = ManagerFactory.getManagerInstance('products')
const cartManager = ManagerFactory.getManagerInstance('carts')
const userManager = ManagerFactory.getManagerInstance('users')

class AdminController {

    async getAdmin (req, res) {

        const cart = await cartManager.getCartById(req.user.cart._id)
    
        res.render('admin/admin', {
            title: 'Agregar un nuevo producto',
            style: 'admin',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            } : null,
            idCart: cart._id
        })
    
    }
    
    async getAdminEditarProducto (req, res) {

        res.render('admin/editarProducto', {
            title: 'Editar un producto',
            style: 'admin',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            } : null
        })
    }

    async getUsersAdmin (req, res) {

        res.render('admin/getUser', {
            title: 'Visualizar Usuario',
            style: 'admin',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
                isPublic: req.user.role == 'Customer',
                isPremium: req.user.role == 'Premium'
            } : null
        })
    }

    async postUsersAdmin (req, res){

        const userId = req.body.id
        
        const user = await userManager.getUserById(userId)
        const cart = await cartManager.getCartById(req.user.cart._id)

        if(!user){
            res.render('errorCarrito', {
                title: 'No existe este usuario.',
                style: 'order',
                user: req.user ? {
                    ...req.user,
                    isAdmin: req.user.role == 'admin',
                    isPublic: req.user.role == 'Customer',
                    isPremium: req.user.role == 'Premium'
                } : null,
                idCart: cart._id
            })
            return
        }

        res.render('profiledos', {
            ...user,
            title: `Usuario Seleccionado - ${user.first_name}`,
            style: 'profile',
            user: req.user ? {
                ...req.user,
                isAdmin: req.user.role == 'admin',
            } : null,
            userdos: user ? {
                ...user,
                isPublic: user.role == 'Customer',
                isPremium: user.role == 'Premium'
            } : null,
            idCart: cart._id
        })

    }

    async deleteUsersAdmin (req, res){
        const { id } = req.params

        const cart = await cartManager.getCartById(req.user.cart._id)
        const user = await userManager.deleteUser( id )
            if(user.deletedCount >= 1){
                res.render('errorCarrito', {
                    title: 'Usuario eliminado',
                    style: 'order',
                    user: req.user ? {
                        ...req.user,
                        isAdmin: req.user.role == 'admin',
                        isPublic: req.user.role == 'Customer',
                        isPremium: req.user.role == 'Premium'
                    } : null,
                    idCart: cart._id
                })
                return
            }
    }

    // Creacion de un nuevo producto solo por el ADMIN
    async addProductAdmin (req, res) {
        if(req.user.role == 'Premium'){
            await productManager.addProduct({
                ...req.body,
                owner: req.user.email
            })

            res.redirect('/admin/admin')
        } else {
            await productManager.addProduct(req.body)
        
            res.redirect('/admin/admin')
        }
    }

    // Editar un producto existente solo por el ADMIN
    async updateProductAdmin (req, res) {

        const {id, ...body} = req.body

        productManager.updateProduct(id, body)

        res.redirect('/')

    }
}

module.exports = new AdminController()