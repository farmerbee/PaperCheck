var express = require('express');
var router = express.Router();

router.post('/', (req, res,next) => {
    res.json({
        name: 'alibaba',
        ration: '80.88'
    })
})


module.exports = router;