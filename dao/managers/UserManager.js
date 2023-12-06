const fs = require('fs/promises')
const path = require('path')

class UserManager {

    constructor ( filename ) {

        this.filename = filename
        this.filepath = path.join(__dirname, this.filename)

    }   

    async addUser( usuario, id ){
        const data = await fs.readFile(this.filepath, 'utf-8')
        const user = JSON.parse(data)

        user.push({
            ...usuario,
            id
        })

        await fs.writeFile(this.filepath, JSON.stringify(user, null, 2))
    }

    async getUsers(){
        const data = await fs.readFile(this.filepath, 'utf-8')
        const user = JSON.parse(data)

        return user
    }

    async getUserById( id ){
        const data = await fs.readFile(this.filepath, 'utf-8')
        const user = JSON.parse(data)

        const userId = user.find(us => us.id == id)

        return userId
    }

    async updateUser( id, editUS ){
        const data = await fs.readFile(this.filepath, 'utf-8')
        const user = JSON.parse(data)

        const userId = await this.getUserById( id )
        const userDelete = user.filter(us => us.id != id)
        
        const userEdit = {
            ...userId,
            ...editUS
        }

        if(userId){
            await fs.writeFile(this.filepath, JSON.stringify(userDelete, null, 2))

            userDelete.push(userEdit)
        }

        await fs.writeFile(this.filepath, JSON.stringify(userDelete, null, 2))
    }

    async deleteUser( id ){
        const data = await fs.readFile(this.filepath, 'utf-8')
        const user = JSON.parse(data)

        const userDelete = user.filter(us => us.id != id)

        await fs.writeFile(this.filepath, JSON.stringify(userDelete, null, 2))
    }
}

module.exports = UserManager