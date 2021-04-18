var express = require('express');
var router = express.Router();
const path = require('path');
const checkFile = require('../utils/checkFile');


const { getDir } = require('../utils/path');
/* GET home page. */
router.get('/', function (req, res, next) {
  const reqIp = req.ip.split(':').pop();
  if (req.query.name) {
    let fileName = req.query.name;
    console.log(fileName);
    let targetFile = path.join(getDir('uploads'), `${reqIp}`, `${fileName}`);
  }

  res.json({
    name:'dfsdf',
    ratio: 20
  })
  // res.send('ol');
  // res.sendFile(path.join(getDir('views'), 'index.html'));
  // res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
  // res.status(200);

  /* TODO */

  // res.redirect('/load');
  // res.send('ok');
  // res.send('ok');
});


module.exports = router;
