const logger = require('../logger/index');
const ManagerFactory = require('../dao/managersMongo/manager.factory')

const userManager = ManagerFactory.getManagerInstance('users')

const mailSenderService = require('../services/mail.sender.service')

async function eliminarUsuariosInactivos() {
    logger.info('Ejecutando eliminacion de usuarios inactivos' + " " + new Date())
    // Obtenemos todos los usuarios
    const users = await userManager.getUsers()

    // Obtenemos la fecha actual
    const fechaActual = new Date()

    // Iteramos sobre los usuarios para eliminar los que no se conectaron en los últimos 2 días
    for (const usuarios of users) {
        // Verificamos si last_connection está definido y es una cadena de texto
        if (usuarios.last_connection && typeof usuarios.last_connection === 'string') {
            const dosDias = 2 * 24 * 60 * 60 * 1000
            const fechaCadena = usuarios.last_connection.replace(/^Connect|Disconnect/, '').trim();
            const fechaConexion = new Date(fechaCadena)

            // Calculamos el tiempo inactivo
            const tiempoInactivo = fechaActual - fechaConexion

            if (tiempoInactivo >= dosDias) {
                if (usuarios.role === 'admin') {
                    return
                }

                // Envía un correo electrónico al usuario para avisarle que la cuenta fue eliminada

                const template = `
                <h2>¡Hola ${usuarios.first_name}, ${usuarios.last_name}!</h2>
                <h4>Queríamos avisarte que tu cuenta del eCommerce fue eliminada por inactividad.</h4>
                <h4>Te invitamos a que vuelvas a registrarte para disfrutar las mejores ofertas</h4>
                <h4>Muchas Gracias.</h4>
                `

                const subject = 'Cuenta Eliminada Por Inactividad'

                mailSenderService.send(subject, usuarios.email, template)

                // Eliminamos los usuarios que tengan más de dos días de inactividad
                logger.info(`El usuario ${usuarios.first_name} fue eliminado por inactividad`)
                await userManager.deleteUser(usuarios._id)
            }
        }
    }

    // Programamos para que se ejecute esta tarea cada 24 horas
    setTimeout(eliminarUsuariosInactivos, 24 * 60 * 60 * 1000)
}

module.exports = eliminarUsuariosInactivos
