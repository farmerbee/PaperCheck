var express = require('express');
var router = express.Router();
const path = require('path');
const checkFile = require('../utils/checkFile');


const getDir = require('../utils/path');
/* GET home page. */
router.get('/*', function (req, res, next) {
  const reqIp = req.ip.split(':').pop();
  if (req.query.name) {
    let fileName = req.query.name;
    console.log(fileName);

    let targetFile = path.join(getDir('uploads'), `${reqIp}`, `${fileName}`);
    console.log(targetFile);

  }

  res.json({
    name: 'lili'
  })

  /* TODO */

});


module.exports = router;
