var express = require('express');
var router = express.Router();
const path  = require('path');


const {getDir} = require('../utils/path');
/* GET home page. */
router.get('/', function(req, res, next) {
  const reqIp = req.ip.split(':').pop();
  let fileName = req.query.name;
  let targetFile =  path.join(getDir('uploads'), `${reqIp}`, `${fileName}`);


  
  console.log('index',  fileName);
  res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'));
  // res.send('ok');
});

module.exports = router;
