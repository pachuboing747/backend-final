const { Router } = require('express')
const logger = require('../../logger/index')


const router = Router()

router.get('/', (_req, res) => {

    logger.debug('Este es un mensaje de depuración (debug).');
    logger.info('Este es un mensaje informativo (info).');
    logger.warn('Este es un mensaje de advertencia (warn).');
    logger.error('Este es un mensaje de error (error).');

    res.send('Endpoint /loggerTest ejecutado. Revisa los registros en la consola o el archivo de registro (dependiendo del entorno).');
})

module.exports = router