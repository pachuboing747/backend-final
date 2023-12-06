
module.exports = {
    //Conexion a la Base de Datos
    MONGO_CONNECT: process.env.MONGO_CONNECT,

    // PUERTO Y HOST
    PORT: process.env.PORT,
    HOST: process.env.HOST,

    // ENTORNO
    URL: process.env.URL,

    // Conexion con GitHub
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_STRATEGY_NAME: process.env.GITHUB_STRATEGY_NAME,

    //PERSISTENCIA
    PERSISTANCE: process.env.MANAGER_PERSISTANCE,

    // ADMIN
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

    //MAIL
    mail: {
        GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
        GMAIL_PWD: process.env.GMAIL_PWD
    },

    //LEVEL WINSTON
    CONSOLE_LOG_LEVEL: 'debug',
    FILE_LOG_LEVEL: 'info',
    ERROR_LOG_LEVEL: 'error'
}