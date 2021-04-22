var express = require('express');
var router = express.Router();


// 处理当该IP非第一次访问
router.get('/', function(req, res, next) {
    res.status(200).send('ok')
});

module.exports = router;
