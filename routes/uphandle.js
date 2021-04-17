const express = require('express');
const router = express.Router();
const path  = require('path');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'));
//   // res.render('index', { title: 'Express' });
// });

router.post('/', (req, res, next) => {
    console.log('another handler');
})

module.exports = router;