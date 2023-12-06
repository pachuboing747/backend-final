const path = require('path')
const multer = require('multer')


const storage = multer.diskStorage({

    destination: ( req, file, cb ) => {
        const tipo = req.body.tipo || 'default'

        cb(null, path.join(__dirname, `../public/uploads/${tipo}`))    
    },
    filename: ( req, file, cb ) => {
        const ext = req.body.ext

        cb(null, `${file.fieldname}-${Date.now()}.${ext}`)
    }
})

const upload = multer({ storage })

module.exports = upload