const logger = require('./../logger/index')

const fn = (req, _res, next) => {
    // Esto es lo que se va a loggear
    logger.http(`[${req.method}] - ${req.url} at ${(new Date()).toISOString()}`)
    next()
}

module.exports = fn