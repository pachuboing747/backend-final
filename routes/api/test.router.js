const { Router } = require('express')

const router = Router()

/// /api/test/simple
router.get('/simple', (req, res) => {
    let sum = 0

    for (let i = 0; i < 5e8; i++) {
        sum += i
    }

    res.send({ sum })
})


module.exports = router