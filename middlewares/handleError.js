const EErrors = require('../errors/enum.error')
const logger = require('../logger/index')

function handleError (error, req, res, next) {
    logger.error(error.cause)
    switch (error.code) {
        case EErrors.ID_INEXISTENTE:
            res.status(error.statusCode).send({
                status: error.statusCode,
                error: error.name,
                message: error.message
            })
            break;
        case EErrors.CAMPOS_OBLIGATORIOS:
            res.status(error.statusCode).send({
                status: error.statusCode,
                error: error.name,
                message: error.message
            })
            break;
        case EErrors.PRODUCTO_EXISTENTE:
            res.status(error.statusCode).send({
                status: error.statusCode,
                error: error.name,
                message: error.message
            })
            break;
        case EErrors.PERMISOS_BLOQUEADOS:
            res.status(error.statusCode).send({
                status: error.statusCode,
                error: error.name,
                message: error.message
            })
            break;
    
        default:
            res.send({
                status: 'error',
                error: 'Unhandled error'
            })
    }
}

module.exports = handleError