
class CustomError {

    static createError({ name = 'Error', message, cause, code = 1, statusCode = 500 }) {
        let error = new Error(message, { cause })
        error.name = name
        error.code = code
        error.statusCode = statusCode
        return error
    }

}

module.exports = CustomError