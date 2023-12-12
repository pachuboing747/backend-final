(async () => {
    require('dotenv').config()
    
    const http = require('http')
    const path = require('path')

    const express = require('express')
    const swaggerJsDoc = require('swagger-jsdoc')
    const swaggerUiExpress = require('swagger-ui-express')
    const handlebars = require('express-handlebars')
    const { Server } = require('socket.io')
    const mongoDB = require('./services/mongo.db')
    const cookieParser = require('cookie-parser')
    const session = require('express-session')
    const MongoStore = require('connect-mongo')
    const passport = require('passport')
    const { PORT, HOST, MONGO_CONNECT, ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config/config')
    const handleError = require('./middlewares/handleError')

    const { api, home } = require('./routes/index.js')
    const SocketManager = require('./websocket')
    const initPassportLocal = require('./config/passport.init.js')
    const { isValidPassword } = require('./utils/password.js')
    const logger = require('./logger/index')
    const loggerMiddleware = require('./middlewares/logger.middleware')
    const eliminarUsuariosInactivosMiddleware = require('./middlewares/eliminarUsuariosInactivosMiddleware.js')
    const homeController = require('./controllers/home.controllers.js');
    const cartController = require('./controllers/apiControllers/carts.controllers.js');
    try { 
        await mongoDB.connect()
        
        const app = express()
        const server = http.createServer(app) 
        const io = new Server(server)
        
        app.use(loggerMiddleware)
        
        const specs = swaggerJsDoc({
            definition: {
                openapi: '3.0.1',
                info: {
                    title: 'eCommerce API',
                    description: 'Documentacion para el eCommerce API'
                }
            },
            apis: [`${__filename}/../doc/**/*.yaml`]
        })

        //handlebars
        app.engine('handlebars', handlebars.engine({
            extname: 'handlebars',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
        }));
        app.set('views', path.join(__dirname, '/views'))
        app.set('view engine', 'handlebars')
        
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())
        app.use('/static', express.static(path.join(__dirname + '/public')))
        app.use(cookieParser('secret'))
      
        
        // Ejecutamos funcion de eliminar usuarios inactivos
        eliminarUsuariosInactivosMiddleware()
        
        //Registramos los middlewares de passport
        initPassportLocal()

        app.use(session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true,
            store: MongoStore.create({
                mongoUrl: MONGO_CONNECT,
                ttl: 60 * 60
            })
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        
        //middlware GLOBAL
        app.use((req, _res, next) => {

            if(req.user){  
                if(req.user.email == ADMIN_EMAIL && isValidPassword(ADMIN_PASSWORD, req.user.password)){
                    req.user.role = 'admin'
                }
            }
            next()
        })

        app.use((req, _res, next) => {
            req.io = io

            next()
        })

        // ruta del home
        app.use('/', home)
        
        // ruta de las api
        app.use('/api', api)

        // ruta de la documentacion
        app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

        app.use(handleError)
        
        app.post('/', homeController.postHome);
        app.post('/carts', cartController.addCart)

        // WEB SOCKET
        io.on('connection', SocketManager)
        
        const port = PORT || 8080
        
        server.listen(port, () => {
            logger.info(`Servidor leyendose desde http://${HOST}:${port}`)
        })

        logger.warn('Se ha conectado a la base de datos')

    } catch (error) {
        logger.error('No se ha podido conectar a la base de datos')
    }
})()

