var express = require('express');
var router = express.Router();
const path = require('path');
const checkFile = require('../utils/checkFile');


const getDir = require('../utils/path');
/* GET home page. */
router.get('/*', async function (req, res, next) {
  const reqIp = req.ip.split(':').pop();
  if (req.query.name) {
    let fileName = req.query.name;

    let targetFile = path.join(getDir('uploads'), `${reqIp}`, `${fileName}`);

    setTimeout(() => {
      res.json({
        name: 'lili'
      })
    }, 1000);
  }

  // res.send(200)
  /* TODO */

});


module.exports = router;
