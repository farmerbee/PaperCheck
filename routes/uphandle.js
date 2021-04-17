const express = require('express');
const router = express.Router();
const path  = require('path');

const getDir = require('../utils/path');
const {reqIp} = require('./home');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'));
//   // res.render('index', { title: 'Express' });
// });

router.get('/', (req, res, next) => {
    console.log('handle ', reqIp);
})

module.exports = router;